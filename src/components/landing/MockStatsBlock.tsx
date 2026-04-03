import { formatPnl, formatRR } from "@/lib/utils";

interface MockStats {
  pnl: number;
  winRate: number;
  count: number;
  avgRR: number;
}

export function MockStatsBlock({ stats }: { stats: MockStats }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      <div>
        <div className="text-xs text-text-3 font-dm-sans mb-1">P&L</div>
        <div className="text-sm font-dm-mono font-medium text-green">
          {formatPnl(stats.pnl)}
        </div>
      </div>
      <div>
        <div className="text-xs text-text-3 font-dm-sans mb-1">Win Rate</div>
        <div className="text-sm font-dm-mono font-medium text-text">
          {stats.winRate}%
        </div>
      </div>
      <div>
        <div className="text-xs text-text-3 font-dm-sans mb-1">Trades</div>
        <div className="text-sm font-dm-mono font-medium text-text">
          {stats.count}
        </div>
      </div>
      <div>
        <div className="text-xs text-text-3 font-dm-sans mb-1">Avg R:R</div>
        <div className="text-sm font-dm-mono font-medium text-green">
          {formatRR(stats.avgRR)}
        </div>
      </div>
    </div>
  );
}
