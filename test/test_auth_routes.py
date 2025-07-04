import os
os.environ.setdefault("REDIS_URL", "redis://localhost:6379/0")
os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///:memory:")

import bcrypt
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi import HTTPException

from core.routes import auth
from core.schemas import UserCreate, UserLogin
from core.utils.email import send_email


@pytest.mark.asyncio
async def test_register_user_success():
    db = MagicMock()
    result = MagicMock()
    result.scalar_one_or_none.return_value = None
    db.execute = AsyncMock(return_value=result)
    
    async def refresh(user):
        user.id = 1
    db.refresh = AsyncMock(side_effect=refresh)
    db.commit = AsyncMock()

    with patch('core.routes.auth.secrets.token_urlsafe', return_value='tok123'):
        with patch('core.routes.auth.send_email', new=AsyncMock()) as mock_send:
            user_in = UserCreate(username='alice', password='secret', email='alice@example.com')
            resp = await auth.register_user(user_in, db=db)
            assert resp == {'id': 1, 'username': 'alice', 'email': 'alice@example.com'}
            verify_link = f"http://localhost:5173/verify-email?token=tok123&email=alice@example.com"
            mock_send.assert_awaited_once_with(
                'alice@example.com',
                'Verify your email',
                f'Hello alice, please verify your email by visiting {verify_link}'
            )
    db.add.assert_called()
    db.commit.assert_called()
    db.refresh.assert_called()


@pytest.mark.asyncio
async def test_login_user_success():
    hashed_pw = bcrypt.hashpw(b'secret', bcrypt.gensalt()).decode()
    user = MagicMock(id=1, username='alice', hashed_password=hashed_pw, is_verified=True)
    result = MagicMock()
    result.scalar_one_or_none.return_value = user
    db = MagicMock()
    db.execute = AsyncMock(return_value=result)

    creds = UserLogin(username='alice', password='secret')
    resp = await auth.login_user(creds, db=db)
    assert resp['username'] == 'alice'
    assert resp['role'] == 'user'
    assert resp['token'] == 'fake-token'


@pytest.mark.asyncio
async def test_login_user_unverified():
    hashed_pw = bcrypt.hashpw(b'secret', bcrypt.gensalt()).decode()
    user = MagicMock(id=1, username='alice', hashed_password=hashed_pw, is_verified=False)
    result = MagicMock()
    result.scalar_one_or_none.return_value = user
    db = MagicMock()
    db.execute = AsyncMock(return_value=result)

    creds = UserLogin(username='alice', password='secret')
    with pytest.raises(HTTPException) as exc:
        await auth.login_user(creds, db=db)
    assert exc.value.status_code == 403


@pytest.mark.asyncio
async def test_send_email_dispatch():
    with patch('core.utils.email.aiosmtplib.send', new=AsyncMock()) as mock_send:
        await send_email('bob@example.com', 'Hi', 'Hello')
        mock_send.assert_awaited_once()
        message = mock_send.call_args.args[0]
        assert message['To'] == 'bob@example.com'
        assert message['Subject'] == 'Hi'


@pytest.mark.asyncio
async def test_verify_email_success():
    user = MagicMock()
    result = MagicMock()
    result.scalar_one_or_none.return_value = user
    db = MagicMock()
    db.execute = AsyncMock(return_value=result)
    db.commit = AsyncMock()

    resp = await auth.verify_email(token='tok123', db=db)
    assert resp == {'message': 'Email verified'}
    assert user.is_verified is True
    assert user.verification_token is None
    db.commit.assert_called()


@pytest.mark.asyncio
async def test_verify_email_already_verified():
    first_result = MagicMock()
    first_result.scalar_one_or_none.return_value = None
    verified_user = MagicMock(is_verified=True)
    second_result = MagicMock()
    second_result.scalar_one_or_none.return_value = verified_user

    db = MagicMock()
    db.execute = AsyncMock(side_effect=[first_result, second_result])

    resp = await auth.verify_email(token='bad', email='alice@example.com', db=db)
    assert resp == {'message': 'Email already verified'}


