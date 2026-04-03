import { formatPnl, formatRR, pnlColor, rrColor } from "@/lib/utils";

interface MockTrade {
  asset: string;
  direction: "LONG" | "SHORT";
  result: "win" | "loss" | "be";
  pnl: number;
  rr: number;
  timeframe: string;
  session: string;
}

export function MockTradeCard({ trade }: { trade: MockTrade }) {
  const resultColors = {
    win: { bg: "bg-green-bg", border: "border-green-br", text: "text-green" },
    loss: { bg: "bg-red-bg", border: "border-red-br", text: "text-red" },
    be: { bg: "bg-amber-bg", border: "border-amber-br", text: "text-amber" },
  };
  const rc = resultColors[trade.result];
  const directionColor =
    trade.direction === "LONG" ? "text-green" : "text-red";

  return (
    <div className="bg-surface border border-border rounded-xl p-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-dm-mono font-medium shrink-0 ${rc.bg} ${rc.text}`}
        >
          {trade.result === "win" ? "W" : trade.result === "loss" ? "L" : "BE"}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-text font-dm-sans">
              {trade.asset}
            </span>
            <span
              className={`text-xs font-dm-mono font-medium ${directionColor}`}
            >
              {trade.direction}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-text-3 font-dm-sans">
              {trade.timeframe}
            </span>
            <span className="text-xs text-text-3">·</span>
            <span className="text-xs text-text-3 font-dm-sans">
              {trade.session}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4 shrink-0">
        <div className="text-right">
          <div
            className={`text-sm font-dm-mono font-medium ${pnlColor(trade.pnl)}`}
          >
            {formatPnl(trade.pnl)}
          </div>
          <div
            className={`text-xs font-dm-mono ${rrColor(trade.rr)}`}
          >
            {formatRR(trade.rr)}
          </div>
        </div>
      </div>
    </div>
  );
}
