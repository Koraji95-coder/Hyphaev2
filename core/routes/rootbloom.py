from fastapi import APIRouter

router = APIRouter()

@router.post("/rootbloom/generate")
async def generate_content(prompt: str, context: dict | None = None):
    return {"agent": "rootbloom", "response": "generated", "timestamp": "now"}

@router.get("/rootbloom/health")
async def rootbloom_health():
    return {"status": "ok", "details": {}, "timestamp": "now"}
