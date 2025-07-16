# core/routes/auth.py

import os
import secrets
import bcrypt
from datetime import datetime, timedelta, timezone

from fastapi import (
    APIRouter,
    BackgroundTasks,
    Depends,
    HTTPException,
    Query,
    Body,
    Header,
    Cookie,
    Response,
    Request,
)
from jose import JWTError, jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.config.settings import settings
from core.utils.email import send_email
from core.utils.dependencies import get_current_user
from core.utils.logger import get_logger

from core.schemas import UserCreate, UserLogin, UserRead
from db.database import get_db
from db.models import User, BlacklistedToken

logger = get_logger(__name__)
router = APIRouter()
IS_PROD = os.getenv("ENV") == "production"


@router.post("/auth/register")
async def register_user(
    data: UserCreate,           # make sure UserCreate now includes a `pin: str` field
    db: AsyncSession = Depends(get_db),
):
    # 1) Validate & uniqueness
    if not data.username or not data.password or not data.pin:
        raise HTTPException(400, "Username, password and PIN required")

    # username must be unique
    existing = await db.execute(
        select(User).where(User.username == data.username)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(400, "Username already exists")

    # email (if provided) must also be unique
    if data.email:
        email_exists = await db.execute(
            select(User).where(User.email == data.email)
        )
        if email_exists.scalar_one_or_none():
            raise HTTPException(400, "Email already exists")

    # 2) Hash password + PIN, persist user, then issue tokens
    hashed_pw = bcrypt.hashpw(data.password.encode(), bcrypt.gensalt()).decode()
    hashed_pin = bcrypt.hashpw(data.pin.encode(), bcrypt.gensalt()).decode()

    verification_token = secrets.token_urlsafe()
    user = User(
        username=data.username,
        email=data.email,
        hashed_password=hashed_pw,
        pin_hash=hashed_pin,          # store the PIN hash
        pin_verified=False,           # force PIN check later
        verification_token=verification_token,
        avatar=data.avatar
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    now = datetime.now(timezone.utc)
    access_expires = now + timedelta(hours=1)
    access_token = jwt.encode(
        {"sub": str(user.id), "username": user.username, "exp": access_expires},
        settings.JWT_SECRET,
        algorithm="HS256",
    )
    refresh_token = secrets.token_urlsafe(32)
    user.refresh_token = refresh_token
    user.refresh_token_expires_at = now + timedelta(days=7)
    await db.commit()

    # 3) Fire off verification email
    if user.email:
        verify_link = f"{settings.FRONTEND_URL}/verify-email?token={verification_token}"
        fallback = (
            f"Hi {user.username},\n\n"
            f"Please verify your HyphaeOS account by clicking:\n{verify_link}\n\n"
            "— The HyphaeOS Team"
        )
        await send_email(
            user.email,
            "🔒 Verify Your HyphaeOS Email",
            "verify_email.html",
            body=fallback,
            username=user.username,
            verify_link=verify_link,
        )

    # 4) Return tokens + initial pin_verified flag
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "access_token": access_token,
        "refresh_token": refresh_token,
        "pin_verified": False,
    }
@router.post("/auth/set_pin")
async def set_pin(
    pin: str = Body(..., embed=True),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not pin or len(pin) < 4:
        raise HTTPException(400, "PIN must be at least 4 digits")
    if user.pin_hash and bcrypt.checkpw(pin.encode(), user.pin_hash.encode()):
        raise HTTPException(400, "New PIN cannot be the same as your current PIN")
    user.pin_hash = bcrypt.hashpw(pin.encode(), bcrypt.gensalt()).decode()
    user.pin_verified = False
    await db.commit()
    return {"message": "PIN set successfully"}

@router.post("/auth/verify_pin")
async def verify_pin(
    pin: str = Body(..., embed=True),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not user.pin_hash or not bcrypt.checkpw(pin.encode(), user.pin_hash.encode()):
        raise HTTPException(401, "Invalid PIN")
    user.pin_verified = True
    await db.commit()
    return {"success": True}

@router.post("/auth/change_pin")
async def change_pin(
    old_pin: str = Body(..., embed=True),
    new_pin: str = Body(..., embed=True),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not user.pin_hash or not bcrypt.checkpw(old_pin.encode(), user.pin_hash.encode()):
        raise HTTPException(401, "Invalid current PIN")
    if bcrypt.checkpw(new_pin.encode(), user.pin_hash.encode()):
        raise HTTPException(400, "New PIN cannot be the same as your current PIN")
    user.pin_hash = bcrypt.hashpw(new_pin.encode(), bcrypt.gensalt()).decode()
    user.pin_verified = False
    await db.commit()
    return {"message": "PIN changed successfully"}

@router.post("/auth/login")
async def login_user(
    credentials: UserLogin,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    # Authenticate
    result = await db.execute(
        select(User).where(User.username == credentials.username)
    )
    user = result.scalar_one_or_none()
    if not user or not bcrypt.checkpw(
        credentials.password.encode(), user.hashed_password.encode()
    ):
        raise HTTPException(401, "Invalid username or password")
    if not user.is_verified:
        raise HTTPException(403, "Email not verified")

    # Issue tokens
    now = datetime.now(timezone.utc)
    access_expires = now + timedelta(hours=1)
    access_token = jwt.encode(
        {"sub": str(user.id), "username": user.username, "exp": access_expires},
        settings.JWT_SECRET,
        algorithm="HS256",
    )
    new_refresh = secrets.token_urlsafe(32)
    user.refresh_token = new_refresh
    user.refresh_token_expires_at = now + timedelta(days=7)
    await db.commit()

    response.set_cookie(
        "refresh_token",
        value=new_refresh,
        httponly=True,
        secure=IS_PROD,
        samesite="lax",
        path="/",
        max_age=7 * 24 * 3600,
    )

    return {
        "id": user.id,
        "username": user.username,
        "role": "user",
        "access_token": access_token,
        "pin_verified": False,
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
        res = await db.execute(
            select(User).where(User.refresh_token == refresh_token)
        )
        u = res.scalar_one_or_none()
        if u:
            u.refresh_token = None
            u.refresh_token_expires_at = None

    await db.commit()
    response.delete_cookie("refresh_token", path="/")
    return {"status": "logged_out"}


@router.get("/auth/me", response_model=UserRead)
async def get_profile(
    authorization: str | None = Header(None),
    db: AsyncSession = Depends(get_db),
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Not authenticated")
    token = authorization.split(" ", 1)[1]

    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])
    except JWTError:
        raise HTTPException(401, "Invalid token")

    sub = payload.get("sub")
    try:
        user_id = int(sub)
    except:
        raise HTTPException(401, "Invalid token subject")

    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(404, "User not found")

    return {
        "id":            user.id,
        "username":      user.username,
        "email":         user.email,
        "pending_email": user.pending_email,
        "verified":      user.is_verified,
        "is_active":     user.is_active,
        "created_at":    user.created_at,
        "avatar":        user.avatar,
    }


@router.post("/auth/change_username")
async def change_username(
    new_username: str = Body(..., embed=True),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if user.username == new_username:
        raise HTTPException(400, "That is already your current username")

    existing = await db.execute(
        select(User).where(User.username == new_username, User.id != user.id)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(400, "Username already taken")

    user.username = new_username
    await db.commit()
    return {"message": "Username changed successfully"}

@router.post("/auth/refresh")
async def refresh_token(
    response: Response,
    refresh_token: str = Cookie(None),
    db: AsyncSession = Depends(get_db),
    request: Request = None,  # Add request parameter
):
    logger.info(f"Received /auth/refresh with method: {request.method}")
    if not refresh_token:
        logger.error("No refresh token provided")
        raise HTTPException(401, "No refresh token")
    res = await db.execute(
        select(User).where(User.refresh_token == refresh_token)
    )
    user = res.scalar_one_or_none()
    blk = await db.execute(
        select(BlacklistedToken).where(BlacklistedToken.token == refresh_token)
    )
    if not user or blk.scalar_one_or_none():
        raise HTTPException(401, "Invalid or revoked refresh token")

    now = datetime.now(timezone.utc)
    if user.refresh_token_expires_at and user.refresh_token_expires_at < now:
        raise HTTPException(401, "Refresh token expired")

    access_expires = now + timedelta(hours=1)
    access_token = jwt.encode(
        {"sub": str(user.id), "username": user.username, "exp": access_expires},
        settings.JWT_SECRET,
        algorithm="HS256",
    )
    new_refresh = secrets.token_urlsafe(32)
    user.refresh_token = new_refresh
    user.refresh_token_expires_at = now + timedelta(days=7)
    await db.commit()

    # send the new refresh token cookie in a way the browser will include on XHR
    response.set_cookie(
        "refresh_token",
        value=new_refresh,
        httponly=True,
        secure=True,           # modern browsers require Secure when SameSite=None
        samesite="none",       # allow it on cross-site XHR/fetch
        path="/",
        max_age=7 * 24 * 3600,
    )

@router.post("/auth/change_password")
async def change_password(
    old_password: str = Body(..., embed=True),
    new_password: str = Body(..., embed=True),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # 1) Verify their current password
    if not bcrypt.checkpw(old_password.encode(), user.hashed_password.encode()):
        raise HTTPException(401, "Invalid current password")

    # 2) Hash & store the new one
    user.hashed_password = bcrypt.hashpw(new_password.encode(), bcrypt.gensalt()).decode()
    await db.commit()

    return {"message": "Password changed successfully"}


@router.post("/auth/password-reset/request")
async def password_reset_request(
    background_tasks: BackgroundTasks,
    email: str = Body(..., embed=True),
    db: AsyncSession = Depends(get_db),
):
    """
    Always returns 200 to avoid leaking which emails exist.
    """
    res = await db.execute(select(User).where(User.email == email))
    user = res.scalar_one_or_none()

    if user:
        token = secrets.token_urlsafe()
        user.reset_token = token
        await db.commit()

        reset_link = f"{settings.FRONTEND_URL}/reset-password?token={token}"
        # fallback plain-text
        fallback = (
            f"Hi {user.username},\n\n"
            f"You requested a password reset. Click here:\n{reset_link}\n\n"
            "— The HyphaeOS Team"
        )
        background_tasks.add_task(
            send_email,
            user.email,
            "🔐 HyphaeOS Password Reset",
            "forgot_password.html",
            body=fallback,
            username=user.username,
            reset_link=reset_link,
        )

    return {"message": "If that email exists, you’ll get a link shortly."}


@router.get("/auth/password-reset/check")
async def password_reset_check(
    token: str = Query(..., description="One-time reset token"),
    db: AsyncSession = Depends(get_db),
):
    """Just verify that the token exists (no mutation)."""
    result = await db.execute(select(User).where(User.reset_token == token))
    if not result.scalar_one_or_none():
        raise HTTPException(404, detail="Invalid or expired token")
    return {"message": "Token is valid"}

@router.post("/auth/password-reset/confirm")
async def password_reset_confirm(
    token: str = Body(..., embed=True),
    new_password: str = Body(..., embed=True),
    db: AsyncSession = Depends(get_db),
):
    """Consume the token and update the password."""
    result = await db.execute(select(User).where(User.reset_token == token))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(404, detail="Invalid or expired token")

    user.hashed_password = bcrypt.hashpw(new_password.encode(), bcrypt.gensalt()).decode()
    user.reset_token = None
    await db.commit()
    return {"message": "Password reset successful"}


@router.get("/auth/verify_email")
async def verify_email(token: str = Query(...), db: AsyncSession = Depends(get_db)):
    user = (await db.execute(select(User).where(User.verification_token == token))).scalar_one_or_none()
    if not user:
        raise HTTPException(404, "Invalid or expired token")

    # If already verified, bail out immediately
    if user.is_verified:
        return {"message": "Email already verified."}

    # Otherwise verify + send exactly one welcome email
    user.is_verified = True
    user.verification_token = None
    await db.commit()

    fallback = (
        f"Hey {user.username},\n\n"
        "Your HyphaeOS email has been verified and your account is now active.\n\n"
        "— The HyphaeOS Team"
    )
    await send_email(
        user.email,
        "🎉 Welcome to HyphaeOS!",
        "welcome_email.html",
        body=fallback,
        username=user.username,
    )
    return {"message": "Email successfully verified."}


@router.post("/auth/change_email")
async def change_email(
    background_tasks: BackgroundTasks,
    new_email: str = Body(..., embed=True),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # 1) If there's no pending change and they submitted their current confirmed email
    if user.pending_email is None and user.email == new_email:
        raise HTTPException(400, "That is already your current email")

    # 2) Prevent conflicts with another user's *confirmed* email
    existing = await db.execute(
        select(User).where(User.email == new_email, User.id != user.id)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(400, "That email is already in use")

    # 3) Update or resend pending change (allow re-sending if same email already pending)
    token = secrets.token_urlsafe()
    user.pending_email = new_email
    user.verification_token = token
    await db.commit()

    verify_link = f"{settings.FRONTEND_URL}/verify-email-change?token={token}"
    background_tasks.add_task(
        send_email,
        new_email,
        "🔄 Email Change Request for Your HyphaeOS Account",
        "change_email.html",
        body=(
            f"Hey {user.username},\n\n"
            f"You requested to change your email to {new_email}.\n"
            f"Confirm here: {verify_link}\n\n"
            "— The HyphaeOS Team"
        ),
        username=user.username,
        new_email=new_email,
        verify_link=verify_link
    )

    return {
        "message": "Verification email sent to your new address. Please click the link to confirm."
    }

@router.post("/auth/cancel_pending_email")
async def cancel_pending_email(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not user.pending_email:
        raise HTTPException(400, "No pending email to cancel")

    user.pending_email = None
    user.verification_token = None
    await db.commit()
    return {"message": "Pending email change canceled."}



@router.post("/auth/resend_verification")
async def resend_verification(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if user.is_verified:
        raise HTTPException(400, "Email already verified")
    
    if not user.email:
        raise HTTPException(400, "No email associated with account")

    token = secrets.token_urlsafe()
    user.verification_token = token
    await db.commit()

    verify_link = f"{settings.FRONTEND_URL}/verify-email?token={token}"
    fallback = (
        f"Hi {user.username},\n\n"
        f"Please verify your HyphaeOS account by clicking:\n{verify_link}\n\n"
        "— The HyphaeOS Team"
    )
    await send_email(
        user.email,
        "🔒 Resend: Verify Your HyphaeOS Email",
        "verify_email.html",
        body=fallback,
        username=user.username,
        verify_link=verify_link,
    )
    return {"message": "Verification email resent. Please check your inbox."}

@router.get("/auth/verify_email_change")
async def verify_email_change(
    token: str = Query(...),
    db: AsyncSession = Depends(get_db),
):
    print("🔥 verify_email_change called with token:", token)
    res = await db.execute(
        select(User).where(User.verification_token == token)
    )
    user = res.scalar_one_or_none()
    if not user or not user.pending_email:
        raise HTTPException(404, "Invalid or expired token, or no pending email change")

    # Update email to pending_email
    user.email = user.pending_email
    user.pending_email = None
    user.verification_token = None
    # Do NOT modify is_verified to preserve login ability
    await db.commit()

    # Send confirmation email
    fallback = (
        f"Hey {user.username},\n\n"
        f"Your email has been updated to {user.email}. You’re all set!\n\n"
        "— The HyphaeOS Team"
    )
    await send_email(
        user.email,
        "✅ Email Updated",
        "email_verified.html",
        body=fallback,
        username=user.username,
    )
    return {"message": "Email successfully updated."}

@router.get("/auth/status")
async def auth_status(user_id: int = 1, db: AsyncSession = Depends(get_db)):
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(404, "User not found")
    return {"status": "authenticated", "username": user.username, "role": "user"}


@router.get("/auth/admin_only")
async def admin_only():
    return {"message": "admin access granted"}
