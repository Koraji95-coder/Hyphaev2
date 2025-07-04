from fastapi import APIRouter, Query, Depends, HTTPException, Body, Header
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
import bcrypt
import secrets

from core.config.settings import settings

from core.utils import send_email
from core.schemas import UserCreate, UserLogin

from db.database import get_db
from db.models import User

router = APIRouter()

@router.post("/auth/register")
async def register_user(data: UserCreate, db: AsyncSession = Depends(get_db)):
    username = data.username
    password = data.password
    email = data.email

    if not username or not password:
        raise HTTPException(status_code=400, detail="Username and password required")

    result = await db.execute(select(User).where(User.username == username))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Username already exists")

    hashed_pw = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    token = secrets.token_urlsafe()
    user = User(
        username=username,
        email=email,
        hashed_password=hashed_pw,
        verification_token=token,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    if email:
        verify_link = f"{settings.FRONTEND_URL}/verify-email?token={token}&email={email}"
        await send_email(
            email,
            "Verify your email",
            f"Hello {username}, please verify your email by visiting {verify_link}",
        )
    return {"id": user.id, "username": user.username, "email": user.email}

@router.post("/auth/login")
async def login_user(credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    username = credentials.username
    password = credentials.password

    if not username or not password:
        raise HTTPException(status_code=400, detail="Invalid credentials")

    result = await db.execute(select(User).where(User.username == username))
    user = result.scalar_one_or_none()
    if not user or not bcrypt.checkpw(password.encode(), user.hashed_password.encode()):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    return {"id": user.id, "username": user.username, "role": "user", "token": "fake-token", "pin_verified": True}

@router.post("/auth/logout")
async def logout_user():
    return {"status": "logged_out"}

@router.get("/auth/me")
async def get_profile(
    authorization: str | None = Header(default=None),
    db: AsyncSession = Depends(get_db),
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")

    token = authorization.split(" ", 1)[1]
    if token != "fake-token":
        raise HTTPException(status_code=401, detail="Not authenticated")

    result = await db.execute(select(User).limit(1))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "role": "user",
        "verified": True,
    }

@router.post("/auth/refresh")
async def refresh_token():
    return {"access_token": "refreshed-token"}

@router.get("/auth/auto_login")
async def auto_login():
    return {"username": "demo", "role": "user"}

@router.post("/auth/set_pin")
async def set_pin(pin: str = Body(..., embed=True)):
    return {"success": True, "message": "pin set"}

@router.post("/auth/verify_pin")
async def verify_pin(pin: str = Body(..., embed=True)):
    return {"success": True}

@router.post("/auth/change_pin")
async def change_pin(
    old_pin: str = Body(..., embed=True),
    new_pin: str = Body(..., embed=True),
):
    return {"success": True, "message": "pin changed"}

@router.get("/auth/verify_email")
async def verify_email(
    token: str = Query(...),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(User).where(User.verification_token == token)
    )
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Invalid token")
    user.is_verified = True
    user.verification_token = None
    await db.commit()
    return {"message": "Email verified"}

@router.get("/auth/status")
async def auth_status(user_id: int = 1, db: AsyncSession = Depends(get_db)):
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"status": "authenticated", "username": user.username, "role": "user"}

@router.get("/auth/admin_only")
async def admin_only():
    return {"message": "admin access granted"}

@router.post("/auth/password-reset/request")
async def password_reset_request(email: str):
    await send_email(
        email,
        "Password Reset",
        "Follow this link to reset your password.",
    )
    return {"message": "Reset email sent"}

@router.post("/auth/password-reset/verify")
async def password_reset_verify(token: str, new_password: str):
    return {"message": "Password reset successful"}


@router.post("/auth/resend-verification")
async def resend_verification(
    email: str = Body(..., embed=True),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.is_verified:
        return {"message": "Email already verified"}
    token = secrets.token_urlsafe()
    user.verification_token = token
    await db.commit()
    verify_link = f"{settings.FRONTEND_URL}/verify-email?token={token}&email={email}"
    await send_email(
        email,
        "Verify your email",
        f"Hello {user.username}, please verify your email by visiting {verify_link}",
    )
    return {"message": "Verification email resent"}
