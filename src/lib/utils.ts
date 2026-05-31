export function formatPnl(pnl: number | null, currency = "USD"): string {
  if (pnl === null || pnl === undefined) return "—";
  const prefix = currency === "USD" ? "$" : currency === "EUR" ? "€" : "";
  const sign = pnl >= 0 ? "+" : "";
  return `${sign}${prefix}${Math.abs(pnl).toFixed(2)}`;
}

export function formatRR(rr: number | null): string {
  if (rr === null || rr === undefined) return "—";
  return `${rr.toFixed(2)}R`;
}

export function calcRR(entry: number, sl: number, tp: number): number {
  const risk = Math.abs(entry - sl);
  const reward = Math.abs(tp - entry);
  if (risk === 0) return 0;
  return parseFloat((reward / risk).toFixed(2));
}

export function rrColor(rr: number | null): string {
  if (rr === null) return "";
  if (rr >= 2) return "text-[var(--green)]";
  if (rr >= 1) return "text-[var(--amber)]";
  return "text-[var(--red)]";
}

export function pnlColor(pnl: number | null): string {
  if (pnl === null) return "";
  if (pnl > 0) return "text-[var(--green)]";
  if (pnl < 0) return "text-[var(--red)]";
  return "text-[var(--text-2)]";
}

type AppLang = "en" | "uz" | "ru";

export function formatDate(dateStr: string, lang: AppLang = "uz"): string {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) {
    return lang === "en" ? "Today" : lang === "ru" ? "Сегодня" : "Bugun";
  }
  if (d.toDateString() === yesterday.toDateString()) {
    return lang === "en" ? "Yesterday" : lang === "ru" ? "Вчера" : "Kecha";
  }
  const locale = lang === "en" ? "en-US" : lang === "ru" ? "ru-RU" : "uz-UZ";
  return d.toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatTime(dateStr: string, lang: AppLang = "uz"): string {
  const locale = lang === "en" ? "en-US" : lang === "ru" ? "ru-RU" : "uz-UZ";
  return new Date(dateStr).toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function groupTradesByDate(trades: { created_at: string }[]) {
  const groups: Record<string, typeof trades> = {};
  trades.forEach((t) => {
    const key = formatDate(t.created_at);
    if (!groups[key]) groups[key] = [];
    groups[key].push(t);
  });
  return groups;
}

export function getInitials(name: string | null): string {
  if (!name) return "T";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
