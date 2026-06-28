import os
import sys
from dotenv import load_dotenv

# Fix Windows console encoding for Unicode characters in PDFs
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

from src.data_loader import load_all_documents
from src.vectorstore import FaissVectorStore
from src.search import RAGSearch

load_dotenv()


def main():
    data_dir = "data"
    persist_dir = "faiss_store"

    # Step 1: Check if data directory exists and has files
    if not os.path.isdir(data_dir):
        print(f"[ERROR] Data directory '{data_dir}' not found.")
        print("        Place your PDF/TXT files in the 'data/' folder and try again.")
        sys.exit(1)

    data_files = [f for f in os.listdir(data_dir) if not f.startswith(".")]
    if not data_files:
        print(f"[WARNING] Data directory '{data_dir}' is empty. No documents to load.")
        sys.exit(1)

    print(f"[INFO] Found {len(data_files)} files in '{data_dir}': {data_files}")

    # Step 2: Build or load FAISS index via RAGSearch (single model load)
    rag_search = RAGSearch(persist_dir=persist_dir)

    # Step 3: Test a vector search
    print("\n" + "=" * 60)
    print("VECTOR SEARCH TEST")
    print("=" * 60)
    query = "What is attention mechanism?"
    results = rag_search.vectorstore.query(query, top_k=3)
    print(f"\nQuery: '{query}'")
    print(f"Top {len(results)} results:")
    for i, r in enumerate(results):
        text = r["metadata"].get("text", "")[:150] if r["metadata"] else "N/A"
        print(f"  [{i+1}] (score={r['score']:.4f}) {text}...")

    # Step 4: Test RAG with LLM
    print("\n" + "=" * 60)
    print("RAG + LLM TEST")
    print("=" * 60)
    summary = rag_search.search_and_summarize(query, top_k=3)
    print(f"\nQuery: '{query}'")
    print(f"LLM Summary:\n{summary}")


if __name__ == "__main__":
    main()
