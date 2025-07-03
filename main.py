# main.py
from fastapi import FastAPI
from contextlib import asynccontextmanager

from core.config.settings import settings
from core.cache.redis_cache import connect_redis, close_redis
from db.database import connect_db, close_db
from core.routes.health import router as health_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_redis()
    await connect_db()
    yield
    # Shutdown
    await close_redis()
    await close_db()

app = FastAPI(lifespan=lifespan)
app.include_router(health_router)
