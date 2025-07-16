# core/utils/email.py

import os
from pathlib import Path
from email.message import EmailMessage
from email.utils import formataddr

import aiosmtplib
from jinja2 import Environment, FileSystemLoader, select_autoescape, TemplateNotFound

from core.config.settings import settings

# ───────────────────────────────────────────────────────────
# Point Jinja at your frontend/templates directory
# ───────────────────────────────────────────────────────────
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
TEMPLATES_DIR = PROJECT_ROOT / "frontend" / "templates"

jinja_env = Environment(
    loader=FileSystemLoader(str(TEMPLATES_DIR)),
    autoescape=select_autoescape(["html", "xml"]),
)


async def send_email(
    recipient: str,
    subject: str,
    template_name: str,
    **context  # e.g. username=..., reset_link=..., verify_link=...
) -> None:
    """
    Render the given Jinja2 template with `context` and send it.
    If the template isn't found, falls back to a plain-text `context['body']`.
    """
    # 1) Render HTML or fallback to plain text
    try:
        template = jinja_env.get_template(template_name)
        html_body = template.render(**context)
    except TemplateNotFound:
        html_body = context.get("body", "")

    # 2) Build MIME message
    message = EmailMessage()
    message["From"] = formataddr(("The HyphaeOS Team", settings.SMTP_USER))
    message["To"] = recipient
    message["Subject"] = subject

    if html_body.lstrip().startswith("<"):
        # HTML alternative
        message.add_alternative(html_body, subtype="html", charset="utf-8")
    else:
        message.set_content(html_body, charset="utf-8")

    # 3) Send
    await aiosmtplib.send(
        message,
        hostname=settings.SMTP_HOST,
        port=settings.SMTP_PORT,
        username=settings.SMTP_USER,
        password=settings.SMTP_PASSWORD,
        start_tls=True,
    )
