import type { Metadata } from "next";

import { LandingHeader } from "@/components/finlens/LandingHeader";
import { LandingFooter } from "@/components/finlens/LandingSections";
import { Lensy } from "@/components/finlens/Lensy";

export const metadata: Metadata = {
  title: "แผนในอนาคต | FinLens AI",
  description: "FinLens เริ่มจากกองทุนรวม แล้วขยายไปยังการลงทุนประเภทอื่นด้วยหลักเดียวกัน: ทุกตัวเลขตรวจสอบย้อนกลับได้ ข้อมูลเพื่อความเข้าใจ ไม่ใช่คำแนะนำการลงทุน",
};

/** The six layers every product gets, and what exists today. */
const LAYERS: { title: string; text: string; now: string }[] = [
  { title: "ภาพรวม", text: "ผลิตภัณฑ์นี้คืออะไร เรากำลังซื้อสินทรัพย์ หรือให้ใครกู้เงิน", now: "กองทุนรวม: ประเภทกอง กองทุนหลัก ระดับความเสี่ยง" },
  { title: "กลไกและความเสี่ยง", text: "เงินเพิ่มหรือลดจากอะไร ขายคืนได้เร็วแค่ไหน มีเงื่อนไขอะไร", now: "แจ้งเตือนความเสี่ยงจากกฎ: ค่าเงิน การกระจุกตัว ตลาดต่างประเทศ การขายคืน" },
  { title: "ค่าใช้จ่ายเป็นบาท", text: "จ่ายอะไร ตอนไหน หักจากเงินเราหรือหักในกอง และรวมแล้วกี่บาท", now: "Fee X-Ray แยกตอนซื้อ ระหว่างถือ ตอนขาย และเครื่องคำนวณเป็นบาท" },
  { title: "คำถามก่อนตัดสินใจ", text: "สิ่งที่ควรถามก่อนโอนเงิน ตั้งแต่พื้นฐานจนถึงเรื่องเฉพาะของผลิตภัณฑ์", now: "เช็กลิสต์ก่อนซื้อ คลังศัพท์ และถามน้อง Lensy" },
  { title: "กฎหมายและผู้กำกับดูแล", text: "ใครกำกับดูแล ผู้ให้บริการมีใบอนุญาตประเภทไหน ร้องเรียนที่ไหน", now: "ยังไม่มี อยู่ในแผน" },
  { title: "แหล่งอ้างอิงและวันที่", text: "ทุกตัวเลขย้อนกลับไปเอกสารต้นทางได้ พร้อมหน้า วันที่ และสถานะการตรวจ", now: "ที่มาของทุกตัวเลข (พร้อมเลขหน้าเมื่อเอกสารระบุ) สถานะข้อมูล และวันที่ของเอกสาร" },
];

const PHASES: { name: string; when: string; items: string[]; current?: boolean }[] = [
  { name: "ตอนนี้", when: "เดโม", items: ["กองทุนรวม โดยเฉพาะกองฟีดเดอร์และกองดัชนี", "เทียบค่าธรรมเนียมแฝงหลายกองเคียงกัน", "ใช้ได้ทั้ง LINE และเว็บ"], current: true },
  { name: "ขั้นถัดไป", when: "หลังประกวด", items: ["เงินฝากและสลากออมทรัพย์", "ตราสารหนี้และหุ้นกู้", "ETF และ DR", "ส่องพอร์ต"] },
  { name: "ต่อจากนั้น", when: "ระยะกลาง", items: ["หุ้นและ REIT", "ประกันชีวิตควบการลงทุน", "เช็กก่อนเชื่อ: เทียบโฆษณากับเอกสาร"] },
  { name: "ระยะยาว", when: "เมื่อโครงสร้างข้อมูลพร้อม", items: ["อนุพันธ์และสินทรัพย์ดิจิทัล", "การลงทุนต่างประเทศ: ค่าเงินและค่าโอน", "ตรวจใบอนุญาตผู้ให้บริการ (Legal Lens)"] },
];

const PRINCIPLES = [
  "มีใบอนุญาต ไม่ได้แปลว่าไม่มีความเสี่ยง และไม่ได้แปลว่าเงินต้นได้รับการรับประกัน",
  "ค้นไม่พบในฐานข้อมูล ไม่ได้แปลว่าผิดกฎหมาย จะบอกว่า “ยังไม่พบข้อมูลจากแหล่งที่ตรวจสอบ”",
  "ไม่พบค่าธรรมเนียมในเอกสาร ไม่ได้แปลว่าไม่มีค่าธรรมเนียม",
  "ตัวเลขเงินคำนวณด้วยสูตรที่มีชุดทดสอบ AI มีหน้าที่อธิบาย ไม่ใช่คิดเลข",
  "ไม่จัดอันดับผลิตภัณฑ์ ไม่แนะนำให้ซื้อหรือขาย ไม่คาดการณ์ผลตอบแทน",
  "ไม่นำตัวเลขต่างนิยามมาเทียบกันตรง ๆ เช่น จำนวนบัญชีกับจำนวนคน",
];

