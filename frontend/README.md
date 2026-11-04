# FinLens AI · frontend

แอป Next.js ของ FinLens AI (เว็บ + API + บอท LINE) ดูวิธีรัน สถาปัตยกรรม และวิธีเพิ่มกองทุนที่ [README หลัก](../README.md)

```bash
npx pnpm@10 install
npm run dev        # http://localhost:3000
npm test
npm run build
npm run extract -- <รหัสกอง>   # ดึงข้อมูลจาก PDF
npm run line:validate          # ให้ LINE ตรวจรูปแบบการ์ด
npm run line:richmenu          # รูปเมนูล่างแชต (เพิ่ม -- --apply เพื่อตั้งจริง)
```

หน้าในกลุ่ม `src/app/(ledger)` และ `src/components/home` เป็นโค้ดของ U-Ledger ที่เก็บไว้เป็นต้นแบบ ไม่ได้ใช้ใน FinLens
