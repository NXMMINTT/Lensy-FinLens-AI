/**
 * "130 คำถามก่อนลงทุน" for the public /learn page. General knowledge, not figures of any fund.
 * Bodies use a small Markdown subset rendered by components/finlens/learn/MiniMarkdown:
 * paragraphs, **bold**, "- " and "1. " lists, | tables |, "> " quotes and "$$ " formula lines.
 * Figures in the bodies are labelled examples (ตัวอย่างสมมติ), never a product's real numbers.
 */
import data from "./learn-data.json";

export type LearnItem = { n: number; q: string; body: string };
export type LearnGroup = { id: string; letter: string; title: string; intro: string; sources: string; items: LearnItem[] };

export const LEARN: LearnGroup[] = data;

export const LEARN_COUNT = LEARN.reduce((n, g) => n + g.items.length, 0);

/** A group as a chapter title: "คำถามด้านภาษีการลงทุน" -> "ภาษีการลงทุน". */
export function chapterTitle(g: LearnGroup): string {
  return g.title.replace(/^คำถาม(เรื่อง|ด้าน|เกี่ยวกับ)?/, "");
}

export function learnGroup(id: string): LearnGroup | undefined {
  return LEARN.find((g) => g.id === id);
}
