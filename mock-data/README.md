# Mock Data Schema

Mock data สำหรับ demo U-Ledger AI แบ่งตาม 2 Tab หลักของแดชบอร์ด ทุกไฟล์ผูกกันด้วย `product_id`

## ทุก Tab (เพิ่มเติม)

- `platforms.json` — รายชื่อแพลตฟอร์มอีคอมเมิร์ซ ~60 แพลตฟอร์ม ครอบคลุมไทย/SEA/Global/Europe/เอเชียตะวันออกเฉียงเหนือ/ตะวันออกกลาง-แอฟริกา-อินเดีย ใช้เป็น master list สำหรับ dropdown filter หรือ badge แสดงความครอบคลุมของระบบ (`platform_id` ใช้ผูกกับ `competitor-prices.json`/`market-trend.json`)

## Tab 1: My Business

- `products.json` — แคตตาล็อกสินค้า (ต้นทุน, ราคาขาย, สต็อก)
- `transactions.json` — รายรับ/รายจ่าย ที่มาจาก LINE OCR สลิป, เสียง, หรือกรอกมือ (`source`: `line_slip_ocr` | `line_voice` | `manual`)
- `tax-status.json` — สถานะ Tax Meter เทียบเพดาน VAT 1.8 ล้านบาท (`risk_level`: `green` | `yellow` | `red`)

## Tab 2: Market Radar

- `competitor-prices.json` — ราคาคู่แข่งต่อสินค้า 1 ชิ้น ข้ามแพลตฟอร์ม พร้อม `my_cost_price`/`my_selling_price` ไว้ปักหมุดเทียบ และ `price_distribution_thb` สำหรับกราฟ distribution
- `market-trend.json` — ยอดขายรายสัปดาห์แยกตามแพลตฟอร์ม (Omni-Channel trend)
- `keyword-volume.json` — ปริมาณการค้นหาคำยอดฮิตต่อแพลตฟอร์ม
- `eu-arbitrage.json` — โอกาสตลาดยุโรป (ราคาขายแนะนำ + demand score)
- `trend-catalog.json` — หน้าเทรนด์ตลาด/หน้าสินค้า (`GET /api/market/trend-catalog`): 20 หมวด × 4 สินค้า × 5 แพลตฟอร์ม พร้อม `search_growth_pct`, `search_index` (8 สัปดาห์ + คาดการณ์ 2), ราคา/จำนวนร้านต่อแพลตฟอร์ม, `offers` (ค่าส่ง โค้ดส่วนลด เรตติ้ง ยอดขาย ระยะส่ง) และ `price_history` 8 สัปดาห์ — **ไฟล์สร้างจากสคริปต์** `scripts/generate_trend_catalog.js` (ย้าย sample generator จาก branch NIGHT มา) อย่าแก้มือ ให้แก้สคริปต์แล้วรันใหม่

## ทุก Tab

- `insights.json` — ข้อความสรุปจาก U-Bot ต่อ insight หนึ่งเรื่อง ผูกกับ `tab` (`my_business` | `market_radar`) และ `related_product_id` — ทีม AI generate ข้อความใหม่แทนที่ array นี้ได้โดยไม่ต้องเปลี่ยน field
- `b2b-sponsors.json` — สินค้า sponsor จากพาร์ทเนอร์ค้าส่ง B2B (เช่น Thai Mart) ที่จะโชว์แทรกในหน้า Market Radar เมื่อ `target_product_ids`/`target_keywords` ตรงกับสินค้า/เทรนด์ที่ผู้ใช้กำลังดู เรียงการแสดงผลตาม `sponsored_rank` (เลขน้อยแสดงก่อน)
- `daily-knowledge.json` — หัวข้อความรู้ธุรกิจสำหรับฟีเจอร์ "ข่าวธุรกิจ/อบรมฟรีประจำวัน" แต่ละหัวข้อมี `outline` (ประเด็นคร่าวๆ) ให้ Gemini แต่งเป็นสคริปต์พูดแล้วแปลงเป็นเสียงด้วย ElevenLabs ผ่าน `/api/knowledge/*`

## Premium (mock)

- `subscription.json` — แพ็กเกจ Free/Premium (199 บาท/เดือน, trial 7 วัน), กฎแต่ละสถานะ (`status`: `free` | `trialing` | `active` | `past_due` | `canceled` | `expired`), ตาราง `transitions`, ผู้ใช้หลัก `current_user` และ `demo_users` ครบทุกสถานะไว้สลับโชว์ — frontend ใช้ `is_premium` ตัดสินว่าจะล็อก Tab 2 หรือไม่ และแสดง `banner` ตามสถานะ

- `platform-connect.json` — โปรไฟล์ร้าน + สินค้าตัวอย่างที่ "ดึงมา" ตอน onboarding เชื่อมต่อร้านค้า (ดูที่ `/api/onboarding/connect`) key เป็น `platform_id` เดียวกับใน `platforms.json`

## โลโก้แพลตฟอร์ม (`frontend/public/logos/`)

- 24/60 แพลตฟอร์มมีโลโก้จริง (map อยู่ใน `frontend/src/lib/market/platformLogo.ts` ตัวแปร `LOGOS`) — 5 ไฟล์แรก (shopee/lazada/amazon/ebay/thaimart) เป็น asset ที่มีอยู่แล้วจากทีม frontend ส่วนที่เหลือเป็น **Simple Icons** (simpleicons.org, สัญญาอนุญาต CC0) ซึ่งเป็นคลัง brand mark ฟรีที่เปิดให้ใช้ได้ ไม่ใช่โลโก้ทางการที่ดาวน์โหลดจากเว็บแต่ละแพลตฟอร์มโดยตรง
- แพลตฟอร์มที่เหลือ (~36 ตัว เช่น Kaidee, ShopSpot, Page365, Tiki, Zalora, Gmarket, Noon, Jumia ฯลฯ) **ไม่มีอยู่ใน Simple Icons library** ด้านหน้าเว็บจะ fallback ไปโชว์ตัวอักษรย่อแทน (letter badge) ซึ่งเป็นพฤติกรรมเดิมของ `platformLogo()` อยู่แล้ว
- ถ้าจะเพิ่มโลโก้จริงให้แพลตฟอร์มที่เหลือ ต้องขอ/ใช้ brand asset อย่างถูกต้องจากแต่ละเจ้าของแบรนด์เอง (มีข้อจำกัดเรื่องลิขสิทธิ์ ไม่ควรดึงจากเว็บแบบสุ่ม)

## กติกาการแก้ไข

- ถ้าจะเพิ่ม field ใหม่ แจ้งในกลุ่มก่อน กัน frontend/backend/AI ใช้ field คนละชื่อ
- `product_id` ต้องตรงกันทุกไฟล์ (P001, P002, P003 ตาม `products.json`)
