import uuid
from decimal import Decimal

from sqlalchemy import Boolean, ForeignKey, Numeric, String, Text, text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDMixin


class Recipe(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "recipes"

    slug: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    version: Mapped[str] = mapped_column(
        String(20), default="1.0.0", server_default=text("'1.0.0'")
    )

    # Full recipe definition (steps, prompts, model routing, schemas)
    config: Mapped[dict] = mapped_column(JSONB, nullable=False)

    # Metadata
    is_public: Mapped[bool] = mapped_column(Boolean, default=True, server_default=text("TRUE"))
    is_custom: Mapped[bool] = mapped_column(Boolean, default=False, server_default=text("FALSE"))
    icon: Mapped[str | None] = mapped_column(String(50))
    estimated_cost_per_run: Mapped[Decimal | None] = mapped_column(Numeric(10, 6))

    # Custom recipe ownership
    created_by: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id"), nullable=True, index=True
    )
    organization_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("organizations.id"), nullable=True, index=True
    )
