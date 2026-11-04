"use client";

import { useEffect, useRef, useState } from "react";

import { UFoxFace } from "@/components/brand/UFoxFace";
import { UFoxLive } from "@/components/brand/UFoxLive";
import { Card } from "@/components/ui/Card";
import { LineIcon } from "@/components/ui/LineIcon";
import { useAskUFox } from "@/hooks/market/useAskUFox";
import { useCompetitorPrices } from "@/hooks/market/useCompetitorPrices";
import { apiFetchBlob } from "@/lib/api-client";
import { useLocale } from "@/lib/i18n";
type Message = { role: "user" | "bot" | "error"; text: string };

/** U-Fox answers use Markdown **bold** for the key recommendation; render just that. */
function BotText({ text }: { text: string }) {
  return text
    .split(/(\*\*[^*]+\*\*)/g)
    .map((part, i) => (part.startsWith("**") && part.endsWith("**") ? <strong key={i}>{part.slice(2, -2)}</strong> : part));
}

/** Plays a U-Fox answer through ElevenLabs (/api/voice/speak); audio is fetched once and reused. */
function SpeakButton({ text }: { text: string }) {
  const th = useLocale();
  const t = th.marketRadar.chat;
  const [state, setState] = useState<"idle" | "loading" | "playing" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  async function play() {
    if (state === "playing") {
      audioRef.current?.pause();
      setState("idle");
      return;
    }
    try {
      if (!audioRef.current) {
        setState("loading");
        const blob = await apiFetchBlob("/api/voice/speak", {
          method: "POST",
          body: JSON.stringify({ text: text.replace(/\*\*/g, "") }),
        });
        audioRef.current = new Audio(URL.createObjectURL(blob));
        audioRef.current.onended = () => setState("idle");
      }
      audioRef.current.currentTime = 0;
      await audioRef.current.play();
      setState("playing");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setState("error");
    }
  }

  return (
    <div className="mt-1.5 flex flex-col gap-1">
      <button
        type="button"
        onClick={play}
        disabled={state === "loading"}
        aria-label={t.listen}
        className="inline-flex min-h-[36px] items-center gap-1.5 self-start rounded-full bg-brand-soft px-3.5 text-sm font-semibold text-brand disabled:opacity-50"
      >
        <LineIcon name={state === "playing" ? "pause" : "speaker"} size={16} />
        {state === "loading" ? t.voiceLoading : state === "playing" ? t.stop : t.listen}
      </button>
      {state === "error" && <span className="text-xs text-danger-ink">{error}</span>}
    </div>
  );
}

export default function UFoxChatPage() {
  const th = useLocale();
  const t = th.marketRadar.chat;
  const prices = useCompetitorPrices();
  const ask = useAskUFox();
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, ask.isPending]);

  function send(question: string) {
    const text = question.trim();
    if (!text || ask.isPending) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setDraft("");
    ask.mutate(
      { question: text, product_id: prices.data?.product_id },
      {
        onSuccess: (res) => setMessages((m) => [...m, { role: "bot", text: res.answer }]),
        onError: (err) => setMessages((m) => [...m, { role: "error", text: err.message }]),
      },
    );
  }

  const p = prices.data;

  return (
    <div className="flex flex-wrap items-start gap-[22px]">
      <Card className="flex min-w-0 flex-[999_1_560px] flex-col gap-4">
        <div>
          <h2 className="m-0 text-xl font-bold">{t.title}</h2>
          <p className="m-0 text-[15px] text-ink-muted">{t.subtitle}</p>
        </div>

        <div className="flex min-h-[360px] flex-col gap-3 rounded-[24px] bg-[#DCEBFD] p-4 md:p-5">
          {messages.length === 0 && (
            <div className="m-auto flex flex-col items-center gap-2 text-center">
              <UFoxLive size={160} pose="line" bubbleSide="right" tips={["ถามเรื่องราคา คู่แข่ง หรือภาษีได้เลยค่ะ", "กดคำถามด้านล่างก็ได้นะ", "หนูตอบเป็นเสียงได้ด้วย!"]} />
              <p className="m-0 font-hand text-lg font-semibold text-brand">{t.empty}</p>
            </div>
          )}
          {messages.map((m, i) =>
            m.role === "user" ? (
              <div key={i} className="max-w-[85%] animate-pop self-end whitespace-pre-wrap rounded-[20px] rounded-br-md bg-chat px-4 py-2.5 text-[#0F2A12]">
                {m.text}
              </div>
            ) : (
              <div key={i} className="flex max-w-[90%] animate-pop items-end gap-2.5 self-start">
                <UFoxFace size={34} />
                <div
                  className={`whitespace-pre-wrap rounded-[20px] rounded-bl-md px-4 py-2.5 leading-relaxed ${
                    m.role === "error" ? "bg-danger-soft text-expense" : "bg-surface text-ink"
                  }`}
                >
                  {m.role === "bot" ? (
                    <>
                      <BotText text={m.text} />
                      <SpeakButton text={m.text} />
                    </>
                  ) : (
                    m.text
                  )}
                </div>
              </div>
            ),
          )}
          {ask.isPending && (
            <div className="flex items-end gap-2.5 self-start" aria-label={t.thinking}>
              <UFoxFace size={34} />
              <span className="flex gap-1.5 rounded-[20px] rounded-bl-md bg-surface px-5 py-4">
                {[0, 150, 300].map((d) => (
                  <span key={d} className="h-2 w-2 animate-typing rounded-full bg-brand-light" style={{ animationDelay: `${d}ms` }} />
                ))}
              </span>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="flex flex-wrap gap-2">
          {t.suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => send(s)}
              disabled={ask.isPending}
              className="inline-flex min-h-[44px] items-center rounded-full border-2 border-sky-line bg-surface px-4 text-[15px] font-medium text-ink hover:border-brand hover:text-brand disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>

        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            send(draft);
          }}
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={t.placeholder}
            aria-label={t.placeholder}
            className="min-h-[50px] min-w-0 flex-1 rounded-full border-2 border-sky-line px-5 text-[17px] focus:border-brand"
          />
          <button
            type="submit"
            disabled={ask.isPending || !draft.trim()}
            className="min-h-[50px] rounded-full bg-brand px-6 font-bold text-white disabled:opacity-50"
          >
            {t.send}
          </button>
        </form>
        <p className="text-xs text-ink-muted">{t.disclaimer}</p>
      </Card>

      {p && (
        <Card className="flex min-w-0 flex-[1_1_280px] flex-col gap-3">
          <h2 className="text-lg font-semibold">{t.contextTitle}</h2>
          <div className="text-sm font-semibold">{p.product_name}</div>
          <dl className="flex flex-col gap-2 text-sm">
            {[
              [th.marketRadar.overview.myCost, `฿${p.my_cost_price}`],
              [th.marketRadar.overview.myPrice, `฿${p.my_selling_price}`],
              [th.marketRadar.overview.median, `฿${p.price_distribution_thb.median}`],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-2 border-t border-line-subtle pt-2 first:border-t-0 first:pt-0">
                <dt className="text-ink-muted">{k}</dt>
                <dd className="font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
        </Card>
      )}
    </div>
  );
}
