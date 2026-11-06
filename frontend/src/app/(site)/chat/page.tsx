import type { Metadata } from "next";

import { AppShell } from "@/components/finlens/app/AppShell";
import { ChatClient } from "@/components/finlens/app/ChatClient";
import { PageHeader } from "@/components/finlens/app/PageHeader";
import { aiConfig } from "@/lib/ai";
import { EXAMPLE_QUESTIONS } from "@/lib/ask";
import { getVerifiedFunds } from "@/lib/funds";
import { MAX_COMPARE_FUNDS } from "@/lib/limits";

export const metadata: Metadata = {
  title: "ถามน้อง Lensy | FinLens AI",
  description: "ถามเรื่องค่าใช้จ่าย ความเสี่ยง และเงื่อนไขของกองทุน ทุกตัวเลขบอกที่มา ข้อมูลเพื่อความเข้าใจ ไม่ใช่คำแนะนำการลงทุน",
};

export default async function ChatPage({ searchParams }: { searchParams: Promise<{ fund?: string; q?: string }> }) {
  const { fund, q } = await searchParams;
  // a question handed over from the glossary ("ถามน้องต่อ"): pre-filled, not sent until the user taps send
  const initialInput = (q ?? "").trim().slice(0, 500);
  const funds = getVerifiedFunds().map((f) => ({ code: f.code, nameTh: f.nameTh.value ?? f.code, isSample: f.meta.isSample }));
  // ?fund=A or ?fund=A,B (up to 3, e.g. the money question on the home page asks about both example funds)
  const asked = (fund ?? "").split(",").map((c) => c.trim().toUpperCase()).filter(Boolean);
  const wanted = funds.filter((f) => asked.includes(f.code.toUpperCase())).slice(0, MAX_COMPARE_FUNDS);
  // default: the two featured real funds (first in the list), so the example questions work as they read
  const initialCodes = wanted.length ? wanted.map((f) => f.code) : funds.slice(0, 2).map((f) => f.code);
  const questions = EXAMPLE_QUESTIONS.map((q) => q.question);

  return (
    <AppShell sampleNote={funds.some((f) => f.isSample)}>
      <PageHeader
        label="ถามน้อง Lensy"
        title="ถามเรื่องกองทุน"
        mark="หรือศัพท์การเงินได้เลย"
        text="ตัวเลขของกองตอบจากข้อมูลของกองในระบบเท่านั้น และบอกที่มาทุกครั้ง ตัวเลขที่มีเลขหน้ากดดูข้อความในเอกสารได้ ศัพท์ทั่วไปน้องอธิบายให้พร้อมป้ายความรู้ทั่วไป ตัวเลขเงินคำนวณด้วยสูตร"
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
