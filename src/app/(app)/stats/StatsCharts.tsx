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
  PieChart,
  Pie,
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
          hide={true}
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

// --- Checklist Pie Chart (all items in one chart) ---

const PIE_COLORS = [
  "#2d6a4f", "#0f766e", "#b45309", "#7c3aed", "#dc2626",
  "#0369a1", "#4d7c0f", "#be185d", "#6d28d9", "#0e7490",
  "#a16207", "#15803d", "#9f1239", "#1d4ed8", "#c2410c",
];

interface ChecklistPieData {
  item: string;
  checkedCount: number;
  uncheckedCount: number;
  checkedWinRate: number | null;
  uncheckedWinRate: number | null;
  winRateDelta: number;
  checkedPnl: number;
}

interface ChecklistPieChartProps {
  data: ChecklistPieData[];
  labels: { checked: string; unchecked: string; tradeCount: string };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, labels: tipLabels }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as ChecklistPieData & { percent: number };
  return (
    <div
      style={{
        backgroundColor: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "8px",
        padding: "8px 12px",
        fontSize: "12px",
        fontFamily: "DM Mono",
        boxShadow: "var(--shadow)",
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 4, fontFamily: "DM Sans" }}>{d.item}</div>
      <div style={{ color: "var(--text-2)", fontSize: "11px" }}>{tipLabels.checked}: {d.checkedCount} ({d.checkedWinRate ?? "—"}%)</div>
      <div style={{ color: "var(--text-2)", fontSize: "11px" }}>{tipLabels.unchecked}: {d.uncheckedCount} ({d.uncheckedWinRate ?? "—"}%)</div>
      <div style={{ color: d.winRateDelta >= 0 ? "var(--green)" : "var(--red)", fontSize: "11px", marginTop: 2 }}>
        {d.winRateDelta > 0 ? "+" : ""}{d.winRateDelta}pp
      </div>
    </div>
  );
}

export function ChecklistPieChart({ data, labels }: ChecklistPieChartProps) {
  if (data.length === 0) return null;

  const totalChecks = data.reduce((s, d) => s + d.checkedCount, 0);
  const pieData = data.map((d) => ({
    ...d,
    value: d.checkedCount,
    percent: totalChecks > 0 ? Math.round((d.checkedCount / totalChecks) * 100) : 0,
  }));

  return (
    <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6">
      <div style={{ width: 200, height: 200, flexShrink: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={90}
              dataKey="value"
              stroke="none"
              startAngle={90}
              endAngle={-270}
              paddingAngle={2}
            >
              {pieData.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} opacity={0.85} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip labels={labels} />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex-1 w-full">
        <div className="space-y-2">
          {pieData.map((d, i) => (
            <div key={d.item} className="flex items-center gap-2.5">
              <div
                className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
              />
              <div className="flex-1 flex items-center justify-between">
                <span className="text-[11px] md:text-[12px] text-text font-medium truncate">{d.item}</span>
                <div className="flex items-center gap-3 ml-2 flex-shrink-0">
                  <span className="text-[10px] md:text-[11px] text-text-3">{d.checkedCount} {labels.tradeCount}</span>
                  <span
                    className="text-[11px] md:text-[12px] font-dm-mono font-medium"
                    style={{ color: d.winRateDelta >= 0 ? "var(--green)" : "var(--red)" }}
                  >
                    {d.winRateDelta > 0 ? "+" : ""}{d.winRateDelta}pp
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
