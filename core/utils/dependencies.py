# core/utils/dependencies.py
from fastapi import Header, Depends, HTTPException
from jose import JWTError, jwt
from sqlalchemy.ext.asyncio import AsyncSession
from core.config.settings import settings
from db.database import get_db
from db.models import User
from core.utils.logger import get_logger

logger = get_logger(__name__)

async def get_current_user(
    authorization: str | None = Header(None),
    db: AsyncSession = Depends(get_db),
):
    if not authorization or not authorization.startswith("Bearer "):
        logger.warning("No or invalid Authorization header")
        raise HTTPException(401, "Not authenticated")
    token = authorization.split(" ", 1)[1]
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])
        user_id = int(payload.get("sub"))
        logger.debug(f"Decoded token for user_id: {user_id}")
    except (JWTError, TypeError, ValueError) as e:
        logger.error(f"Invalid token: {str(e)}")
        raise HTTPException(401, "Invalid token")
    user = await db.get(User, user_id)
    if not user:
        logger.error(f"User not found for id: {user_id}")
        raise HTTPException(404, "User not found")
    return user