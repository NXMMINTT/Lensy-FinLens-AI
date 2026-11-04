"use client";

import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { useLocale } from "@/lib/i18n";

const ACTUAL_WEEKS = 8;

/** Search interest: 8 actual weeks (solid) + 2 forecast weeks (dashed), one series. */
export function SearchTrendChart({ values }: { values: number[] }) {
  const th = useLocale();
  const t = th.marketRadar.product;
  const rows = values.map((v, i) => ({
    week: i < ACTUAL_WEEKS ? `-${ACTUAL_WEEKS - 1 - i}` : `+${i - ACTUAL_WEEKS + 1}`,
    actual: i < ACTUAL_WEEKS ? v : null,
    // the forecast starts at the last actual point so the two lines join
    forecast: i >= ACTUAL_WEEKS - 1 ? v : null,
  }));
  const label = (week: string) => (week === "-0" ? "ตอนนี้" : week.startsWith("+") ? week : `−${week.slice(1)}`);
  const tooltipLabel = (week: string) =>
    week === "-0"
      ? "สัปดาห์นี้"
      : week.startsWith("+")
        ? `อีก ${week.slice(1)} สัปดาห์ (คาดการณ์)`
        : `${week.slice(1)} สัปดาห์ก่อน`;

  return (
    <>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={rows} margin={{ left: 0, right: 12, top: 8, bottom: 0 }}>
          <CartesianGrid stroke="rgb(var(--line-subtle))" vertical={false} />
          <XAxis
            dataKey="week"
            tickFormatter={label}
            tick={{ fontSize: 10, fill: "#5A667A" }}
            interval={0}
            axisLine={{ stroke: "rgb(var(--line))" }}
            tickLine={false}
          />
          <YAxis hide domain={["dataMin - 5", "dataMax + 5"]} />
          <ReferenceLine x="-0" stroke="#CBD5E1" />
          <Tooltip labelFormatter={(w: string) => tooltipLabel(w)} formatter={(v: number) => v.toFixed(0)} />
          <Line
            type="monotone"
            dataKey="actual"
            name={t.actual}
            stroke="#1F5FBF"
            strokeWidth={2}
            dot={false}
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="forecast"
            name={t.forecast}
            stroke="#1F5FBF"
            strokeWidth={2}
            strokeDasharray="5 4"
            dot={false}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap gap-4 text-xs text-ink-body">
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-5 bg-brand" />
          {t.actual}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-0 w-5 border-t-2 border-dashed border-brand" />
          {t.forecast}
        </span>
      </div>
    </>
  );
}
