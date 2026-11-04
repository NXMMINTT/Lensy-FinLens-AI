"""Flex Messages for greeting, help, and how-to — styled to match
the U-Fox mascot design with blue headers and menu button grid.
"""

from linebot.v3.messaging import (
    FlexBox,
    FlexBubble,
    FlexButton,
    FlexImage,
    FlexMessage,
    FlexSeparator,
    FlexText,
    MessageAction,
    PostbackAction,
    URIAction,
)

from app.core.settings import settings

LIFF_BASE = f"https://liff.line.me/{settings.liff_id}" if settings.liff_id else ""

FOX_IMAGE = "https://i.imgur.com/7QF9Yuv.png"


def build_welcome_flex() -> FlexMessage:
    header = FlexBox(
        layout="vertical",
        background_color="#4A90D9",
        padding_all="20px",
        padding_bottom="16px",
        contents=[
            FlexBox(
                layout="horizontal",
                contents=[
                    FlexBox(
                        layout="vertical",
                        flex=7,
                        contents=[
                            FlexText(
                                text="สวัสดีครับ! 👋",
                                color="#FFFFFF",
                                size="xl",
                                weight="bold",
                            ),
                            FlexText(
                                text="ผม U-Fox",
                                color="#FFFFFF",
                                size="xxl",
                                weight="bold",
                                margin="sm",
                            ),
                            FlexText(
                                text="ผู้ช่วยจัดการการเงิน\nของคุณครับ",
                                color="#FFFFFFCC",
                                size="sm",
                                margin="sm",
                                wrap=True,
                            ),
                        ],
                    ),
                ],
            ),
        ],
    )

    question_box = FlexBox(
        layout="vertical",
        background_color="#EBF3FE",
        corner_radius="12px",
        padding_all="12px",
        margin="lg",
        contents=[
            FlexText(
                text="วันนี้อยากให้ผมช่วยเรื่องอะไรดีครับ?",
                color="#4A90D9",
                size="sm",
                weight="bold",
                wrap=True,
            ),
        ],
    )

    menu_row_1 = FlexBox(
        layout="horizontal",
        spacing="sm",
        margin="lg",
        contents=[
            _menu_button("💰", "บันทึกรายรับ", "เพิ่มรายรับง่ายๆเลย", MessageAction(label="บันทึกรายรับ", text="บันทึกรายรับ")),
            _menu_button("💸", "บันทึกรายจ่าย", "จดรายจ่ายได้ทันที", MessageAction(label="บันทึกรายจ่าย", text="บันทึกรายจ่าย")),
            _menu_button("📊", "สรุปภาพรวม", "ดูรายรับ-รายจ่าย", PostbackAction(label="สรุปภาพรวม", data="action=menu_summary", display_text="สรุปภาพรวม")),
        ],
    )

    menu_row_2 = FlexBox(
        layout="horizontal",
        spacing="sm",
        margin="sm",
        contents=[
            _menu_button("📦", "จัดการสินค้า", "เช็คสินค้าและสต็อก", URIAction(label="จัดการสินค้า", uri=f"{LIFF_BASE}/stock") if LIFF_BASE else MessageAction(label="จัดการสินค้า", text="จัดการสินค้า")),
            _menu_button("🌍", "ดูตลาดคู่แข่ง", "เทรนด์ต่างประเทศ", URIAction(label="ดูตลาดคู่แข่ง", uri=f"{LIFF_BASE}/market") if LIFF_BASE else MessageAction(label="ดูตลาดคู่แข่ง", text="ดูตลาดคู่แข่ง")),
            _menu_button("👑", "อัปเกรดแพ็กเกจ", "ฟีเจอร์เพิ่มเติม", URIAction(label="อัปเกรดแพ็กเกจ", uri=f"{LIFF_BASE}/market/plans") if LIFF_BASE else MessageAction(label="อัปเกรดแพ็กเกจ", text="อัปเกรดแพ็กเกจ")),
        ],
    )

    bottom_row = FlexBox(
        layout="horizontal",
        spacing="sm",
        margin="lg",
        contents=[
            FlexButton(
                style="secondary",
                height="sm",
                color="#F0F0F0",
                action=PostbackAction(label="⚙️ ตั้งค่าร้าน", data="action=menu_settings", display_text="ตั้งค่าร้าน"),
            ),
            FlexButton(
                style="secondary",
                height="sm",
                color="#F0F0F0",
                action=PostbackAction(label="❓ วิธีใช้งาน", data="action=menu_howto", display_text="วิธีใช้งาน"),
            ),
            FlexButton(
                style="secondary",
                height="sm",
                color="#F0F0F0",
                action=MessageAction(label="💬 คุยกับ U-Fox", text="สวัสดี"),
            ),
        ],
    )

    body = FlexBox(
        layout="vertical",
        padding_all="16px",
        contents=[
            question_box,
            menu_row_1,
            menu_row_2,
            FlexSeparator(margin="lg"),
            bottom_row,
        ],
    )

    bubble = FlexBubble(header=header, body=body)
    return FlexMessage(alt_text="สวัสดีครับ! ผม U-Fox ผู้ช่วยจัดการการเงินของคุณ", contents=bubble)


