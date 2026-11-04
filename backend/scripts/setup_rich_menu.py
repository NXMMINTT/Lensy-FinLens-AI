"""Register the LINE Rich Menu via Messaging API.

Usage:
    cd backend && python -m scripts.setup_rich_menu

Requires LINE_CHANNEL_ACCESS_TOKEN and LIFF_ID in .env.
"""

import json
import sys
from pathlib import Path

import httpx

from app.core.settings import settings

API = "https://api.line.me/v2/bot"
ASSET = Path(__file__).resolve().parent.parent / "app" / "line_messages" / "assets" / "rich_menu.jpg"

LIFF_BASE = f"https://liff.line.me/{settings.liff_id}" if settings.liff_id else ""


def _headers() -> dict[str, str]:
    return {"Authorization": f"Bearer {settings.line_channel_access_token}"}


def _build_rich_menu_body() -> dict:
    return {
        "size": {"width": 2500, "height": 1686},
        "selected": True,
        "name": "U-Ledger AI Menu",
        "chatBarText": "เมนู U-Ledger",
        "areas": [
            {
                "bounds": {"x": 0, "y": 0, "width": 1000, "height": 1686},
                "action": {"type": "postback", "data": "action=menu_greeting", "displayText": "สวัสดีครับ"},
            },
            {
                "bounds": {"x": 1000, "y": 0, "width": 750, "height": 562},
                "action": {"type": "postback", "data": "action=menu_summary", "displayText": "สรุปวันนี้"},
            },
            {
                "bounds": {"x": 1750, "y": 0, "width": 750, "height": 562},
                "action": {"type": "uri", "uri": f"{LIFF_BASE}/market", "label": "Market Radar"},
            },
            {
                "bounds": {"x": 1000, "y": 562, "width": 750, "height": 562},
                "action": {"type": "uri", "uri": f"{LIFF_BASE}/stock", "label": "สต็อกสินค้า"},
            },
            {
                "bounds": {"x": 1750, "y": 562, "width": 750, "height": 562},
                "action": {"type": "uri", "uri": f"{LIFF_BASE}/transactions", "label": "รายการ"},
            },
            {
                "bounds": {"x": 1000, "y": 1124, "width": 500, "height": 562},
                "action": {"type": "uri", "uri": f"{LIFF_BASE}/", "label": "Dashboard"},
            },
            {
                "bounds": {"x": 1500, "y": 1124, "width": 500, "height": 562},
                "action": {"type": "uri", "uri": f"{LIFF_BASE}/market/plans", "label": "Premium"},
            },
            {
                "bounds": {"x": 2000, "y": 1124, "width": 500, "height": 562},
                "action": {"type": "postback", "data": "action=menu_help", "displayText": "Help"},
            },
        ],
    }


def main() -> None:
    if not settings.line_channel_access_token:
        print("ERROR: LINE_CHANNEL_ACCESS_TOKEN is empty in .env")
        sys.exit(1)
    if not settings.liff_id:
        print("ERROR: LIFF_ID is empty in .env")
        sys.exit(1)
    if not ASSET.exists():
        print(f"ERROR: Rich menu image not found at {ASSET}")
        sys.exit(1)

    client = httpx.Client(headers=_headers(), timeout=30)

    # 1. Create rich menu definition
    print("Creating rich menu...")
    resp = client.post(f"{API}/richmenu", json=_build_rich_menu_body())
    resp.raise_for_status()
    menu_id = resp.json()["richMenuId"]
    print(f"  richMenuId = {menu_id}")

    # 2. Upload image
    print("Uploading image...")
    with ASSET.open("rb") as f:
        resp = client.post(
            f"https://api-data.line.me/v2/bot/richmenu/{menu_id}/content",
            content=f.read(),
            headers={**_headers(), "Content-Type": "image/jpeg"},
        )
    resp.raise_for_status()
    print("  Image uploaded.")

    # 3. Set as default for all users
    print("Setting as default rich menu...")
    resp = client.post(f"{API}/user/all/richmenu/{menu_id}")
    resp.raise_for_status()
    print("Done! Rich menu is now live.")


if __name__ == "__main__":
    main()
