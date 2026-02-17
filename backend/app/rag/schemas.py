from pydantic import BaseModel, Field


class IngestDocument(BaseModel):
    """Un document à vectoriser et stocker."""

    content: str = Field(..., min_length=1, description="Texte du document")
    metadata: dict = Field(default_factory=dict, description="Métadonnées optionnelles (source, titre, etc.)")


class IngestBatch(BaseModel):
    """Lot de documents pour l'ingestion (data pour le prof)."""

    documents: list[IngestDocument] = Field(..., min_length=1)


class RagQuery(BaseModel):
    """Question posée au chatbot RAG."""

    question: str = Field(..., min_length=1)
    k: int = Field(default=4, ge=1, le=20, description="Nombre de chunks à récupérer")


class RagQueryResponse(BaseModel):
    """Réponse du chatbot avec sources (recherche vectorielle)."""

    answer: str
    sources: list[dict] = Field(default_factory=list, description="Chunks utilisés (content + metadata)")


class DataExport(BaseModel):
    """Export de la data vectorisée pour que le prof puisse challenger."""

    documents: list[dict] = Field(..., description="Liste des documents actuellement vectorisés (content + metadata)")
