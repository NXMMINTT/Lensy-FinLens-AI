from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.errors import ApiError
from app.core.settings import settings
from app.services import auth_service, user_service

router = APIRouter(prefix="/auth", tags=["auth"])


class LineLoginRequest(BaseModel):
    id_token: str


class TokenResponse(BaseModel):
    access_token: str


@router.post("/line", response_model=TokenResponse)
def login_with_line(body: LineLoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    if not settings.liff_id:
        raise ApiError(400, "liff_not_configured", "ระบบยังไม่ได้ตั้งค่า LIFF")
    try:
        profile = auth_service.verify_line_id_token(body.id_token)
    except auth_service.InvalidTokenError as exc:
        raise ApiError(401, "invalid_id_token", "ยืนยันตัวตนกับ LINE ไม่สำเร็จ") from exc

    user = user_service.get_or_create_user(db, profile.line_user_id)
    if profile.display_name:
        user.display_name = profile.display_name
    user_service.get_or_create_default_business(db, user)
    db.commit()
    return TokenResponse(access_token=auth_service.issue_jwt(profile.line_user_id))
