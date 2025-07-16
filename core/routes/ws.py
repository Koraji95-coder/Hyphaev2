# backend/routes/ws.py
from fastapi import APIRouter, WebSocket, Depends
from core.websocket.websocket_manager import manager
from core.utils.dependencies import get_current_user_ws # Custom auth for WebSocket
from core.utils.logger import get_logger
from datetime import datetime, timezone

router = APIRouter()
logger = get_logger(__name__)

@router.websocket("/ws/logs")
async def websocket_logs(websocket: WebSocket, user=Depends(get_current_user_ws)):
    await manager.connect(user.id, websocket)

    # ✅ Emit "connected" message to client
    await manager.send_to_user(user.id, {
        "type": "connect",
        "message": f"🔒 Authenticated as {user.username}",
        "timestamp": datetime.now(timezone.utc).isoformat()
    })

    try:
        while True:
            await websocket.receive_text()  # optional keep-alive
    except Exception as e:
        logger.warning(f"WebSocket error: {e}")
    finally:
        manager.disconnect(user.id, websocket)