from fastapi import APIRouter

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
async def delete_user(user_id: str):
    return {"status": "deleted", "message": f"User {user_id} removed"}
