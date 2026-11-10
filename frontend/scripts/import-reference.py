"""
Import the team's investment reference workbook into src/lib/reference-data.json.

    python scripts/import-reference.py <workbook.xlsx>

Reads the 10 group sheets ("1 ตลาดเงิน" ... "11 ต่างประเทศ"), one row per topic, columns A–U:
A id · B title · C what · D facts (" | ") · E as of · F risk · G check steps · H source names ·
I main link · J support links · K tier · L status · M note · N audit result · O "นำตัวเลขขึ้นเว็บ"
(may figures go on the site) · P extra official source checked · Q law · R evidence limit ·
S checked on · T evidence id · U follow-up.

Column O decides `showFigures`: only rows starting with "ได้" may show numbers. The others keep their
description, risk, check steps and sources, but no headline figure and no numbered facts (the site
and the chat leave those out). The headline figure of a topic is picked by hand (HEADLINES below)
from that row's own facts; reference.test.ts checks it is really there.
"""

import json
import re
import sys
from pathlib import Path

import openpyxl

OUT = Path(__file__).resolve().parent.parent / "src" / "lib" / "reference-data.json"

STATUS = {
    "ยืนยันจากแหล่งทางการ": "official",
    "ตรวจยืนยันเฉพาะข้อเท็จจริงที่ระบุจากต้นทาง": "source-checked",
    "ตรวจเอกสารทางการสำหรับนิยาม/ข้อกำหนด; ตัวเลขรายผลิตภัณฑ์ต้องตรวจแยก": "definition",
    "ยืนยันจากสื่อ/ผู้ให้บริการ (ยังไม่เทียบต้นทาง)": "media",
    "ยืนยันบางส่วน (ขาดตัวเลขสำคัญ)": "partial",
    "ข้อมูลเก่า/ขัดแย้ง ต้องเช็กซ้ำ": "stale",
    "ยังไม่ได้ตรวจสอบ": "unchecked",
}

# tier of a source row in the "แหล่งอ้างอิง" sheet, or of the row itself (column K)
TIER_OFFICIAL = ("ทางการ", "หน่วยงานกำกับ")
TIER_PROVIDER = ("ธนาคาร", "โบรกเกอร์", "ผู้ให้บริการ", "ผู้ออก")


def tier_of(text: str) -> str:
    t = text or ""
    if t.startswith(TIER_OFFICIAL):
        return "ทางการ"
    if any(k in t.split("/")[0] for k in TIER_PROVIDER):
        return "ธนาคาร/โบรกเกอร์/ผู้ให้บริการ"
    if "ในแอป" in t or "funds20" in t:
        return "ข้อมูลในแอป"
    if "ทางการ" in t:
        return "ทางการ"
    return "สื่อข่าว/เว็บข้อมูล"


# one figure per topic whose numbers may be shown; the value must appear in the topic's facts
HEADLINES = {
    "2.9": ("270 วัน", "อายุสูงสุดของหุ้นกู้ระยะสั้น (ก.ล.ต.)"),
    "5.1": ("0.03%", "Expense Ratio ของ IVV (ตัวอย่างกองเดียว)"),
    "5.3": ("0.40%", "TER ของ GLD"),
    "7.1": ("65,050", "บาท ทองแท่งขายออก (10 พ.ย. 69 10:51 น.)"),
    "7.2": ("65,850", "บาท ทองรูปพรรณขายออก (10 พ.ย. 69 10:51 น.)"),
    "7.5": ("5,000", "troy ounces ต่อสัญญา Silver Futures (CME)"),
    "7.6": ("50", "troy ounces ต่อสัญญา Platinum Futures (CME)"),
    "7.7": ("100", "troy ounces ต่อสัญญา Palladium Futures (CME)"),
    "8.1": ("200 บาท/จุด", "ตัวคูณ SET50 Futures"),
    "8.2": ("1,000 หุ้น", "ขนาดสัญญา Single Stock Futures"),
    "8.3": ("50 บาททองคำ", "ขนาดสัญญา GF (GF10 = 10 บาททองคำ)"),
    "9.8": ("16 ต.ค. 2569", "เกณฑ์ Crypto ETF ของ ก.ล.ต. มีผล"),
    "10.1": ("33.5270", "บาทต่อ USD อัตราอ้างอิง ธปท. (9 พ.ย. 69)"),
    "10.3": ("37.4068", "บาทต่อ EUR อัตรากลาง ธปท. (9 พ.ย. 69)"),
    "10.4": ("44.9000", "บาทต่อ GBP อัตรากลาง ธปท. (9 พ.ย. 69)"),
    "10.5": ("21.2214", "บาทต่อ 100 JPY อัตรากลาง ธปท. (9 พ.ย. 69)"),
    "10.6": ("5.0310", "บาทต่อ CNY อัตรากลาง ธปท. (9 พ.ย. 69)"),
    "10.8": ("1,000 USD", "ขนาดสัญญา USD Futures (TFEX)"),
    "11.2": ("0.03%", "Expense Ratio ของ IVV (ตัวอย่างกองเดียว)"),
    "11.7": ("19:00–03:00 น.", "รอบกลางคืนของ DR หุ้นสหรัฐ/ยุโรป"),
    "11.8": ("6 พ.ค. 2568", "DRx ย้ายไปซื้อขายรวมกับ DR"),
}

