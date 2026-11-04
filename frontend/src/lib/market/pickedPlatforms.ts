const PICKED_KEY = "mr-platforms";

/** Platforms chosen on /market/platforms (per-viewer convenience, so localStorage). */
export function loadPickedPlatforms(): string[] | null {
  try {
    const raw = window.localStorage.getItem(PICKED_KEY);
    return raw ? (JSON.parse(raw) as string[]) : null;
  } catch {
    return null;
  }
}

export function savePickedPlatforms(ids: string[]): void {
  try {
    window.localStorage.setItem(PICKED_KEY, JSON.stringify(ids));
  } catch {
    // storage blocked (private mode) — the choice just isn't remembered
  }
}
