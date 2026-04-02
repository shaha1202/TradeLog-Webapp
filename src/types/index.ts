export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  plan: "free" | "pro_monthly" | "pro_quarterly";
  plan_expires_at: string | null;
  account_balance: number | null;
  default_risk: number;
  currency: string;
  main_pair: string | null;
  feedback_enabled: boolean;
  created_at: string;
}

export interface Trade {
  id: string;
  user_id: string;
  asset: string | null;
  timeframe: string | null;
  session: string | null;
  direction: "LONG" | "SHORT" | null;
  entry: number | null;
  sl: number | null;
  tp: number | null;
  rr: number | null;
  lot_size: number | null;
  risk_percent: number | null;
  risk_dollar: number | null;
  pnl: number | null;
  result: "win" | "loss" | "be" | null;
  htf_trend: string | null;
  confluence: string[] | null;
  ai_narrative: string | null;
  ai_feedback: string | null;
  checklist: Record<string, boolean> | null;
  mood: string[] | null;
  plan_adherence: number | null;
  went_well: string | null;
  improve: string | null;
  created_at: string;
}

export interface AIAnalysisResult {
  asset: string | null;
  timeframe: string | null;
  session: string | null;
  direction: "LONG" | "SHORT" | null;
  entry: number | null;
  sl: number | null;
  tp: number | null;
  trend: string | null;
  narrative: string | null;
  feedback: string | null;
}
