"""
FaissVectorStore — Hybrid BM25 + Semantic (FAISS cosine) retrieval.

Why hybrid?
- Dense (FAISS): great at understanding meaning / paraphrase
- Sparse (BM25): great at exact keyword / entity matching
- Combined: much more robust than either alone — a core RAG technique

Index choice:
- IndexFlatIP (inner-product) on L2-normalized vectors = cosine similarity
- More accurate than IndexFlatL2 for sentence embeddings
- Slightly faster search too
"""

import os
import pickle
import faiss
import numpy as np
from typing import List, Dict, Any, Tuple
from rank_bm25 import BM25Okapi
from src.embedding import EmbeddingPipeline


def _tokenize(text: str) -> List[str]:
    """Simple whitespace + lowercase tokenizer for BM25."""
    return text.lower().split()


class FaissVectorStore:
    def __init__(
        self,
        persist_dir: str = "faiss_store",
        embedding_model: str = "all-MiniLM-L6-v2",
        chunk_size: int = 600,
        chunk_overlap: int = 120,
    ):
        self.persist_dir = persist_dir
        os.makedirs(self.persist_dir, exist_ok=True)

        self.index: faiss.IndexFlatIP | None = None
        self.metadata: List[Dict] = []   # {"text": str, "source": str}
        self.bm25: BM25Okapi | None = None
        self.corpus_tokens: List[List[str]] = []

        self._emb_pipe = EmbeddingPipeline(
            model_name=embedding_model,
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
        )

    # ------------------------------------------------------------------ #
    # Build                                                                #
    # ------------------------------------------------------------------ #
    def build_from_documents(self, documents: List[Any]):
        print(f"[INFO] Building index from {len(documents)} raw documents…")
        chunks = self._emb_pipe.chunk_documents(documents)
        if not chunks:
            print("[WARNING] No chunks produced — check your data/ folder.")
            return

        embeddings = self._emb_pipe.embed_chunks(chunks)   # normalized float32

        self.metadata = [
            {
                "text": c.page_content,
                "source": c.metadata.get("source", "unknown"),
            }
            for c in chunks
        ]

        # ── Dense index (cosine) ──────────────────────────────────────── #
        dim = embeddings.shape[1]
        self.index = faiss.IndexFlatIP(dim)   # Inner-product = cosine on unit vecs
        self.index.add(embeddings)

        # ── Sparse index (BM25) ──────────────────────────────────────── #
        self.corpus_tokens = [_tokenize(m["text"]) for m in self.metadata]
        self.bm25 = BM25Okapi(self.corpus_tokens)

        self.save()
        print(f"[INFO] Index ready: {len(self.metadata)} chunks  |  dim={dim}")

    # ------------------------------------------------------------------ #
    # Persist                                                              #
    # ------------------------------------------------------------------ #
    def save(self):
        faiss.write_index(self.index, os.path.join(self.persist_dir, "faiss.index"))
        with open(os.path.join(self.persist_dir, "metadata.pkl"), "wb") as f:
            pickle.dump(
                {"metadata": self.metadata, "corpus_tokens": self.corpus_tokens}, f
            )
        print(f"[INFO] Saved index -> {self.persist_dir}")

    def load(self):
        self.index = faiss.read_index(os.path.join(self.persist_dir, "faiss.index"))
        with open(os.path.join(self.persist_dir, "metadata.pkl"), "rb") as f:
            data = pickle.load(f)

        # Handle old format (just a list) vs new format (dict)
        if isinstance(data, list):
            self.metadata = data
            self.corpus_tokens = [_tokenize(m.get("text", "")) for m in self.metadata]
        else:
            self.metadata = data["metadata"]
            self.corpus_tokens = data["corpus_tokens"]

        self.bm25 = BM25Okapi(self.corpus_tokens)
        print(f"[INFO] Loaded index: {self.index.ntotal} vectors  |  BM25 corpus: {len(self.corpus_tokens)} docs")

    # ------------------------------------------------------------------ #
    # Hybrid Query                                                         #
    # ------------------------------------------------------------------ #
    def query(self, query_text: str, top_k: int = 5) -> List[Dict]:
        """
        Hybrid retrieval:
        1. FAISS cosine similarity → top_k*3 candidates
        2. BM25 score for same candidates
        3. Reciprocal Rank Fusion (RRF) to merge rankings
        4. Return top_k deduplicated results
        """
        if self.index is None or self.index.ntotal == 0:
            return []

        fetch_k = min(top_k * 3, self.index.ntotal)

        # ── Dense retrieval ───────────────────────────────────────────── #
        q_emb = self._emb_pipe.embed_query(query_text)
        scores_dense, indices = self.index.search(q_emb, fetch_k)
        dense_indices = [int(i) for i in indices[0] if i >= 0]
        dense_scores  = {idx: float(s) for idx, s in zip(dense_indices, scores_dense[0]) if idx >= 0}

        # ── Sparse retrieval (BM25) ───────────────────────────────────── #
        bm25_scores_all = self.bm25.get_scores(_tokenize(query_text))
        # Rank all docs by BM25; we only care about the candidate pool
        bm25_ranked = sorted(
            ((i, float(bm25_scores_all[i])) for i in dense_indices),
            key=lambda x: x[1], reverse=True
        )
        bm25_scores = {i: s for i, s in bm25_ranked}

        # ── Reciprocal Rank Fusion ─────────────────────────────────────── #
        # RRF score = Σ 1/(k + rank_i)  where k=60 (standard constant)
        RRF_K = 60
        rrf: Dict[int, float] = {}

        # Dense ranking
        for rank, idx in enumerate(dense_indices):
            rrf[idx] = rrf.get(idx, 0.0) + 1.0 / (RRF_K + rank + 1)

        # BM25 ranking
        for rank, (idx, _) in enumerate(bm25_ranked):
            rrf[idx] = rrf.get(idx, 0.0) + 1.0 / (RRF_K + rank + 1)

        # Sort by RRF score
        sorted_results = sorted(rrf.items(), key=lambda x: x[1], reverse=True)

        # ── Build output ──────────────────────────────────────────────── #
        # Minimum cosine score threshold — anything below 0.2 is noise
        MIN_COSINE = 0.2

        results = []
        seen_texts = set()

        for idx, score in sorted_results[:top_k]:
            if idx >= len(self.metadata):
                continue
            cosine = dense_scores.get(idx, 0.0)
            # Hard filter: skip chunks with very low semantic similarity
            if cosine < MIN_COSINE:
                continue
            meta = self.metadata[idx]
            # Deduplicate by first 120 chars
            key = meta["text"][:120]
            if key in seen_texts:
                continue
            seen_texts.add(key)
            results.append({
                "index": idx,
                "score": score,
                "dense_score": cosine,
                "bm25_score": bm25_scores.get(idx, 0.0),
                "metadata": meta,
            })

        print(f"[INFO] Hybrid query '{query_text[:50]}...'  ->  {len(results)} results  (threshold={MIN_COSINE})")
        return results
