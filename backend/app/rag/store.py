"""
Store RAG: embeddings OpenAI + stockage pgvector.

- add_documents: vectorise les textes (LangChain OpenAIEmbeddings) et les insère en base.
- similarity_search: récupère les k chunks les plus proches de la question (recherche vectorielle).
"""

import uuid
from typing import Any

import asyncpg
import structlog
from langchain_openai import OpenAIEmbeddings
from pgvector.asyncpg import register_vector

from app.config import settings

logger = structlog.get_logger()

# Dimension des embeddings OpenAI text-embedding-3-small
EMBEDDING_DIM = 1536

_pool: asyncpg.Pool | None = None


def _pg_url() -> str:
    """URL Postgres pour asyncpg (sans +asyncpg)."""
    return settings.database_url.replace("postgresql+asyncpg://", "postgresql://", 1)


async def get_pool() -> asyncpg.Pool:
    global _pool
    if _pool is None:
        _pool = await asyncpg.create_pool(
            _pg_url(),
            min_size=1,
            max_size=5,
            init=register_vector,
            command_timeout=30,
        )
        logger.info("rag_pool_created")
    return _pool


async def add_documents(documents: list[tuple[str, dict]]) -> int:
    """
    Vectorise les (content, metadata) avec OpenAI et les insère dans rag_documents.
    Retourne le nombre de documents insérés.
    """
    if not documents:
        return 0
    embeddings_client = OpenAIEmbeddings(model="text-embedding-3-small", api_key=settings.openai_api_key)
    texts = [d[0] for d in documents]
    metadatas = [d[1] for d in documents]
    # Un seul appel batch pour limiter la latence
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
                asyncpg.types.JSONB(meta),
                embedding,
            )
            count += 1
    logger.info("rag_ingest", count=count)
    return count


async def similarity_search(query_embedding: list[float], k: int = 4) -> list[dict[str, Any]]:
    """
    Recherche vectorielle: retourne les k documents les plus proches (cosine).
    """
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT content, metadata, embedding <=> $1 AS distance
            FROM rag_documents
            ORDER BY embedding <=> $1
            LIMIT $2
            """,
            query_embedding,
            k,
        )
    return [
        {"content": r["content"], "metadata": dict(r["metadata"] or {}), "distance": float(r["distance"])}
        for r in rows
    ]


async def list_documents() -> list[dict[str, Any]]:
    """Liste les documents vectorisés (pour fournir la data au prof)."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            "SELECT id, content, metadata, created_at FROM rag_documents ORDER BY created_at"
        )
    return [
        {
            "id": str(r["id"]),
            "content": r["content"],
            "metadata": dict(r["metadata"] or {}),
            "created_at": r["created_at"].isoformat() if r["created_at"] else None,
        }
        for r in rows
    ]


async def close_pool() -> None:
    global _pool
    if _pool is not None:
        await _pool.close()
        _pool = None
        logger.info("rag_pool_closed")
