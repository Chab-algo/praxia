# RAG – Recherche vectorielle (démo)

## Stack (léger pour Railway)

- **Postgres + pgvector** : pas de service en plus, extension dans la même DB.
- **LangChain** : `langchain-core` + `langchain-openai` (embeddings + ChatOpenAI).
- **Embeddings** : OpenAI `text-embedding-3-small` (1536 dim).

## Data vectorisée (à fournir au prof)

- Fichier : `backend/data/rag_sample.json`.
- Après ingestion : **GET /rag/data** renvoie la liste des documents actuellement en base (pour challenger les réponses en live).

## Démo

1. **Ingestion** (une fois) :
   ```bash
   # Backend démarré + migration 008 appliquée
   uv run python -m scripts.ingest_rag_sample
   ```
   Ou en HTTP : **POST /rag/ingest** avec le body de `data/rag_sample.json`.

2. **Recherche vectorielle** : **POST /rag/query**  
   Body : `{ "question": "Comment fonctionne la recherche vectorielle dans PraxIA ?", "k": 4 }`  
   Réponse : `{ "answer": "...", "sources": [...] }`.

3. **Export data pour le prof** : **GET /rag/data**.

## Fonctions Python (pour le prof – LangChain)

- **`app/rag/store.py`** : `add_documents` (embed + insert pgvector), `similarity_search` (requête `ORDER BY embedding <=> $1`).
- **`app/rag/retriever.py`** : `PgVectorRetriever` (BaseRetriever LangChain) → `aget_relevant_documents` : embed de la question, puis `similarity_search`.
- **`app/rag/chain.py`** : `query_rag` : retriever → format_docs → `ChatPromptTemplate` + `ChatOpenAI` → réponse + sources.

## Railway

- **Postgres** : si tu utilises le Postgres Railway, vérifier que l’extension **pgvector** est disponible (certains clusters l’ont déjà). Sinon, activer l’extension dans le dashboard ou utiliser un fournisseur qui la propose.
- **Docker** : pas de changement de taille notable (3 deps : langchain-core, langchain-openai, pgvector). Image Postgres en local : `pgvector/pgvector:pg16` dans `docker-compose.yml`.
