import os
os.environ.setdefault("REDIS_URL", "redis://localhost:6379/0")
os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///:memory:")

import bcrypt
import pytest
from unittest.mock import AsyncMock, MagicMock, patch

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
    user = MagicMock(id=1, username='alice', hashed_password=hashed_pw)
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
