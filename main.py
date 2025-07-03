# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from core.config.settings import settings
from core.cache.redis_cache import connect_redis, close_redis
from db.database import connect_db, close_db
from core.routes.health import router as health_router

# Prefix for all API routes
API_PREFIX = "/api"

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

# Allow CORS for the frontend origin
origins = ["http://localhost:5173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

routers = [health_router]
for router in routers:
    app.include_router(router, prefix=API_PREFIX)
