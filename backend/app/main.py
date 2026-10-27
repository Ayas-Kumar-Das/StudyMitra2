"""StudyMitra FastAPI Application.

Main entry point with lifespan management, CORS, and route registration.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.utils.logging import setup_logging, get_logger
from app.db.database import init_db, close_db
from app.retrieval.vector_store import init_vector_store, get_vector_store
from app.retrieval.embedder import init_embedder
from app.retrieval.reranker import init_reranker
from app.retrieval.keyword import get_keyword_searcher
from app.api import health, documents, chat


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown lifecycle."""
    settings = get_settings()
    logger = setup_logging(settings.DEBUG)
    log = get_logger("main")

    log.info("=" * 60)
    log.info(f"Starting {settings.APP_NAME}")
    log.info(f"Debug: {settings.DEBUG}")
    log.info(f"LLM: {settings.LLM_PROVIDER}/{settings.LLM_MODEL}")
    log.info(f"Embedding: {settings.EMBEDDING_MODEL}")
    log.info(f"Reranker: {'enabled' if settings.RERANKER_ENABLED else 'disabled'}")
    log.info("=" * 60)

    # Initialize services
    log.info("Initializing database...")
    await init_db()

    log.info("Initializing vector store...")
    await init_vector_store()

    log.info("Loading embedding model...")
    init_embedder()

    log.info("Loading reranker model...")
    init_reranker()

    # Build BM25 index from existing chunks
    log.info("Building keyword search index...")
    try:
        vs = get_vector_store()
        all_chunks = await vs.get_all_chunks()
        keyword_searcher = get_keyword_searcher()
        keyword_searcher.build_index(all_chunks)
        log.info(f"Keyword index built with {keyword_searcher.size} chunks")
    except Exception as e:
        log.warning(f"Could not build keyword index: {e}")

    log.info(f"✓ {settings.APP_NAME} ready!")

    yield  # Application runs here

    # Shutdown
    log.info("Shutting down...")
    await close_db()
    log.info("Goodbye!")


# ── Create App ───────────────────────────────────────────────────────────

app = FastAPI(
    title="StudyMitra API",
    description="Personal Academic RAG Knowledge Engine",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow frontend origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(health.router, prefix="/api")
app.include_router(health.router)  # Also expose /health for root health checks
app.include_router(documents.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
