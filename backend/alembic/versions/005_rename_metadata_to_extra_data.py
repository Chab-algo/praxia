"""Rename metadata column to extra_data (metadata is reserved in SQLAlchemy)

Revision ID: 005_rename_metadata_to_extra_data
Revises: 004_add_crm_tables
Create Date: 2026-02-07 18:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "005_rename_metadata_to_extra_data"
down_revision = "004_add_crm_tables"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Rename metadata to extra_data in leads table
    op.alter_column("leads", "metadata", new_column_name="extra_data")
    
    # Rename metadata to extra_data in opportunities table
    op.alter_column("opportunities", "metadata", new_column_name="extra_data")


def downgrade() -> None:
    # Rename extra_data back to metadata in leads table
    op.alter_column("leads", "extra_data", new_column_name="metadata")
    
    # Rename extra_data back to metadata in opportunities table
    op.alter_column("opportunities", "extra_data", new_column_name="metadata")
