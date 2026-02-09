"""Add batch_executions and batch_items tables

Revision ID: 006_add_batch_tables
Revises: 005_rename_metadata
Create Date: 2026-02-09 12:00:00.000000
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision = "006_add_batch_tables"
down_revision = "005_rename_metadata"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "batch_executions",
        sa.Column("id", sa.Uuid(), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("agent_id", sa.Uuid(), nullable=False),
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("status", sa.String(50), server_default=sa.text("'pending'"), nullable=False),
        sa.Column("file_type", sa.String(20), server_default=sa.text("'csv'"), nullable=False),
        sa.Column("total_items", sa.Integer(), nullable=False),
        sa.Column("completed_items", sa.Integer(), server_default=sa.text("0"), nullable=False),
        sa.Column("failed_items", sa.Integer(), server_default=sa.text("0"), nullable=False),
        sa.Column("total_cost_cents", sa.Numeric(10, 4), server_default=sa.text("0"), nullable=False),
        sa.Column("completed_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("NOW()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.text("NOW()"), nullable=False),
        sa.ForeignKeyConstraint(["agent_id"], ["agents.id"], name=op.f("fk_batch_executions_agent_id_agents")),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], name=op.f("fk_batch_executions_user_id_users")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_batch_executions")),
    )
    op.create_index(op.f("ix_batch_executions_user_id"), "batch_executions", ["user_id"])
    op.create_index(op.f("ix_batch_executions_agent_id"), "batch_executions", ["agent_id"])

    op.create_table(
        "batch_items",
        sa.Column("id", sa.Uuid(), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("batch_id", sa.Uuid(), nullable=False),
        sa.Column("item_index", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(50), server_default=sa.text("'pending'"), nullable=False),
        sa.Column("input_data", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("output_data", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("error_data", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("execution_id", sa.Uuid(), nullable=True),
        sa.Column("cost_cents", sa.Numeric(10, 6), server_default=sa.text("0"), nullable=False),
        sa.Column("duration_ms", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("NOW()"), nullable=False),
        sa.Column("completed_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(
            ["batch_id"],
            ["batch_executions.id"],
            name=op.f("fk_batch_items_batch_id_batch_executions"),
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["execution_id"],
            ["executions.id"],
            name=op.f("fk_batch_items_execution_id_executions"),
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_batch_items")),
    )
    op.create_index(op.f("ix_batch_items_batch_id"), "batch_items", ["batch_id"])


def downgrade() -> None:
    op.drop_index(op.f("ix_batch_items_batch_id"), table_name="batch_items")
    op.drop_table("batch_items")
    op.drop_index(op.f("ix_batch_executions_agent_id"), table_name="batch_executions")
    op.drop_index(op.f("ix_batch_executions_user_id"), table_name="batch_executions")
    op.drop_table("batch_executions")
