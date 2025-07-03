from fastapi import APIRouter, Response
from fastapi.responses import StreamingResponse
from io import BytesIO

router = APIRouter()

@router.get("/system/state")
async def system_state():
    return {"mode": "dev", "flags": {}, "memory": {}}

@router.post("/system/mode")
async def set_system_mode(mode: str):
    return {"status": "ok", "mode": mode}

@router.get("/core/status")
async def core_status():
    return {"status": "ok"}

@router.post("/core/safe-mode/toggle")
async def toggle_safe_mode():
    return {"status": "ok"}

@router.get("/system/memory/{user}")
async def user_memory(user: str):
    return {"user": user, "memory": []}

@router.get("/system/dashboard")
async def dashboard_summary():
    return {"safe_mode": False, "active_agents": [], "registered_agents": [], "memory_key_counts": {}}

@router.get("/system/export/pdf/{user}")
async def export_user_memory_pdf(user: str):
    pdf_bytes = BytesIO(b"PDF data for " + user.encode())
    return StreamingResponse(pdf_bytes, media_type="application/pdf")
