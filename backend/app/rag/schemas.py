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
    k: int = Field(default=6, ge=1, le=20, description="Nombre de chunks à récupérer")
    specialist: str | None = Field(
        default="agents_ia",
        description="Spécialité (ex. agents_ia) pour le prompt système et le filtre metadata",
    )
    score_threshold: float | None = Field(
        default=0.65,
        ge=0,
        le=1,
        description="Seuil de similarité minimum (1 - distance) pour garder un chunk",
    )
    filter_metadata: dict | None = Field(
        default=None,
        description="Filtre optionnel sur metadata (ex. {\"source\": \"agents_ia\"})",
    )


class RagQueryResponse(BaseModel):
    """Réponse du chatbot avec sources (recherche vectorielle). Chaque source inclut score."""

    answer: str
    sources: list[dict] = Field(
        default_factory=list,
        description="Chunks utilisés (content, metadata, score de similarité)",
    )


class DataExport(BaseModel):
    """Export de la data vectorisée pour que le prof puisse challenger."""

    documents: list[dict] = Field(
        ...,
        description="Liste des documents (id, content, metadata, created_at, embedding optionnel)",
    )
