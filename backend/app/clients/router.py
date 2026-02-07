import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.auth.models import User
from app.clients import service
from app.db.engine import get_db

router = APIRouter(prefix="/api/clients", tags=["clients"])


@router.get("/{client_id}/overview")
async def get_client_overview(
    client_id: uuid.UUID,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Vue complète d'un client (organisation)."""
    overview = await service.get_client_overview(db=db, client_id=client_id)
    if not overview:
        raise HTTPException(status_code=404, detail="Client not found")
    return overview
