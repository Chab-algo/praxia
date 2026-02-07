import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.agents import service
from app.agents.schemas import AgentCreate, AgentResponse, AgentUpdate
from app.auth.dependencies import get_current_org, get_current_user
from app.auth.models import User
from app.db.engine import get_db
from app.organizations.models import Organization

router = APIRouter(prefix="/api/agents", tags=["agents"])


@router.post("", response_model=AgentResponse, status_code=201)
async def create_agent(
    body: AgentCreate,
    user: Annotated[User, Depends(get_current_user)],
    org: Annotated[Organization, Depends(get_current_org)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    try:
        agent = await service.create_agent(
            db=db,
            org_id=org.id,
            user_id=user.id,
            name=body.name,
            recipe_slug=body.recipe_slug,
            description=body.description,
            config_overrides=body.config_overrides,
            custom_prompts=body.custom_prompts,
        )
        return AgentResponse(
            id=str(agent.id),
            name=agent.name,
            description=agent.description,
            status=agent.status,
            recipe_slug=body.recipe_slug,
            config_overrides=agent.config_overrides,
            custom_prompts=agent.custom_prompts,
            created_at=agent.created_at,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("", response_model=list[AgentResponse])
async def list_agents(
    org: Annotated[Organization, Depends(get_current_org)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    agents = await service.list_agents(db, org.id)
    return [
        AgentResponse(
            id=str(a.id),
            name=a.name,
            description=a.description,
            status=a.status,
            recipe_slug=None,
            config_overrides=a.config_overrides,
            custom_prompts=a.custom_prompts,
            created_at=a.created_at,
        )
        for a in agents
    ]


@router.get("/{agent_id}", response_model=AgentResponse)
async def get_agent(
    agent_id: uuid.UUID,
    org: Annotated[Organization, Depends(get_current_org)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    agent = await service.get_agent(db, agent_id, org.id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return AgentResponse(
        id=str(agent.id),
        name=agent.name,
        description=agent.description,
        status=agent.status,
        recipe_slug=None,
        config_overrides=agent.config_overrides,
        custom_prompts=agent.custom_prompts,
        created_at=agent.created_at,
    )


@router.patch("/{agent_id}", response_model=AgentResponse)
async def update_agent(
    agent_id: uuid.UUID,
    body: AgentUpdate,
    org: Annotated[Organization, Depends(get_current_org)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    agent = await service.get_agent(db, agent_id, org.id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    agent = await service.update_agent(
        db,
        agent,
        name=body.name,
        description=body.description,
        status=body.status,
        config_overrides=body.config_overrides,
        custom_prompts=body.custom_prompts,
    )
    return AgentResponse(
        id=str(agent.id),
        name=agent.name,
        description=agent.description,
        status=agent.status,
        recipe_slug=None,
        config_overrides=agent.config_overrides,
        custom_prompts=agent.custom_prompts,
        created_at=agent.created_at,
    )
