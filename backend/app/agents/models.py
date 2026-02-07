import uuid
from datetime import datetime

from sqlalchemy import ForeignKey, String, Text, text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDMixin


class Agent(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "agents"

    organization_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("organizations.id"), nullable=True, index=True
    )
    recipe_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("recipes.id"))
    recipe_slug: Mapped[str | None] = mapped_column(String(255))

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    status: Mapped[str] = mapped_column(
        String(50), default="draft", server_default=text("'draft'")
    )

    # Config overrides on top of recipe (the 20% customization)
    config_overrides: Mapped[dict] = mapped_column(
        JSONB, default=dict, server_default=text("'{}'::jsonb")
    )
    custom_prompts: Mapped[dict] = mapped_column(
        JSONB, default=dict, server_default=text("'{}'::jsonb")
    )
    custom_steps: Mapped[dict] = mapped_column(
        JSONB, default=dict, server_default=text("'{}'::jsonb")
    )

    # Integration
    webhook_url: Mapped[str | None] = mapped_column(Text)
    api_key_hash: Mapped[str | None] = mapped_column(String(255))

    created_by: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)

    # Soft delete
    deleted_at: Mapped[datetime | None] = mapped_column()
