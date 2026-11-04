"""Web dashboard auth: exchange a LIFF ID token (verified with LINE) for our
own short-lived JWT carrying the LINE user id.
"""

from dataclasses import dataclass
from datetime import UTC, datetime, timedelta

import httpx
import jwt

from app.core.settings import settings

LINE_VERIFY_URL = "https://api.line.me/oauth2/v2.1/verify"
JWT_ALGORITHM = "HS256"
JWT_TTL = timedelta(days=7)


class InvalidTokenError(Exception):
    pass


@dataclass
class LineProfile:
    line_user_id: str
    display_name: str | None


def liff_channel_id() -> str:
    # A LIFF ID is "<LINE Login channel ID>-<suffix>"; LINE verifies ID tokens against the channel ID.
    return settings.liff_id.split("-", 1)[0]


def verify_line_id_token(id_token: str) -> LineProfile:
    response = httpx.post(
        LINE_VERIFY_URL, data={"id_token": id_token, "client_id": liff_channel_id()}, timeout=10
    )
    if response.status_code != 200:
        raise InvalidTokenError(response.text)
    payload = response.json()
    return LineProfile(line_user_id=payload["sub"], display_name=payload.get("name"))


def issue_jwt(line_user_id: str, now: datetime | None = None) -> str:
    now = now or datetime.now(UTC)
    return jwt.encode(
        {"sub": line_user_id, "iat": now, "exp": now + JWT_TTL}, settings.jwt_secret, algorithm=JWT_ALGORITHM
    )


def decode_jwt(token: str) -> str:
    """Returns the LINE user id the token was issued for."""
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[JWT_ALGORITHM])
    except jwt.PyJWTError as exc:
        raise InvalidTokenError(str(exc)) from exc
    return payload["sub"]
