"""RAG: pgvector extension and rag_documents table

Revision ID: 008_rag_pgvector
Revises: 007_batch_indexes_and_precision
Create Date: 2026-02-17

"""
from alembic import op

revision = "008_rag_pgvector"
down_revision = "007_batch_indexes_and_precision"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")
    op.execute("""
        CREATE TABLE IF NOT EXISTS rag_documents (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            content text NOT NULL,
            metadata jsonb DEFAULT '{}',
            embedding vector(1536) NOT NULL,
            created_at timestamptz DEFAULT NOW()
        )
    """)


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS rag_documents")
    op.execute("DROP EXTENSION IF EXISTS vector")
