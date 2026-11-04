"use client";

import { useEffect } from "react";

import { initLiff, isLiffConfigured } from "@/lib/liff";

/** On the public landing page (the LIFF endpoint root), initialize LIFF so the SDK
 * resolves `?liff.state=/path` from rich-menu deep links and navigates into the app. */
export function LiffStateHandler() {
  useEffect(() => {
    if (!isLiffConfigured()) return;
    initLiff().catch(() => {});
  }, []);
  return null;
}
