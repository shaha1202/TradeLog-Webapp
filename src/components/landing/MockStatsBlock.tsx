"use client";

import { useCountUp } from "@/lib/hooks";

interface MockStats {
  pnl: number;
  winRate: number;
  count: number;
  avgRR: number;
}

export function MockStatsBlock({ stats }: { stats: MockStats }) {
  const pnl = useCountUp({ target: stats.pnl, decimals: 2, prefix: "+$", duration: 1400 });
  const wr = useCountUp({ target: stats.winRate, decimals: 0, suffix: "%", duration: 900 });
  const cnt = useCountUp({ target: stats.count, decimals: 0, duration: 600 });
  const rr = useCountUp({ target: stats.avgRR, decimals: 2, suffix: "R", duration: 900 });

  return (
    <div className="bg-surface border border-border rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      <div>
        <div className="text-xs text-text-3 font-dm-sans mb-1">P&L</div>
        <div ref={pnl.ref as React.RefObject<HTMLDivElement>} className="text-sm font-dm-mono font-medium text-green">
          {pnl.display}
        </div>
      </div>
      <div>
        <div className="text-xs text-text-3 font-dm-sans mb-1">Win Rate</div>
        <div ref={wr.ref as React.RefObject<HTMLDivElement>} className="text-sm font-dm-mono font-medium text-text">
          {wr.display}
        </div>
      </div>
      <div>
        <div className="text-xs text-text-3 font-dm-sans mb-1">Trades</div>
        <div ref={cnt.ref as React.RefObject<HTMLDivElement>} className="text-sm font-dm-mono font-medium text-text">
          {cnt.display}
        </div>
      </div>
      <div>
        <div className="text-xs text-text-3 font-dm-sans mb-1">Avg R:R</div>
        <div ref={rr.ref as React.RefObject<HTMLDivElement>} className="text-sm font-dm-mono font-medium text-green">
          {rr.display}
        </div>
      </div>
    </div>
  );
}
