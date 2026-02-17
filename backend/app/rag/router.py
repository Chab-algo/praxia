"""
API RAG: ingestion, recherche vectorielle (démo), export data pour le prof.
"""

import structlog
from fastapi import APIRouter, HTTPException

from app.rag.chain import query_rag
from app.rag.schemas import DataExport, IngestBatch, RagQuery, RagQueryResponse
from app.rag.store import add_documents, list_documents

logger = structlog.get_logger()

router = APIRouter(prefix="/rag", tags=["rag"])


@router.post("/ingest", status_code=201)
async def ingest(body: IngestBatch):
    """
    Ingestion: vectorise les documents et les stocke (pgvector).
    Utiliser cette route pour charger la data avant la démo.
    """
    if not body.documents:
        raise HTTPException(422, detail="documents requis")
    payload = [(d.content, d.metadata) for d in body.documents]
    count = await add_documents(payload)
    return {"ingested": count}


@router.post("/query", response_model=RagQueryResponse)
async def query(body: RagQuery):
    """
    Recherche vectorielle + réponse LLM (démo chatbot RAG).
    Le prof peut challenger les résultats en live avec la data exportée.
    """
    answer, sources = await query_rag(body.question, k=body.k)
    return RagQueryResponse(answer=answer, sources=sources)


@router.get("/data", response_model=DataExport)
async def export_data():
    """
    Export de la data vectorisée pour que le prof puisse challenger les réponses.
    """
    documents = await list_documents()
    return DataExport(
        documents=[{"content": d["content"], "metadata": d["metadata"]} for d in documents]
    )
