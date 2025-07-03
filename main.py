# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from core.config.settings import settings
from core.cache.redis_cache import connect_redis, close_redis
from db.database import connect_db, close_db
from core.utils.logger import get_logger

logger = get_logger(__name__)
from core.routes.health import router as health_router
from core.routes.auth import router as auth_router
from core.routes.users import router as users_router
from core.routes.system import router as system_router
from core.routes.logs import router as logs_router
from core.routes.feedback import router as feedback_router
from core.routes.query import router as query_router
from core.routes.rootbloom import router as rootbloom_router
from core.routes.neuroweave import router as neuroweave_router
from core.routes.sporelink import router as sporelink_router
from core.routes.verify import router as verify_router
from core.routes.database import router as database_router
from core.routes.plugins import router as plugins_router
from core.routes.mycocore import router as mycocore_router
from core.routes.state import router as state_router
from core.routes.agents import router as agents_router

# Prefix for all API routes
API_PREFIX = "/api"

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    redis_ok = await connect_redis()
    db_ok = await connect_db()
    if not redis_ok:
        logger.warning("Running without Redis cache")
    if not db_ok:
        logger.warning("Database unavailable; some features may not work")
    yield
    # Shutdown
    await close_redis()
    await close_db()

app = FastAPI(lifespan=lifespan)

# Allow CORS for the frontend origin
origins = ["http://localhost:5173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

routers = [
    health_router,
    auth_router,
    users_router,
    system_router,
    logs_router,
    feedback_router,
    query_router,
    rootbloom_router,
    neuroweave_router,
    sporelink_router,
    verify_router,
    database_router,
    plugins_router,
    mycocore_router,
    state_router,
    agents_router,
]
for router in routers:
    app.include_router(router, prefix=API_PREFIX)
