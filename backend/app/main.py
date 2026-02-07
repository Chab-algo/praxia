from contextlib import asynccontextmanager

import structlog
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.recipes import registry

logger = structlog.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("starting_praxia", version="0.1.0")
    registry.load_recipes()
    yield
    # Shutdown
    logger.info("shutting_down_praxia")


def create_app() -> FastAPI:
    app = FastAPI(
        title="PraxIA",
        description="AI Agent Studio - From business idea to production agent in 48h",
        version="0.1.0",
        lifespan=lifespan,
    )

    origins = [
        settings.frontend_url,
        "http://localhost:3000",
    ]
    # Remove empty strings and duplicates
    origins = list(set(o for o in origins if o))
    logger.info("cors_origins", origins=origins)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Health check
    @app.get("/health")
    async def health():
        return {"status": "ok", "version": "0.1.0"}

    # Ensure all models are imported so SQLAlchemy metadata is complete
    from app.auth import models as _auth_models  # noqa: F401
    from app.organizations import models as _org_models  # noqa: F401
    from app.recipes import models as _recipe_models  # noqa: F401
    from app.agents import models as _agent_models  # noqa: F401
    from app.executions import models as _exec_models  # noqa: F401
    from app.usage import models as _usage_models  # noqa: F401

    # Register routers
    from app.agents.router import router as agents_router
    from app.analytics.router import router as analytics_router
    from app.auth.router import router as auth_router
    from app.executions.router import router as executions_router
    from app.recipes.router import router as recipes_router
    from app.usage.router import router as usage_router

    app.include_router(auth_router)
    app.include_router(recipes_router)
    app.include_router(agents_router)
    app.include_router(executions_router)
    app.include_router(usage_router)
    app.include_router(analytics_router)

    return app


app = create_app()
