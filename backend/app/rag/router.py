"""
API RAG : ingestion, recherche vectorielle (chatbot expert), export data pour le prof.
"""

import structlog
from fastapi import APIRouter, HTTPException, Query

from app.rag.chain import query_rag
from app.rag.schemas import DataExport, IngestBatch, RagQuery, RagQueryResponse
from app.rag.store import add_documents, list_documents

logger = structlog.get_logger()

router = APIRouter(prefix="/rag", tags=["rag"])


@router.post("/ingest", status_code=201)
async def ingest(body: IngestBatch):
    """
    Ingestion : vectorise les documents et les stocke en base.
    Utiliser cette route (ou le script ingest) pour charger la data avant la démo.
    """
    if not body.documents:
        raise HTTPException(422, detail="documents requis")
    payload = [(d.content, d.metadata) for d in body.documents]
    count = await add_documents(payload)
    return {"ingested": count}


@router.post("/query", response_model=RagQueryResponse)
async def query(body: RagQuery):
    """
    Recherche vectorielle + réponse LLM (chatbot RAG). Paramètres optionnels :
    specialist (ex. agents_ia), score_threshold, filter_metadata.
    Réponse avec answer et sources (content, metadata, score) pour challenger.
    """
    answer, sources = await query_rag(
        question=body.question,
        k=body.k,
        specialist=body.specialist,
        score_threshold=body.score_threshold,
        filter_metadata=body.filter_metadata,
    )
    return RagQueryResponse(answer=answer, sources=sources)


@router.get("/data", response_model=DataExport)
async def export_data(
    source: str | None = Query(default=None, description="Filtrer par metadata.source (ex. agents_ia)"),
    include_embeddings: bool = Query(default=True, description="Inclure les embeddings pour recalcul cosine"),
):
    """
    Export de la data vectorisée pour que le prof puisse challenger les réponses.
    Optionnel : filtre par source, inclusion des embeddings pour recalculer la similarité.
    """
    filter_metadata = {"source": source} if source else None
    documents = await list_documents(
        filter_metadata=filter_metadata,
        include_embeddings=include_embeddings,
    )
    return DataExport(documents=documents)
