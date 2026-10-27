"""Hybrid retrieval: merges vector and keyword search results using RRF.

Reciprocal Rank Fusion (RRF) provides a robust way to combine ranked 
lists from different retrieval methods without needing score normalization.
"""

from app.utils.logging import get_logger

logger = get_logger("hybrid")


def reciprocal_rank_fusion(
    result_lists: list[list[dict]],
    k: int = 60,
) -> list[dict]:
    """Merge multiple ranked result lists using Reciprocal Rank Fusion.
    
    RRF score = Σ 1 / (k + rank_i) for each list
    
    Args:
        result_lists: List of ranked result lists (each item has 'id' key)
        k: Constant to prevent high scores from dominating (typically 60)
    
    Returns:
        Merged list sorted by RRF score, descending
    """
    rrf_scores: dict[str, float] = {}
    chunk_data: dict[str, dict] = {}

    for results in result_lists:
        for rank, result in enumerate(results):
            chunk_id = result["id"]
            rrf_scores[chunk_id] = rrf_scores.get(chunk_id, 0) + 1.0 / (k + rank + 1)

            # Keep the result data from the first list that has it
            if chunk_id not in chunk_data:
                chunk_data[chunk_id] = result

    # Sort by RRF score
    sorted_ids = sorted(rrf_scores.keys(), key=lambda x: rrf_scores[x], reverse=True)

    merged = []
    for chunk_id in sorted_ids:
        entry = chunk_data[chunk_id].copy()
        entry["rrf_score"] = rrf_scores[chunk_id]
        merged.append(entry)

    logger.debug(
        f"RRF merged {sum(len(r) for r in result_lists)} results from "
        f"{len(result_lists)} lists → {len(merged)} unique"
    )
    return merged


def weighted_merge(
    vector_results: list[dict],
    keyword_results: list[dict],
    alpha: float = 0.7,
    top_k: int = 10,
) -> list[dict]:
    """Merge vector and keyword results with configurable weighting.
    
    Uses RRF internally but allows controlling the relative 
    importance of vector vs keyword results via alpha.
    
    Args:
        vector_results: Results from semantic/vector search
        keyword_results: Results from BM25 keyword search
        alpha: Weight for vector results (1.0 = all vector, 0.0 = all keyword)
        top_k: Maximum results to return
    
    Returns:
        Merged results sorted by combined score
    """
    if alpha >= 1.0:
        return vector_results[:top_k]
    if alpha <= 0.0:
        return keyword_results[:top_k]

    # Use RRF for fusion
    merged = reciprocal_rank_fusion([vector_results, keyword_results])
    return merged[:top_k]
