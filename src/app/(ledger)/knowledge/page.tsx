"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { UFox } from "@/components/brand/UFox";
import { useKnowledgeTopics, useTopicAudio, useTopicScript } from "@/hooks/knowledge/useKnowledge";
import { useI18n } from "@/lib/i18n";
import type { KnowledgeTopic } from "@/types/knowledge";

const CATEGORY_STYLE: Record<string, string> = {
  ภาษี: "bg-sun-soft text-sun-ink",
  การตลาด: "bg-sky-deep text-brand-dark dark:text-brand-light",
  แพลตฟอร์ม: "bg-[#EDE9FE] text-[#6D28D9] dark:bg-[#2e1065] dark:text-[#c4b5fd]",
  ส่งออก: "bg-success-soft text-success-ink",
};

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function TopicCard({ topic }: { topic: KnowledgeTopic }) {
  const { tr, locale } = useI18n();
  const script = useTopicScript();
  const audio = useTopicAudio();
  const [open, setOpen] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const cleanupAudio = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    el.pause();
    el.removeAttribute("src");
    el.load();
    audioRef.current = null;
    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, []);

  useEffect(() => () => cleanupAudio(), [cleanupAudio]);

  function toggle() {
    setOpen((v) => !v);
    if (!open && !script.data && !script.isPending) script.mutate(topic.topic_id);
  }

  function play() {
    if (audioRef.current) {
      if (playing) {
        audioRef.current.pause();
        setPlaying(false);
      } else {
        audioRef.current.play().catch(() => {});
        setPlaying(true);
      }
      return;
    }

    audio.mutate({ topicId: topic.topic_id, lang: locale }, {
      onSuccess: (data) => {
        cleanupAudio();
        const el = new Audio(`data:${data.audio_mime};base64,${data.audio_base64}`);
        audioRef.current = el;
        el.addEventListener("loadedmetadata", () => setDuration(el.duration));
        el.addEventListener("timeupdate", () => setCurrentTime(el.currentTime));
        el.addEventListener("ended", () => {
          setPlaying(false);
          setCurrentTime(0);
        });
        el.play().then(() => setPlaying(true)).catch(() => {});
      },
    });
  }

  function stop() {
    cleanupAudio();
  }

  function seek(e: React.ChangeEvent<HTMLInputElement>) {
    const t = Number(e.target.value);
    if (audioRef.current) audioRef.current.currentTime = t;
    setCurrentTime(t);
  }

  const hasAudio = audioRef.current !== null;
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const categoryLabel = tr(`cat.${topic.category}`) !== `cat.${topic.category}` ? tr(`cat.${topic.category}`) : topic.category;

  return (
    <article className="flex flex-col gap-3 rounded-[24px] bg-surface p-5 shadow-[0_2px_14px_rgba(0,0,0,0.05)]">
      <span className={`self-start rounded-full px-3 py-1 text-[12px] font-bold ${CATEGORY_STYLE[topic.category] ?? "bg-line-subtle text-ink-body"}`}>
        {categoryLabel}
      </span>
      <h2 className="m-0 text-[18px] font-bold leading-snug text-ink">{topic.title}</h2>
      <ul className="m-0 flex list-disc flex-col gap-1.5 pl-5 text-[15px] text-ink-body">
        {topic.outline.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <button type="button" onClick={toggle} className="text-[15px] font-semibold text-brand no-underline">
          {open ? tr("knowledge.hideSummary") : tr("knowledge.readSummary")}
        </button>
        <button
          type="button"
          onClick={play}
          disabled={audio.isPending}
          className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-brand no-underline disabled:opacity-60"
        >
          {audio.isPending ? tr("knowledge.generating") : playing ? tr("knowledge.pause") : hasAudio ? tr("knowledge.resume") : tr("knowledge.listen")}
        </button>
        {hasAudio && (
          <button
            type="button"
            onClick={stop}
            className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-expense no-underline"
          >
            {tr("knowledge.stop")}
          </button>
        )}
      </div>

      {hasAudio && (
        <div className="flex items-center gap-3">
          <span className="min-w-[40px] text-[13px] tabular-nums text-ink-muted">{formatTime(currentTime)}</span>
          <div className="relative flex-1">
            <div className="h-[6px] overflow-hidden rounded-full bg-line-subtle">
              <div className="h-full rounded-full bg-brand transition-[width] duration-200" style={{ width: `${progress}%` }} />
            </div>
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={currentTime}
              onChange={seek}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />
          </div>
          <span className="min-w-[40px] text-right text-[13px] tabular-nums text-ink-muted">{formatTime(duration)}</span>
        </div>
      )}

      {audio.error && <p className="m-0 text-[14px] text-expense">{audio.error.message}</p>}

      {open && (
        <div className="rounded-2xl bg-brand-tint px-4 py-3 text-[15px] leading-relaxed text-ink-body">
          {script.isPending && <p className="m-0 text-ink-muted">{tr("knowledge.summarizing")}</p>}
          {script.error && <p className="m-0 text-expense">{tr("knowledge.summaryError")} {script.error.message}</p>}
          {script.data && <p className="m-0 whitespace-pre-line">{script.data.script}</p>}
        </div>
      )}
    </article>
  );
}

export default function KnowledgePage() {
  const { tr } = useI18n();
  const topics = useKnowledgeTopics();
  const [category, setCategory] = useState<string | null>(null);

  const categories = topics.data ? [...new Set(topics.data.map((t) => t.category))] : [];
  const shown = topics.data?.filter((t) => !category || t.category === category) ?? [];

  return (
    <div className="flex flex-col gap-5 pb-4">
      <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-sky-deep to-brand-tint px-6 py-6">
        <div className="flex items-start gap-4">
          <div className="min-w-0 flex-1">
            <p className="m-0 text-[22px] font-bold leading-tight text-ink">{tr("knowledge.title")}</p>
            <p className="m-0 mt-1 text-[15px] text-ink-body">{tr("knowledge.subtitle")}</p>
          </div>
          <UFox size={90} pose="idea" className="shrink-0" />
        </div>
      </section>

      {topics.error && (
        <p className="m-0 rounded-3xl bg-danger-soft p-6 text-expense">{tr("knowledge.loadError")} {topics.error.message}</p>
      )}
      {topics.isLoading && <p className="m-0 rounded-3xl bg-surface p-6 text-center text-ink-muted">{tr("knowledge.loading")}</p>}

      {topics.data && (
        <>
          <nav className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
            <button
              type="button"
              onClick={() => setCategory(null)}
              className={`min-h-[40px] flex-none rounded-full px-4 text-[14px] font-semibold ${!category ? "bg-navy text-white" : "border-2 border-sky-line bg-surface text-ink-body"}`}
            >
              {tr("knowledge.all")}
            </button>
            {categories.map((c) => {
              const label = tr(`cat.${c}`) !== `cat.${c}` ? tr(`cat.${c}`) : c;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`min-h-[40px] flex-none rounded-full px-4 text-[14px] font-semibold ${category === c ? "bg-navy text-white" : "border-2 border-sky-line bg-surface text-ink-body"}`}
                >
                  {label}
                </button>
              );
            })}
          </nav>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] gap-4">
            {shown.map((topic) => (
              <TopicCard key={topic.topic_id} topic={topic} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
