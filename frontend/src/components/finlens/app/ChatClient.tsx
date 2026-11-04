"use client";

import { useEffect, useRef, useState } from "react";

import type { AskRef, AskResponse } from "@/lib/ask";
import { DISCLAIMER } from "@/lib/disclaimer";

import { LensyFace } from "../Lensy";
import { SampleBadge } from "../SampleBadge";
import { SourceChip } from "./ui";

type FundOption = { code: string; nameTh: string; isSample: boolean };
type Msg = { id: number; role: "user" | "bot"; text: string; refs?: AskRef[]; assumptions?: string[]; kind?: AskResponse["kind"] };

const MAX = 3;

export function ChatClient({ funds, initialCodes, questions, aiReady }: { funds: FundOption[]; initialCodes: string[]; questions: string[]; aiReady: boolean }) {
  const [codes, setCodes] = useState<string[]>(initialCodes);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(1);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, busy]);

  function toggle(code: string) {
    setCodes((cur) => (cur.includes(code) ? (cur.length > 1 ? cur.filter((c) => c !== code) : cur) : cur.length < MAX ? [...cur, code] : cur));
  }

  async function ask(question: string) {
    const q = question.trim();
    if (!q || busy) return;
    setInput("");
    setMessages((m) => [...m, { id: nextId.current++, role: "user", text: q }]);
    setBusy(true);
    let res: AskResponse;
    try {
      const r = await fetch("/api/ask", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fundCodes: codes, question: q }) });
      res = (await r.json()) as AskResponse;
    } catch {
      res = { kind: "error", answer: "เชื่อมต่อไม่สำเร็จ ลองใหม่อีกครั้งนะคะ", refs: [] };
    }
    setMessages((m) => [...m, { id: nextId.current++, role: "bot", text: res.answer, refs: res.refs, assumptions: res.assumptions, kind: res.kind }]);
    setBusy(false);
  }

  const selectedSample = funds.some((f) => f.isSample && codes.includes(f.code));
  const multi = codes.length > 1;

  return (
    <div className="flex flex-col gap-4">
      {/* fund picker */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[14px] text-ink-muted">ถามเรื่องกอง:</span>
        {funds.map((f) => {
          const on = codes.includes(f.code);
          return (
            <button
              key={f.code}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(f.code)}
              className={`min-h-[40px] rounded-full border px-3.5 text-[14px] font-semibold ${on ? "border-brand bg-brand-soft text-ink" : "border-line bg-surface text-ink-muted hover:border-brand"}`}
            >
              {on ? "✓ " : "+ "}
              {f.nameTh}
            </button>
          );
        })}
        {selectedSample && <SampleBadge />}
      </div>

      {!aiReady && (
        <p className="m-0 rounded-xl border border-sun/40 bg-sun-soft px-4 py-2.5 text-[14px] text-sun-ink">
          ระบบ AI ยังไม่ได้ตั้งค่า (KKU_API_KEY) ตอนนี้ตอบได้เฉพาะคำถามตัวเลขเงิน (คำนวณด้วยสูตร) และคำถามที่น้องต้องปฏิเสธ
        </p>
      )}

      {/* conversation */}
      <div className="force-light flex min-h-[420px] flex-col gap-3 rounded-[24px] bg-[#DCEBFD] p-4 md:p-5" aria-live="polite">
        {messages.length === 0 && (
          <div className="flex items-end gap-2">
            <LensyFace size={36} />
            <div className="max-w-[85%] rounded-[18px] rounded-bl-md bg-surface px-4 py-3 text-[15px] text-ink-body">
              สวัสดีค่ะ น้อง Lensy เอง ถามเรื่องค่าใช้จ่าย ความเสี่ยง หรือเงื่อนไขของกองที่เลือกได้เลยค่ะ ทุกคำตอบจะบอกเลขหน้าในเอกสาร
            </div>
          </div>
        )}
        {messages.map((m) =>
          m.role === "user" ? (
            <div key={m.id} className="max-w-[85%] self-end rounded-[18px] rounded-br-md bg-chat px-4 py-2.5 text-[15px] text-[#0F2A12]">
              {m.text}
            </div>
          ) : (
            <div key={m.id} className="flex items-end gap-2">
              <LensyFace size={36} />
              <div className="flex max-w-[88%] flex-col gap-2 rounded-[18px] rounded-bl-md bg-surface px-4 py-3 text-[15px] text-ink-body">
                <p className="m-0 whitespace-pre-line">{m.text}</p>
                {m.refs && m.refs.length > 0 && (
                  <span className="flex flex-wrap gap-1.5">
                    {m.refs.map((r, i) => (
                      <span key={i} className="inline-flex items-center gap-1">
                        {multi && <span className="text-[11px] font-semibold text-ink-muted">{r.code}</span>}
                        <SourceChip page={r.page} source={r.source} quote={r.quote} />
                      </span>
                    ))}
                  </span>
                )}
                {m.assumptions && (
                  <ul className="m-0 flex flex-col gap-0.5 border-t border-line pt-2 pl-4 text-[12.5px] text-ink-muted">
                    {m.assumptions.map((a) => (
                      <li key={a}>{a}</li>
                    ))}
                  </ul>
                )}
                <span className="border-t border-line pt-1.5 text-[11.5px] text-ink-muted">{DISCLAIMER}</span>
              </div>
            </div>
          ),
        )}
        {busy && (
          <div className="flex items-end gap-2" aria-label="น้อง Lensy กำลังพิมพ์">
            <LensyFace size={36} />
            <span className="flex gap-1.5 rounded-[18px] rounded-bl-md bg-surface px-4 py-3.5">
              {[0, 150, 300].map((d) => (
                <span key={d} className="h-2 w-2 animate-typing rounded-full bg-brand-light" style={{ animationDelay: `${d}ms` }} />
              ))}
            </span>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* suggestions */}
      <div className="flex flex-wrap gap-2">
        {questions.map((q) => (
          <button
            key={q}
            type="button"
            disabled={busy}
            onClick={() => ask(q)}
            className="rounded-full border border-brand/40 bg-surface px-3.5 py-2 text-left text-[14px] text-ink-body hover:border-brand hover:bg-brand-soft disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>

      {/* input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void ask(input);
        }}
        className="flex gap-2"
      >
        <label className="sr-only" htmlFor="ask-input">
          คำถาม
        </label>
        <input
          id="ask-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={500}
          placeholder="พิมพ์คำถาม เช่น TER คืออะไร"
          className="min-h-[52px] flex-1 rounded-full border border-line bg-surface px-5 text-[16px] text-ink placeholder:text-ink-faint focus:border-brand"
        />
        <button type="submit" disabled={busy || !input.trim()} className="min-h-[52px] rounded-full bg-brand px-6 font-bold text-white hover:bg-brand-dark disabled:opacity-50">
          ส่ง
        </button>
      </form>
    </div>
  );
}
