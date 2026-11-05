import type { Metadata } from "next";

import { AppShell } from "@/components/finlens/app/AppShell";
import { ChatClient } from "@/components/finlens/app/ChatClient";
import { PageHeader } from "@/components/finlens/app/PageHeader";
import { aiConfig } from "@/lib/ai";
import { SAMPLE_QUESTIONS } from "@/lib/ask";
import { getVerifiedFunds } from "@/lib/funds";

export const metadata: Metadata = {
  title: "ถามน้อง Lensy | FinLens AI",
  description: "ถามเรื่องค่าใช้จ่าย ความเสี่ยง และเงื่อนไขของกองทุน คำตอบมีเลขหน้าในเอกสาร ข้อมูลเพื่อความเข้าใจ ไม่ใช่คำแนะนำการลงทุน",
};

export default async function ChatPage({ searchParams }: { searchParams: Promise<{ fund?: string; q?: string }> }) {
  const { fund, q } = await searchParams;
  // a question handed over from the glossary ("ถามน้องต่อ"): pre-filled, not sent until the user taps send
  const initialInput = (q ?? "").trim().slice(0, 500);
  const funds = getVerifiedFunds().map((f) => ({ code: f.code, nameTh: f.nameTh.value ?? f.code, isSample: f.meta.isSample }));
  const wanted = funds.find((f) => f.code.toUpperCase() === fund?.trim().toUpperCase());
  const initialCodes = wanted ? [wanted.code] : funds.slice(0, 1).map((f) => f.code);
  const questions = [...SAMPLE_QUESTIONS, "ลงทุน 100,000 บาท 10 ปี เสียค่าธรรมเนียมกี่บาท"];

  return (
    <AppShell sampleNote={funds.some((f) => f.isSample)}>
      <PageHeader
        label="ถามน้อง Lensy"
        title="ถามเรื่องกองทุน"
        mark="หรือศัพท์การเงินได้เลย"
        text="ตัวเลขของกองตอบจากข้อมูลที่ทีมตรวจแล้วเท่านั้น และมีป้ายเลขหน้าให้กดดูข้อความในเอกสาร ศัพท์ทั่วไปน้องอธิบายให้พร้อมป้ายความรู้ทั่วไป ตัวเลขเงินคำนวณด้วยสูตร"
        pose="idea"
      />
      {funds.length === 0 ? (
        <p className="m-0 rounded-2xl border border-line bg-surface p-6">ยังไม่มีข้อมูลกองทุนที่ตรวจแล้วค่ะ</p>
      ) : (
        <ChatClient funds={funds} initialCodes={initialCodes} initialInput={initialInput} questions={questions} aiReady={Boolean(aiConfig().apiKey)} />
      )}
    </AppShell>
  );
}
