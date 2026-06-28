# NexRAG — AI Knowledge Engine

NexRAG is an AI-powered research assistant built using **FastAPI**, **React**, **LangChain**, and **Llama-3.3 70B** via Groq. It allows users to upload local documents and chat with an intelligent AI that uses a **Hybrid Retrieval-Augmented Generation (RAG)** pipeline to answer questions strictly based on the uploaded context.

## 🚀 Features
- **Hybrid Retrieval:** Uses FAISS (Cosine Similarity) + BM25 Sparse retrieval, merged with Reciprocal Rank Fusion (RRF) for highly accurate search.
- **Anti-Hallucination:** Strict cosine-similarity thresholds (0.2 cutoff) ensure the AI only answers when relevant context is found. For casual greetings, it seamlessly switches to a conversational mode without fabricating data.
- **Multi-Format Support:** Upload `.pdf`, `.docx`, `.txt`, `.csv`, `.json`, `.md`, `.html`, `.sql`, `.yaml`, and more.
- **Premium Glassmorphism UI:** Built with React, Vite, and TailwindCSS featuring fluid Framer Motion animations and responsive layouts.
- **Syntax Highlighting:** LLM outputs are fully formatted using `react-markdown` with `highlight.js` syntax highlighting.

## 🛠️ Tech Stack
- **Backend:** FastAPI, Python, Uvicorn
- **AI & RAG:** LangChain, SentenceTransformers (`all-MiniLM-L6-v2`), FAISS, BM25Okapi
- **LLM:** Llama-3.3 70B (via Groq API)
- **Frontend:** React, Vite, TailwindCSS, Framer Motion, Lucide React

## 📦 Installation & Setup

### 1. Backend Setup
Create a virtual environment and install the required Python packages:
```bash
pip install -r requirements.txt
```
Create a `.env` file in the root directory and add your Groq API key:
```env
GROQ_API_KEY="your-groq-api-key"
```

### 2. Frontend Setup
Navigate to the `frontend` directory, install dependencies, and build the React app:
```bash
cd frontend
npm install
npm run build
cd ..
```
*(The build output will be placed in the `static/assets` folder so FastAPI can serve it directly).*

### 3. Run the App
Start the FastAPI server:
```bash
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```
Then, open your browser and navigate to `http://127.0.0.1:8000` to start uploading documents and chatting!