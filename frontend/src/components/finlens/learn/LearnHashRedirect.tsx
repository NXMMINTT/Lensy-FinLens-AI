"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Older links pointed into one long page (/learn#b, /learn#q45). Each group is now its own chapter
 * page, so such a link is sent on to the chapter (and the question inside it).
 */
export function LearnHashRedirect({ chapters }: { chapters: { id: string; first: number; last: number }[] }) {
  const router = useRouter();
  useEffect(() => {
    const hash = decodeURIComponent(window.location.hash.slice(1));
    if (!hash) return;
    const byId = chapters.find((c) => c.id === hash);
    if (byId) return router.replace(`/learn/${byId.id}`);
    const n = Number(/^q(\d+)$/.exec(hash)?.[1]);
    const byQ = n ? chapters.find((c) => n >= c.first && n <= c.last) : undefined;
    if (byQ) router.replace(`/learn/${byQ.id}#q${n}`);
  }, [chapters, router]);
  return null;
}
