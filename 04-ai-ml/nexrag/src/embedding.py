"""
EmbeddingPipeline — wraps SentenceTransformer + LangChain text splitter.

Key decisions for this learning project:
- chunk_size=600, chunk_overlap=120  → better precision than 1000/200
- batch_size=32 → balanced speed vs RAM (won't OOM on typical laptops)
- normalize_embeddings=True → required for cosine similarity (IndexFlatIP)
"""

from typing import List, Any
import numpy as np
from langchain_text_splitters import RecursiveCharacterTextSplitter
from sentence_transformers import SentenceTransformer


class EmbeddingPipeline:
    def __init__(
        self,
        model_name: str = "all-MiniLM-L6-v2",
        chunk_size: int = 600,
        chunk_overlap: int = 120,
    ):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        # SentenceTransformer loads once and stays in memory
        self.model = SentenceTransformer(model_name)
        print(f"[INFO] Embedding model ready: {model_name}  dim={self.model.get_sentence_embedding_dimension()}")

    # ------------------------------------------------------------------ #
    # Chunking                                                             #
    # ------------------------------------------------------------------ #
    def chunk_documents(self, documents: List[Any]) -> List[Any]:
        """
        Split docs into overlapping chunks using recursive splitter.
        Paragraph boundaries are preferred, then sentences, then words.
        """
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=self.chunk_size,
            chunk_overlap=self.chunk_overlap,
            length_function=len,
            separators=["\n\n", "\n", ". ", " ", ""],
        )
        chunks = splitter.split_documents(documents)
        # Drop trivially short chunks (headers, page numbers, etc.)
        chunks = [c for c in chunks if len(c.page_content.strip()) >= 60]
        print(f"[INFO] Chunked {len(documents)} docs -> {len(chunks)} chunks  (size<={self.chunk_size}, overlap={self.chunk_overlap})")
        return chunks

    # ------------------------------------------------------------------ #
    # Embedding                                                            #
    # ------------------------------------------------------------------ #
    def embed_chunks(self, chunks: List[Any]) -> np.ndarray:
        texts = [c.page_content for c in chunks]
        print(f"[INFO] Encoding {len(texts)} chunks…")
        embeddings = self.model.encode(
            texts,
            batch_size=32,          # safe for ≤8 GB RAM
            show_progress_bar=True,
            normalize_embeddings=True,  # unit-norm → cosine sim via dot-product
        )
        print(f"[INFO] Embeddings: {embeddings.shape}  (normalized for cosine)")
        return embeddings.astype("float32")

    def embed_query(self, text: str) -> np.ndarray:
        """Encode a single query, normalized to match stored embeddings."""
        vec = self.model.encode([text], normalize_embeddings=True)
        return vec.astype("float32")
