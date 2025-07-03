from fastapi import APIRouter, Query

router = APIRouter()

@router.post("/auth/register")
async def register_user(data: dict):
    return {"status": "registered", "user": data}

@router.post("/auth/login")
async def login_user(credentials: dict):
    return {"id": 1, "username": credentials.get("username"), "role": "user", "token": "fake-token", "pin_verified": True}

@router.post("/auth/logout")
async def logout_user():
    return {"status": "logged_out"}

@router.get("/auth/me")
async def get_profile():
    return {"id": 1, "username": "demo", "email": "demo@example.com", "role": "user", "verified": True}

@router.post("/auth/refresh")
async def refresh_token():
    return {"access_token": "refreshed-token"}

@router.get("/auth/auto_login")
async def auto_login():
    return {"username": "demo", "role": "user"}

@router.post("/auth/set_pin")
async def set_pin(pin: str):
    return {"success": True, "message": "pin set"}

@router.post("/auth/verify_pin")
async def verify_pin(pin: str):
    return {"success": True}

@router.post("/auth/change_pin")
async def change_pin(old_pin: str, new_pin: str):
    return {"success": True, "message": "pin changed"}

@router.get("/auth/verify_email")
async def verify_email(token: str = Query(...)):
    return {"message": "Email verified"}

@router.get("/auth/status")
async def auth_status():
    return {"status": "authenticated", "username": "demo", "role": "user"}

@router.get("/auth/admin_only")
async def admin_only():
    return {"message": "admin access granted"}

@router.post("/auth/password-reset/request")
async def password_reset_request(email: str):
    return {"message": "Reset email sent"}

@router.post("/auth/password-reset/verify")
async def password_reset_verify(token: str, new_password: str):
    return {"message": "Password reset successful"}
