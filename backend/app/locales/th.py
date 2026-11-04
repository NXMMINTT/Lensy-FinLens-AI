"""Thai copy for bot messages and Flex Messages. Keep all user-facing
Thai strings here rather than inline in services/routers.
"""

from decimal import Decimal

from app.core.formatting import format_thb

INCOME_LABEL = "รายรับ"
EXPENSE_LABEL = "รายจ่าย"

TRANSACTION_CONFIRM_BUTTON = "ยืนยัน"
TRANSACTION_EDIT_BUTTON = "แก้ไข"
TRANSACTION_CANCEL_BUTTON = "ยกเลิก"
LOW_CONFIDENCE_BADGE = "โปรดตรวจสอบอีกครั้ง"

TRANSACTION_CONFIRMED_REPLY = "บันทึกเรียบร้อยแล้วครับ ✅"
TRANSACTION_CANCELLED_REPLY = "ยกเลิกรายการแล้วครับ"
TRANSACTION_EDIT_REPLY = (
    "ได้เลยครับ ยกเลิกรายการเดิมให้แล้ว ✏️\n"
    "พิมพ์ ส่งรูป หรืออัดเสียงรายการที่ถูกต้องมาได้เลยครับ เช่น \"ขายน้ำพริก 3 กระปุก 150 บาท\" "
    "แล้วจะส่งการ์ดให้ยืนยันใหม่ครับ"
)
TRANSACTION_ALREADY_RESOLVED_REPLY = "รายการนี้ถูกดำเนินการไปแล้วครับ"
TRANSACTION_NOT_FOUND_REPLY = "ไม่พบรายการนี้ครับ"
TAX_SNOOZE_REPLY = "รับทราบครับ เดือนหน้าจะส่งสรุปเพดาน VAT ให้อีกครั้ง 🦊"

NO_TRANSACTIONS_PARSED_REPLY = "ไม่พบรายการที่สามารถบันทึกได้ครับ ลองพิมพ์ใหม่อีกครั้งได้ไหมครับ"
UNSUPPORTED_MESSAGE_TYPE_REPLY = "ตอนนี้รองรับข้อความ รูปสลิป/ใบเสร็จ และข้อความเสียงครับ ลองส่งแบบนั้นมาได้เลยนะครับ"
GENERIC_ERROR_REPLY = "ขอโทษครับ ตอนนี้ระบบขัดข้อง กรุณาลองใหม่อีกครั้งครับ"

RICH_MENU_HOWTO_REPLY = (
    "สวัสดีครับ! ผม U-Fox 🦊 ผู้ช่วยจัดการการเงินของคุณครับ\n\n"
    "บันทึกรายรับ-รายจ่ายได้ 3 แบบเลยครับ 👇\n\n"
    "📝 พิมพ์ข้อความ เช่น \"ขายน้ำพริก 3 กระปุก 150 บาท\"\n"
    "🧾 ส่งรูปสลิปหรือใบเสร็จ\n"
    "🎙️ อัดเสียงสั่งงาน เช่น \"จ่ายค่าวัตถุดิบ 500 บาท\"\n\n"
    "ส่งมาตามนี้เลยครับ เดี๋ยว U-Fox จะอ่านแล้วส่งการ์ดให้ยืนยันอีกที"
)
RICH_MENU_HELP_REPLY = (
    "สวัสดีครับ! 👋 ผม U-Fox ผู้ช่วยจัดการการเงินของคุณครับ\n\n"
    "วันนี้อยากให้ผมช่วยเรื่องอะไรดีครับ?\n\n"
    "💰 บันทึกรายรับ: เพิ่มรายรับง่ายๆเลย\n"
    "💸 บันทึกรายจ่าย: จดรายจ่ายได้ทันที\n"
    "📊 สรุปภาพรวม: ดูรายรับ-รายจ่ายรายเดือน\n"
    "📦 จัดการสินค้า: เช็ครายการสินค้าและสต็อก\n"
    "🌍 ดูตลาดคู่แข่ง: ส่งสินค้า/เทรนด์ต่างประเทศ\n"
    "👑 อัปเกรดแพ็กเกจ: ฟีเจอร์เพิ่มเติมเพื่อธุรกิจของคุณ\n\n"
    "พิมพ์ ส่งรูปสลิป หรืออัดเสียงมาได้เลยครับ!"
)


def vat_warning_message(ratio_percent: str) -> str:
    return (
        f"⚠️ รายได้สะสมปีนี้ถึง {ratio_percent} ของเกณฑ์จดทะเบียน VAT (1.8 ล้านบาท/ปี) แล้วนะครับ "
        "ลองดูรายละเอียดเพิ่มเติมที่หน้า Dashboard ได้ครับ"
    )


def tax_status_reply(annual_income: Decimal, ratio_percent: str, required: bool) -> str:
    status = "ถึงเกณฑ์ต้องจดทะเบียน VAT แล้วครับ" if required else "ยังไม่ถึงเกณฑ์ VAT ครับ"
    return f"รายได้สะสมปีนี้ {format_thb(annual_income)} ({ratio_percent} ของเกณฑ์ 1.8 ล้านบาท) {status}"


def daily_summary_reply(income_total: Decimal, expense_total: Decimal) -> str:
    net = income_total - expense_total
    return (
        "สรุปวันนี้ค่ะ\n"
        f"รายรับ: {format_thb(income_total)}\n"
        f"รายจ่าย: {format_thb(expense_total)}\n"
        f"กำไรสุทธิ: {format_thb(net)}"
    )


def stock_remaining_line(product_name: str, stock_qty: Decimal, unit: str) -> str:
    qty = f"{stock_qty.normalize():f}"
    if stock_qty <= 0:
        return f"📦 {product_name} หมดสต็อกแล้วค่ะ (คงเหลือ {qty} {unit})"
    return f"📦 {product_name} คงเหลือ {qty} {unit}"
