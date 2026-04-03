import type { Trade } from "@/types";

// --- Filter ---

export function filterByDays(trades: Trade[], days: number) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return trades.filter((t) => new Date(t.created_at) >= cutoff);
}

// --- Main Stats ---

export function calcStats(trades: Trade[]) {
  const wins = trades.filter((t) => t.result === "win").length;
  const losses = trades.filter((t) => t.result === "loss").length;
  const totalPnl = trades.reduce((s, t) => s + (t.pnl ?? 0), 0);
  const winRate = trades.length > 0 ? Math.round((wins / trades.length) * 100) : 0;
  const rrTrades = trades.filter((t) => t.rr !== null);
  const avgRR = rrTrades.length > 0 ? rrTrades.reduce((s, t) => s + (t.rr ?? 0), 0) / rrTrades.length : 0;
  const grossProfit = trades.filter((t) => (t.pnl ?? 0) > 0).reduce((s, t) => s + (t.pnl ?? 0), 0);
  const grossLoss = Math.abs(trades.filter((t) => (t.pnl ?? 0) < 0).reduce((s, t) => s + (t.pnl ?? 0), 0));
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;

  const allMoods = trades.flatMap((t) => t.mood ?? []);
  const moodCounts = allMoods.reduce((acc, m) => ({ ...acc, [m]: (acc[m] ?? 0) + 1 }), {} as Record<string, number>);
  const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  const avgAdherence = trades.filter((t) => t.plan_adherence !== null).reduce((s, t) => s + (t.plan_adherence ?? 0), 0) / (trades.filter((t) => t.plan_adherence !== null).length || 1);

  const sorted = [...trades].sort((a, b) => (b.pnl ?? 0) - (a.pnl ?? 0));
  const best = sorted[0] ?? null;
  const worst = sorted[sorted.length - 1] ?? null;

  return { wins, losses, totalPnl, winRate, avgRR, grossProfit, grossLoss, profitFactor, topMood, avgAdherence, best, worst };
}

// --- Balance Curve (cumulative PnL) ---

export function calcBalanceCurve(trades: Trade[]) {
  const sorted = [...trades].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  let cumulative = 0;
  return sorted.map((t) => {
    cumulative += t.pnl ?? 0;
    return {
      date: new Date(t.created_at).toLocaleDateString("uz-UZ", { day: "numeric", month: "short" }),
      balance: parseFloat(cumulative.toFixed(2)),
    };
  });
}

// --- Daily PnL ---

export function calcDailyPnl(trades: Trade[]) {
  const days: Record<string, number> = {};
  trades.forEach((t) => {
    const d = new Date(t.created_at).toLocaleDateString("uz-UZ");
    days[d] = (days[d] ?? 0) + (t.pnl ?? 0);
  });
  return Object.entries(days)
    .slice(-28)
    .map(([date, pnl]) => ({
      date,
      pnl: parseFloat(pnl.toFixed(2)),
    }));
}

// --- Session Performance ---

export function calcSessionPerformance(trades: Trade[]) {
  const sessions = ["Asian", "London", "New York", "London + NY"] as const;
  return sessions
    .map((session) => {
      const st = trades.filter((t) => t.session === session);
      if (st.length === 0) return null;
      const wins = st.filter((t) => t.result === "win").length;
      const pnl = st.reduce((s, t) => s + (t.pnl ?? 0), 0);
      return {
        session,
        count: st.length,
        wins,
        winRate: Math.round((wins / st.length) * 100),
        pnl: parseFloat(pnl.toFixed(2)),
      };
    })
    .filter(Boolean) as { session: string; count: number; wins: number; winRate: number; pnl: number }[];
}

// --- Direction Performance (LONG vs SHORT) ---

export function calcDirectionPerformance(trades: Trade[]) {
  return (["LONG", "SHORT"] as const).map((dir) => {
    const dt = trades.filter((t) => t.direction === dir);
    const wins = dt.filter((t) => t.result === "win").length;
    const pnl = dt.reduce((s, t) => s + (t.pnl ?? 0), 0);
    return {
      direction: dir,
      count: dt.length,
      wins,
      winRate: dt.length > 0 ? Math.round((wins / dt.length) * 100) : 0,
      pnl: parseFloat(pnl.toFixed(2)),
    };
  });
}

