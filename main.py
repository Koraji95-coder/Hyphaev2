# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager, suppress
import asyncio
import random
import socketio

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
from core.routes.mycocore import router as mycocore_router, start_metrics_task
from core.routes.state import router as state_router
from core.routes.agents import router as agents_router
from core.routes.market import router as market_router

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

    market_task  = asyncio.create_task(market_broadcast())
    # fire off our system_metrics broadcast loop
    metrics_task = start_metrics_task()
    yield
    # Shutdown
    market_task.cancel()  # Ensure market task is canceled
    metrics_task.cancel()  # Ensure metrics task is canceled
    with suppress(Exception):
        await market_task
        await metrics_task
    await close_redis()
    await close_db()

fastapi_app = FastAPI(lifespan=lifespan)

# Allow CORS for the frontend origin
origins = ["http://localhost:5173"]

# Socket.IO server for market updates
sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins=origins)

# Background task to emit placeholder market data
async def market_broadcast():
    symbols = ["AAPL", "MSFT", "GOOG"]
    indices = ["DOW", "NASDAQ"]
    while True:
        sym = random.choice(symbols)
        await sio.emit(
            "quote",
            {"symbol": sym, "price": round(random.uniform(100, 500), 2)},
            namespace="/market",
        )
        idx = random.choice(indices)
        await sio.emit(
            "index",
            {
                "symbol": idx,
                "price": round(random.uniform(1000, 2000), 2),
                "change": round(random.uniform(-5, 5), 2),
            },
            namespace="/market",
        )
        await asyncio.sleep(1)

sio_app = socketio.ASGIApp(sio, other_asgi_app=fastapi_app, socketio_path="market")

fastapi_app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Authorization"],  # Ensure Authorization header is exposed
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
    market_router,
]
for router in routers:
    fastapi_app.include_router(router, prefix=API_PREFIX)

# Expose ASGI app with Socket.IO mounted
app = sio_app