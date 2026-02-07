"""Add custom recipe fields

Revision ID: 003_add_recipe_custom_fields
Revises: 002_remove_org
Create Date: 2026-02-07 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "003_add_recipe_custom_fields"
down_revision = "002_remove_org"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add is_custom field
    op.add_column(
        "recipes",
        sa.Column("is_custom", sa.Boolean(), server_default=sa.text("FALSE"), nullable=False),
    )

    # Add created_by field
    op.add_column(
        "recipes",
        sa.Column("created_by", postgresql.UUID(as_uuid=True), nullable=True),
    )
    op.create_index(op.f("ix_recipes_created_by"), "recipes", ["created_by"], unique=False)

    # Add organization_id field
    op.add_column(
        "recipes",
        sa.Column("organization_id", postgresql.UUID(as_uuid=True), nullable=True),
    )
    op.create_index(op.f("ix_recipes_organization_id"), "recipes", ["organization_id"], unique=False)

    # Add foreign key constraints
    op.create_foreign_key(
        op.f("fk_recipes_created_by_users"),
        "recipes",
        "users",
        ["created_by"],
        ["id"],
    )
    op.create_foreign_key(
        op.f("fk_recipes_organization_id_organizations"),
        "recipes",
        "organizations",
        ["organization_id"],
        ["id"],
    )


def downgrade() -> None:
    # Remove foreign keys
    op.drop_constraint(op.f("fk_recipes_organization_id_organizations"), "recipes", type_="foreignkey")
    op.drop_constraint(op.f("fk_recipes_created_by_users"), "recipes", type_="foreignkey")

    # Remove indexes
    op.drop_index(op.f("ix_recipes_organization_id"), table_name="recipes")
    op.drop_index(op.f("ix_recipes_created_by"), table_name="recipes")

    # Remove columns
    op.drop_column("recipes", "organization_id")
    op.drop_column("recipes", "created_by")
    op.drop_column("recipes", "is_custom")