# rows in the workbook that are not a real topic (no asset named): left out of the site
SKIP = {"11.12"}


# The workbook speaks to the team ("ในไฟล์ของคุณ", sheets, columns); the site speaks to visitors.
CLEAN = [
    (r"ดูแถว (\d+\.\d+) ในชีต \d+", r"ดูหัวข้อ \1"),
    (r"จากชีต (\d+\.\d+)", r"จากหัวข้อ \1"),
    (r"ดูชีต (\d+)", r"ดูหมวด \1"),
    (r"\s*\(รายละเอียด[^)]*ชีต funds20\)", ""),
    (r"; เก็บข้อมูลเดิมในชีตผลตรวจ", ""),
    (r"\s*\(นับจากคอลัมน์[^)]*\)", ""),
    (r"กองในไฟล์ funds20", "กองในแอป"),
    (r"ในไฟล์:", "ในแอป:"),
    (r"(กอง[^ ]*)?ในไฟล์ของคุณ", lambda m: (m.group(1) or "กอง") + "ในแอป FinLens"),
    (r"\(funds20\)", "(ข้อมูลกองในแอป)"),
    (r"\(ตามไฟล์ funds20\)", "(ตามข้อมูลกองในแอป)"),
    (r"ตามไฟล์ funds20", "ตามข้อมูลกองในแอป"),
    (r"ในไฟล์ funds20", "ในแอป"),
    (r"ข้อมูลจากไฟล์ผู้ใช้", "ข้อมูลกองในแอป"),
    (r"ให้ผู้ใช้", "ให้ผู้ลงทุน"),
    (r"ของผู้ใช้", "ของผู้ลงทุน"),
]
# check steps / notes that only make sense inside the workbook are dropped
TEAM_ONLY = re.compile(r"ชีต|แผ่น|คอลัมน์|ของฉัน|ผู้ใช้|funds20|/mnt/|_doc\b|_page\b|^เติม|^ใส่เลขหน้า")
IN_APP = {"name": "ข้อมูลกองทุนในแอป FinLens (ดูทีละกอง)", "url": None, "tier": "ข้อมูลในแอป"}


def clean(v: str) -> str:
    for pat, rep in CLEAN:
        v = re.sub(pat, rep, v)
    return v


def text(v) -> str:
    return "" if v is None else clean(str(v).strip())


def lines(v) -> list[str]:
    return [x.strip() for x in text(v).splitlines() if x.strip()]


def steps(v) -> list[str]:
    t = text(v)
    parts = [p.strip() for p in re.split(r"\s*\d+\)\s*", t) if p.strip()]
    if len(parts) <= 1 and " > " in t:
        parts = [p.strip() for p in t.split(" > ") if p.strip()]
    parts = [p for p in parts if not TEAM_ONLY.search(p)]
    return parts or ["เปิดหน้า ดูทีละกอง ในแอป แล้วเทียบตัวเลขกับ Factsheet ของกองนั้น"]


def sources_of(row, source_sheet: dict) -> list[dict]:
    names = lines(row[7])
    urls = [u for u in lines(row[8]) + lines(row[9]) if u.startswith("http")]
    out = []
    for i, n in enumerate(names):
        m = re.match(r"\[(\w+)\]\s*(.*)", n)
        key, name = (m.group(1), m.group(2)) if m else (f"s{i + 1}", n)
        ref = source_sheet.get(key)
        if key == "funds" or "funds20" in name:
            out.append({"key": "funds", **IN_APP})
            continue
        url = ref["url"] if ref and (ref["url"] or "").startswith("http") else (urls[i] if i < len(urls) else None)
        tier = tier_of(ref["tier"]) if ref else tier_of(text(row[10]))
        # a line naming two sources ("A | ทางการ: B"): keep its first name
        out.append({"key": key, "name": name.split(" | ")[0].strip(), "url": url, "tier": tier})
    # the source the audit checked the row against counts as the official one
    extra = text(row[15])
    for s in out:
        if extra and s["url"] == extra:
            s["tier"] = "ทางการ"
    seen = {s["url"] for s in out}
    for u in urls[len(names):]:
        if u not in seen:
            out.append({"key": f"s{len(out) + 1}", "name": re.sub(r"^https?://(www\.)?", "", u).split("/")[0], "url": u, "tier": tier_of(text(row[10]))})
            seen.add(u)
    if extra.startswith("http") and extra not in seen:
        out.append({"key": "checked", "name": "ต้นทางที่ตรวจเพิ่ม (10 พ.ย. 2569)", "url": extra, "tier": "ทางการ"})
    return out


