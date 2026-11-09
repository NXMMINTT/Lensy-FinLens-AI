import { IconRail, type RailItem } from "../app/IconRail";

/** The compare page's menu: funds, or the topics of one group; each item is its own URL. */
export function ComparePicker({ cat, fundsCount, groups }: { cat: number | null; fundsCount: number; groups: { num: number; title: string; count: number }[] }) {
  const items: RailItem[] = [
    { key: "funds", label: "กองทุน", count: fundsCount, href: "/compare" },
    ...groups.map((g) => ({ key: String(g.num), label: g.title, count: g.count, href: `/compare?cat=${g.num}` })),
  ];
  return <IconRail label="เทียบอะไร" items={items} active={cat === null ? "funds" : String(cat)} />;
}
