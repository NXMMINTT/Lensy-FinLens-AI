"""Point LINE at a new public URL (e.g. after a cloudflared quick tunnel restarts).

Updates, in one go:
  1. the Messaging API webhook  -> <url>/api/v1/line/webhook   (LINE_CHANNEL_ACCESS_TOKEN)
  2. the LIFF app's endpoint URL -> <url>                        (LIFF_ID + LINE_LOGIN_CHANNEL_ID/SECRET)
then asks LINE to test the webhook.

Usage (from backend/):  python scripts/sync_public_url.py https://xxxx.trycloudflare.com
"""

import sys
from pathlib import Path

import httpx

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.core.settings import settings  # noqa: E402

API = "https://api.line.me"


def update_webhook(public_url: str) -> None:
    headers = {"Authorization": f"Bearer {settings.line_channel_access_token}"}
    endpoint = f"{public_url}/api/v1/line/webhook"
    httpx.put(f"{API}/v2/bot/channel/webhook/endpoint", headers=headers, json={"endpoint": endpoint}, timeout=20).raise_for_status()
    test = httpx.post(f"{API}/v2/bot/channel/webhook/test", headers=headers, json={}, timeout=30).json()
    print(f"webhook -> {endpoint}  (LINE test: {'OK' if test.get('success') else test})")


def update_liff(public_url: str) -> None:
    if not (settings.liff_id and settings.line_login_channel_id and settings.line_login_channel_secret):
        print("LIFF skipped: set LIFF_ID, LINE_LOGIN_CHANNEL_ID and LINE_LOGIN_CHANNEL_SECRET in backend/.env")
        return
    # Short-lived channel access token for the LINE Login channel (client credentials).
    token = httpx.post(
        f"{API}/v2/oauth/accessToken",
        data={
            "grant_type": "client_credentials",
            "client_id": settings.line_login_channel_id,
            "client_secret": settings.line_login_channel_secret,
        },
        timeout=20,
    )
    token.raise_for_status()
    headers = {"Authorization": f"Bearer {token.json()['access_token']}"}
    response = httpx.put(
        f"{API}/liff/v1/apps/{settings.liff_id}",
        headers=headers,
        json={"view": {"type": "full", "url": public_url}},
        timeout=20,
    )
    response.raise_for_status()
    print(f"LIFF {settings.liff_id} -> {public_url}")


def main() -> None:
    if len(sys.argv) != 2 or not sys.argv[1].startswith("https://"):
        sys.exit(__doc__)
    public_url = sys.argv[1].rstrip("/")
    update_webhook(public_url)
    update_liff(public_url)


if __name__ == "__main__":
    main()
