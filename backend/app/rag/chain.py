"""
Chaîne LangChain RAG : Retriever -> format_docs -> Prompt (expert) -> ChatOpenAI -> réponse.

- _format_docs : concatène les page_content des documents pour le prompt.
- create_rag_chain : construit la chaîne (retriever | format_docs | prompt | llm).
- query_rag : orchestration complète (retriever avec filter/score_threshold, prompt expert,
  LLM) ; retourne réponse et sources avec score pour que le prof puisse challenger.
"""

from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI

from app.config import settings
from app.rag.retriever import PgVectorRetriever

# Prompt système pour l'expert « agents IA » (RAG spécialiste).
SYSTEM_PROMPT_AGENTS_IA = (
    "Tu es un expert en agents IA, bonnes pratiques et frameworks (LangChain, etc.). "
    "Tu réponds uniquement à partir du contexte fourni (recherche vectorielle). "
    "Cite explicitement les sources (titres ou extraits) quand c'est pertinent. "
    "Si le contexte ne contient pas l'information, dis-le clairement."
)
SYSTEM_PROMPT_DEFAULT = (
    "Tu réponds à la question en t'appuyant uniquement sur le contexte suivant (recherche vectorielle). "
    "Cite les sources quand c'est pertinent. Si le contexte ne contient pas l'information, dis-le clairement."
)


def _format_docs(docs):
    """Formate les documents récupérés en un seul bloc pour le prompt."""
    return "\n\n---\n\n".join(doc.page_content for doc in docs)


def _get_system_prompt(specialist: str | None) -> str:
    if specialist == "agents_ia":
        return SYSTEM_PROMPT_AGENTS_IA
    return SYSTEM_PROMPT_DEFAULT


def _get_filter_metadata(specialist: str | None, filter_metadata: dict | None) -> dict | None:
    if filter_metadata is not None:
        return filter_metadata
    if specialist == "agents_ia":
        return {"source": "agents_ia"}
    return None


def create_rag_chain(k: int = 4):
    """
    Crée la chaîne RAG LangChain : retriever -> format_docs -> prompt -> LLM.
    Utilisée pour une invocation générique ; pour l'API avec specialist/score_threshold,
    utiliser query_rag directement.
    """
    retriever = PgVectorRetriever(k=k)
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", SYSTEM_PROMPT_DEFAULT),
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


async def query_rag(
    question: str,
    k: int = 6,
    specialist: str | None = "agents_ia",
    score_threshold: float | None = 0.65,
    filter_metadata: dict | None = None,
) -> tuple[str, list[dict]]:
    """
    Interroge le RAG : retriever (avec filter_metadata et score_threshold), format_docs,
    prompt système selon specialist, puis LLM. Retourne (réponse, sources) avec score
    dans chaque source pour que le prof puisse challenger.
    """
    meta_filter = _get_filter_metadata(specialist, filter_metadata)
    retriever = PgVectorRetriever(
        k=k,
        score_threshold=score_threshold,
        filter_metadata=meta_filter,
    )
    docs = await retriever.ainvoke(question)
    sources = [
        {
            "content": d.page_content,
            "metadata": d.metadata,
            "score": round(d.metadata.get("score", 0), 4),
        }
        for d in docs
    ]
    context_str = _format_docs(docs) if docs else "(Aucun document pertinent)"
    system_prompt = _get_system_prompt(specialist)
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", system_prompt),
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
