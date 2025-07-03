from fastapi import APIRouter

router = APIRouter()

@router.get("/mycocore/snapshot")
async def mycocore_snapshot():
    return {"status": "ok", "uptime": "0", "memory_usage": 0, "cpu_usage": 0, "agents": [], "safe_mode": False}

@router.get("/mycocore/alerts")
async def mycocore_alerts():
    return {"status": "ok", "alerts": [], "timestamp": "now"}

@router.post("/mycocore/safe-mode")
async def toggle_safe_mode():
    return {"status": "ok", "safe_mode": "off"}
