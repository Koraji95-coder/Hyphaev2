# redis_cache.py
import redis.asyncio as aioredis
from core.config.settings import settings

redis = None  # Global Redis connection

async def connect_redis():
    global redis
    redis = aioredis.from_url(
        settings.REDIS_URL,
        decode_responses=True,
        max_connections=10,
        socket_connect_timeout=5,
    )

async def close_redis():
    global redis
    if redis:
        await redis.aclose()
        redis = None
