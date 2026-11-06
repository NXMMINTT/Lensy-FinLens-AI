/** How each kind of source is named next to a figure. Browser-safe (no data or fs imports). */
import type { DocSource } from "./schema";

export const SOURCE_LABEL: Record<DocSource, string> = {
  factsheet: "Factsheet",
  prospectus: "หนังสือชี้ชวน",
  master: "เอกสารกองทุนหลัก",
  sec: "ข้อมูลจาก ก.ล.ต.",
};

/** "หน้า 2 · Factsheet", or just the source when there is no page (SEC data). */
export function sourceRef(page: number | null, source: DocSource): string {
  return page === null ? SOURCE_LABEL[source] : `หน้า ${page} · ${SOURCE_LABEL[source]}`;
}
