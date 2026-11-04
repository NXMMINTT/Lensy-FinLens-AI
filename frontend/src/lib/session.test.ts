import { describe, expect, it } from "vitest";

import { hashUserId, safeNext, signSession, verifySession } from "./session";

describe("session cookie", () => {
  it("round-trips a signed session", async () => {
    const t = await signSession({ sub: "abc", demo: false });
    expect(await verifySession(t)).toMatchObject({ sub: "abc", demo: false });
  });

  it("rejects a tampered or expired cookie", async () => {
    const t = await signSession({ sub: "abc", demo: true });
    const [body, sig] = t.split(".");
    const forged = Buffer.from(JSON.stringify({ sub: "someone-else", demo: false, exp: 9999999999 })).toString("base64url");
    expect(await verifySession(`${forged}.${sig}`)).toBeNull();
    expect(await verifySession(`${body}.x${sig.slice(1)}`)).toBeNull();
    expect(await verifySession(t, Date.now() + 8 * 24 * 3600 * 1000)).toBeNull();
    expect(await verifySession("garbage")).toBeNull();
    expect(await verifySession(undefined)).toBeNull();
  });

  it("stores a one-way hash, never the LINE userId", async () => {
    const h = await hashUserId("U1234567890abcdef");
    expect(h).not.toContain("U1234567890abcdef");
    expect(h).toBe(await hashUserId("U1234567890abcdef"));
    expect(h).not.toBe(await hashUserId("U0000000000000000"));
  });

  it("only redirects to same-site paths after login", () => {
    expect(safeNext("/funds/ABC")).toBe("/funds/ABC");
    expect(safeNext("https://evil.example")).toBe("/funds");
    expect(safeNext("//evil.example")).toBe("/funds");
    expect(safeNext(null)).toBe("/funds");
  });
});
