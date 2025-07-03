import asyncio
from core.cache.redis_cache import connect_redis, close_redis

async def main():
    await connect_redis()
    # Get the redis global variable from the actual module, not an import-time copy
    from core.cache import redis_cache
    try:
        pong = await redis_cache.redis.ping()
        print("PING:", pong)
        await redis_cache.redis.set("foo", "bar")
        val = await redis_cache.redis.get("foo")
        print("GET foo:", val)
    finally:
        await close_redis()

if __name__ == "__main__":
    asyncio.run(main())
