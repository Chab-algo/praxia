"""
Retriever LangChain qui s'appuie sur le store (recherche vectorielle).

- Hérite de BaseRetriever pour s'enchaîner avec un LLM dans une chain.
- _aget_relevant_documents : embed de la question, puis similarity_search avec filter_metadata,
  puis filtrage par score_threshold ; retourne une liste de Document (content + metadata dont score).
"""

from langchain_core.callbacks import AsyncCallbackManagerForRetrieverRun
from langchain_core.documents import Document
from langchain_core.retrievers import BaseRetriever
from langchain_core.runnables import RunnableConfig
from langchain_openai import OpenAIEmbeddings

from app.config import settings
from app.rag.store import similarity_search


class PgVectorRetriever(BaseRetriever):
    """
    Retriever qui interroge la table rag_documents : embed de la requête, recherche
    vectorielle (similarity_search), filtrage optionnel par score minimum.
    """

    k: int = 4
    score_threshold: float | None = None
    filter_metadata: dict | None = None
    embeddings: OpenAIEmbeddings | None = None

    class Config:
        arbitrary_types_allowed = True

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if self.embeddings is None:
            self.embeddings = OpenAIEmbeddings(
                model="text-embedding-3-small",
                api_key=settings.openai_api_key,
            )

    def _get_relevant_documents(self, query: str) -> list[Document]:
        raise NotImplementedError("Utiliser aget_relevant_documents (async)")

    async def _aget_relevant_documents(
        self,
        query: str,
        *,
        run_manager: AsyncCallbackManagerForRetrieverRun | None = None,
        config: RunnableConfig | None = None,
    ) -> list[Document]:
        query_embedding = await self.embeddings.aembed_query(query)
        hits = await similarity_search(
            query_embedding,
            k=self.k,
            filter_metadata=self.filter_metadata,
        )
        if self.score_threshold is not None:
            hits = [h for h in hits if h.get("score", 0) >= self.score_threshold]
        return [
            Document(
                page_content=h["content"],
                metadata={
                    **h["metadata"],
                    "distance": h["distance"],
                    "score": h.get("score", 1.0 - h["distance"]),
                },
            )
            for h in hits
        ]
