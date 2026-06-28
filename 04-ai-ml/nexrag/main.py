import sys
sys.stdout.reconfigure(encoding="utf-8", errors="replace")

import os
import shutil
import asyncio
from pathlib import Path
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from src.data_loader import load_all_documents
from src.search import RAGSearch

load_dotenv()

app = FastAPI(title="NexRAG Platform", docs_url="/docs")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Directories ──────────────────────────────────────────────────────── #
os.makedirs("data", exist_ok=True)
os.makedirs("faiss_store", exist_ok=True)
os.makedirs("static", exist_ok=True)

ALLOWED_EXTENSIONS = {
    ".pdf", ".txt", ".csv", ".json", ".jsonl",
    ".md", ".html", ".htm", ".sql", ".yaml", ".yml",
    ".docx", ".doc", ".py", ".js", ".ts", ".xml", ".log",
}

# ── Init RAG Pipeline ────────────────────────────────────────────────── #
print("[INFO] Initializing RAG Pipeline…")
rag_search = RAGSearch(persist_dir="faiss_store")
print("[INFO] RAG Pipeline ready ✅")


# ── Request models ───────────────────────────────────────────────────── #
class QueryRequest(BaseModel):
    query: str
    top_k: int = 5


# ── API Endpoints ────────────────────────────────────────────────────── #
@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided.")

    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=415,
            detail=f"'{ext}' is not supported. Allowed: {', '.join(sorted(ALLOWED_EXTENSIONS))}",
        )

    dest = Path("data") / file.filename
    with open(dest, "wb") as f:
        shutil.copyfileobj(file.file, f)

    print(f"[INFO] Saved: {file.filename}  →  rebuilding index…")

    try:
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, _rebuild_index)
        return {"message": f"✅ '{file.filename}' indexed successfully."}
    except Exception as e:
        print(f"[ERROR] Index rebuild: {e}")
        raise HTTPException(status_code=500, detail=f"Indexing failed: {e}")


def _rebuild_index():
    docs = load_all_documents("data")
    rag_search.vectorstore.build_from_documents(docs)


@app.post("/api/query")
async def query_rag(req: QueryRequest):
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty.")
    try:
        loop = asyncio.get_event_loop()
        answer = await loop.run_in_executor(
            None, lambda: rag_search.search_and_summarize(req.query, top_k=req.top_k)
        )
        return {"answer": answer}
    except Exception as e:
        print(f"[ERROR] Query: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/health")
async def health():
    return {
        "status": "ok",
        "chunks_indexed": rag_search.vectorstore.index.ntotal if rag_search.vectorstore.index else 0,
    }


# ── Static Files + SPA fallback ──────────────────────────────────────── #
# Mount /assets (Vite build artefacts)
app.mount("/assets", StaticFiles(directory="static/assets"), name="assets")


@app.get("/{full_path:path}", include_in_schema=False)
async def serve_spa(full_path: str):
    """
    Catch-all: serve index.html for any path not matched by API routes.
    React Router handles /contact, etc. on the client side.
    """
    index = Path("static/index.html")
    if index.exists():
        return FileResponse(index)
    raise HTTPException(status_code=503, detail="Frontend not built. Run: npm run build inside frontend/")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
