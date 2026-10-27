"""Embedding model abstraction.

Wraps sentence-transformers to provide a clean interface.
The model is loaded lazily and cached as a singleton.
"""

from sentence_transformers import SentenceTransformer
from app.config import get_settings
from app.utils.logging import get_logger

logger = get_logger("embedder")

_embedder: "Embedder | None" = None


class Embedder:
    """Generates dense vector embeddings from text."""

    def __init__(self, model_name: str):
        logger.info(f"Loading embedding model: {model_name}")
        self.model = SentenceTransformer(model_name)
        self.dimension = self.model.get_sentence_embedding_dimension()
        logger.info(f"Embedding model loaded (dim={self.dimension})")

    def embed(self, texts: list[str]) -> list[list[float]]:
        """Generate embeddings for a list of texts.
        
        Args:
            texts: List of strings to embed
            
        Returns:
            List of embedding vectors (list of floats)
        """
        if not texts:
            return []
        embeddings = self.model.encode(
            texts,
            show_progress_bar=False,
            normalize_embeddings=True,
            batch_size=64,
        )
        return embeddings.tolist()

    def embed_query(self, query: str) -> list[float]:
        """Generate embedding for a single query string."""
        return self.embed([query])[0]


def get_embedder() -> Embedder:
    """Get or create the singleton embedder instance."""
    global _embedder
    if _embedder is None:
        settings = get_settings()
        _embedder = Embedder(settings.EMBEDDING_MODEL)
    return _embedder


def init_embedder():
    """Eagerly initialize the embedder (called at startup)."""
    get_embedder()