export default function RoadmapPage() {
  return (
    <div className="overflow-x-clip text-ink">
      <LandingHeader />
      <main className="bg-surface">
        <div className="mx-auto flex max-w-[1000px] flex-col gap-12 px-5 py-12 md:px-6">
          <header className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex max-w-[640px] flex-col gap-3">
              <span className="self-start rounded-md bg-brand-soft px-2.5 py-1 text-[14px] font-bold text-brand">แผนในอนาคต</span>
              <h1 className="m-0 text-[30px] font-bold leading-tight md:text-[40px]">
                เริ่มจากกองทุนรวม <span className="marker-green">ขยายด้วยหลักเดียวกัน</span>
              </h1>
              <p className="m-0 text-ink-body">
                ก่อนนำเงินไปลงทุน คนควรรู้ว่ากำลังซื้ออะไร จ่ายเงินให้ใคร มีค่าใช้จ่ายเท่าไร เงินอาจเพิ่มหรือลดจากอะไร และถ้ามีปัญหาจะตรวจสอบกับใคร
                FinLens เริ่มทำเรื่องนี้กับกองทุนรวม แล้วจะใช้โครงเดียวกันกับการลงทุนประเภทอื่น
              </p>
            </div>
            <Lensy pose="chart" size={140} className="max-sm:hidden" />
          </header>

          <section aria-labelledby="layers-title" className="flex flex-col gap-4">
            <h2 id="layers-title" className="m-0 text-[24px] font-bold">
              ทุกผลิตภัณฑ์ต้องตอบได้ 6 เรื่อง
            </h2>
            <ol className="m-0 grid list-none gap-3 p-0 md:grid-cols-2">
              {LAYERS.map((l, i) => (
                <li key={l.title} className="flex flex-col gap-1.5 rounded-[20px] border border-line bg-surface p-5">
                  <span className="flex items-baseline gap-2">
                    <span className="font-heading text-[22px] font-bold text-brand/50">{i + 1}</span>
                    <b className="text-[17px]">{l.title}</b>
                  </span>
                  <span className="text-[15px] text-ink-body">{l.text}</span>
                  <span className={`mt-1 rounded-xl px-3 py-1.5 text-[13.5px] ${l.now.startsWith("ยังไม่มี") ? "bg-line-subtle text-ink-muted" : "bg-brand-tint text-ink-body"}`}>
                    <b className={l.now.startsWith("ยังไม่มี") ? "" : "text-brand"}>ตอนนี้:</b> {l.now}
                  </span>
                </li>
              ))}
            </ol>
          </section>

          <section aria-labelledby="phases-title" className="flex flex-col gap-4">
            <h2 id="phases-title" className="m-0 text-[24px] font-bold">
              ลำดับการขยาย
            </h2>
            <ol className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2 lg:grid-cols-4">
              {PHASES.map((p) => (
                <li
                  key={p.name}
                  className={`flex flex-col gap-2 rounded-[20px] p-5 ${p.current ? "force-light bg-gradient-to-br from-brand to-brand-dark text-white" : "border border-line bg-surface"}`}
                >
                  <span className="flex flex-col">
                    <b className="text-[18px]">{p.name}</b>
                    <span className={`text-[13px] ${p.current ? "text-white/80" : "text-ink-muted"}`}>{p.when}</span>
                  </span>
                  <ul className="m-0 flex flex-col gap-1 pl-4 text-[14.5px]">
                    {p.items.map((it) => (
                      <li key={it}>{it}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
            <p className="m-0 text-[13.5px] text-ink-muted">
              แต่ละประเภทจะเปิดเมื่อมีเอกสารต้นทาง ฐานข้อมูลค่าใช้จ่าย และสูตรคำนวณที่ผ่านการทดสอบแล้วเท่านั้น
            </p>
          </section>

          <section aria-labelledby="rules-title" className="flex flex-col gap-4 rounded-[24px] bg-brand-tint p-6 md:p-8">
            <h2 id="rules-title" className="m-0 text-[24px] font-bold">
              หลักที่ไม่เปลี่ยน ไม่ว่าจะขยายไปแค่ไหน
            </h2>
            <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
              {PRINCIPLES.map((p) => (
                <li key={p} className="flex items-start gap-2.5 text-[15.5px] text-ink-body">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand text-[12px] font-bold text-white" aria-hidden="true">
                    ✓
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
