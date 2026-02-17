"""RAG: rag_documents table (embeddings en JSONB, sans pgvector pour Railway)

Revision ID: 008_rag_pgvector
Revises: 007_batch_indexes_and_precision
Create Date: 2026-02-17

"""
from alembic import op
import sqlalchemy as sa

revision = "008_rag_pgvector"
down_revision = "007_batch_indexes_and_precision"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "rag_documents",
        sa.Column("id", sa.Uuid(), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("metadata", sa.dialects.postgresql.JSONB(astext_type=sa.Text()), server_default="{}", nullable=True),
        sa.Column("embedding", sa.dialects.postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()"), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("rag_documents")
