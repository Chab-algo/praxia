"""Add CRM tables (leads, interactions, opportunities)

Revision ID: 004_add_crm_tables
Revises: 003_add_recipe_custom_fields
Create Date: 2026-02-07 11:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "004_add_crm_tables"
down_revision = "003_add_recipe_custom_fields"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # === leads ===
    op.create_table(
        "leads",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("organization_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("full_name", sa.String(255), nullable=True),
        sa.Column("company", sa.String(255), nullable=True),
        sa.Column("phone", sa.String(50), nullable=True),
        sa.Column("job_title", sa.String(255), nullable=True),
        sa.Column("status", sa.String(50), server_default=sa.text("'new'"), nullable=False),
        sa.Column("source", sa.String(100), nullable=True),
        sa.Column("score", sa.Integer(), server_default=sa.text("0"), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("metadata", postgresql.JSONB(astext_type=sa.Text()), server_default=sa.text("'{}'::jsonb"), nullable=False),
        sa.Column("assigned_to", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("NOW()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.text("NOW()"), nullable=False),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_leads")),
        sa.ForeignKeyConstraint(
            ["organization_id"],
            ["organizations.id"],
            name=op.f("fk_leads_organization_id_organizations"),
        ),
        sa.ForeignKeyConstraint(
            ["assigned_to"],
            ["users.id"],
            name=op.f("fk_leads_assigned_to_users"),
        ),
    )
    op.create_index(op.f("ix_leads_organization_id"), "leads", ["organization_id"], unique=False)
    op.create_index(op.f("ix_leads_assigned_to"), "leads", ["assigned_to"], unique=False)
    op.create_index(op.f("ix_leads_email"), "leads", ["email"], unique=False)

    # === lead_interactions ===
    op.create_table(
        "lead_interactions",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("lead_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("type", sa.String(50), nullable=False),
        sa.Column("subject", sa.String(255), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("outcome", sa.String(100), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("NOW()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.text("NOW()"), nullable=False),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_lead_interactions")),
        sa.ForeignKeyConstraint(
            ["lead_id"],
            ["leads.id"],
            name=op.f("fk_lead_interactions_lead_id_leads"),
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            name=op.f("fk_lead_interactions_user_id_users"),
        ),
    )
    op.create_index(op.f("ix_lead_interactions_lead_id"), "lead_interactions", ["lead_id"], unique=False)
    op.create_index(op.f("ix_lead_interactions_user_id"), "lead_interactions", ["user_id"], unique=False)

    # === opportunities ===
    op.create_table(
        "opportunities",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("lead_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("organization_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("value_cents", sa.Integer(), server_default=sa.text("0"), nullable=False),
        sa.Column("probability", sa.Integer(), server_default=sa.text("50"), nullable=False),
        sa.Column("expected_close_date", sa.DateTime(), nullable=True),
        sa.Column("status", sa.String(50), server_default=sa.text("'open'"), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("metadata", postgresql.JSONB(astext_type=sa.Text()), server_default=sa.text("'{}'::jsonb"), nullable=False),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("NOW()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.text("NOW()"), nullable=False),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_opportunities")),
        sa.ForeignKeyConstraint(
            ["lead_id"],
            ["leads.id"],
            name=op.f("fk_opportunities_lead_id_leads"),
        ),
        sa.ForeignKeyConstraint(
            ["organization_id"],
            ["organizations.id"],
            name=op.f("fk_opportunities_organization_id_organizations"),
        ),
    )
    op.create_index(op.f("ix_opportunities_lead_id"), "opportunities", ["lead_id"], unique=False)
    op.create_index(op.f("ix_opportunities_organization_id"), "opportunities", ["organization_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_opportunities_organization_id"), table_name="opportunities")
    op.drop_index(op.f("ix_opportunities_lead_id"), table_name="opportunities")
    op.drop_table("opportunities")

    op.drop_index(op.f("ix_lead_interactions_user_id"), table_name="lead_interactions")
    op.drop_index(op.f("ix_lead_interactions_lead_id"), table_name="lead_interactions")
    op.drop_table("lead_interactions")

    op.drop_index(op.f("ix_leads_email"), table_name="leads")
    op.drop_index(op.f("ix_leads_assigned_to"), table_name="leads")
    op.drop_index(op.f("ix_leads_organization_id"), table_name="leads")
    op.drop_table("leads")