// --- Timeframe Performance ---

export function calcTimeframePerformance(trades: Trade[]) {
  const tfs: Record<string, { count: number; wins: number; pnl: number }> = {};
  trades.forEach((t) => {
    const tf = t.timeframe;
    if (!tf) return;
    if (!tfs[tf]) tfs[tf] = { count: 0, wins: 0, pnl: 0 };
    tfs[tf].count++;
    if (t.result === "win") tfs[tf].wins++;
    tfs[tf].pnl += t.pnl ?? 0;
  });

  const order = ["M1", "M5", "M15", "M30", "H1", "H4", "D1"];
  return Object.entries(tfs)
    .sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0]))
    .map(([timeframe, d]) => ({
      timeframe,
      count: d.count,
      wins: d.wins,
      winRate: Math.round((d.wins / d.count) * 100),
      pnl: parseFloat(d.pnl.toFixed(2)),
    }));
}

// --- Confluence Performance ---

export function calcConfluencePerformance(trades: Trade[]) {
  const tags: Record<string, { count: number; wins: number; pnl: number }> = {};

  for (const t of trades) {
    const confluences = t.confluence ?? [];
    for (const tag of confluences) {
      if (!tags[tag]) tags[tag] = { count: 0, wins: 0, pnl: 0 };
      tags[tag].count++;
      if (t.result === "win") tags[tag].wins++;
      tags[tag].pnl += t.pnl ?? 0;
    }
  }

  return Object.entries(tags)
    .filter(([, s]) => s.count >= 2)
    .map(([tag, s]) => ({
      tag,
      count: s.count,
      wins: s.wins,
      winRate: Math.round((s.wins / s.count) * 100),
      pnl: parseFloat(s.pnl.toFixed(2)),
    }))
    .sort((a, b) => b.winRate - a.winRate);
}

// --- Checklist Performance ---

export function calcChecklistPerformance(trades: Trade[]) {
  const allItems = new Set<string>();
  trades.forEach((t) => {
    if (t.checklist) Object.keys(t.checklist).forEach((k) => allItems.add(k));
  });

  const results: {
    item: string;
    checkedCount: number;
    uncheckedCount: number;
    checkedWinRate: number | null;
    uncheckedWinRate: number | null;
    winRateDelta: number;
    checkedPnl: number;
  }[] = [];

  for (const item of allItems) {
    const checked = trades.filter((t) => t.checklist?.[item] === true);
    const unchecked = trades.filter((t) => t.checklist?.[item] === false);

    const cWR = checked.length > 0
      ? Math.round((checked.filter((t) => t.result === "win").length / checked.length) * 100)
      : null;
    const uWR = unchecked.length > 0
      ? Math.round((unchecked.filter((t) => t.result === "win").length / unchecked.length) * 100)
      : null;

    results.push({
      item,
      checkedCount: checked.length,
      uncheckedCount: unchecked.length,
      checkedWinRate: cWR,
      uncheckedWinRate: uWR,
      winRateDelta: (cWR ?? 0) - (uWR ?? 0),
      checkedPnl: parseFloat(checked.reduce((s, t) => s + (t.pnl ?? 0), 0).toFixed(2)),
    });
  }

  return results.sort((a, b) => b.winRateDelta - a.winRateDelta);
}

// --- Asset Performance (enhanced) ---

export function calcAssetPerformance(trades: Trade[]) {
  const assets: Record<string, { count: number; wins: number; pnl: number }> = {};
  trades.forEach((t) => {
    const a = t.asset ?? "Other";
    if (!assets[a]) assets[a] = { count: 0, wins: 0, pnl: 0 };
    assets[a].count++;
    if (t.result === "win") assets[a].wins++;
    assets[a].pnl += t.pnl ?? 0;
  });

  return Object.entries(assets)
    .sort((a, b) => b[1].count - a[1].count)
    .map(([asset, d]) => ({
      asset,
      count: d.count,
      wins: d.wins,
      winRate: Math.round((d.wins / d.count) * 100),
      pnl: parseFloat(d.pnl.toFixed(2)),
    }));
}
