"""Remove organization requirement - scope by user instead

Revision ID: 002_remove_org
Revises: 001_initial
Create Date: 2026-02-07
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = "002_remove_org"
down_revision = "001_initial"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # --- agents: make organization_id nullable, make created_by NOT NULL with index ---
    op.alter_column("agents", "organization_id", existing_type=sa.Uuid(), nullable=True)
    op.alter_column("agents", "created_by", existing_type=sa.Uuid(), nullable=False)
    op.create_index(op.f("ix_agents_created_by"), "agents", ["created_by"])

    # --- executions: make organization_id nullable, add user_id column ---
    op.alter_column("executions", "organization_id", existing_type=sa.Uuid(), nullable=True)
    op.add_column("executions", sa.Column("user_id", sa.Uuid(), nullable=True))
    op.create_foreign_key(
        op.f("fk_executions_user_id_users"),
        "executions",
        "users",
        ["user_id"],
        ["id"],
    )
    op.create_index(op.f("ix_executions_user_id"), "executions", ["user_id"])

    # Backfill user_id from triggered_by_user_id for existing rows
    op.execute(
        "UPDATE executions SET user_id = triggered_by_user_id WHERE user_id IS NULL AND triggered_by_user_id IS NOT NULL"
    )

    # Make user_id NOT NULL after backfill
    op.alter_column("executions", "user_id", existing_type=sa.Uuid(), nullable=False)

    # --- usage_daily: make organization_id nullable, add user_id column ---
    op.alter_column("usage_daily", "organization_id", existing_type=sa.Uuid(), nullable=True)
    op.add_column("usage_daily", sa.Column("user_id", sa.Uuid(), nullable=True))
    op.create_foreign_key(
        op.f("fk_usage_daily_user_id_users"),
        "usage_daily",
        "users",
        ["user_id"],
        ["id"],
    )
    op.create_index(op.f("ix_usage_daily_user_id"), "usage_daily", ["user_id"])

    # Drop the old unique constraint on (organization_id, date)
    op.drop_constraint("uq_usage_daily_org_date", "usage_daily", type_="unique")

    # --- api_keys: make organization_id nullable, add user_id column ---
    op.alter_column("api_keys", "organization_id", existing_type=sa.Uuid(), nullable=True)
    op.add_column("api_keys", sa.Column("user_id", sa.Uuid(), nullable=True))
    op.create_foreign_key(
        op.f("fk_api_keys_user_id_users"),
        "api_keys",
        "users",
        ["user_id"],
        ["id"],
    )
    op.create_index(op.f("ix_api_keys_user_id"), "api_keys", ["user_id"])


def downgrade() -> None:
    # --- api_keys ---
    op.drop_index(op.f("ix_api_keys_user_id"), table_name="api_keys")
    op.drop_constraint(op.f("fk_api_keys_user_id_users"), "api_keys", type_="foreignkey")
    op.drop_column("api_keys", "user_id")
    op.alter_column("api_keys", "organization_id", existing_type=sa.Uuid(), nullable=False)

    # --- usage_daily ---
    op.create_unique_constraint("uq_usage_daily_org_date", "usage_daily", ["organization_id", "date"])
    op.drop_index(op.f("ix_usage_daily_user_id"), table_name="usage_daily")
    op.drop_constraint(op.f("fk_usage_daily_user_id_users"), "usage_daily", type_="foreignkey")
    op.drop_column("usage_daily", "user_id")
    op.alter_column("usage_daily", "organization_id", existing_type=sa.Uuid(), nullable=False)

    # --- executions ---
    op.drop_index(op.f("ix_executions_user_id"), table_name="executions")
    op.drop_constraint(op.f("fk_executions_user_id_users"), "executions", type_="foreignkey")
    op.drop_column("executions", "user_id")
    op.alter_column("executions", "organization_id", existing_type=sa.Uuid(), nullable=False)

    # --- agents ---
    op.drop_index(op.f("ix_agents_created_by"), table_name="agents")
    op.alter_column("agents", "created_by", existing_type=sa.Uuid(), nullable=True)
    op.alter_column("agents", "organization_id", existing_type=sa.Uuid(), nullable=False)