def build_howto_flex() -> FlexMessage:
    header = FlexBox(
        layout="vertical",
        background_color="#4A90D9",
        padding_all="20px",
        contents=[
            FlexText(
                text="📖 วิธีใช้งาน U-Fox",
                color="#FFFFFF",
                size="lg",
                weight="bold",
            ),
            FlexText(
                text="บันทึกรายรับ-รายจ่ายง่ายๆ 3 แบบ",
                color="#FFFFFFCC",
                size="xs",
                margin="sm",
            ),
        ],
    )

    body = FlexBox(
        layout="vertical",
        padding_all="16px",
        spacing="md",
        contents=[
            _howto_item("📝", "พิมพ์ข้อความ", "เช่น \"ขายน้ำพริก 3 กระปุก 150 บาท\""),
            FlexSeparator(margin="sm"),
            _howto_item("🧾", "ส่งรูปสลิป/ใบเสร็จ", "ถ่ายรูปส่งมาได้เลย AI อ่านให้"),
            FlexSeparator(margin="sm"),
            _howto_item("🎙️", "อัดเสียงสั่งงาน", "เช่น \"จ่ายค่าวัตถุดิบ 500 บาท\""),
            FlexSeparator(margin="md"),
            FlexBox(
                layout="vertical",
                background_color="#FFF9E6",
                corner_radius="8px",
                padding_all="12px",
                contents=[
                    FlexText(
                        text="💡 เคล็ดลับ",
                        size="sm",
                        weight="bold",
                        color="#E09000",
                    ),
                    FlexText(
                        text="ส่งมาตามนี้เลยครับ เดี๋ยว U-Fox จะอ่านแล้วส่งการ์ดให้ยืนยันอีกทีครับ",
                        size="xs",
                        color="#666666",
                        margin="sm",
                        wrap=True,
                    ),
                ],
            ),
        ],
    )

    bubble = FlexBubble(header=header, body=body)
    return FlexMessage(alt_text="วิธีใช้งาน U-Fox", contents=bubble)


def _menu_button(emoji: str, title: str, subtitle: str, action) -> FlexBox:
    return FlexBox(
        layout="vertical",
        background_color="#F5F8FF",
        corner_radius="12px",
        padding_all="10px",
        flex=1,
        spacing="xs",
        action=action,
        contents=[
            FlexText(text=emoji, size="xl", align="center"),
            FlexText(text=title, size="xxs", weight="bold", color="#333333", align="center", wrap=True),
            FlexText(text=subtitle, size="xxs", color="#999999", align="center", wrap=True),
        ],
    )


def _howto_item(emoji: str, title: str, desc: str) -> FlexBox:
    return FlexBox(
        layout="horizontal",
        spacing="md",
        contents=[
            FlexText(text=emoji, size="xl", flex=1, align="center"),
            FlexBox(
                layout="vertical",
                flex=8,
                contents=[
                    FlexText(text=title, size="sm", weight="bold", color="#333333"),
                    FlexText(text=desc, size="xs", color="#888888", wrap=True, margin="xs"),
                ],
            ),
        ],
    )
