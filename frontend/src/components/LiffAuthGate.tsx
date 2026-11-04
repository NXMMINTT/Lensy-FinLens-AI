"use client";

import { useEffect, useState } from "react";

import liff from "@line/liff";

import { UFox } from "@/components/brand/UFox";
import { ensureSession, getStoredJwt } from "@/lib/api-client";
import { ensureLoggedIn, initLiff, isLiffConfigured } from "@/lib/liff";

type State = "loading" | "need_login" | "signing_in" | "ready";

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return Promise.race([p, new Promise<T>((_, rej) => setTimeout(() => rej(new Error("timeout")), ms))]);
}

export function LiffAuthGate({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLiffConfigured()) {
      setState("ready");
      return;
    }
    (async () => {
      try {
        await withTimeout(initLiff(), 8000);
      } catch {
        // LIFF failed to initialize in time — let the user retry via the button.
        setState("need_login");
        return;
      }
      if (getStoredJwt()) {
        setState("ready");
        return;
      }
      // Already authenticated with LINE (in-app auto-login, or returned from redirect):
      // finish by exchanging the ID token for our session. Never block forever on it.
      if (liff.isLoggedIn()) {
        try {
          await withTimeout(ensureSession(), 12000);
          if (getStoredJwt()) {
            setState("ready");
            return;
          }
        } catch {
          /* fall through to the login screen */
        }
      }
      setState("need_login");
    })();
  }, []);

  async function signIn() {
    setError(null);
    setState("signing_in");
    try {
      await ensureLoggedIn(); // external browser: redirects to LINE Login and navigates away
      await withTimeout(ensureSession(), 15000);
      if (!getStoredJwt()) throw new Error("ไม่ได้รับสิทธิ์จาก LINE กรุณาลองใหม่");
      setState("ready");
    } catch (e) {
      setError(e instanceof Error && e.message !== "timeout" ? e.message : "เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่");
      setState("need_login");
    }
  }

  if (state === "ready") return <>{children}</>;

  if (state === "loading" || state === "signing_in") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-tint">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand border-t-transparent" />
          <p className="text-sm text-ink-muted">กำลังเข้าสู่ระบบ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-tint px-6">
      <div className="flex max-w-sm flex-col items-center gap-5 rounded-[28px] bg-surface p-8 text-center shadow-lg">
        <UFox size={110} />
        <div>
          <h1 className="m-0 text-2xl font-bold text-ink">ยินดีต้อนรับสู่ FinLens AI</h1>
          <p className="m-0 mt-2 text-ink-body">เข้าสู่ระบบด้วยบัญชี LINE ของคุณเพื่อเริ่มใช้งานครับ</p>
        </div>

        <button
          type="button"
          onClick={signIn}
          className="inline-flex min-h-[50px] w-full items-center justify-center gap-2 rounded-full bg-[#06C755] px-6 font-bold text-white"
        >
          <LineLogo />
          เข้าสู่ระบบด้วย LINE
        </button>
      </div>
    </div>
  );
}

function LineLogo() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.48 2 2 5.64 2 10.13c0 4.02 3.55 7.39 8.35 8.03.32.07.77.21.88.49.1.25.07.64.03.9l-.14.85c-.04.25-.2.98.86.53 1.06-.45 5.72-3.37 7.8-5.77C21.3 13.5 22 11.9 22 10.13 22 5.64 17.52 2 12 2Z" />
    </svg>
  );
}
