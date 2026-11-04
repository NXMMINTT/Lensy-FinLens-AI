"""Shared look for the U-Fox Flex cards (confirm, tax alert, year summary).

The cards are written as plain Flex JSON dicts — easy to compare with the
LINE Flex Simulator — and wrapped into SDK models by `to_flex_message`.
Banner/icon images are hosted in a public GitHub repo; LINE fetches them by URL.
"""

from decimal import Decimal

from linebot.v3.messaging import FlexContainer, FlexMessage

ASSET_BASE = "https://raw.githubusercontent.com/earth201215/line-photo/main/"
# Pinned to the commit of the re-uploaded file so LINE never shows the stale cached copy.
TAX_YELLOW_BANNER = "https://raw.githubusercontent.com/earth201215/line-photo/707df11/banner-tax-yellow.jpg"

NAVY = "#1B2559"
GREY = "#8A91A3"

GREEN = {"main": "#16A34A", "dark": "#11823B", "tint": "#E7F8EE", "track": "#D5F0DF"}
YELLOW = {"main": "#F5B82E", "dark": "#8A5A00", "tint": "#FFF4D6", "track": "#FBE9BC"}
RED = {"main": "#E8335A", "dark": "#C21F45", "tint": "#FDECF0", "track": "#F9D3DC"}
BLUE = {"main": "#2563EB", "dark": "#1D4ED8", "tint": "#E8F0FE", "track": "#DCE7FD"}


def asset(name: str) -> str:
    return ASSET_BASE + name


def to_flex_message(alt_text: str, container: dict) -> FlexMessage:
    return FlexMessage(alt_text=alt_text, contents=FlexContainer.from_dict(container))


def baht_whole(amount: Decimal) -> str:
    sign = "-" if amount < 0 else ""
    return f"{sign}฿{abs(amount):,.0f}"


def hero(url: str) -> dict:
    return {"type": "image", "url": url, "size": "full", "aspectRatio": "1040:294", "aspectMode": "cover"}


def pill(text: str, bg: str, fg: str) -> dict:
    return {
        "type": "box", "layout": "vertical", "flex": 0, "backgroundColor": bg, "cornerRadius": "12px",
        "paddingTop": "3px", "paddingBottom": "3px", "paddingStart": "10px", "paddingEnd": "10px",
        "contents": [{"type": "text", "text": text, "size": "xs", "weight": "bold", "color": fg}],
    }


def glyph_box(glyph: str, color: str, size: str = "28px", radius: str = "8px") -> dict:
    return {
        "type": "box", "layout": "vertical", "flex": 0, "width": size, "height": size, "cornerRadius": radius,
        "backgroundColor": color, "justifyContent": "center", "alignItems": "center",
        "contents": [{"type": "text", "text": glyph, "size": "sm", "weight": "bold", "color": "#FFFFFF", "align": "center"}],
    }


def progress_bar(percent: float, track: str, fill: str, height: int = 10) -> dict:
    width = f"{max(2, min(100, round(percent)))}%"
    radius = f"{height // 2}px"
    return {
        "type": "box", "layout": "vertical", "height": f"{height}px", "cornerRadius": radius, "backgroundColor": track,
        "contents": [{
            "type": "box", "layout": "vertical", "width": width, "height": f"{height}px",
            "cornerRadius": radius, "backgroundColor": fill, "contents": [],
        }],
    }


def footer(primary: dict, primary_color: str, secondary: dict) -> dict:
    """primary/secondary are Flex action dicts (postback or uri)."""
    return {
        "type": "box", "layout": "vertical", "spacing": "xs", "paddingAll": "16px", "paddingTop": "12px",
        "contents": [
            {"type": "button", "style": "primary", "color": primary_color, "height": "md", "action": primary},
            {"type": "button", "style": "link", "color": GREY, "height": "sm", "action": secondary},
        ],
    }


def postback(label: str, data: str, display_text: str | None = None) -> dict:
    action = {"type": "postback", "label": label, "data": data}
    if display_text:
        action["displayText"] = display_text
    return action
