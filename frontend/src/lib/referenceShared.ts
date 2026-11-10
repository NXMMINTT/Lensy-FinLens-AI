/**
 * Types, labels and small helpers for the investment reference that client components can import
 * without pulling the whole reference-data.json into the browser bundle. Data lives in reference.ts.
 */
export type RefStatus = "official" | "source-checked" | "definition" | "media" | "partial" | "stale" | "unchecked";

/**
 * Status words say what was checked, never that an authority approved it ("ตรงกับ", not "รับรอง"):
 * checking a document is not certification by the SEC or the Bank of Thailand.
 */
export const REF_STATUS_LABEL: Record<RefStatus, string> = {
  official: "ตรงกับแหล่งทางการ",
  "source-checked": "ตรวจกับต้นทางแล้ว เฉพาะข้อที่ระบุ",
  definition: "นิยามจากเอกสารทางการ ตัวเลขต้องตรวจแยก",
  media: "จากสื่อ/ผู้ให้บริการ ยังไม่เทียบต้นทาง",
  partial: "ตรวจได้บางส่วน ขาดตัวเลขสำคัญ",
  stale: "ข้อมูลเก่าหรือขัดแย้ง ต้องเช็กซ้ำ",
  unchecked: "ยังไม่ได้ตรวจสอบ",
};

/** What a topic card needs: one figure (or a short summary), its date and status. */
export type RefCardData = {
  id: string;
  cat: number;
  title: string;
  status: RefStatus;
  headline: { value: string; label: string } | null;
  summary: string;
  asOf: string;
  /** false: the team's audit says this topic's figures may not be shown yet (they are left out) */
  showFigures: boolean;
};

/** Anchor id of one topic line on /explain, e.g. "ref-4-14". */
export function refAnchor(id: string): string {
  return `ref-${id.replace(".", "-")}`;
}

/** URL segment of a topic page: "4.14" -> "4-14". */
export function refSlug(id: string): string {
  return id.replace(".", "-");
}

/** Where a topic opens: its own page, or its line on /explain when nothing has been checked yet. */
export function refPath(id: string, status: RefStatus): string {
  return status !== "unchecked" ? `/reference/${refSlug(id)}` : `/explain#${refAnchor(id)}`;
}

/** Short as-of text for a card: the first date when the topic lists several. */
export function shortAsOf(asOf: string): string {
  return asOf.split(" / ")[0].trim();
}

/** What the topic comparison table needs for one topic (no check steps; sources only as a count). */
export type RefCompareData = RefCardData & {
  what: string;
  facts: string[];
  risk: string;
  note: string;
  sourceCount: number;
};

/** One-line names for the icon menu where the group's full name would wrap (full name stays as the tooltip). */
export const GROUP_SHORT: Record<string, string> = { "7": "โภคภัณฑ์", "9": "คริปโต" };
