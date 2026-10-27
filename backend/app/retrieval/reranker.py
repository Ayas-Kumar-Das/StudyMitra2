"""Cross-encoder reranker for improving retrieval precision.

Uses a cross-encoder model to score query-passage pairs directly,
which is more accurate than bi-encoder similarity but slower.
Applied after initial retrieval to rerank the top candidates.
"""

from sentence_transformers import CrossEncoder
from app.config import get_settings
from app.utils.logging import get_logger

logger = get_logger("reranker")

_reranker: "Reranker | None" = None


class Reranker:
    """Cross-encoder reranker for post-retrieval precision improvement."""

    def __init__(self, model_name: str):
        logger.info(f"Loading reranker model: {model_name}")
        self.model = CrossEncoder(model_name)
        logger.info("Reranker model loaded")

    def rerank(
        self,
        query: str,
        results: list[dict],
        top_k: int = 5,
    ) -> list[dict]:
        """Rerank retrieval results using cross-encoder scoring.
        
        Args:
            query: The original query
            results: Retrieved chunks (must have 'text' key)
            top_k: Number of results to keep after reranking
        
        Returns:
            Reranked list (top_k items), sorted by cross-encoder score
        """
        if not results:
            return []

        # Build query-passage pairs
        pairs = [(query, r.get("text", "")) for r in results]

        # Score all pairs
        scores = self.model.predict(pairs, show_progress_bar=False)

        # Attach scores and sort
        for result, score in zip(results, scores):
            result["rerank_score"] = float(score)

        reranked = sorted(results, key=lambda x: x["rerank_score"], reverse=True)

        logger.debug(
            f"Reranked {len(results)} results → top {top_k} "
            f"(best: {reranked[0]['rerank_score']:.3f})"
        )
        return reranked[:top_k]


def get_reranker() -> Reranker | None:
    """Get the singleton reranker (None if disabled)."""
    global _reranker
    settings = get_settings()

    if not settings.RERANKER_ENABLED:
        return None

    if _reranker is None:
        _reranker = Reranker(settings.RERANKER_MODEL)

    return _reranker


def init_reranker():
    """Eagerly initialize the reranker if enabled."""
    settings = get_settings()
    if settings.RERANKER_ENABLED:
        get_reranker()
    else:
        logger.info("Reranker disabled")
