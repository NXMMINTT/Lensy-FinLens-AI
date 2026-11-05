import Link from "next/link";

import { Disclaimer } from "@/components/finlens/Disclaimer";
import { Lensy } from "@/components/finlens/Lensy";

export default function NotFound() {
  return (
    <main className="flex min-h-[100svh] items-center justify-center bg-white px-4 py-10 text-ink dark:bg-transparent">
      <section className="flex w-full max-w-[560px] flex-col items-center gap-4 text-center">
        <Lensy pose="question" size={180} />
        <h1 className="m-0 font-heading text-[28px] font-extrabold leading-tight md:text-[34px]">ไม่พบหน้านี้ค่ะ</h1>
        <p className="m-0 text-[16px] text-ink-body">ลิงก์อาจพิมพ์ผิดหรือหน้านี้ถูกย้ายไปแล้ว กลับไปเทียบกองทุนหรือดูหน้าแรกได้เลยนะคะ</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/compare" className="inline-flex min-h-[48px] items-center rounded-full bg-brand px-6 font-bold text-white no-underline hover:bg-brand-dark">
            เทียบกองทุน
          </Link>
          <Link href="/" className="inline-flex min-h-[48px] items-center rounded-full border-2 border-sky-line px-6 font-bold text-brand no-underline hover:border-brand">
            หน้าแรก
          </Link>
        </div>
        <Disclaimer className="mt-2" />
      </section>
    </main>
  );
}
