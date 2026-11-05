import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/** A fake LIFF SDK; each test sets what LINE "returns". */
const liff = {
  init: vi.fn(async () => {}),
  isLoggedIn: vi.fn(() => true),
  isInClient: vi.fn(() => false),
  getIDToken: vi.fn<() => string | null>(() => null),
  getContext: vi.fn<() => { scope: string[] } | null>(() => ({ scope: ["openid", "profile"] })),
  login: vi.fn(),
  logout: vi.fn(),
};
vi.mock("@line/liff", () => ({ default: liff }));

function memoryStorage(): Storage {
  const m = new Map<string, string>();
  return {
    get length() {
      return m.size;
    },
    clear: () => m.clear(),
    getItem: (k) => m.get(k) ?? null,
    key: (i) => [...m.keys()][i] ?? null,
    removeItem: (k) => void m.delete(k),
    setItem: (k, v) => void m.set(k, String(v)),
  };
}

const fetchMock = vi.fn(async () => new Response(JSON.stringify({ ok: true }), { status: 200 }));
const reload = vi.fn();

async function load() {
  vi.resetModules();
  return import("./liff");
}

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_LIFF_ID", "1234567890-abcdefgh");
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://finlens.example");
  vi.stubGlobal("sessionStorage", memoryStorage());
  vi.stubGlobal("window", { location: { pathname: "/funds", search: "", origin: "https://finlens.example", reload } });
  vi.stubGlobal("fetch", fetchMock);
  for (const f of Object.values(liff)) f.mockClear();
  fetchMock.mockClear();
  reload.mockClear();
  liff.isLoggedIn.mockReturnValue(true);
  liff.isInClient.mockReturnValue(false);
  liff.getIDToken.mockReturnValue(null);
  liff.getContext.mockReturnValue({ scope: ["openid", "profile"] });
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("old token without the openid scope (logged in, no ID token)", () => {
  it("logs out of LINE and logs in again, automatically", async () => {
    const { exchangeLineToken } = await load();
    await expect(exchangeLineToken("/compare")).resolves.toBe("redirecting");
    expect(liff.logout).toHaveBeenCalledOnce();
    expect(liff.login).toHaveBeenCalledWith({ redirectUri: "https://finlens.example" });
    expect(liff.logout.mock.invocationCallOrder[0]).toBeLessThan(liff.login.mock.invocationCallOrder[0]);
    expect(sessionStorage.getItem("finlens.login.next")).toBe("/compare");
  });

  it("tries only once per tab, then shows the Thai message (no loop)", async () => {
    const { exchangeLineToken, NO_ID_TOKEN } = await load();
    await exchangeLineToken("/compare");
    liff.login.mockClear();
    liff.logout.mockClear();
    await expect(exchangeLineToken("/compare")).rejects.toThrow(NO_ID_TOKEN);
    expect(liff.login).not.toHaveBeenCalled();
    expect(liff.logout).not.toHaveBeenCalled();
  });

  it("\"ลองใหม่\" (resetRelogin) allows one more automatic re-login", async () => {
    const { exchangeLineToken, resetRelogin } = await load();
    await exchangeLineToken("/compare");
    await exchangeLineToken("/compare").catch(() => {});
    liff.login.mockClear();
    resetRelogin();
    await expect(exchangeLineToken("/compare")).resolves.toBe("redirecting");
    expect(liff.login).toHaveBeenCalledOnce();
  });

  it("inside the LINE app it reloads instead of liff.login(), which does nothing there", async () => {
    liff.isInClient.mockReturnValue(true);
    const { exchangeLineToken } = await load();
    await expect(exchangeLineToken("/compare")).resolves.toBe("redirecting");
    expect(liff.logout).toHaveBeenCalledOnce();
    expect(reload).toHaveBeenCalledOnce();
    expect(liff.login).not.toHaveBeenCalled();
  });

  it("says when the LIFF app itself has no openid scope", async () => {
    liff.getContext.mockReturnValue({ scope: ["profile"] });
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const { exchangeLineToken, NO_OPENID_SCOPE } = await load();
    await exchangeLineToken("/compare");
    await expect(exchangeLineToken("/compare")).rejects.toThrow(NO_OPENID_SCOPE);
  });

  it("never re-logs in when sessionStorage is blocked", async () => {
    vi.stubGlobal("sessionStorage", {
      getItem: () => {
        throw new Error("blocked");
      },
    });
    const { exchangeLineToken, NO_ID_TOKEN } = await load();
    await expect(exchangeLineToken("/compare")).rejects.toThrow(NO_ID_TOKEN);
    expect(liff.login).not.toHaveBeenCalled();
  });
});

describe("with an ID token", () => {
  it("exchanges it for the site session and clears the re-login flag", async () => {
    liff.getIDToken.mockReturnValue("id-token");
    sessionStorage.setItem("finlens.login.relogin", "1");
    const { exchangeLineToken } = await load();
    await expect(exchangeLineToken("/compare")).resolves.toBe("ok");
    expect(fetchMock).toHaveBeenCalledWith("/api/auth/line", expect.objectContaining({ method: "POST", body: JSON.stringify({ idToken: "id-token" }) }));
    expect(sessionStorage.getItem("finlens.login.relogin")).toBeNull();
    expect(liff.logout).not.toHaveBeenCalled();
  });
});

describe("signOut (ปุ่มออกจากระบบ)", () => {
  it("clears the site session and calls liff.logout()", async () => {
    sessionStorage.setItem("finlens.login.relogin", "1");
    sessionStorage.setItem("finlens.login.next", "/compare");
    const { signOut } = await load();
    await signOut();
    expect(fetchMock).toHaveBeenCalledWith("/api/auth/logout", { method: "POST" });
    expect(liff.init).toHaveBeenCalled();
    expect(liff.logout).toHaveBeenCalledOnce();
    expect(sessionStorage.getItem("finlens.login.relogin")).toBeNull();
    expect(sessionStorage.getItem("finlens.login.next")).toBeNull();
  });
});
