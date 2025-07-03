from fastapi import APIRouter

router = APIRouter()

@router.get("/agents/stats")
async def agent_stats():
    return {"connected": 0}
