# FinLens AI · น้อง Lensy

ผู้ช่วยอ่านเอกสารกองทุนรวม ทั้งใน LINE และบนเว็บ น้อง Lensy (แพนด้าแดงตัวสีเขียว) อ่าน Fund Fact Sheet กับหนังสือชี้ชวนให้ แล้วบอกเป็นภาษาง่าย ๆ ว่า **มีค่าใช้จ่ายอะไร เสียเงินไปกี่บาท และมีความเสี่ยงอะไร** ทุกคำตอบบอกเลขหน้าในเอกสาร

น้อง Lensy มีหน้าที่ 3 อย่าง

1. **เทียบกองทุนเคียงกัน (หัวใจของ FinLens):** เช่น กองที่ลงทุนต่อในกองต่างประเทศกับกองดัชนี ว่าแต่ละกองมีค่าธรรมเนียมที่มองไม่เห็นอะไรบ้าง ซ่อนอยู่หน้าไหนของเอกสาร และถือไว้หลายปีแล้วต่างกันกี่บาท โดยไม่ตัดสินว่ากองไหนดีกว่า
2. **อธิบายทีละกองเป็นภาษาง่าย:** กองนี้มีค่าใช้จ่ายอะไร เสียเงินไปกี่บาท และมีความเสี่ยงอะไร
3. **ตอบคำถามเรื่องการเงิน:** อธิบายศัพท์และแนวคิดการเงินทั่วไป โดยติดป้ายว่าเป็นความรู้ทั่วไป ส่วนตัวเลขของกองตอบจากเอกสารที่ทีมตรวจแล้วเท่านั้น

