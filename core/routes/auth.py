from fastapi import APIRouter, Query, Depends, HTTPException, Body, Header, Cookie, Response
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timedelta, timezone

import bcrypt
import secrets
import os
IS_PROD = os.getenv("ENV") == "production"
from jose import JWTError, jwt

from core.config.settings import settings
from core.utils import send_email
from core.schemas import UserCreate, UserLogin
from db.database import get_db
from db.models import User, BlacklistedToken

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
    verification_token = secrets.token_urlsafe()
    user = User(
        username=username,
        email=email,
        hashed_password=hashed_pw,
        verification_token=verification_token,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    # compute “now” and one-hour expiration
    current_time = datetime.now(timezone.utc)
    expire_time = current_time + timedelta(hours=1)
    access_token = jwt.encode(
        {"sub": user.id, "username": user.username, "exp": expire_time},
        settings.JWT_SECRET,
        algorithm="HS256"
    )
    refresh_token = secrets.token_urlsafe(32)
    user.refresh_token = refresh_token
    user.refresh_token_expires_at = current_time + timedelta(days=7)
    await db.commit()

    if email:
        verify_link = f"{settings.FRONTEND_URL}/verify-email?token={verification_token}&email={email}"
        await send_email(
            email,
            "Verify your email",
            f"Hello {username}, please verify your email by visiting {verify_link}",
        )
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "access_token": access_token,
        "refresh_token": refresh_token,
        "pin_verified": True,
    }

@router.post("/auth/login")
async def login_user(
    credentials: UserLogin,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    # Authenticate
    result = await db.execute(select(User).where(User.username == credentials.username))
    user = result.scalar_one_or_none()
    if not user or not bcrypt.checkpw(credentials.password.encode(), user.hashed_password.encode()):
        raise HTTPException(401, "Invalid username or password")
    if not user.is_verified:
        raise HTTPException(403, "Email not verified")

    # Issue tokens
    now = datetime.now(timezone.utc)
    expire = now + timedelta(hours=1)
    access_token = jwt.encode(
        {"sub": user.id, "username": user.username, "exp": expire},
        settings.JWT_SECRET,
        algorithm="HS256",
    )
    refresh_token = secrets.token_urlsafe(32)
    user.refresh_token = refresh_token
    user.refresh_token_expires_at = now + timedelta(days=7)
    await db.commit()

    # Set HttpOnly refresh cookie
    response.set_cookie(
        "refresh_token",
        value=refresh_token,
        httponly=True,
        secure=IS_PROD,       # <-- secure=False locally
        samesite="strict",
        path="/",
        max_age=7 * 24 * 3600,
    )

    return {
        "id": user.id,
        "username": user.username,
        "role": "user",
        "access_token": access_token,
        "pin_verified": True,
    }

@router.post("/auth/logout")
async def logout_user(
    response: Response,
    authorization: str | None = Header(None),
    refresh_token: str | None = Cookie(None),
    db: AsyncSession = Depends(get_db),
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Not authenticated")
    token = authorization.split(" ", 1)[1]

    # Blacklist both tokens
    db.add(BlacklistedToken(token=token))
    if refresh_token:
        db.add(BlacklistedToken(token=refresh_token))

        # Clear stored refresh token on user
        result = await db.execute(select(User).where(User.refresh_token == refresh_token))
        u = result.scalar_one_or_none()
        if u:
            u.refresh_token = None
            u.refresh_token_expires_at = None

    await db.commit()

    # Clear client cookie
    response.delete_cookie("refresh_token", path="/")

    return {"status": "logged_out"}

@router.get("/auth/me")
async def get_profile(
    authorization: str | None = Header(None),
    db: AsyncSession = Depends(get_db),
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Not authenticated")
    token = authorization.split(" ", 1)[1]

    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(401, "Invalid token")
    except JWTError:
        raise HTTPException(401, "Invalid token")

    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(404, "User not found")
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "role": "user",
        "verified": user.is_verified,
    }

@router.post("/auth/refresh")
async def refresh_token(
    response: Response,
    refresh_token: str = Cookie(None),
    db: AsyncSession = Depends(get_db),
):
    if not refresh_token:
        raise HTTPException(401, "No refresh token cookie")

    # Validate refresh token
    result = await db.execute(select(User).where(User.refresh_token == refresh_token))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(401, "Invalid refresh token")
    blk = await db.execute(select(BlacklistedToken).where(BlacklistedToken.token == refresh_token))
    if blk.scalar_one_or_none():
        raise HTTPException(401, "Refresh token revoked")
    now = datetime.now(timezone.utc)
    if user.refresh_token_expires_at and user.refresh_token_expires_at < now:
        raise HTTPException(401, "Refresh token expired")

    # Issue new tokens
    expire = now + timedelta(hours=1)
    access_token = jwt.encode(
        {"sub": user.id, "username": user.username, "exp": expire},
        settings.JWT_SECRET,
        algorithm="HS256",
    )
    new_refresh = secrets.token_urlsafe(32)
    user.refresh_token = new_refresh
    user.refresh_token_expires_at = now + timedelta(days=7)
    await db.commit()

    # Set new HttpOnly cookie
    response.set_cookie(
        "refresh_token",
        value=refresh_token,
        httponly=True,
        secure=IS_PROD,       # <-- secure=False locally
        samesite="strict",
        path="/",
        max_age=7 * 24 * 3600,
    )

    return {"access_token": access_token}

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
    email: str | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(User).where(User.verification_token == token)
    )
    user = result.scalar_one_or_none()
    if not user:
        if email:
            result = await db.execute(select(User).where(User.email == email))
            user_email = result.scalar_one_or_none()
            if user_email and user_email.is_verified:
                return {"message": "Email already verified"}
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
async def password_reset_request(
    email: str = Body(..., embed=True),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    token = secrets.token_urlsafe()
    user.reset_token = token
    await db.commit()

    reset_link = f"{settings.FRONTEND_URL}/reset-password?token={token}"
    await send_email(
        email,
        "Password Reset",
        f"Hello {user.username},\n\nYour username is: {user.username}\n"
        f"Follow this link to reset your password: {reset_link}",
    )
    return {"message": "Reset email sent", "username": user.username}

@router.post("/auth/password-reset/verify")
async def password_reset_verify(
    token: str = Body(..., embed=True),
    new_password: str = Body(..., embed=True),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.reset_token == token))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Invalid token")

    hashed_pw = bcrypt.hashpw(new_password.encode(), bcrypt.gensalt()).decode()
    user.hashed_password = hashed_pw
    user.reset_token = None
    await db.commit()
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