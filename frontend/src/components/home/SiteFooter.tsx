import { UFoxFace } from "@/components/brand/UFoxFace";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-6 px-6 py-10 text-[15px]">
        <div className="flex items-center gap-3">
          <UFoxFace size={44} />
          <div>
            <div className="text-[22px] font-extrabold text-brand">FinLens AI</div>
            <div className="text-ink-muted">“คู่ธุรกิจ SME ที่รู้ทั้งตัวเลข และทั้งโลก”</div>
          </div>
        </div>
        <div className="text-ink-muted">U-Hackathon 2026 · Future of Finance &amp; Community</div>
      </div>
    </footer>
  );
}
