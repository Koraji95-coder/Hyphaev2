from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import asyncio, json
from datetime import datetime

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

@router.websocket("/mycocore/stream")
async def mycocore_stream(ws: WebSocket):
    # accept the WS handshake
    await ws.accept()
    try:
        while True:
            # send some dummy metrics every 5 seconds
            payload = {
                "type": "metrics",
                "timestamp": datetime.utcnow().isoformat(),
                "data": {
                    "cpu_usage": 42,
                    "memory_usage": 73
                }
            }
            await ws.send_text(json.dumps(payload))
            await asyncio.sleep(5)
    except WebSocketDisconnect:
        # client disconnected cleanly
        return