@pytest.mark.asyncio
async def test_resend_verification_unverified():
    user = MagicMock(username='alice', email='alice@example.com', is_verified=False)
    result = MagicMock()
    result.scalar_one_or_none.return_value = user
    db = MagicMock()
    db.execute = AsyncMock(return_value=result)
    db.commit = AsyncMock()

    with patch('core.routes.auth.secrets.token_urlsafe', return_value='tok123'):
        with patch('core.routes.auth.send_email', new=AsyncMock()) as mock_send:
            resp = await auth.resend_verification(email='alice@example.com', db=db)
            assert resp == {'message': 'Verification email resent'}
            verify_link = (
                f"http://localhost:5173/verify-email?token=tok123&email=alice@example.com"
            )
            mock_send.assert_awaited_once_with(
                'alice@example.com',
                'Verify your email',
                f'Hello alice, please verify your email by visiting {verify_link}'
            )
    assert user.verification_token == 'tok123'
    db.commit.assert_called()


@pytest.mark.asyncio
async def test_resend_verification_already_verified():
    user = MagicMock(username='bob', email='bob@example.com', is_verified=True)
    result = MagicMock()
    result.scalar_one_or_none.return_value = user
    db = MagicMock()
    db.execute = AsyncMock(return_value=result)

    resp = await auth.resend_verification(email='bob@example.com', db=db)
    assert resp == {'message': 'Email already verified'}


@pytest.mark.asyncio
async def test_get_profile_authenticated():
    user = MagicMock(id=1, username='alice', email='alice@example.com')
    result = MagicMock()
    result.scalar_one_or_none.return_value = user
    db = MagicMock()
    db.execute = AsyncMock(return_value=result)

    resp = await auth.get_profile(db=db, authorization='Bearer fake-token')
    assert resp == {
        'id': 1,
        'username': 'alice',
        'email': 'alice@example.com',
        'role': 'user',
        'verified': True,
    }
    db.execute.assert_awaited()


@pytest.mark.asyncio
async def test_get_profile_missing_token():
    db = MagicMock()
    db.execute = AsyncMock()
    with pytest.raises(HTTPException) as exc:
        await auth.get_profile(db=db, authorization=None)
    assert exc.value.status_code == 401
    db.execute.assert_not_awaited()


@pytest.mark.asyncio
async def test_get_profile_invalid_token():
    db = MagicMock()
    db.execute = AsyncMock()
    with pytest.raises(HTTPException) as exc:
        await auth.get_profile(db=db, authorization='Bearer bad')
    assert exc.value.status_code == 401
    db.execute.assert_not_awaited()


@pytest.mark.asyncio
async def test_password_reset_request():
    user = MagicMock(username='alice', email='alice@example.com')
    result = MagicMock()
    result.scalar_one_or_none.return_value = user
    db = MagicMock()
    db.execute = AsyncMock(return_value=result)
    db.commit = AsyncMock()

    with patch('core.routes.auth.secrets.token_urlsafe', return_value='tok123'):
        with patch('core.routes.auth.send_email', new=AsyncMock()) as mock_send:
            resp = await auth.password_reset_request(email='alice@example.com', db=db)
            assert resp == {'message': 'Reset email sent', 'username': 'alice'}
            reset_link = f"http://localhost:5173/reset-password?token=tok123"
            mock_send.assert_awaited_once_with(
                'alice@example.com',
                'Password Reset',
                f"Hello alice,\n\nYour username is: alice\nFollow this link to reset your password: {reset_link}",
            )
    assert user.reset_token == 'tok123'
    db.commit.assert_called()


@pytest.mark.asyncio
async def test_password_reset_verify():
    hashed_pw = bcrypt.hashpw(b'old', bcrypt.gensalt()).decode()
    user = MagicMock(reset_token='tok123', hashed_password=hashed_pw)
    result = MagicMock()
    result.scalar_one_or_none.return_value = user
    db = MagicMock()
    db.execute = AsyncMock(return_value=result)
    db.commit = AsyncMock()

    resp = await auth.password_reset_verify(token='tok123', new_password='new', db=db)
    assert resp == {'message': 'Password reset successful'}
    assert user.reset_token is None
    assert bcrypt.checkpw(b'new', user.hashed_password.encode())
    db.commit.assert_called()
