"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipProps } from "recharts";

import { baht } from "@/lib/money";
import { useTheme } from "@/lib/theme";

/** Categorical slots, validated for CVD separation and contrast in both modes (dataviz validator). */
export const SERIES_COLORS = {
  light: ["#1A7637", "#2a78d6", "#c04f9a", "#d9822b"],
  dark: ["#3c9a4b", "#3987e5", "#d0589f", "#e8953a"],
} as const;

const CHROME = {
  light: { grid: "#E2F0E7", axis: "#82968A", ref: "#82968A", surface: "#FFFFFF" },
  dark: { grid: "#2D4237", axis: "#96AC9F", ref: "#96AC9F", surface: "#1A2620" },
} as const;

export type ChartSeries = { key: string; name: string; slot: number };
export type ChartRow = { year: number; gross: number } & Record<string, number>;

const compact = new Intl.NumberFormat("th-TH", { notation: "compact", maximumFractionDigits: 1 });

function ChartTooltip({ active, payload, label, series }: TooltipProps<number, string> & { series: ChartSeries[] }) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload as ChartRow;
  return (
    <div className="min-w-[220px] rounded-xl border border-line bg-surface px-3 py-2 text-[13px] shadow-lg">
      <div className="mb-1 font-semibold text-ink">{label === 0 ? "ตอนเริ่ม (หลังค่าธรรมเนียมขาย)" : `สิ้นปีที่ ${label}`}</div>
      {series.map((s) => (
        <div key={s.key} className="flex items-center justify-between gap-3 text-ink-body">
          <span className="flex items-center gap-1.5">
            <i className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: `var(--series-${s.slot + 1})` }} />
            {s.name}
          </span>
          <b className="text-ink">{baht(row[s.key])}</b>
        </div>
      ))}
      <div className="mt-1 flex items-center justify-between gap-3 border-t border-line pt-1 text-ink-muted">
        <span>ถ้าไม่มีค่าธรรมเนียมเลย</span>
        <span>{baht(row.gross)}</span>
      </div>
    </div>
  );
}

/** Money over the years for the selected funds, plus a dashed no-fee reference line. One y-axis (baht). */
export function CostChart({ rows, series }: { rows: ChartRow[]; series: ChartSeries[] }) {
  const { resolved } = useTheme();
  const colors = SERIES_COLORS[resolved];
  const chrome = CHROME[resolved];
  const last = rows.length - 1;

  return (
    <div
      className="h-[320px] w-full md:h-[380px]"
      style={Object.fromEntries(series.map((s) => [`--series-${s.slot + 1}`, colors[s.slot]])) as React.CSSProperties}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={rows} margin={{ top: 12, right: 24, bottom: 8, left: 4 }}>
          <CartesianGrid stroke={chrome.grid} vertical={false} />
          <XAxis
            dataKey="year"
            tickLine={false}
            axisLine={{ stroke: chrome.grid }}
            tick={{ fill: chrome.axis, fontSize: 12 }}
            tickFormatter={(y: number) => (y === 0 ? "เริ่ม" : `ปี ${y}`)}
            interval="preserveStartEnd"
            minTickGap={24}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: chrome.axis, fontSize: 12 }}
            tickFormatter={(v: number) => compact.format(v)}
            width={56}
            domain={["auto", "auto"]}
          />
          <Tooltip content={<ChartTooltip series={series} />} cursor={{ stroke: chrome.axis, strokeDasharray: "3 3" }} />
          <Line
            dataKey="gross"
            name="ถ้าไม่มีค่าธรรมเนียมเลย"
            stroke={chrome.ref}
            strokeWidth={1.5}
            strokeDasharray="5 5"
            dot={false}
            activeDot={false}
            isAnimationActive={false}
          />
          {series.map((s) => (
            <Line
              key={s.key}
              dataKey={s.key}
              name={s.name}
              stroke={colors[s.slot]}
              strokeWidth={2}
              dot={(p: { index: number; cx: number; cy: number }) =>
                p.index === last ? <circle key={`end-${s.key}`} cx={p.cx} cy={p.cy} r={4.5} fill={colors[s.slot]} stroke={chrome.surface} strokeWidth={2} /> : <g key={`d-${s.key}-${p.index}`} />
              }
              activeDot={{ r: 5, strokeWidth: 2 }}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
