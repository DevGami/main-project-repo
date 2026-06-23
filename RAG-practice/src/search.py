"""
RAGSearch — hybrid retrieval + Groq LLM generation.

Pipeline:
  query -> BM25+FAISS hybrid retrieval -> cosine threshold filter
        -> context assembly -> Groq Llama-3.3-70B -> answer
"""

import sys
sys.stdout.reconfigure(encoding="utf-8", errors="replace")

import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage
from src.vectorstore import FaissVectorStore

load_dotenv()


# ── System prompt ─────────────────────────────────────────────────────── #
SYSTEM_PROMPT = """You are NexRAG, an expert AI research assistant with a curated knowledge base.

## Your Core Behaviour

1. **Answer from context ONLY** — If retrieved context is provided, base your answer on it.
2. **Be honest about gaps** — If the context doesn't contain enough information to answer, say so clearly. Do NOT invent details not present in the context.
3. **Conversational queries** — If the user says hi, thanks, or asks something clearly unrelated to the knowledge base, respond naturally and briefly without fabricating research content.
4. **No hallucination** — Never make up citations, facts, or paper details that are not in the provided context.

## Formatting Rules (when giving a substantive answer)
- Use **bold** for key terms and important concepts
- Use `code` for variables, functions, model names, and equations
- Use ## headings for major sections, ### for subsections
- Use bullet lists or numbered lists where appropriate
- Use > blockquote for direct quotes or key excerpts from papers
- Keep answers comprehensive but scannable — no walls of plain text

## Tone
Professional, precise, and insightful — like a senior researcher who has read every paper in the knowledge base.
"""


class RAGSearch:
    def __init__(
        self,
        persist_dir: str = "faiss_store",
        embedding_model: str = "all-MiniLM-L6-v2",
        llm_model: str = "llama-3.3-70b-versatile",
    ):
        self.vectorstore = FaissVectorStore(persist_dir, embedding_model)

        faiss_path = os.path.join(persist_dir, "faiss.index")
        meta_path  = os.path.join(persist_dir, "metadata.pkl")
        if not (os.path.exists(faiss_path) and os.path.exists(meta_path)):
            from src.data_loader import load_all_documents
            docs = load_all_documents("data")
            self.vectorstore.build_from_documents(docs)
        else:
            self.vectorstore.load()

        groq_api_key = os.getenv("GROQ_API_KEY")
        if not groq_api_key:
            raise ValueError("GROQ_API_KEY not found. Add it to .env file.")

        self.llm = ChatGroq(
            groq_api_key=groq_api_key,
            model_name=llm_model,
            temperature=0.2,   # lower = less hallucination
            max_tokens=2048,
        )
        print(f"[INFO] Groq LLM ready: {llm_model}")

    def search_and_summarize(self, query: str, top_k: int = 5) -> str:
        results = self.vectorstore.query(query, top_k=top_k)

        # ── No relevant context found ─────────────────────────────────── #
        if not results:
            # Build a conversational response with the LLM, no context
            human_prompt = (
                f"The user said: \"{query}\"\n\n"
                "No relevant documents were found in the knowledge base for this query. "
                "If this is a greeting or casual message, respond naturally and briefly. "
                "If it looks like a research question, politely tell the user that no relevant "
                "documents were found and suggest they upload relevant files."
            )
            messages = [SystemMessage(content=SYSTEM_PROMPT), HumanMessage(content=human_prompt)]
            return self.llm.invoke(messages).content

        # ── Assemble context from retrieved chunks ─────────────────────── #
        texts = [r["metadata"].get("text", "").strip() for r in results]
        texts = [t for t in texts if len(t) >= 50]

        if not texts:
            return "I couldn't extract usable text from the retrieved chunks. Please try rephrasing your question."

        context = "\n\n---\n\n".join(texts)

        human_prompt = (
            f"**User Query:** {query}\n\n"
            f"**Retrieved Context from Knowledge Base** "
            f"({len(texts)} chunks, cosine-filtered):\n\n"
            f"{context}\n\n"
            "Please answer the query based strictly on the context above. "
            "If the context does not contain enough information to answer, say so."
        )

        messages = [
            SystemMessage(content=SYSTEM_PROMPT),
            HumanMessage(content=human_prompt),
        ]

        response = self.llm.invoke(messages)
        return response.content


if __name__ == "__main__":
    rag = RAGSearch()
    print(rag.search_and_summarize("What is the attention mechanism?", top_k=5))
