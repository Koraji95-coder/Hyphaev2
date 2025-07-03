from fastapi import APIRouter

router = APIRouter()

@router.get("/state")
async def get_state():
    return {"user": "demo", "mood": "happy", "flags": {}, "memory": {}}

@router.get("/state/memory")
async def get_memory_state():
    return {"flags": {}, "memory": {}}

@router.get("/state/memory/chain/{user}")
async def get_memory_chain(user: str):
    return []

@router.delete("/state/memory/{key}")
async def delete_memory_value(key: str):
    return {"status": "deleted"}
