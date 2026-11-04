# U-Ledger AI

MVP สำหรับ U-Hackathon 2026 — Market Intelligence Platform สำหรับ SME
ใช้บัญชี Zero-UI ผ่าน LINE เป็นตัวดึงผู้ใช้เข้าระบบ แล้วต่อยอดเป็น Web Dashboard (Next.js + LIFF) แบบ 2 Tabs

> สถานะปัจจุบัน:
> - **Tab 1 — My Business เสร็จแล้ว** (MINT)
>   - LINE: บันทึกรายรับ-รายจ่ายจาก **ข้อความ / รูปสลิป-ใบเสร็จ / ข้อความเสียง** (Gemini ผ่าน KKU IntelSphere) → การ์ดยืนยัน →
>     **ตัดสต็อกอัตโนมัติ** เมื่อยืนยันการขาย และเพิ่มสต็อกพร้อมบันทึกต้นทุนเมื่อยืนยันการซื้อ
>   - Dashboard: Tax Meter (เขียว/เหลือง/แดง), รายรับ-รายจ่าย-กำไรสุทธิ, สินค้าขายดี 3 อันดับ, สต็อก
> - **Tab 2 — Market Radar + U-Bot + B2B เสร็จแล้ว** (natchanon, mock-data backed — ดู `backend/README.md`)
>   - ราคาคู่แข่งข้ามแพลตฟอร์ม, เทรนด์ Omni-channel, Keyword volume, EU arbitrage, B2B Sponsored Placements
>   - U-Bot ต่อ Gemini จริงผ่าน KKU IntelSphere + ตอบด้วยเสียงผ่าน ElevenLabs, ความรู้ธุรกิจประจำวัน
> - Premium/Subscription — mock data พร้อมแล้ว (EARTH), ยังไม่มี billing logic จริง
> - Frontend ตัวจริง — อยู่ระหว่างรวมงาน (ดู branch `MINT`, `NIGHT`)

## โครงสร้างโปรเจกต์

```
u-ledger-ai/
├── backend/             # FastAPI + PostgreSQL + LINE Bot (Python 3.12)
│   ├── app/
│   │   ├── core/          # settings, db session, errors
│   │   ├── models/        # SQLAlchemy models
│   │   ├── schemas/       # Pydantic request/response
│   │   ├── routers/       # API endpoints: LINE webhook, auth, dashboard (DB),
│   │   │                  # market_radar, ubot, b2b, voice, knowledge, insights (mock-data)
│   │   ├── services/      # business logic (Gemini, LINE, สต็อก, auth)
│   │   ├── analytics/     # สรุปภาพรวมสำหรับ dashboard
│   │   ├── line_messages/ # Flex message templates
│   │   ├── prompts/       # system prompts ของ Gemini
│   │   ├── locales/       # ข้อความภาษาไทย
│   │   ├── tax_engine/    # pure functions, config-driven ผ่าน config/tax_rules.yaml
│   │   ├── config.py      # ตั้งค่า U-Bot/ElevenLabs (KKU IntelSphere) แยกจาก core/settings.py
│   │   └── main.py
│   ├── alembic/           # migrations
│   ├── config/tax_rules.yaml
│   ├── scripts/           # seed_demo.py, export_openapi.py
│   ├── tests/
│   └── .env.example
├── frontend/            # Next.js + LIFF dashboard (ดู frontend/README.md)
│   ├── src/
│   │   ├── app/           # หน้าเว็บ (App Router)
│   │   ├── components/    # UI components
│   │   └── hooks/ lib/ locales/ types/
│   └── .env.example
├── mock-data/           # ข้อมูลจำลองสำหรับ Market Radar/B2B/ความรู้ธุรกิจ (ดู mock-data/README.md)
└── docker-compose.yml   # PostgreSQL
```

## Backend

