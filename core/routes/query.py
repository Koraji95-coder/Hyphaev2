from fastapi import APIRouter

router = APIRouter()

@router.get("/queries/recent")
async def recent_queries(limit: int = 10):
    return []
