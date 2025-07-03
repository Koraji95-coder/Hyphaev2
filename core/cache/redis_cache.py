# redis_cache.py
import redis.asyncio as aioredis
from core.config.settings import settings
from core.utils.logger import get_logger
import asyncio

logger = get_logger(__name__)

redis = None  # Global Redis connection

async def connect_redis(max_retries: int = 3, delay: float = 2.0) -> bool:
    """Establish connection to Redis.

    Parameters
    ----------
    max_retries: int
        Number of connection attempts before giving up.
    delay: float
        Delay between retries in seconds.

    Returns
    -------
    bool
        True if connection succeeded, False otherwise.
    """
    global redis
    for attempt in range(1, max_retries + 1):
        try:
            redis = aioredis.from_url(
                settings.REDIS_URL,
                decode_responses=True,
                max_connections=10,
                socket_connect_timeout=5,
            )
            await redis.ping()
            logger.info("Connected to Redis")
            return True
        except Exception as exc:
            logger.error(f"Redis connection attempt {attempt} failed: {exc}")
            redis = None
            if attempt == max_retries:
                logger.error("All Redis connection attempts failed; continuing without cache")
                return False
            await asyncio.sleep(delay)

async def close_redis():
    global redis
    if redis:
        await redis.aclose()
        redis = None
        logger.info("Redis connection closed")
