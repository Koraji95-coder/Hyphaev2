# core/routes/mycocore.py

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from typing import List, Literal
from datetime import datetime
import psutil
import asyncio

from core.utils.logger import get_logger

logger = get_logger(__name__)
router = APIRouter()

# ─── Pydantic Models ──────────────────────────────────────────────────────────

class MycoCoreSnapshot(BaseModel):
    status: Literal["ok"]
    uptime: str
    memory_usage: float
    cpu_usage: float
    agents: List[str]
    safe_mode: bool

class MycoCoreAlerts(BaseModel):
    status: Literal["ok", "alert"]
    alerts: List[str]
    timestamp: str

class SystemMetricsPayload(BaseModel):
    type: Literal["system_metrics"]
    timestamp: str
    data: dict

# ─── In-Memory Store ──────────────────────────────────────────────────────────

websocket_connections: set[WebSocket] = set()

# ─── REST ENDPOINTS ───────────────────────────────────────────────────────────

@router.get("/mycocore/snapshot", response_model=MycoCoreSnapshot)
async def mycocore_snapshot():
    """Returns current system metrics snapshot (stub, replace with real metrics)."""
    # Optionally calculate uptime, agents, etc.
    return MycoCoreSnapshot(
        status="ok",
        uptime="0",           # replace with actual uptime logic
        memory_usage=0.0,     # replace with psutil.virtual_memory().percent
        cpu_usage=0.0,        # replace with psutil.cpu_percent()
        agents=[],            # replace with actual agent names
        safe_mode=False,
    )

@router.get("/mycocore/alerts", response_model=MycoCoreAlerts)
async def mycocore_alerts():
    """Returns current system alerts."""
    return MycoCoreAlerts(
        status="ok",  # Or "alert" if any alerts present
        alerts=[],    # List[str], e.g. ["Low memory", "Disk full"]
        timestamp=datetime.utcnow().isoformat() + "Z",
    )

# ─── WEBSOCKET ENDPOINT ───────────────────────────────────────────────────────

@router.websocket("/mycocore/stream")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    logger.info("New WS client connected to /mycocore/stream")
    websocket_connections.add(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        logger.info("WebSocket client disconnected cleanly")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
    finally:
        websocket_connections.discard(websocket)
        logger.info("Cleaned up WS connection")

# ─── BACKGROUND BROADCAST TASK ────────────────────────────────────────────────

async def system_metrics_broadcast():
    while True:
        cpu = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory().percent
        payload = SystemMetricsPayload(
            type="system_metrics",
            timestamp=datetime.utcnow().isoformat() + "Z",
            data={"cpu_usage": cpu, "memory_usage": memory},
        ).dict()
        logger.info(f"Broadcasting system metrics: {payload}")
        if websocket_connections:
            await asyncio.gather(
                *(ws.send_json(payload) for ws in websocket_connections)
            )
        await asyncio.sleep(5)

def start_metrics_task():
    """
    Kick off the background broadcast loop and return the created task.
    """
    return asyncio.create_task(system_metrics_broadcast())
