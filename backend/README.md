# U-Ledger AI Backend (FastAPI)

## Setup

ดูขั้นตอนเต็ม (PostgreSQL, migration, seed) ที่ [README หลัก](../README.md#backend)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -e ".[dev]"
cp .env.example .env
```

แก้ `.env` ใส่:
- `KKU_API_KEY` (ขอได้จาก KKU IntelSphere — gen.ai.kku.ac.th/chat) — ใช้กับ LINE bot (แยกรายการจากข้อความ/สลิป/เสียง) และ U-Bot / voice / knowledge
- `ELEVENLABS_API_KEY` (สมัครฟรีได้ที่ elevenlabs.io มี free tier) — ถ้าไม่ใส่ endpoint เสียงจะตอบ 503 แต่ endpoint อื่นใช้ได้ปกติ

ไฟล์ `.env` ไม่ถูก commit เข้า git

## Run

```bash
uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

## Endpoints

### My Business
- `GET /api/products` — รายการสินค้า
- `GET /api/products/{product_id}` — สินค้ารายชิ้น
- `GET /api/transactions` — รายรับ/รายจ่าย
- `GET /api/tax-status` — Tax Meter

### Market Radar
- `GET /api/market/platforms` — รายชื่อแพลตฟอร์มทั้งหมด (~60)
- `GET /api/market/competitor-prices` — ราคาคู่แข่งข้ามแพลตฟอร์ม
- `GET /api/market/trend` — ยอดขายรายสัปดาห์ Omni-channel
- `GET /api/market/keyword-volume` — คำค้นหายอดฮิต
- `GET /api/market/eu-arbitrage` — โอกาสตลาดยุโรป

### Insights (U-Bot)
- `GET /api/insights?tab=&product_id=` — insight ตัวอย่างแบบ static (filter ได้)
- `POST /api/ubot/ask` — ถาม U-Bot จริงผ่าน Gemini (KKU IntelSphere) โดยอัตโนมัติประกอบ context จาก mock data ทั้งหมด (ภาษี, ราคาคู่แข่ง, คำค้นหา) ให้ก่อนส่งคำถาม
  ```bash
  curl -X POST http://localhost:8000/api/ubot/ask \
    -H "Content-Type: application/json" \
    -d '{"question":"ตอนนี้ควรปรับราคาน้ำพริกไหม","product_id":"P001"}'
  ```
  ถ้ายังไม่ตั้งค่า `KKU_API_KEY` ใน `.env` จะตอบ 503 กลับมาแทน

### เสียง U-Bot (ElevenLabs)
- `POST /api/voice/speak` — รับข้อความ คืนไฟล์เสียง MP3 ตรงๆ (`{"text": "..."}`)
- `POST /api/voice/ask-and-speak` — ถาม U-Bot แล้วแปลงคำตอบเป็นเสียงในขั้นตอนเดียว คืน JSON `{answer, audio_base64, audio_mime}`

### ความรู้ธุรกิจประจำวัน (Daily Business Briefing)
เนื้อหาให้ความรู้สั้นๆ แบบ "ข่าวธุรกิจ/ความรู้ประจำวัน" พูดโดย U-Bot — สุ่มหัวข้อหมุนเวียนตามวันที่ (deterministic ต่อวัน ทุกคนที่เปิดวันเดียวกันได้หัวข้อเดียวกัน) แล้วให้ Gemini แต่งสคริปต์พูดจากโครงหัวข้อใน `mock-data/daily-knowledge.json`
- `GET /api/knowledge/topics` — ดูหัวข้อทั้งหมด (7 หัวข้อ: ภาษี, การตลาด, แพลตฟอร์ม, ส่งออก, การจัดการร้าน)
- `GET /api/knowledge/daily` — สคริปต์ของวันนี้ (ข้อความอย่างเดียว)
- `GET /api/knowledge/daily/audio` — สคริปต์ของวันนี้ + เสียงพูด (ต้องมี `ELEVENLABS_API_KEY`)
- `GET /api/knowledge/topics/{topic_id}/audio` — เลือกฟังหัวข้อไหนก็ได้ ไม่ต้องรอตามวัน

### B2B Sponsored Placements
- `GET /api/b2b/sponsors` — รายการสินค้า sponsor ทั้งหมด (เช่น Thai Mart) เรียงตามที่มีในไฟล์
- `GET /api/b2b/sponsors/match?product_id=&keyword=` — กรองเฉพาะ listing ที่ตรงกับสินค้า/คีย์เวิร์ดที่กำลังดูอยู่ เรียงตาม `sponsored_rank` — ไม่ใส่ query เลยจะได้ทั้งหมด
- `POST /api/b2b/sponsors/{listing_id}/click` — บันทึกคลิกโฆษณา (เก็บ in-memory ไม่เขียนทับไฟล์ mock data, รีสตาร์ท server แล้วรีเซ็ต)

### Premium / Subscription (mock)
ข้อมูลตัวอย่างสถานะ subscription ครบทุกสถานะ (`free`/`trialing`/`active`/`past_due`/`canceled`/`expired`) ไว้ให้ frontend ทดสอบ UI — **ยังไม่มี payment logic จริง** แค่ query ข้อมูลตัวอย่างจาก `mock-data/subscription.json`
- `GET /api/premium/plans` — แพ็กเกจ Free/Premium (ราคา, features, trial_days)
- `GET /api/premium/status-rules` — คำอธิบายแต่ละสถานะ (ใช้ขึ้น banner/ข้อความใน UI)
- `GET /api/premium/status?user_id=` — สถานะ subscription ของ user คนเดียว — ไม่ใส่ `user_id` จะได้ "ร้านของฉัน" (`current_user`, สถานะ `trialing`)
- `GET /api/premium/users` — รายชื่อ user ตัวอย่างครบทุกสถานะ (6 คน) ไว้สลับทดสอบ
- `GET /api/premium/billing-history?user_id=` — ประวัติการชำระเงิน กรองตาม user ได้

### Onboarding — "เชื่อมต่อร้านค้า" (mock, จำลองการดึงข้อมูลจากแพลตฟอร์มจริง)
Shopee/Lazada/TikTok Shop Open Platform ต้องสมัคร partner แบบ verified แล้วรออนุมัติเป็นสัปดาห์ ไม่ทันเวลาแฮกกาธอน
ส่วนนี้เลยจำลองขั้นตอน "เชื่อมต่อร้านค้า" ตอน onboarding แบบ end-to-end จริง (ยิง request จริง, delay สมจริง ~1.5-2.2s)
ให้ดูเหมือนดึงโปรไฟล์ร้าน+สินค้ามาจากแพลตฟอร์มจริง โดยใช้ข้อมูลจาก `mock-data/platform-connect.json`
- `GET /api/onboarding/platforms` — แพลตฟอร์มที่เชื่อมต่อได้ (Shopee/Lazada/TikTok Shop)
- `POST /api/onboarding/connect` — `{"platform_id": "shopee_th"}` → รอ ~1.5-2.2 วินาที (จำลอง sync) → คืนโปรไฟล์ร้าน + สินค้าตัวอย่าง

ข้อมูลทั้งหมดอ่านจากไฟล์ใน `../mock-data/` โดยตรง — แก้ schema ที่ไฟล์ mock data แล้ว API จะได้ตามนั้นทันที ไม่ต้อง sync ซ้ำ
