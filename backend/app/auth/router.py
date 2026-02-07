from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_org, get_current_user
from app.auth.models import User
from app.auth.schemas import UserResponse
from app.db.engine import get_db
from app.organizations.models import Organization

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.get("/me", response_model=UserResponse)
async def get_me(
    user: Annotated[User, Depends(get_current_user)],
    org: Annotated[Organization | None, Depends(get_current_org)],
):
    return UserResponse(
        id=str(user.id),
        email=user.email,
        full_name=user.full_name,
        organization_id=str(org.id) if org else None,
        organization_name=org.name if org else None,
    )
