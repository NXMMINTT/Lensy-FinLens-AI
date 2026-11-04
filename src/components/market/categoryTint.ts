// Tints rotate per category like NIGHT's trend page, so neighbouring tiles differ.
const TINTS = [
  "bg-[#EAF2FC] text-[#1F5FBF] dark:bg-brand-soft dark:text-brand-light",
  "bg-line-subtle text-ink-body",
  "bg-brand-soft text-[#174A96] dark:text-brand-light",
  "bg-sun-soft text-sun-ink",
  "bg-sky text-ink",
  "bg-success-soft text-success-ink",
];

export function categoryTint(categoryId: string): string {
  return TINTS[(Number(categoryId.replace(/\D/g, "")) - 1) % TINTS.length];
}
