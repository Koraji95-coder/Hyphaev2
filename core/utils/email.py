import aiosmtplib
from email.message import EmailMessage

from core.config.settings import settings

async def send_email(recipient: str, subject: str, body: str) -> None:
    """Send an email using the configured SMTP server."""
    message = EmailMessage()
    message["From"] = settings.SMTP_USER
    message["To"] = recipient
    message["Subject"] = subject
    message.set_content(body)

    await aiosmtplib.send(
        message,
        hostname=settings.SMTP_HOST,
        port=settings.SMTP_PORT,
        username=settings.SMTP_USER,
        password=settings.SMTP_PASSWORD,
        start_tls=True,
    )
