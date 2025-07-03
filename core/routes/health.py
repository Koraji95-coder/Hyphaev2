# health.py
from fastapi import APIRouter, Depends
from db.database import get_db
from core.cache.redis_cache import redis

router = APIRouter()

@router.get("/health")
async def health(db=Depends(get_db)):
    # Check DB
    try:
        await db.execute("SELECT 1")
        db_ok = True
    except Exception as e:
        db_ok = False

    # Check Redis
    try:
        pong = await redis.ping() if redis else False
        redis_ok = bool(pong)
    except Exception as e:
        redis_ok = False

    return {
        "database": db_ok,
        "redis": redis_ok,
    }
