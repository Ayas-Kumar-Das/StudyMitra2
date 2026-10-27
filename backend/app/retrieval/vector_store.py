"""Qdrant vector store adapter.

Provides CRUD operations for storing and retrieving document chunk 
vectors with rich metadata payloads in Qdrant.
"""

from qdrant_client import AsyncQdrantClient
from qdrant_client.models import (
    Distance,
    FieldCondition,
    Filter,
    MatchValue,
    PointStruct,
    VectorParams,
    PayloadSchemaType,
    HasIdCondition,
)

from app.config import get_settings
from app.utils.logging import get_logger

logger = get_logger("vector_store")

_vector_store: "VectorStore | None" = None


class VectorStore:
    """Qdrant-backed vector storage for document chunks."""

    def __init__(self):
        settings = get_settings()
        self.client = AsyncQdrantClient(
            host=settings.QDRANT_HOST,
            port=settings.QDRANT_PORT,
        )
        self.collection = settings.QDRANT_COLLECTION
        self.dimension = settings.EMBEDDING_DIMENSION

    async def ensure_collection(self):
        """Create collection if it doesn't exist."""
        collections = await self.client.get_collections()
        names = [c.name for c in collections.collections]

        if self.collection not in names:
            await self.client.create_collection(
                collection_name=self.collection,
                vectors_config=VectorParams(
                    size=self.dimension,
                    distance=Distance.COSINE,
                ),
            )
            # Create payload indexes for filtering
            for field in ["document_id", "subject", "semester", "doc_type"]:
                await self.client.create_payload_index(
                    collection_name=self.collection,
                    field_name=field,
                    field_schema=PayloadSchemaType.KEYWORD,
                )
            logger.info(f"Created Qdrant collection: {self.collection}")
        else:
            logger.info(f"Qdrant collection exists: {self.collection}")

    async def upsert_chunks(self, chunks: list[dict], embeddings: list[list[float]]):
        """Store chunk vectors with metadata payloads."""
        points = []
        for chunk, embedding in zip(chunks, embeddings):
            payload = {
                "text": chunk["text"],
                "document_id": chunk["document_id"],
                "document_name": chunk["document_name"],
                "chunk_index": chunk["chunk_index"],
                "page_number": chunk.get("page_number"),
                "page_numbers": chunk.get("page_numbers", []),
                "chapter": chunk.get("chapter", ""),
                "section": chunk.get("section", ""),
                "heading_path": chunk.get("heading_path", []),
                "doc_type": chunk.get("doc_type", ""),
                "subject": chunk.get("subject", ""),
                "semester": chunk.get("semester", ""),
            }
            points.append(PointStruct(
                id=chunk["id"],
                vector=embedding,
                payload=payload,
            ))

        # Batch upsert in groups of 100
        batch_size = 100
        for i in range(0, len(points), batch_size):
            batch = points[i:i + batch_size]
            await self.client.upsert(
                collection_name=self.collection,
                points=batch,
            )

        logger.info(f"Upserted {len(points)} vectors to Qdrant")

    async def search(
        self,
        query_vector: list[float],
        top_k: int = 10,
        filters: dict | None = None,
    ) -> list[dict]:
        """Semantic search with optional metadata filters.
        
        Args:
            query_vector: Query embedding vector
            top_k: Number of results to return
            filters: Dict of metadata field -> value for filtering
            
        Returns:
            List of dicts with id, score, and payload
        """
        qdrant_filter = self._build_filter(filters) if filters else None

        results = await self.client.search(
            collection_name=self.collection,
            query_vector=query_vector,
            limit=top_k,
            query_filter=qdrant_filter,
            with_payload=True,
        )

        return [
            {
                "id": str(r.id),
                "score": r.score,
                **r.payload,
            }
            for r in results
        ]

    async def delete_by_document(self, document_id: str):
        """Delete all vectors belonging to a document."""
        await self.client.delete(
            collection_name=self.collection,
            points_selector=Filter(
                must=[
                    FieldCondition(
                        key="document_id",
                        match=MatchValue(value=document_id),
                    )
                ]
            ),
        )
        logger.info(f"Deleted vectors for document: {document_id}")

    async def get_all_chunks(self) -> list[dict]:
        """Scroll through all chunks (for BM25 index rebuild)."""
        all_chunks: list[dict] = []
        offset = None

        while True:
            results, next_offset = await self.client.scroll(
                collection_name=self.collection,
                limit=500,
                offset=offset,
                with_payload=True,
                with_vectors=False,
            )

            for point in results:
                all_chunks.append({
                    "id": str(point.id),
                    **point.payload,
                })

            if next_offset is None:
                break
            offset = next_offset

        logger.info(f"Scrolled {len(all_chunks)} chunks from Qdrant")
        return all_chunks

    async def health_check(self) -> bool:
        """Check if Qdrant is reachable."""
        try:
            await self.client.get_collections()
            return True
        except Exception:
            return False

    def _build_filter(self, filters: dict) -> Filter:
        """Build a Qdrant filter from a dict of field conditions."""
        conditions = []

        # Simple field match filters
        for field in ["subject", "semester", "doc_type"]:
            if filters.get(field):
                conditions.append(
                    FieldCondition(
                        key=field,
                        match=MatchValue(value=filters[field]),
                    )
                )

        # Document ID list filter
        if filters.get("document_ids"):
            conditions.append(
                FieldCondition(
                    key="document_id",
                    match=MatchValue(value=filters["document_ids"][0]),
                )
            )
            # For multiple doc IDs, we'd use a should clause
            # but for MVP, single filter is sufficient

        return Filter(must=conditions) if conditions else None


def get_vector_store() -> VectorStore:
    """Get or create the singleton vector store instance."""
    global _vector_store
    if _vector_store is None:
        _vector_store = VectorStore()
    return _vector_store


async def init_vector_store():
    """Initialize vector store and ensure collection exists."""
    vs = get_vector_store()
    await vs.ensure_collection()
