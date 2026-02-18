"""
Chunking RAG : découpe de textes longs en chunks pour le pipeline d'ingestion.

- split_document(content, metadata) : découpe un document en chunks avec overlap
  (LangChain RecursiveCharacterTextSplitter), enrichit les metadata de chaque chunk.
  Utilisé avant add_documents pour ingérer des textes longs.
"""

from langchain_text_splitters import RecursiveCharacterTextSplitter


# Taille et overlap recommandés pour garder du contexte sans dépasser la fenêtre du modèle.
DEFAULT_CHUNK_SIZE = 700
DEFAULT_CHUNK_OVERLAP = 100


def split_document(
    content: str,
    metadata: dict | None = None,
    *,
    chunk_size: int = DEFAULT_CHUNK_SIZE,
    chunk_overlap: int = DEFAULT_CHUNK_OVERLAP,
) -> list[tuple[str, dict]]:
    """
    Découpe un document (texte long) en chunks avec overlap.

    Utilise RecursiveCharacterTextSplitter de LangChain pour respecter
    les paragraphes et les phrases. Retourne une liste de (chunk_text, metadata)
    prête à être passée à store.add_documents pour l'ingestion.

    Chaque chunk reçoit les metadata d'origine enrichies de chunk_index et
    éventuellement source/title si présents dans metadata.
    """
    if not content or not content.strip():
        return []

    meta = dict(metadata or {})
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        length_function=len,
        separators=["\n\n", "\n", ". ", " ", ""],
    )
    chunks = splitter.split_text(content.strip())
    result: list[tuple[str, dict]] = []
    for i, text in enumerate(chunks):
        chunk_meta = {**meta, "chunk_index": i}
        result.append((text, chunk_meta))
    return result