แผนขยายไปยังการลงทุนประเภทอื่น (เงินฝาก ตราสารหนี้ หุ้น ฯลฯ) ด้วยหลักเดียวกัน ดูได้ที่หน้า [`/roadmap`](https://lensy-fin-lens-ai.vercel.app/roadmap)

> ข้อมูลเพื่อความเข้าใจ ไม่ใช่คำแนะนำการลงทุน

- เว็บ: https://lensy-fin-lens-ai.vercel.app
- LINE: [@961ngpkl](https://line.me/R/ti/p/@961ngpkl) (Lensy | FinLens AI)
- ผลงานส่ง Trinity Hackathon 2026

---

## ฟังก์ชันหลัก

| ฟังก์ชัน | ทำอะไร | ทำงานอย่างไร |
|---|---|---|
| **Hidden Fee Detector** | รวมค่าใช้จ่ายทุกชั้นเป็น "ต้นทุนต่อปีรวม" แยกชั้นเป็นแถบสี และเตือนเมื่อค่าใช้จ่ายกองหลักอยู่ในหนังสือชี้ชวนแต่ไม่อยู่ใน Factsheet | `TER + ค่าใช้จ่ายกองหลัก` (ถ้าเอกสารระบุว่า TER ยังไม่รวม) · `src/lib/funds.ts` |
| **Risk Alert** | เตือนเรื่องค่าเงิน ตลาดต่างประเทศ การกระจุกตัว และเงื่อนไขขายคืน พร้อมป้าย สูง / ปานกลาง / ควรรู้ | **กฎตายตัว ไม่ใช้ AI** · `src/lib/riskRules.ts` |
| **True Cost Calculator** | ค่าธรรมเนียมเป็นเงินบาท เทียบได้ 2–3 กอง ปรับเงิน จำนวนปี (1–30) และผลตอบแทนสมมติได้ | **สูตรในโค้ด ไม่ให้ AI คิดตัวเลข** · `src/lib/trueCost.ts` |
| **AI Explain** | ถามศัพท์และเงื่อนไขในเอกสาร ได้คำตอบพร้อมเลขหน้า | คำถามขอคำแนะนำ → ปฏิเสธด้วยกฎ · คำถามตัวเลขเงิน → `trueCost` · อื่น ๆ → Gemini แล้วตรวจเลขหน้าซ้ำ · `src/lib/askService.ts` |

### กติกา Responsible AI ที่ระบบบังคับใช้
1. ทุกตัวเลขมีเลขหน้าและข้อความอ้างอิง (สคีมาไม่ยอมรับค่าที่ไม่มีเลขหน้า)
2. เอกสารไม่มี → "ไม่พบข้อมูลนี้ในเอกสาร" ไม่เดา
3. ไม่แนะนำซื้อขาย ไม่จัดอันดับ ไม่คาดการณ์ผลตอบแทน
4. เว็บและ LINE อ่านเฉพาะข้อมูลที่ทีมตรวจแล้ว (`data/verified/`)
5. ทุกหน้าและทุกการ์ด LINE มีบรรทัด "ไม่ใช่คำแนะนำการลงทุน"
6. ไม่มีฐานข้อมูลสมาชิก คุกกี้เก็บแค่ LINE userId แบบ hash
7. ข้อมูลตัวอย่างติดป้าย "ข้อมูลตัวอย่าง" ทุกที่

---

## หน้าเว็บ

| หน้า | ล็อกอิน | เนื้อหา |
|---|---|---|
| `/` | ไม่ต้อง | หน้าโปรโมต |
| `/login` | – | เข้าสู่ระบบด้วย LINE (LIFF) |
| `/funds` | ต้อง | รายการกองทุน ค้นหา |
| `/funds/[รหัส]` | ต้อง | Hidden Fee, Risk Alert, การขายคืน, ผลตอบแทนย้อนหลัง |
| `/compare` | ต้อง | เทียบต้นทุนเป็นบาท พร้อมกราฟ |
| `/chat` | ต้อง | ถามน้อง Lensy |

## น้อง Lensy ใน LINE
- พิมพ์ชื่อหรือรหัสกอง → การ์ดสรุปต้นทุนรวม ความเสี่ยงหลัก เลขหน้า และปุ่ม "ดูละเอียด" (เปิดหน้าเว็บใน LINE)
- พิมพ์คำถาม → คำตอบแบบเดียวกับหน้าแชตบนเว็บ
- เมนูล่างแชต 4 ปุ่ม: ค่าใช้จ่าย / ความเสี่ยง / คำนวณ / ถามน้อง Lensy

---

## สถาปัตยกรรม

```
LINE app ──webhook──▶ /api/line/webhook ─┐
                                         ├─▶ askService ─┬─ กฎ: ปฏิเสธคำแนะนำ
เว็บ (Next.js) ───────▶ /api/ask ─────────┘              ├─ trueCost: ตัวเลขเงิน
                                                        └─ Gemini (KKU IntelSphere) + ตรวจเลขหน้า
                 ทุกเส้นทางอ่านข้อมูลจาก data/verified/*.json (ผ่าน Zod schema)

PDF ──npm run extract──▶ data/extracted/ (pending) ──ทีม econ ตรวจ──▶ data/verified/
```

- **Next.js 15** (App Router) + TypeScript + Tailwind CSS + Recharts บน Vercel
- **AI:** Gemini ผ่าน KKU IntelSphere (API แบบ OpenAI)
- **LINE:** Messaging API (`@line/bot-sdk`) + LIFF (`@line/liff`)
- **ข้อมูล:** ไฟล์ JSON ในโปรเจกต์ ไม่มีฐานข้อมูล
- **ทดสอบ:** Vitest

โค้ดทั้งหมดอยู่ใน `frontend/`

```
frontend/
  src/app/(site)/         หน้าเว็บ FinLens
  src/app/api/            ask, auth, line/webhook
  src/lib/                schema, funds, trueCost, riskRules, ask, askService, extraction, line/
  src/components/finlens/ UI ของ FinLens
  data/verified/          ข้อมูลกองที่ตรวจแล้ว (เว็บและ LINE อ่านจากที่นี่)
  data/extracted/         ผลดึงจาก PDF รอตรวจ
  docs/pdfs/<รหัสกอง>/    PDF ต้นฉบับ
  scripts/                extract, line-validate, line-richmenu
```

---

## วิธีรันในเครื่อง

ต้องมี Node.js 20+ (ใช้ pnpm ผ่าน `npx pnpm`)

```bash
cd frontend
npx pnpm@10 install
cp .env.example .env.local   # แล้วใส่ค่า (ดูด้านล่าง)
npm run dev                  # http://localhost:3000
npm test                     # unit tests
npm run build
```

บนเครื่องพัฒนา หน้าล็อกอินมีปุ่ม **"เข้าโหมดทดลอง"** สำหรับเข้าแดชบอร์ดโดยไม่ใช้ LINE (เว็บจริงที่ตั้ง LIFF แล้วจะไม่มีปุ่มนี้)

### ค่าใน `.env.local` (และใน Vercel)
| ชื่อ | ใช้ทำอะไร |
|---|---|
| `KKU_BASE_URL`, `KKU_API_KEY`, `KKU_MODEL` | AI (Gemini ผ่าน KKU IntelSphere) |
| `LINE_CHANNEL_SECRET`, `LINE_CHANNEL_ACCESS_TOKEN` | บอท LINE (Messaging API channel) |
| `NEXT_PUBLIC_LIFF_ID` | ล็อกอินด้วย LINE และเปิดเว็บใน LINE |
| `NEXT_PUBLIC_SITE_URL` | URL ของเว็บ เช่น `https://lensy-fin-lens-ai.vercel.app` |
| `SESSION_SECRET` | เซ็นคุกกี้ล็อกอิน (สุ่มยาว ๆ บนเว็บจริงต้องมี) |
| `NEXT_PUBLIC_LINE_ADD_FRIEND_URL` | ปุ่มเพิ่มเพื่อน |

ห้าม commit `.env.local`

---

## วิธีเพิ่มกองทุน

1. วาง PDF ที่ `frontend/docs/pdfs/<รหัสกอง>/` (ชื่อไฟล์มีคำว่า `fact` = Factsheet, ไฟล์อื่น = หนังสือชี้ชวน; ชื่อโฟลเดอร์ไม่มี `&` หรือเว้นวรรค)
2. `npm run extract -- <รหัสกอง>` → ได้ `data/extracted/<รหัสกอง>.json` สถานะ `pending`
   ระบบตรวจซ้ำว่าข้อความอ้างอิงมีอยู่จริงในหน้านั้น ถ้าไม่เจอค่านั้นจะเป็น `null` และอยู่ในรายการ "สิ่งที่ต้องตรวจเอง"
3. ทีม econ ตรวจทีละค่าเทียบกับ PDF ตาม [frontend/data/README.md](frontend/data/README.md)
4. ตั้ง `"status": "verified"` และ `"verifiedBy"` แล้วย้ายไฟล์ไป `data/verified/`
5. `npm test` และ `npm run build` แล้ว commit

## ตั้งค่า LINE
1. **Messaging API channel:** Webhook URL = `https://<เว็บ>/api/line/webhook` → Verify → เปิด Use webhook
2. **LINE Official Account Manager:** ปิด Auto-reply และ Greeting messages
3. **LINE Login channel → LIFF:** Endpoint URL และ Callback URL = `https://<เว็บ>`, Scope `openid` + `profile`, Size Full
4. เมนูล่างแชต: `npm run line:richmenu` (ดูรูป) และ `npm run line:richmenu -- --apply` (ตั้งจริง)
5. เปลี่ยนการ์ดแล้ว: `npm run line:validate` ให้ LINE ตรวจรูปแบบ (ไม่ได้ส่งข้อความหาใคร)

## เดโม
สคริปต์เดโม 3 นาที: [docs/demo-script.md](docs/demo-script.md)