# A field that only points at another topic ("ดูหัวข้อ 7.1", "ดู 8.6", "เช่นเดียวกับ 5.9", "ดูหมวด 2"):
# the site shows that topic's own content instead of a pointer.
POINTER = re.compile(r"^(?:ดู(?:หัวข้อ|หมวด)?|เช่นเดียวกับ|เหมือน(?:กับ)?|อ้างอิงซ้ำกับ)\s*(\d+(?:\.\d+)?)$")


def resolve_pointers(categories: list[dict]) -> None:
    by_id = {i["id"]: i for c in categories for i in c["items"]}
    # the topics each row points at, read before any field is filled in
    points_at = {
        i["id"]: [m.group(1) for v in [i["what"], i["risk"], *i["check"], *i["facts"]] if (m := POINTER.match(v)) and "." in m.group(1)]
        for i in by_id.values()
    }

    def target(it: dict, ref: str) -> dict | None:
        if "." in ref:
            return by_id.get(ref)
        # "ดูหมวด 2": the topic of that group this row points at elsewhere
        return next((by_id[r] for r in points_at[it["id"]] if r.startswith(ref + ".") and r in by_id), None)

    for _ in range(3):  # a pointer to a topic that points on (5.10 -> 5.9) settles in a few rounds
        for it in by_id.values():
            for key in ("what", "risk"):
                m = POINTER.match(it[key])
                t = m and target(it, m.group(1))
                if t and not POINTER.match(t[key]):
                    it[key] = t[key]
            for key in ("check", "facts"):
                out = []
                for v in it[key]:
                    m = POINTER.match(v)
                    t = m and target(it, m.group(1))
                    if t and not any(POINTER.match(x) for x in t[key]):
                        out.extend(x for x in t[key] if x not in out)
                    else:
                        out.append(v)
                it[key] = out
            if POINTER.match(it["note"]):
                it["note"] = ""


def main(path: str) -> None:
    wb = openpyxl.load_workbook(path, read_only=True, data_only=True)
    old = json.loads(OUT.read_text(encoding="utf-8"))
    titles = {c["num"]: (c["id"], c["title"]) for c in old["categories"]}

    source_sheet = {}
    for r in wb["แหล่งอ้างอิง"].iter_rows(min_row=2, values_only=True):
        if r and r[0]:
            source_sheet[text(r[0])] = {"name": text(r[1]), "url": text(r[2]) or None, "tier": text(r[3])}

    categories = []
    for ws in wb.worksheets:
        m = re.match(r"^(\d+) ", ws.title)
        if not m or int(m.group(1)) not in titles:
            continue
        num = int(m.group(1))
        items = []
        for row in ws.iter_rows(min_row=2, values_only=True):
            if not row or row[0] is None:
                continue
            rid = text(row[0])
            if rid in SKIP:
                continue
            status = STATUS[text(row[11])]
            gate = text(row[14])
            show = gate.startswith("ได้")
            facts = [f.strip() for f in text(row[3]).split(" | ") if f.strip()]
            head = HEADLINES.get(rid) if show else None
            items.append(
                {
                    "id": rid,
                    "headline": {"value": head[0], "label": head[1]} if head else None,
                    "title": text(row[1]),
                    "what": text(row[2]),
                    "facts": facts,
                    "asOf": text(row[4]),
                    "risk": text(row[5]),
                    "check": steps(row[6]),
                    "sources": sources_of(row, source_sheet),
                    "status": status,
                    "note": "" if TEAM_ONLY.search(text(row[12])) or text(row[12]).startswith("ไม่พบข้อขัดแย้ง") else text(row[12]),
                    "showFigures": show,
                    "figuresRule": gate,
                    "law": text(row[16]),
                    "checkedOn": text(row[18]),
                }
            )
        cid, title = titles[num]
        categories.append({"id": cid, "num": num, "title": title, "items": items})

    resolve_pointers(categories)
    out = {"round": 2, "accessed": "2026-11-10", "categories": categories}
    OUT.write_text(json.dumps(out, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    n = sum(len(c["items"]) for c in categories)
    shown = sum(1 for c in categories for i in c["items"] if i["showFigures"])
    print(f"{len(categories)} groups, {n} topics, figures shown for {shown}")


if __name__ == "__main__":
    main(sys.argv[1])
