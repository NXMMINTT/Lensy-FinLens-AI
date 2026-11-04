import { UFox } from "@/components/brand/UFox";
import { UFoxFace } from "@/components/brand/UFoxFace";
import { Paw } from "@/components/decor/Paw";
import { Twinkle } from "@/components/decor/Twinkle";

const FAQ = [
  ["FinLens AI คืออะไร?", "หนูเป็นผู้ช่วยบัญชีและนักวิเคราะห์ตลาดสำหรับพ่อค้าแม่ค้าออนไลน์ค่ะ จดบัญชีผ่าน LINE และดูราคาคู่แข่งบนเว็บ"],
  ["ต้องโหลดแอปใหม่ไหม?", "ไม่ต้องเลยค่ะ เพิ่มเพื่อน U-Fox ใน LINE แล้วเริ่มส่งรายการได้ทันที หน้าเว็บก็เปิดจาก LINE ได้"],
  ["ตัวเลขภาษีเชื่อได้แค่ไหน?", "เป็นการประมาณจากรายการที่คุณยืนยันแล้ว ใช้วางแผนล่วงหน้าได้ แต่ก่อนยื่นจริงควรตรวจกับผู้สอบบัญชีนะคะ"],
  ["ราคาคู่แข่งมาจากไหน?", "รวบรวมจากแพลตฟอร์มขายของออนไลน์ทั้งในไทยและต่างประเทศค่ะ ในเดโมนี้เป็นข้อมูลตัวอย่าง"],
] as const;

/** FAQ as a LINE chat: the seller asks, U-Fox answers. */
export function FaqSection() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="scroll-mt-20 px-6 pb-24">
      <div className="mx-auto flex max-w-[1100px] flex-wrap gap-x-16 gap-y-8">
        <div className="relative flex flex-[1_1_300px] flex-col items-start gap-3">
          <Paw className="bottom-24 right-8 h-8 w-8 rotate-12 opacity-80 max-md:hidden" />
          <Twinkle className="bottom-40 right-20 h-5 w-5 max-md:hidden" />
          <span className="rounded-full bg-brand-soft px-3.5 py-1 text-[15px] font-semibold text-brand">คำถามที่พบบ่อย</span>
          <h2 id="faq-title" className="m-0 text-[40px] font-extrabold leading-tight">
            เรื่องที่
            <br />
            คนชอบถาม U-Fox
          </h2>
          <UFox pose="question" size={170} className="mt-4 max-md:hidden" />
        </div>
        <dl className="m-0 flex flex-[2_1_520px] flex-col gap-5 rounded-[32px] bg-[#DCEBFD] p-6">
          {FAQ.map(([q, a]) => (
            <div key={q} className="flex flex-col gap-2.5">
              <dt className="max-w-[85%] self-end rounded-[20px] rounded-br-md bg-chat px-[18px] py-2.5 font-semibold text-[#0F2A12]">{q}</dt>
              <dd className="m-0 flex max-w-[90%] items-end gap-2.5 self-start">
                <UFoxFace size={36} />
                <span className="rounded-[20px] rounded-bl-md bg-surface px-[18px] py-2.5 text-ink-body">{a}</span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
