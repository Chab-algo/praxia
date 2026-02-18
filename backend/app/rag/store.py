"""
Store RAG: embeddings OpenAI + stockage JSONB (sans pgvector, compatible Railway).

- add_documents: vectorise les textes (LangChain OpenAIEmbeddings) et les insère en base.
- similarity_search: récupère les k chunks les plus proches (cosine en Python).
"""

import uuid
from typing import Any

import asyncpg
import structlog
from langchain_openai import OpenAIEmbeddings

from app.config import settings

logger = structlog.get_logger()

_pool: asyncpg.Pool | None = None


def _pg_url() -> str:
    """URL Postgres pour asyncpg (sans +asyncpg)."""
    return settings.database_url.replace("postgresql+asyncpg://", "postgresql://", 1)


def _cosine_distance(a: list[float], b: list[float]) -> float:
    """Distance cosine (1 - similarité). Plus c'est petit, plus c'est proche."""
    dot = sum(x * y for x, y in zip(a, b, strict=True))
    na = sum(x * x for x in a) ** 0.5
    nb = sum(x * x for x in b) ** 0.5
    if na == 0 or nb == 0:
        return 1.0
    return 1.0 - (dot / (na * nb))


async def get_pool() -> asyncpg.Pool:
    global _pool
    if _pool is None:
        _pool = await asyncpg.create_pool(
            _pg_url(),
            min_size=1,
            max_size=5,
            command_timeout=30,
        )
        logger.info("rag_pool_created")
    return _pool


async def add_documents(documents: list[tuple[str, dict]]) -> int:
    """
    Vectorise les (content, metadata) avec OpenAI et les insère dans rag_documents.
    """
    if not documents:
        return 0
    embeddings_client = OpenAIEmbeddings(model="text-embedding-3-small", api_key=settings.openai_api_key)
    texts = [d[0] for d in documents]
    metadatas = [d[1] for d in documents]
    vectors = await embeddings_client.aembed_documents(texts)
    pool = await get_pool()
    count = 0
    async with pool.acquire() as conn:
        for content, meta, embedding in zip(texts, metadatas, vectors, strict=True):
            await conn.execute(
                """
                INSERT INTO rag_documents (id, content, metadata, embedding)
                VALUES ($1, $2, $3, $4)
                """,
                uuid.uuid4(),
                content,
                meta,
                embedding,
            )
            count += 1
    logger.info("rag_ingest", count=count)
    return count


async def similarity_search(
    query_embedding: list[float],
    k: int = 4,
    filter_metadata: dict | None = None,
) -> list[dict[str, Any]]:
    """
    Recherche vectorielle : charge les docs (éventuellement filtrés par metadata), calcule la
    similarité cosine, trie et retourne les k plus proches. Chaque hit contient content,
    metadata, distance (cosine) et score (1 - distance) pour que le prof puisse challenger.
    """
    pool = await get_pool()
    async with pool.acquire() as conn:
        if filter_metadata:
            rows = await conn.fetch(
                "SELECT content, metadata, embedding FROM rag_documents WHERE metadata @> $1::jsonb",
                filter_metadata,
            )
        else:
            rows = await conn.fetch(
                "SELECT content, metadata, embedding FROM rag_documents"
            )
    scored = [
        (
            _cosine_distance(query_embedding, list(r["embedding"])),
            {"content": r["content"], "metadata": dict(r["metadata"] or {})},
        )
        for r in rows
    ]
    scored.sort(key=lambda x: x[0])
    return [
        {
            "content": s[1]["content"],
            "metadata": s[1]["metadata"],
            "distance": s[0],
            "score": 1.0 - s[0],
        }
        for s in scored[:k]
    ]


async def list_documents(
    filter_metadata: dict | None = None,
    include_embeddings: bool = False,
) -> list[dict[str, Any]]:
    """
    Liste les documents vectorisés (export pour le prof). Optionnel : filtre par metadata,
    inclusion des embeddings pour recalculer la similarité cosine côté client.
    """
    pool = await get_pool()
    async with pool.acquire() as conn:
        if filter_metadata:
            if include_embeddings:
                rows = await conn.fetch(
                    "SELECT id, content, metadata, created_at, embedding FROM rag_documents WHERE metadata @> $1::jsonb ORDER BY created_at",
                    filter_metadata,
                )
            else:
                rows = await conn.fetch(
                    "SELECT id, content, metadata, created_at FROM rag_documents WHERE metadata @> $1::jsonb ORDER BY created_at",
                    filter_metadata,
                )
        else:
            if include_embeddings:
                rows = await conn.fetch(
                    "SELECT id, content, metadata, created_at, embedding FROM rag_documents ORDER BY created_at"
                )
            else:
                rows = await conn.fetch(
                    "SELECT id, content, metadata, created_at FROM rag_documents ORDER BY created_at"
                )
    result = []
    for r in rows:
        doc = {
            "id": str(r["id"]),
            "content": r["content"],
            "metadata": dict(r["metadata"] or {}),
            "created_at": r["created_at"].isoformat() if r["created_at"] else None,
        }
        if include_embeddings and "embedding" in r:
            doc["embedding"] = list(r["embedding"])
        result.append(doc)
    return result


async def close_pool() -> None:
    global _pool
    if _pool is not None:
        await _pool.close()
        _pool = None
        logger.info("rag_pool_closed")
