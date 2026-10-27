# 📚 StudyMitra — Personal Academic RAG Knowledge Engine

## ⚡ Quick Start Options

### Option A: Run with Docker Compose (Full Stack)

Start all services (React Frontend on Nginx, FastAPI Backend, Qdrant Vector DB):

```bash
docker compose up --build
```

- **Frontend:** [http://localhost:3000](http://localhost:3000)
- **Backend API Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Check:** [http://localhost:8000/api/health](http://localhost:8000/api/health)
- **Qdrant Dashboard:** [http://localhost:6333/dashboard](http://localhost:6333/dashboard)

### Option B: Local Frontend Development (React + Vite)

If you are developing the frontend locally while the backend is running:

```bash
cd frontend
npm ci
npm run dev
```

Open [http://127.0.0.1:3001](http://127.0.0.1:3001). Vite proxies `/api` requests to `http://127.0.0.1:8000`. If your backend is at a different location, specify `API_PROXY_TARGET="http://backend-host:8000" npm run dev`.

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
┌────────────────────────┐     ┌──────────────────────────────────────────┐     ┌─────────┐
│     React Frontend     │────▶│             FastAPI Backend              │────▶│  Qdrant  │
│ (Vite / Nginx in Docker│     │                                          │     │ (Vectors)│
└────────────────────────┘     │  ┌──────────┐ ┌──────────┐ ┌──────────┐ │     └─────────┘
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
    ├── Dockerfile               # Multi-stage: Node build -> Nginx static serving
    ├── nginx.conf               # Production reverse proxy & SPA routing
    ├── package.json             # React 19, Vite, Phosphor Icons, Manrope
    ├── vite.config.js           # Vite dev server with /api proxy & code splitting
    ├── index.html               # React mount root
    ├── public/                  # Static assets
    ├── src/
    │   ├── main.jsx             # React application entry
    │   ├── App.jsx              # Main workspace, navigation, chat, library
    │   ├── components/          # Accessible dialogs & shared controls
    │   ├── features/            # Library, upload modals, composer
    │   ├── lib/                 # API/SSE streaming client, validation, study modes
    │   └── styles/              # Design tokens, themes, typography
    └── tests/                   # Stream parser & unit tests
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
