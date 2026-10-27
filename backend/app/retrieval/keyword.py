"""BM25-based keyword search for hybrid retrieval.

Maintains an in-memory BM25 index over all document chunks.
Rebuilt on startup from Qdrant, updated incrementally during ingestion.
"""

import re
from rank_bm25 import BM25Okapi
from app.utils.logging import get_logger

logger = get_logger("keyword")

_keyword_searcher: "KeywordSearcher | None" = None


class KeywordSearcher:
    """BM25 keyword search over document chunks."""

    def __init__(self):
        self._corpus: list[list[str]] = []  # tokenized texts
        self._chunk_ids: list[str] = []
        self._chunk_data: list[dict] = []  # full chunk payloads
        self._doc_id_map: dict[str, list[int]] = {}  # document_id -> indices
        self._bm25: BM25Okapi | None = None

    def build_index(self, chunks: list[dict]):
        """Build the BM25 index from a list of chunks."""
        self._corpus = []
        self._chunk_ids = []
        self._chunk_data = []
        self._doc_id_map = {}

        for i, chunk in enumerate(chunks):
            tokens = self._tokenize(chunk.get("text", ""))
            self._corpus.append(tokens)
            self._chunk_ids.append(chunk["id"])
            self._chunk_data.append(chunk)

            doc_id = chunk.get("document_id", "")
            if doc_id not in self._doc_id_map:
                self._doc_id_map[doc_id] = []
            self._doc_id_map[doc_id].append(i)

        if self._corpus:
            self._bm25 = BM25Okapi(self._corpus)

        logger.info(f"Built BM25 index with {len(self._corpus)} chunks")

    def add_chunks(self, chunks: list[dict]):
        """Add new chunks to the existing index (triggers rebuild)."""
        for chunk in chunks:
            idx = len(self._corpus)
            tokens = self._tokenize(chunk.get("text", ""))
            self._corpus.append(tokens)
            self._chunk_ids.append(chunk["id"])
            self._chunk_data.append(chunk)

            doc_id = chunk.get("document_id", "")
            if doc_id not in self._doc_id_map:
                self._doc_id_map[doc_id] = []
            self._doc_id_map[doc_id].append(idx)

        if self._corpus:
            self._bm25 = BM25Okapi(self._corpus)

        logger.debug(f"Added {len(chunks)} chunks to BM25 index (total: {len(self._corpus)})")

    def remove_document(self, document_id: str):
        """Remove all chunks for a document and rebuild index."""
        if document_id not in self._doc_id_map:
            return

        indices_to_remove = set(self._doc_id_map[document_id])

        # Rebuild without removed indices
        new_corpus = []
        new_ids = []
        new_data = []
        new_doc_map: dict[str, list[int]] = {}

        for i in range(len(self._corpus)):
            if i not in indices_to_remove:
                new_idx = len(new_corpus)
                new_corpus.append(self._corpus[i])
                new_ids.append(self._chunk_ids[i])
                new_data.append(self._chunk_data[i])

                doc_id = self._chunk_data[i].get("document_id", "")
                if doc_id not in new_doc_map:
                    new_doc_map[doc_id] = []
                new_doc_map[doc_id].append(new_idx)

        self._corpus = new_corpus
        self._chunk_ids = new_ids
        self._chunk_data = new_data
        self._doc_id_map = new_doc_map
        self._bm25 = BM25Okapi(self._corpus) if self._corpus else None

        logger.info(f"Removed document {document_id} from BM25 index (remaining: {len(self._corpus)})")

    def search(
        self,
        query: str,
        top_k: int = 10,
        filters: dict | None = None,
    ) -> list[dict]:
        """Search the BM25 index.
        
        Args:
            query: Search query string
            top_k: Max results to return
            filters: Optional metadata filters (subject, doc_type, etc.)
            
        Returns:
            List of dicts with id, score, and chunk data
        """
        if not self._bm25 or not self._corpus:
            return []

        tokens = self._tokenize(query)
        scores = self._bm25.get_scores(tokens)

        # Build scored results
        scored = []
        for i, score in enumerate(scores):
            if score <= 0:
                continue

            chunk = self._chunk_data[i]

            # Apply filters
            if filters:
                if filters.get("subject") and chunk.get("subject") != filters["subject"]:
                    continue
                if filters.get("semester") and chunk.get("semester") != filters["semester"]:
                    continue
                if filters.get("doc_type") and chunk.get("doc_type") != filters["doc_type"]:
                    continue
                if filters.get("document_ids") and chunk.get("document_id") not in filters["document_ids"]:
                    continue

            scored.append({
                "id": self._chunk_ids[i],
                "score": float(score),
                **chunk,
            })

        # Sort by score descending
        scored.sort(key=lambda x: x["score"], reverse=True)
        return scored[:top_k]

    @property
    def size(self) -> int:
        """Number of chunks in the index."""
        return len(self._corpus)

    @staticmethod
    def _tokenize(text: str) -> list[str]:
        """Simple whitespace + punctuation tokenizer."""
        text = text.lower()
        tokens = re.findall(r"\b\w+\b", text)
        # Remove very short tokens
        return [t for t in tokens if len(t) > 1]


def get_keyword_searcher() -> KeywordSearcher:
    """Get or create the singleton keyword searcher."""
    global _keyword_searcher
    if _keyword_searcher is None:
        _keyword_searcher = KeywordSearcher()
    return _keyword_searcher
