from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from db.database import get_db
from db.models import User

router = APIRouter()

@router.get("/users")
async def list_users(page: int = 1, per_page: int = 20, role: str | None = None):
    return {"users": [], "total": 0, "page": page, "per_page": per_page}

@router.get("/users/{user_id}")
async def get_user(user_id: str):
    return {"id": user_id, "username": "demo", "email": "demo@example.com", "role": "user", "verified": True}

@router.put("/users/{user_id}")
async def update_user(user_id: str, data: dict):
    updated = {"id": user_id}
    updated.update(data)
    return updated

@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int, db: AsyncSession = Depends(get_db)
):
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    await db.delete(user)
    await db.commit()
    return {"message": f"User {user_id} deleted"}
