# 📚 StudyMitra — Personal Academic RAG Knowledge Engine

## Run the redesigned React frontend

```powershell
cd frontend
npm ci
npm run dev -- --port 3000
```

Open http://127.0.0.1:3000. The frontend runs independently in local-preview mode. Files stay in this browser; real AI answers require the backend. See [frontend setup and backend connection instructions](frontend/README.md). The original backend is preserved; its full-stack setup is described below.


A self-hosted study assistant that lets you upload and query your own academic resources — PDFs, lecture notes, textbooks, research papers, and previous-year questions — with grounded, cited answers powered by a modular RAG pipeline.

![License](https://img.shields.io/badge/license-MIT-blue)
![Python](https://img.shields.io/badge/python-3.11-blue)
![Docker](https://img.shields.io/badge/docker-compose-blue)

---

## ✨ Features

- **Document Ingestion** — Upload PDF, Markdown, and text files with automatic structure-aware chunking
- **Hybrid Retrieval** — Vector search (Qdrant) + BM25 keyword search, merged via Reciprocal Rank Fusion
- **Cross-Encoder Reranking** — Optional reranking for improved precision
- **Grounded Answers** — LLM responses based strictly on your documents with `[Source N]` citations
- **6 Response Modes** — Explain, Exam Answer, Summarize, Compare Sources, Find PYQs, Quiz Me
- **Metadata Filtering** — Filter by subject, semester, document type
- **Source Citations Panel** — Clickable, expandable source cards with page/section info
- **Document Library** — Upload, browse, filter, delete, re-index documents
- **SSE Streaming** — Real-time token streaming for chat responses
- **Conversation History** — Persisted in localStorage across sessions
- **Fully Local** — Embeddings and reranking run locally; only LLM calls go to your chosen provider

---

## 🏗 Architecture

```
┌─────────────┐     ┌──────────────────────────────────────────┐     ┌─────────┐
│   Frontend   │────▶│             FastAPI Backend              │────▶│  Qdrant  │
│  (Nginx SPA) │     │                                          │     │ (Vectors)│
└─────────────┘     │  ┌──────────┐ ┌──────────┐ ┌──────────┐ │     └─────────┘
                     │  │Ingestion │ │Retrieval │ │Generation│ │
                     │  │Pipeline  │ │Pipeline  │ │Pipeline  │ │     ┌─────────┐
                     │  └──────────┘ └──────────┘ └──────────┘ │────▶│ SQLite  │
                     │                                          │     │(Metadata)│
                     └──────────────────────────────────────────┘     └─────────┘
```

| Layer | Components |
|---|---|
| **Ingestion** | PDF loader (PyMuPDF) → Markdown loader → Structure-aware chunker → Metadata enrichment |
| **Retrieval** | Embedder (sentence-transformers) → Qdrant vector search → BM25 keyword search → RRF fusion → Cross-encoder reranker |
| **Generation** | Mode-specific prompt templates → OpenAI-compatible LLM → Citation extraction |

---

## 🚀 Quick Start

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/)
- An API key for your chosen LLM provider (OpenAI, Groq, or a local Ollama instance)

### 1. Clone and configure

```bash
cd StudyMitra
cp .env.example .env
```

Edit `.env` with your LLM settings:

```env
LLM_PROVIDER=openai
LLM_API_KEY=sk-your-key-here
LLM_MODEL=gpt-4o-mini
```

**Using Groq (free tier):**
```env
LLM_PROVIDER=groq
LLM_API_KEY=gsk_your-key-here
LLM_BASE_URL=https://api.groq.com/openai/v1
LLM_MODEL=llama-3.1-8b-instant
```

**Using Ollama (fully local):**
```env
LLM_PROVIDER=ollama
LLM_API_KEY=not-needed
LLM_BASE_URL=http://host.docker.internal:11434/v1
LLM_MODEL=llama3.1
```

### 2. Start all services

```bash
docker compose up --build
```

This starts:
- **Frontend** at [http://localhost:3000](http://localhost:3000)
- **Backend API** at [http://localhost:8000](http://localhost:8000/docs)
- **Qdrant** at [http://localhost:6333](http://localhost:6333/dashboard)

> ⏳ First startup takes a few minutes to download embedding and reranker models (~500MB).

### 3. Upload documents and start querying

1. Open [http://localhost:3000](http://localhost:3000)
2. Navigate to **Library** → **Upload Document**
3. Upload your PDFs, notes, or textbooks with subject/semester metadata
4. Switch to **Chat** and start asking questions!

---

## 📁 Project Structure

```
StudyMitra/
├── docker-compose.yml
├── .env.example
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── main.py              # FastAPI app with lifespan
│       ├── config.py            # Pydantic settings
│       ├── api/                 # REST endpoints
│       ├── models/              # Pydantic schemas
│       ├── services/            # Business logic
│       ├── ingestion/           # Document processing pipeline
│       ├── retrieval/           # RAG retrieval (embedder, Qdrant, BM25, reranker)
│       ├── generation/          # LLM prompts and response generation
│       ├── db/                  # SQLite database
│       └── utils/               # Logging, file utilities
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    ├── index.html
    ├── css/styles.css
    └── js/                      # Vanilla JS SPA
```

---

## ⚙️ Configuration

All settings are configured via environment variables (`.env` file):

| Variable | Default | Description |
|---|---|---|
| `LLM_PROVIDER` | `openai` | LLM provider (openai, groq, ollama) |
| `LLM_API_KEY` | — | API key for your LLM provider |
| `LLM_BASE_URL` | `https://api.openai.com/v1` | API endpoint |
| `LLM_MODEL` | `gpt-4o-mini` | Model name |
| `EMBEDDING_MODEL` | `all-MiniLM-L6-v2` | Sentence-transformers model |
| `RERANKER_ENABLED` | `true` | Enable cross-encoder reranking |
| `CHUNK_SIZE` | `512` | Max words per chunk |
| `RETRIEVAL_TOP_K` | `10` | Candidates before reranking |
| `HYBRID_ALPHA` | `0.7` | Vector vs keyword weight (1.0 = pure vector) |

---

## 🔮 Roadmap

The architecture is designed so these can be added without major rewrites:

- [ ] Web search integration
- [ ] Quiz generation & spaced repetition
- [ ] Revision planning & weak-topic detection
- [ ] Study progress tracking
- [ ] Personalized recommendations
- [ ] Agentic study assistant

---

## 📄 License

MIT