1. สตาร์ท PostgreSQL (ที่ root ของโปรเจกต์):
   ```bash
   docker compose up -d
   ```
   **Port 5432 ชนกับอย่างอื่นในเครื่อง** (container โปรเจกต์อื่น หรือ PostgreSQL ที่ลงไว้แต่เดิม)? สร้าง
   `docker-compose.override.yml` (ไม่ต้อง commit เข้า repo — อยู่ใน `.gitignore` แล้ว) แมปไปพอร์ตอื่นแทน:
   ```yaml
   services:
     postgres:
       ports: !override
         - "5433:5432"
   ```
   ต้องใช้ `!override` ไม่ใช่เขียน `ports:` เฉยๆ เพราะ Docker Compose จะ **รวม** list ports จากทั้งสองไฟล์
   (เปิดทั้งพอร์ตเดิมและพอร์ตใหม่พร้อมกัน) ไม่ใช่แทนที่ — แล้วแก้ `DATABASE_URL` ใน `backend/.env` ให้ตรงพอร์ตที่ใช้จริง

   **ไม่มี Docker?** ลง PostgreSQL ผ่าน Homebrew แทนได้:
   ```bash
   brew install postgresql@16
   brew services start postgresql@16
   ```
   ถ้าเครื่องมี PostgreSQL ตัวอื่นครองพอร์ต 5432 อยู่แล้ว (เช่น EDB installer / Postgres.app) — เช็คด้วย
   `lsof -nP -iTCP:5432 -sTCP:LISTEN` — ให้เปลี่ยน Homebrew instance ไปพอร์ตอื่นแทนที่จะไปยุ่งกับตัวเดิม:
   ```bash
   echo "port = 5433" >> /opt/homebrew/var/postgresql@16/postgresql.conf
   brew services restart postgresql@16
   ```
   แล้วสร้าง role/database (ปรับพอร์ตในคำสั่งถ้าใช้ 5433):
   ```bash
   psql -d postgres -c "CREATE ROLE uledger WITH LOGIN PASSWORD 'uledger' SUPERUSER;"
   psql -d postgres -c "CREATE DATABASE uledger OWNER uledger;"
   ```
   อย่าลืมแก้ `DATABASE_URL` ใน `backend/.env` ให้ตรงพอร์ตที่ใช้จริง
2. เข้าโฟลเดอร์ backend แล้วคัดลอกไฟล์ environment:
   ```bash
   cd backend
   cp .env.example .env
   ```
   ใส่ `KKU_API_KEY` (KKU IntelSphere — ใช้ทั้ง LINE bot แยกรายการ/สลิป/เสียง และ U-Bot/Market Radar), `LINE_CHANNEL_SECRET` / `LINE_CHANNEL_ACCESS_TOKEN` (LINE bot) และ `ELEVENLABS_API_KEY` ตามที่ต้องการใช้งาน — รายละเอียด endpoint ของฝั่ง Market Radar/U-Bot/B2B ดูที่ [backend/README.md](backend/README.md)
3. ติดตั้ง dependencies (ใช้ Python 3.12):
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # Windows: .venv\Scripts\activate
   pip install -e ".[dev]"
   ```
4. รัน migration:
   ```bash
   alembic upgrade head
   ```
5. สร้างข้อมูลตัวอย่าง (ร้านของฝากสาธิต + สินค้า/สต็อก + รายการตั้งแต่ต้นปี ให้ Tax Meter อยู่โซนเหลือง):
   ```bash
   python scripts/seed_demo.py          # เพิ่ม --reset เพื่อลบร้านสาธิตเดิมแล้วสร้างใหม่
   ```
6. รันเทส `tax_engine`:
   ```bash
   pytest -q
   ```
7. รัน API (health check ที่ `/health`, เอกสาร API ที่ `/docs`):
   ```bash
   uvicorn app.main:app --reload
   ```
   ถ้าไม่ได้ตั้ง `LIFF_ID` endpoint ของ dashboard จะคืนข้อมูลร้านสาธิตโดยไม่ต้อง login (สำหรับ dev/เดโม)
   — **ก่อนใช้งานจริงต้องตั้ง `LIFF_ID` และ `JWT_SECRET` ที่ยาวอย่างน้อย 32 ตัวอักษร**

   Market Radar/U-Bot/B2B/เสียง/ความรู้ธุรกิจประจำวัน **ไม่ต้องมี PostgreSQL/migration** — อ่านจาก `mock-data/*.json` ตรงๆ ใช้ได้ทันทีแค่ตั้ง `KKU_API_KEY`/`ELEVENLABS_API_KEY`

## Frontend

```bash
cd frontend
cp .env.example .env.local
pnpm install
pnpm dev        # http://localhost:3000
```

รายละเอียดเพิ่มเติม: [frontend/README.md](frontend/README.md)

## หมายเหตุ

- ตัวเลขภาษีทั้งหมดอยู่ใน `backend/config/tax_rules.yaml` — ห้าม hardcode logic ภาษีในโค้ด
- `tax_engine/` เป็น pure functions ล้วน ไม่ติดต่อฐานข้อมูลหรือ side effects
- รูปสลิป/ไฟล์เสียงจาก LINE เก็บไว้ที่ `backend/uploads/` (อยู่ใน .gitignore)
- Market Radar/U-Bot/B2B/เสียง/ความรู้ธุรกิจประจำวัน ใช้ mock data ใน `mock-data/` — แก้ schema ที่นั่นแล้ว API ได้ตามทันที ไม่ต้อง sync ซ้ำ

## Branches

แต่ละคนทำงานบน branch ของตัวเอง ตั้งชื่อตามคน แล้ว merge เข้า `main` ผ่าน PR
