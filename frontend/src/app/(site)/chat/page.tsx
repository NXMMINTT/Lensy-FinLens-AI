import type { Metadata } from "next";

import { AppShell } from "@/components/finlens/app/AppShell";
import { ChatClient } from "@/components/finlens/app/ChatClient";
import { Disclaimer } from "@/components/finlens/Disclaimer";
import { aiConfig } from "@/lib/ai";
import { SAMPLE_QUESTIONS } from "@/lib/ask";
import { getVerifiedFunds } from "@/lib/funds";

export const metadata: Metadata = {
  title: "ถามน้อง Lensy | FinLens AI",
  description: "ถามเรื่องค่าใช้จ่าย ความเสี่ยง และเงื่อนไขของกองทุน คำตอบมีเลขหน้าในเอกสาร ข้อมูลเพื่อความเข้าใจ ไม่ใช่คำแนะนำการลงทุน",
};

export default async function ChatPage({ searchParams }: { searchParams: Promise<{ fund?: string }> }) {
  const { fund } = await searchParams;
  const funds = getVerifiedFunds().map((f) => ({ code: f.code, nameTh: f.nameTh.value ?? f.code, isSample: f.meta.isSample }));
  const wanted = funds.find((f) => f.code.toUpperCase() === fund?.trim().toUpperCase());
  const initialCodes = wanted ? [wanted.code] : funds.slice(0, 1).map((f) => f.code);
  const questions = [...SAMPLE_QUESTIONS, "ลงทุน 100,000 บาท 10 ปี เสียค่าธรรมเนียมกี่บาท"];

  return (
    <AppShell sampleNote={funds.some((f) => f.isSample)}>
      <header className="flex flex-col gap-2">
        <span className="self-start rounded-md border border-brand/30 bg-surface px-3 py-1 text-[14px] font-semibold text-brand">AI Explain</span>
        <h1 className="m-0 text-[30px] font-bold leading-tight md:text-[38px]">
          ถามน้อง Lensy <span className="marker-green">ได้ทุกเรื่องในเอกสาร</span>
        </h1>
        <p className="m-0 max-w-[720px] text-ink-body">
          ตอบจากข้อมูลที่ทีมตรวจแล้วเท่านั้น ทุกตัวเลขมีป้ายเลขหน้าให้กดดูข้อความในเอกสาร ตัวเลขเงินคำนวณด้วยสูตร ไม่ได้ให้ AI คิด
        </p>
        <Disclaimer />
      </header>
      {funds.length === 0 ? (
        <p className="m-0 rounded-2xl border border-line bg-surface p-6">ยังไม่มีข้อมูลกองทุนที่ตรวจแล้วค่ะ</p>
      ) : (
        <ChatClient funds={funds} initialCodes={initialCodes} questions={questions} aiReady={Boolean(aiConfig().apiKey)} />
      )}
    </AppShell>
  );
}
