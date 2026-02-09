"""Add batch indexes and fix cost precision

Revision ID: 007_batch_indexes_and_precision
Revises: 006_add_batch_tables
Create Date: 2026-02-09 14:00:00.000000
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = "007_batch_indexes_and_precision"
down_revision = "006_add_batch_tables"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add missing indexes for common query patterns
    op.create_index("ix_batch_items_status", "batch_items", ["status"])
    op.create_index("ix_batch_items_execution_id", "batch_items", ["execution_id"])

    # Align cost precision: batch total should match item precision (10,6)
    op.alter_column(
        "batch_executions",
        "total_cost_cents",
        type_=sa.Numeric(10, 6),
        existing_type=sa.Numeric(10, 4),
    )


def downgrade() -> None:
    op.alter_column(
        "batch_executions",
        "total_cost_cents",
        type_=sa.Numeric(10, 4),
        existing_type=sa.Numeric(10, 6),
    )
    op.drop_index("ix_batch_items_execution_id", table_name="batch_items")
    op.drop_index("ix_batch_items_status", table_name="batch_items")
