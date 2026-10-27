"""Response generator: orchestrates retrieval → prompt → LLM.

This is the main entry point for answering user queries.
"""

import json
from typing import AsyncGenerator

from app.retrieval.retriever import retrieve
from app.generation.prompts import build_system_prompt, build_user_prompt
from app.generation.llm import generate, generate_stream
from app.models.chat import ChatRequest, ChatResponse, SourceCitation, ResponseMode
from app.utils.logging import get_logger

logger = get_logger("generator")


async def generate_answer(request: ChatRequest) -> ChatResponse:
    """Generate a complete answer with source citations.
    
    Pipeline:
    1. Retrieve relevant chunks
    2. Build system + user prompts
    3. Call LLM
    4. Format response with citations
    """
    # Build filter dict from request
    filters = _build_filters(request)

    # Step 1: Retrieve
    retrieved = await retrieve(
        query=request.query,
        top_k=request.top_k,
        filters=filters,
    )

    # Handle no results
    if not retrieved:
        return ChatResponse(
            answer="I couldn't find any relevant information in your uploaded documents for this query. "
                   "Please try rephrasing your question or check that you've uploaded documents covering this topic.",
            sources=[],
            mode=request.mode.value,
            query=request.query,
            total_sources_retrieved=0,
        )

    # Step 2: Build prompts
    system_prompt = build_system_prompt(request.mode)
    user_prompt = build_user_prompt(request.query, retrieved)

    # Step 3: Generate
    answer = await generate(system_prompt, user_prompt)

    # Step 4: Build citations
    citations = _build_citations(retrieved)

    logger.info(
        f"Generated answer for '{request.query[:60]}...' "
        f"mode={request.mode.value}, sources={len(citations)}"
    )

    return ChatResponse(
        answer=answer,
        sources=citations,
        mode=request.mode.value,
        query=request.query,
        total_sources_retrieved=len(retrieved),
    )


async def generate_answer_stream(request: ChatRequest) -> AsyncGenerator[str, None]:
    """Stream answer generation with SSE-compatible output.
    
    Yields JSON-encoded SSE events:
    - {"type": "token", "content": "..."}
    - {"type": "sources", "sources": [...]}
    - {"type": "done"}
    """
    filters = _build_filters(request)

    # Retrieve
    retrieved = await retrieve(
        query=request.query,
        top_k=request.top_k,
        filters=filters,
    )

    if not retrieved:
        yield json.dumps({
            "type": "token",
            "content": "I couldn't find any relevant information in your uploaded documents for this query. "
                       "Please try rephrasing your question or check that you've uploaded documents covering this topic.",
        })
        yield json.dumps({"type": "sources", "sources": []})
        yield json.dumps({"type": "done"})
        return

    # Build prompts
    system_prompt = build_system_prompt(request.mode)
    user_prompt = build_user_prompt(request.query, retrieved)

    # Stream LLM response
    async for token in generate_stream(system_prompt, user_prompt):
        yield json.dumps({"type": "token", "content": token})

    # Send sources
    citations = _build_citations(retrieved)
    yield json.dumps({
        "type": "sources",
        "sources": [c.model_dump() for c in citations],
    })

    yield json.dumps({"type": "done"})


def _build_filters(request: ChatRequest) -> dict | None:
    """Convert request filters to a dict for the retrieval layer."""
    f = request.filters
    filters = {}

    if f.subject:
        filters["subject"] = f.subject
    if f.semester:
        filters["semester"] = f.semester
    if f.doc_type:
        filters["doc_type"] = f.doc_type
    if f.document_ids:
        filters["document_ids"] = f.document_ids

    return filters if filters else None


def _build_citations(retrieved: list[dict]) -> list[SourceCitation]:
    """Convert retrieved chunks to source citation objects."""
    citations = []
    for r in retrieved:
        citations.append(SourceCitation(
            document_id=r.get("document_id", ""),
            document_name=r.get("document_name", ""),
            chunk_text=r.get("text", "")[:500],  # Truncate for response size
            page_number=r.get("page_number"),
            page_numbers=r.get("page_numbers", []),
            chapter=r.get("chapter", ""),
            section=r.get("section", ""),
            heading_path=r.get("heading_path", []),
            relevance_score=round(r.get("relevance_score", 0), 4),
            doc_type=r.get("doc_type", ""),
            subject=r.get("subject", ""),
        ))
    return citations
