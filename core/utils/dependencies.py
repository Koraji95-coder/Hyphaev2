# core/utils/dependencies.py
from fastapi import Header, Depends, HTTPException, Query, WebSocketException
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
        logger.warning("Missing or malformed Authorization header")
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = authorization.split(" ", 1)[1]
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])
        user_id = int(payload.get("sub"))
    except (JWTError, TypeError, ValueError) as e:
        logger.error(f"Invalid token: {e}")
        raise HTTPException(status_code=401, detail="Invalid token")

    user = await db.get(User, user_id)
    if not user:
        logger.error(f"User not found: {user_id}")
        raise HTTPException(status_code=404, detail="User not found")
    return user

async def get_current_user_ws(
    token: str = Query(...),
    db: AsyncSession = Depends(get_db),
):
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])
        user_id = int(payload.get("sub"))
    except (JWTError, ValueError, TypeError) as e:
        logger.warning(f"WS auth failed: {e}")
        raise WebSocketException(code=1008)

    user = await db.get(User, user_id)
    if not user:
        logger.warning(f"WS user not found: {user_id}")
        raise WebSocketException(code=1008)
    return user