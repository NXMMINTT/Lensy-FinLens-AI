"""Onboarding: "connect your shop" step shown right after a user's first
LINE login. For the demo this simulates pulling a shop profile + products
from the seller's existing marketplace account — Shopee/Lazada/TikTok Shop
Open Platform access all require a business-verified partner application
that takes weeks to approve, so this is mocked end-to-end (real HTTP round
trip, real network delay, mock-data backed) rather than faked purely on
the frontend with a setTimeout.
"""

import asyncio
import random

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.mock_data_loader import load_json

router = APIRouter(prefix="/api/onboarding", tags=["onboarding"])

_CONNECTABLE_PLATFORMS = {"shopee_th", "lazada_th", "tiktok_shop_th"}


class ConnectPlatformRequest(BaseModel):
    platform_id: str


@router.get("/platforms")
def connectable_platforms():
    platforms = load_json("platforms.json")
    return [p for p in platforms if p["platform_id"] in _CONNECTABLE_PLATFORMS]


@router.post("/connect")
async def connect_platform(req: ConnectPlatformRequest):
    if req.platform_id not in _CONNECTABLE_PLATFORMS:
        raise HTTPException(status_code=400, detail="ไม่รองรับแพลตฟอร์มนี้")

    # Real network delay (not instant) so the step reads as an actual sync,
    # matching how long an OAuth + data-pull round trip would feel.
    await asyncio.sleep(random.uniform(1.4, 2.2))

    profiles = load_json("platform-connect.json")
    profile = profiles.get(req.platform_id)
    if not profile:
        raise HTTPException(status_code=404, detail="ไม่พบข้อมูลร้านค้า")
    return profile
