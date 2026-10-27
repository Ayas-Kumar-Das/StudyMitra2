"""Unified retriever: orchestrates the full retrieval pipeline.

embed query → vector search → keyword search → hybrid merge → rerank
"""

from app.retrieval.embedder import get_embedder
from app.retrieval.vector_store import get_vector_store
from app.retrieval.keyword import get_keyword_searcher
from app.retrieval.hybrid import weighted_merge
from app.retrieval.reranker import get_reranker
from app.config import get_settings
from app.utils.logging import get_logger

logger = get_logger("retriever")


async def retrieve(
    query: str,
    top_k: int = 5,
    filters: dict | None = None,
) -> list[dict]:
    """Run the full hybrid retrieval pipeline.
    
    Steps:
    1. Embed the query
    2. Vector search in Qdrant (with metadata filters)
    3. BM25 keyword search (with metadata filters)
    4. Merge via Reciprocal Rank Fusion
    5. Rerank with cross-encoder (if enabled)
    
    Args:
        query: User's question or search query
        top_k: Number of final results to return
        filters: Metadata filters (subject, semester, doc_type, document_ids)
    
    Returns:
        List of chunk dicts with text, metadata, and relevance scores
    """
    settings = get_settings()
    retrieval_k = settings.RETRIEVAL_TOP_K  # candidates before reranking

    # Step 1: Embed query
    embedder = get_embedder()
    query_vector = embedder.embed_query(query)

    # Step 2: Vector search
    vector_store = get_vector_store()
    vector_results = await vector_store.search(
        query_vector=query_vector,
        top_k=retrieval_k,
        filters=filters,
    )
    logger.debug(f"Vector search: {len(vector_results)} results")

    # Step 3: Keyword search
    keyword_searcher = get_keyword_searcher()
    keyword_results = keyword_searcher.search(
        query=query,
        top_k=retrieval_k,
        filters=filters,
    )
    logger.debug(f"Keyword search: {len(keyword_results)} results")

    # Step 4: Hybrid merge
    merged = weighted_merge(
        vector_results=vector_results,
        keyword_results=keyword_results,
        alpha=settings.HYBRID_ALPHA,
        top_k=retrieval_k,
    )
    logger.debug(f"Hybrid merge: {len(merged)} results")

    # Step 5: Rerank (optional)
    reranker = get_reranker()
    if reranker and merged:
        reranker_top_k = min(top_k, settings.RERANKER_TOP_K)
        final_results = reranker.rerank(query, merged, top_k=reranker_top_k)
        logger.debug(f"Reranked to {len(final_results)} results")
    else:
        final_results = merged[:top_k]

    # Assign final relevance scores
    for i, result in enumerate(final_results):
        result["relevance_score"] = result.get("rerank_score", result.get("rrf_score", result.get("score", 0)))

    logger.info(
        f"Retrieved {len(final_results)} chunks for query: '{query[:80]}...' "
        f"(vector={len(vector_results)}, keyword={len(keyword_results)}, "
        f"merged={len(merged)})"
    )
    return final_results
