"use client";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from "recharts";

function getColors() {
  if (typeof window === "undefined") {
    return { green: "#2d6a4f", red: "#9b2226", teal: "#0f766e", text: "#1a1814", text3: "#a09890", border: "#e2ddd4" };
  }
  const cs = getComputedStyle(document.documentElement);
  return {
    green: cs.getPropertyValue("--green").trim() || "#2d6a4f",
    red: cs.getPropertyValue("--red").trim() || "#9b2226",
    teal: cs.getPropertyValue("--teal").trim() || "#0f766e",
    text: cs.getPropertyValue("--text").trim() || "#1a1814",
    text3: cs.getPropertyValue("--text-3").trim() || "#a09890",
    border: cs.getPropertyValue("--border").trim() || "#e2ddd4",
  };
}

// --- Balance Curve (AreaChart) ---

interface BalanceCurveProps {
  data: { date: string; balance: number }[];
}

export function BalanceCurveChart({ data }: BalanceCurveProps) {
  const c = getColors();
  const isPositive = data.length > 0 && data[data.length - 1].balance >= 0;
  const mainColor = isPositive ? c.green : c.red;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={mainColor} stopOpacity={0.2} />
            <stop offset="95%" stopColor={mainColor} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={c.border} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: c.text3, fontFamily: "DM Mono" }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 10, fill: c.text3, fontFamily: "DM Mono" }}
          axisLine={false}
          tickLine={false}
          width={50}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            fontSize: "12px",
            fontFamily: "DM Mono",
            boxShadow: "var(--shadow)",
          }}
          labelStyle={{ color: "var(--text-3)", fontSize: "10px" }}
        />
        <Area
          type="monotone"
          dataKey="balance"
          stroke={mainColor}
          strokeWidth={2}
          fill="url(#balanceGrad)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// --- Daily PnL (BarChart) ---

interface DailyPnlProps {
  data: { date: string; pnl: number }[];
}

export function DailyPnlChart({ data }: DailyPnlProps) {
  const c = getColors();

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={c.border} vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 9, fill: c.text3, fontFamily: "DM Mono" }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 10, fill: c.text3, fontFamily: "DM Mono" }}
          axisLine={false}
          tickLine={false}
          width={50}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            fontSize: "12px",
            fontFamily: "DM Mono",
            boxShadow: "var(--shadow)",
          }}
          labelStyle={{ color: "var(--text-3)", fontSize: "10px" }}
        />
        <Bar dataKey="pnl" radius={[3, 3, 0, 0]} maxBarSize={20}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.pnl >= 0 ? c.green : c.red} opacity={0.85} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// --- Confluence Performance (horizontal BarChart) ---

interface ConfluenceChartProps {
  data: { tag: string; winRate: number; count: number; pnl: number }[];
}

export function ConfluenceChart({ data }: ConfluenceChartProps) {
  const c = getColors();

  return (
    <ResponsiveContainer width="100%" height={data.length * 36 + 20}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 40, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={c.border} horizontal={false} />
        <XAxis
          type="number"
          domain={[0, 100]}
          tick={{ fontSize: 10, fill: c.text3, fontFamily: "DM Mono" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => `${v}%`}
        />
        <YAxis
          type="category"
          dataKey="tag"
          tick={{ fontSize: 11, fill: c.text, fontFamily: "DM Sans" }}
          axisLine={false}
          tickLine={false}
          width={100}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            fontSize: "12px",
            fontFamily: "DM Mono",
            boxShadow: "var(--shadow)",
          }}
          labelStyle={{ color: "var(--text-3)", fontSize: "10px" }}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(value: any) => [`${value}%`, "Win Rate"]}
        />
        <Bar dataKey="winRate" radius={[0, 4, 4, 0]} maxBarSize={20}>
          {data.map((entry, i) => (
            <Cell
              key={i}
              fill={entry.winRate >= 55 ? c.green : entry.winRate >= 40 ? c.teal : c.red}
              opacity={0.85}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
