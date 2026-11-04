import Link from "next/link";

import { UFoxFace } from "@/components/brand/UFoxFace";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2.5 text-[21px] font-extrabold tracking-tight text-ink no-underline">
      <UFoxFace size={40} />
      <span>
        Fin<span className="text-brand">Lens</span> AI
      </span>
    </Link>
  );
}
