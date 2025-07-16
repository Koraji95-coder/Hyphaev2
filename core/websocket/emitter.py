# core/websocket/emitter.py

from datetime import datetime
from core.websocket.websocket_manager import manager

async def emit_to_user(user_id: int, type: str, message: str, payload: dict | None = None):
    await manager.send_to_user(user_id, {
        "type": type,
        "message": message,
        "timestamp": datetime.utcnow().isoformat(),
        "payload": payload
    })
