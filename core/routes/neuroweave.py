from fastapi import APIRouter

router = APIRouter()

@router.post("/neuroweave/ask")
async def neuroweave_ask(prompt: str):
    return {"agent": "neuroweave", "response": "answer"}

@router.post("/agent/ask")
async def neuroweave_tracked(prompt: str):
    return {"agent": "neuroweave", "response": "answer"}

@router.get("/neuroweave/test")
async def neuroweave_test():
    return {"status": "ok", "agent": "neuroweave"}

@router.get("/neuroweave/health")
async def neuroweave_health():
    return {"status": "ok"}
