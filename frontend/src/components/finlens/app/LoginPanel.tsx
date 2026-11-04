"use client";

import liff from "@line/liff";
import { useEffect, useState } from "react";

import { DISCLAIMER } from "@/lib/disclaimer";
import { initLiff, isLiffConfigured } from "@/lib/liff";

import { Lensy } from "../Lensy";

type State = "checking" | "idle" | "working";

async function exchange(): Promise<void> {
  const idToken = liff.getIDToken();
  if (!idToken) throw new Error("ไม่ได้รับข้อมูลยืนยันตัวตนจาก LINE");
  const r = await fetch("/api/auth/line", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idToken }) });
  if (!r.ok) throw new Error(((await r.json().catch(() => null)) as { error?: string } | null)?.error ?? "เข้าสู่ระบบไม่สำเร็จ");
}

export function LoginPanel({ next, demoAllowed }: { next: string; demoAllowed: boolean }) {
  const liffOn = isLiffConfigured();
  const [state, setState] = useState<State>(liffOn ? "checking" : "idle");
  const [error, setError] = useState<string | null>(null);

  // Inside the LINE app (or back from LINE Login) the user is already logged in: finish quietly.
  useEffect(() => {
    if (!liffOn) return;
    (async () => {
      try {
        await initLiff();
        if (liff.isLoggedIn()) {
          await exchange();
          window.location.replace(next);
          return;
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "เข้าสู่ระบบไม่สำเร็จ");
      }
      setState("idle");
    })();
  }, [liffOn, next]);

  async function lineLogin() {
    setError(null);
    setState("working");
    try {
      await initLiff();
      if (!liff.isLoggedIn()) {
        const base = process.env.NEXT_PUBLIC_SITE_URL?.trim() || window.location.origin;
        liff.login({ redirectUri: `${base}/login?next=${encodeURIComponent(next)}` });
        return; // navigates to LINE
      }
      await exchange();
      window.location.replace(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "เข้าสู่ระบบไม่สำเร็จ");
      setState("idle");
    }
  }

  async function demoLogin() {
    setError(null);
    setState("working");
    const r = await fetch("/api/auth/demo", { method: "POST" });
    if (r.ok) window.location.replace(next);
    else {
      setError("เข้าโหมดทดลองไม่ได้");
      setState("idle");
    }
  }

  const busy = state !== "idle";

  return (
    <div className="flex w-full max-w-[420px] flex-col items-center gap-5 rounded-[28px] border border-line bg-surface p-7 text-center shadow-[0_20px_50px_rgba(20,46,34,.10)] md:p-9">
      <Lensy pose="wave" size={150} />
      <div>
        <h1 className="m-0 text-[26px] font-bold leading-snug">เข้าสู่ระบบ FinLens AI</h1>
        <p className="m-0 mt-2 text-ink-body">เข้าสู่ระบบด้วยบัญชี LINE เพื่อดูกองทุน เทียบต้นทุน และถามน้อง Lensy ค่ะ</p>
      </div>

      {liffOn ? (
        <button
          type="button"
          onClick={lineLogin}
          disabled={busy}
          className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-linegreen px-6 font-bold text-white shadow-[0_10px_24px_rgba(6,199,85,.3)] hover:bg-[#05B34C] disabled:opacity-60"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 3C6.5 3 2 6.6 2 11c0 3.9 3.5 7.2 8.3 7.9.3.1.8.2.9.5.1.3.1.7 0 1l-.1.9c0 .3-.2 1 .9.5s5.9-3.5 8.1-6C21.4 14.3 22 12.7 22 11c0-4.4-4.5-8-10-8z" />
          </svg>
          {state === "checking" ? "กำลังตรวจสอบ..." : state === "working" ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบด้วย LINE"}
        </button>
      ) : (
        <p className="m-0 w-full rounded-xl border border-sun/40 bg-sun-soft px-3 py-2 text-[14px] text-sun-ink">ยังไม่ได้ตั้งค่า LINE Login (NEXT_PUBLIC_LIFF_ID)</p>
      )}

      {demoAllowed && (
        <button
          type="button"
          onClick={demoLogin}
          disabled={busy}
          className="inline-flex min-h-[48px] w-full items-center justify-center rounded-full border-2 border-brand px-6 font-bold text-brand hover:bg-brand-soft disabled:opacity-60"
        >
          เข้าโหมดทดลอง
        </button>
      )}
      {demoAllowed && <p className="m-0 -mt-3 text-[12.5px] text-ink-muted">โหมดทดลองจะปิดเองเมื่อตั้งค่า LINE Login แล้ว</p>}

      {error && (
        <p role="alert" className="m-0 w-full rounded-xl bg-danger-soft px-3 py-2 text-[14px] text-danger-ink">
          {error}
        </p>
      )}

      <ul className="m-0 flex list-none flex-col gap-1 p-0 text-left text-[13.5px] text-ink-muted">
        <li>✓ ไม่ต้องสมัครสมาชิก ไม่มีรหัสผ่าน</li>
        <li>✓ ไม่เก็บชื่อ รูป หรือเบอร์โทร เก็บเฉพาะรหัสที่แปลงแล้วย้อนกลับไม่ได้</li>
      </ul>
      <p className="m-0 text-[13px] text-ink-muted">ⓘ {DISCLAIMER}</p>
    </div>
  );
}
