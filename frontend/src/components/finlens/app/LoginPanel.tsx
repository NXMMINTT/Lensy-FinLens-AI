"use client";

import liff from "@line/liff";
import { useEffect, useState } from "react";

import { DISCLAIMER } from "@/lib/disclaimer";
import { initLiff, isLiffConfigured } from "@/lib/liff";

import { Icon } from "../Icon";

type State = "checking" | "idle" | "working";

const PRIVACY = [
  { title: "ไม่ต้องสมัครสมาชิก ไม่มีรหัสผ่าน", text: "ใช้บัญชี LINE ยืนยันตัวตนอย่างเดียว", icon: "M7 11V8a5 5 0 0 1 10 0v3M5 11h14v10H5z" },
  { title: "ไม่เก็บชื่อ รูป หรือเบอร์โทร", text: "เก็บแค่รหัสผู้ใช้ที่แปลงแล้ว ย้อนกลับไม่ได้", icon: "M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6zM8.5 12l2.5 2.5 4.5-5" },
];

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
    <div className="flex w-full flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <span className="text-[15px] font-semibold text-brand">ยินดีต้อนรับค่ะ</span>
        <h1 id="login-title" className="m-0 text-[28px] font-bold leading-snug">
          เข้าสู่ระบบ
        </h1>
        <p className="m-0 text-ink-body">ใช้บัญชี LINE ที่มีอยู่แล้ว กดปุ่มเดียวก็เข้าได้เลย</p>
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
      {demoAllowed && <p className="m-0 -mt-3 text-[12.5px] text-ink-muted">โหมดทดลองมีเฉพาะตอนพัฒนา หรือก่อนตั้งค่า LINE Login</p>}

      {error && (
        <p role="alert" className="m-0 w-full rounded-xl bg-danger-soft px-3 py-2 text-[14px] text-danger-ink">
          {error}
        </p>
      )}

      <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
        {PRIVACY.map((p) => (
          <li key={p.title} className="flex items-start gap-3 rounded-2xl bg-brand-tint px-3.5 py-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand" aria-hidden="true">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d={p.icon} />
              </svg>
            </span>
            <span className="flex flex-col leading-snug">
              <b className="text-[14.5px]">{p.title}</b>
              <span className="text-[13px] text-ink-muted">{p.text}</span>
            </span>
          </li>
        ))}
      </ul>
      <p className="m-0 flex items-center gap-1.5 border-t border-line pt-4 text-[13px] text-ink-muted">
        <Icon name="info" />
        {DISCLAIMER}
      </p>
    </div>
  );
}
