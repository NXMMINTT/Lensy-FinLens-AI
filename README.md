# U-Ledger AI — Web (frontend)

Next.js (App Router) + TypeScript + Tailwind CSS + Recharts แบ่งเป็น 2 Tabs ตาม spec:
**My Business** (ใช้ข้อมูลจริงจาก API แล้ว) และ **Market Radar** (ยังเป็น placeholder)

## เริ่มต้นใช้งาน

```bash
cp .env.example .env.local
pnpm install
pnpm dev
```

เปิด http://localhost:3000 — ถ้าไม่ได้ตั้ง `NEXT_PUBLIC_LIFF_ID` (และฝั่ง API ไม่ได้ตั้ง `LIFF_ID`)
หน้าเว็บจะแสดงข้อมูลร้านสาธิตจาก `scripts/seed_demo.py` โดยไม่ต้อง login
ถ้าตั้ง LIFF แล้ว เว็บจะ login ผ่าน LINE แล้วแลก ID token เป็น JWT ที่ `POST /api/v1/auth/line`

## หน้าที่มี

ดีไซน์โทนขาวฟ้า มี U-Bot เป็นมาสคอต (`src/components/brand/`) — สีอยู่ใน `tailwind.config.ts`, ฟอนต์ Noto Sans Thai

- `/` — หน้าแรก (`src/app/(site)/`) โครงแบบ parnuan.com: แชท LINE + Rich Menu, ขั้นตอน 1/3–3/3, ราคา, FAQ
  ปุ่ม "เพิ่มเพื่อน" ใช้ `NEXT_PUBLIC_LINE_ADD_FRIEND_URL`
- `/dashboard` — **ร้านของฉัน** (ข้อมูลจริงจาก DB): U-Bot ทักทาย + มิเตอร์ภาษี VAT, รายรับ/รายจ่าย/กำไรเดือนนี้,
  สินค้าขายดี 3 อันดับ, รายการรอยืนยันจาก LINE
- `/market` — **Market Radar** (mock data จาก `mock-data/` ผ่าน backend) ล็อกถ้าไม่ใช่ Premium (`market/layout.tsx`):
  - `/market` ภาพรวม: ราคาแนะนำจาก U-Bot (Gemini), กราฟราคาคู่แข่งปักหมุดต้นทุน/ราคาเรา, ขายที่ไหนดี, คำค้นยอดฮิต, ตลาดยุโรป, B2B Sponsored
  - `/market/trends`, `/market/products/[id]` — เทรนด์ตลาด หมวดหมู่ และหน้าสินค้าเทียบราคาทุกแพลตฟอร์ม (มาจาก branch NIGHT)
  - `/market/compare` — เทียบราคาคู่แข่ง + คำนวณกำไรต่อชิ้น · `/market/chat` — ถาม U-Bot พร้อมฟังเสียง (ElevenLabs)
  - `/market/platforms` — เลือกแพลตฟอร์มที่สนใจ · `/market/plans` — แพ็กเกจ Free/Premium
- `/transactions` — รายการบันทึกล่าสุด; รายการที่รอยืนยันกด แก้ไข / ยกเลิก / ยืนยัน ได้
  (`?edit=<id>` เปิดฟอร์มแก้ไข — ปุ่ม "แก้ไข" ใน Flex card ลิงก์มาที่นี่เมื่อตั้ง LIFF แล้ว)
- `/stock` — สต็อกสินค้าคงเหลือและต้นทุนต่อหน่วย

มาสคอต **U-Fox** (ทีมออกแบบ) อยู่ที่ `public/mascot/u-fox-<ท่า>.png` — 17 ท่า ตัดจากชีตสติกเกอร์ของทีม
ใช้ผ่าน `<UBot pose="radar" />` ใน `src/components/brand/UBot.tsx` (สี `#0B1F4D · #2563EB · #60A5FA · #E0F2FE` ตามชีตแบรนด์)

`src/app/(site)` (หน้าแรก) กับ `src/app/(ledger)` (แอป) มี root layout แยกกัน
ทุก animation ปิดเองเมื่อเครื่องตั้ง prefers-reduced-motion

## โครงสร้างโฟลเดอร์

หนึ่งไฟล์ = หนึ่ง component / hook / ฟังก์ชัน ชื่อไฟล์ตรงกับชื่อที่ export

| โฟลเดอร์ | มีอะไร |
|---|---|
| `src/components/brand/` | มาสคอตและแบรนด์: `UBot`, `UBotFace`, `UBotLive` (ขยับตา/คลิกคุย), `Logo`, `LineAddFriendButton` |
| `src/components/decor/` | ของตกแต่ง: `Twinkle`, `Paw`, `Curl`, `Note`, `Sticker`, `ReceiptEdge` ฯลฯ |
| `src/components/home/` | ส่วนต่างๆ ของหน้าแรก (`HeroSection`, `LedgerSection`, `TaxSection`, `PricingSection` …) |
| `src/components/home/phone/` | ชิ้นส่วนมือถือจำลอง (`Phone`, `ChatShell`, `UserBubble`, `ConfirmCard` …) |
| `src/components/home/screens/` | หน้าจอในมือถือจำลองแต่ละจอ (`SlipScreen`, `VoiceScreen`, `TaxAlertScreen` …) |
| `src/components/market/` | ชิ้นส่วนของ Market Radar (กราฟ, โลโก้แพลตฟอร์ม, `CategoryThumb`) |
| `src/components/ui/` | ชิ้นพื้นฐาน: `Card`, `Badge`, `Ring` |
| `src/hooks/dashboard/`, `src/hooks/market/` | React Query hook หนึ่งตัวต่อไฟล์ |
| `src/types/` | type ของข้อมูล (`dashboard.ts`, `market.ts`) และ `api.gen.ts` |
| `src/lib/market/` | ฟังก์ชันช่วยของ Market Radar (สกุลเงิน, สี/โลโก้แพลตฟอร์ม, เทรนด์ …) |

## Generate API types จาก backend

```bash
# ใน backend/: สร้าง openapi.json จากสคีมาปัจจุบันของ FastAPI
source .venv/Scripts/activate && python scripts/export_openapi.py

# ใน frontend/: generate TypeScript types
pnpm gen:api
```

ไฟล์ที่ได้คือ `src/types/api.gen.ts` — **ห้ามแก้ไขด้วยมือ** รัน `pnpm gen:api` ใหม่แทน
(`src/types/dashboard.ts` ใช้ type จากไฟล์นี้)

## ที่ยังไม่ได้ทำ (รอ phase ถัดไป)

- ตั้งค่า LIFF จริง (ตอนนี้ dev ใช้ `DASHBOARD_LINE_USER_ID` ใน backend/.env แทนการ login)
- Vitest / Playwright ยังไม่ตั้งค่า
- Dockerfile ฝั่ง frontend ยังไม่มี (ตามแผนอยู่ phase 6)
