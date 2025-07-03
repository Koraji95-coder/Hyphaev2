import bcrypt
import pytest
from unittest.mock import AsyncMock, MagicMock, patch

from core.routes import auth
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

    with patch('core.routes.auth.send_email', new=AsyncMock()) as mock_send:
        resp = await auth.register_user({'username': 'alice', 'password': 'secret', 'email': 'alice@example.com'}, db=db)
        assert resp == {'id': 1, 'username': 'alice', 'email': 'alice@example.com'}
        mock_send.assert_awaited_once_with(
            'alice@example.com',
            'Verify your email',
            'Hello alice, please verify your email address.'
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

    resp = await auth.login_user({'username': 'alice', 'password': 'secret'}, db=db)
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
