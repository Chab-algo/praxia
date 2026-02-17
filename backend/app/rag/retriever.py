"""
Retriever LangChain qui s'appuie sur le store pgvector (recherche vectorielle).

- Hérite de BaseRetriever pour pouvoir l'enchaîner avec un LLM dans une chain.
- get_relevant_documents / aget_relevant_documents: prennent la question, font l'embedding,
  puis appellent store.similarity_search.
"""

from langchain_core.callbacks import AsyncCallbackManagerForRetrieverRun
from langchain_core.documents import Document
from langchain_core.retrievers import BaseRetriever
from langchain_core.runnables import RunnableConfig
from langchain_openai import OpenAIEmbeddings

from app.config import settings
from app.rag.store import similarity_search


class PgVectorRetriever(BaseRetriever):
    """Retriever qui interroge la table rag_documents (pgvector)."""

    k: int = 4
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
        # Sync: on utilise l'async dans un run_until_complete si besoin; l'API RAG sera async.
        raise NotImplementedError("Utiliser aget_relevant_documents (async)")

    async def _aget_relevant_documents(
        self,
        query: str,
        *,
        run_manager: AsyncCallbackManagerForRetrieverRun | None = None,
        config: RunnableConfig | None = None,
    ) -> list[Document]:
        query_embedding = await self.embeddings.aembed_query(query)
        hits = await similarity_search(query_embedding, k=self.k)
        return [
            Document(page_content=h["content"], metadata={**h["metadata"], "distance": h["distance"]})
            for h in hits
        ]
