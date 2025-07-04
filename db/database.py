# database.py
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base
from sqlalchemy import text

from core.config.settings import settings
from core.utils.logger import get_logger
import asyncio

logger = get_logger(__name__)

engine = create_async_engine(settings.DATABASE_URL, echo=False, future=True)
AsyncSessionLocal = async_sessionmaker(bind=engine, expire_on_commit=False)
Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

async def connect_db(max_retries: int = 3, delay: float = 2.0) -> bool:
    """Connect to the database and create tables.

    Parameters
    ----------
    max_retries: int
        Number of connection attempts before giving up.
    delay: float
        Delay in seconds between retries.

    Returns
    -------
    bool
        True if connection succeeded, False otherwise.
    """
    from . import models  # noqa: F401

    for attempt in range(1, max_retries + 1):
        try:
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
                # add new columns for existing tables if needed
                try:
                    if engine.dialect.name.startswith("postgres"):
                        await conn.execute(
                            text(
                                "ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token VARCHAR(128)"
                            )
                        )
                    else:
                        await conn.execute(
                            text("ALTER TABLE users ADD COLUMN reset_token VARCHAR(128)")
                        )
                except Exception:
                    # column may already exist or not be alterable; ignore errors
                    pass
            logger.info("Database connection established")
            return True
        except Exception as exc:
            logger.error(f"Database connection attempt {attempt} failed: {exc}")
            if attempt == max_retries:
                logger.error("All database connection attempts failed; running in degraded mode")
                return False
            await asyncio.sleep(delay)


async def close_db():
    await engine.dispose()
    logger.info("Database connection closed")
