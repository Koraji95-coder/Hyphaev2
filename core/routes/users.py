# core/routes/users.py
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from core.schemas import UserRead, UserUpdate
from db.database    import get_db
from db.models      import User

router = APIRouter()

@router.get("/users", response_model=List[UserRead])
async def list_users(
    page:     int = Query(1, ge=1),
    per_page: int = Query(20, ge=1),
    db:       AsyncSession = Depends(get_db),
):
    # fetch page
    stmt = select(User).offset((page - 1) * per_page).limit(per_page)
    res  = await db.execute(stmt)
    users = res.scalars().all()

    # fetch total count
    total = await db.execute(select(func.count()).select_from(User))
    count = total.scalar_one()

    # you can include pagination metadata in headers or wrap in a dict, e.g.:
    # return {"users": users, "total": count, "page": page, "per_page": per_page}
    return users

@router.get("/users/{user_id}", response_model=UserRead)
async def get_user(
    user_id: int,
    db:      AsyncSession = Depends(get_db),
):
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(404, "User not found")
    return user

@router.put("/users/{user_id}", response_model=UserRead)
async def update_user(
    user_id: int,
    data:    UserUpdate,
    db:      AsyncSession = Depends(get_db),
):
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(404, "User not found")

    # apply only set fields
    update_data = data.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(user, field, val)

    await db.commit()
    await db.refresh(user)
    return user

@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    db:      AsyncSession = Depends(get_db),
):
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(404, "User not found")
    await db.delete(user)
    await db.commit()
    return {"message": f"User {user_id} deleted"}
