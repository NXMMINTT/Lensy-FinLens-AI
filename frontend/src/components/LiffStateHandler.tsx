"use client";

import { useEffect } from "react";

import { finishPendingLogin, initLiff, isLiffConfigured } from "@/lib/liff";

/** On the public landing page (the LIFF endpoint root), initialize LIFF so the SDK
 * resolves `?liff.state=/path` from rich-menu deep links and navigates into the app,
 * and finish a web login that LINE sent back to the root (see startLineLogin). */
export function LiffStateHandler() {
  useEffect(() => {
    if (!isLiffConfigured()) return;
    initLiff()
      .then(finishPendingLogin)
      .catch(() => {});
  }, []);
  return null;
}
