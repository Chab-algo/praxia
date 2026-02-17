"""
Chaîne LangChain RAG: Retriever (pgvector) -> Prompt -> ChatOpenAI -> réponse.

- create_rag_chain(): construit la chaîne (retriever | format_docs | prompt | llm).
- invoke_async(question): appelle la chaîne et retourne la réponse + les sources.
"""

from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI

from app.config import settings
from app.rag.retriever import PgVectorRetriever


def _format_docs(docs):
    """Formate les documents récupérés en un seul bloc pour le prompt."""
    return "\n\n---\n\n".join(doc.page_content for doc in docs)


def create_rag_chain(k: int = 4):
    """
    Crée la chaîne RAG LangChain:
    1. Retriever: question -> embedding -> recherche vectorielle pgvector -> documents
    2. Prompt: contexte (documents) + question -> message pour le LLM
    3. LLM: génère la réponse à partir du contexte
    """
    retriever = PgVectorRetriever(k=k)
    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                "Tu réponds à la question en t'appuyant uniquement sur le contexte suivant (recherche vectorielle). "
                "Cite les sources quand c'est pertinent. Si le contexte ne contient pas l'information, dis-le clairement.",
            ),
            ("human", "Contexte:\n{context}\n\nQuestion: {question}"),
        ]
    )
    llm = ChatOpenAI(
        model="gpt-4.1-mini",
        api_key=settings.openai_api_key,
        temperature=0.2,
        max_tokens=500,
    )
    chain = (
        RunnablePassthrough.assign(
            context=lambda x: retriever.ainvoke(x["question"]),
        )
        | RunnablePassthrough.assign(
            context=lambda x: _format_docs(x["context"]) if x["context"] else "(Aucun document pertinent)",
        )
        | prompt
        | llm
        | StrOutputParser()
    )
    return chain


async def query_rag(question: str, k: int = 4) -> tuple[str, list[dict]]:
    """
    Interroge le RAG: retriever une fois, puis prompt + LLM. Retourne (réponse, sources).
    """
    retriever = PgVectorRetriever(k=k)
    docs = await retriever.aget_relevant_documents(question)
    sources = [{"content": d.page_content, "metadata": d.metadata} for d in docs]
    context_str = _format_docs(docs) if docs else "(Aucun document pertinent)"
    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                "Tu réponds à la question en t'appuyant uniquement sur le contexte suivant (recherche vectorielle). "
                "Cite les sources quand c'est pertinent. Si le contexte ne contient pas l'information, dis-le clairement.",
            ),
            ("human", "Contexte:\n{context}\n\nQuestion: {question}"),
        ]
    )
    llm = ChatOpenAI(
        model="gpt-4.1-mini",
        api_key=settings.openai_api_key,
        temperature=0.2,
        max_tokens=500,
    )
    chain = prompt | llm | StrOutputParser()
    answer = await chain.ainvoke({"context": context_str, "question": question})
    return answer, sources
