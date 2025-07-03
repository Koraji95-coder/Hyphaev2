from fastapi import APIRouter

router = APIRouter()

@router.post("/verify")
async def verify_code(data: dict):
    return {"success": True}

@router.post("/verify/setup")
async def verify_setup():
    return {"secret": "secret", "uri": "uri", "qr_code": "qr"}

@router.get("/verify/stats")
async def verify_stats():
    return {"success_count": 0, "failure_count": 0, "locked_users": 0, "timestamp": "now"}
