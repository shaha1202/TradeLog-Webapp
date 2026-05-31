import type { Profile } from "@/types";

export const FREE_TRADE_LIMIT = 3;

const PRO_PLANS: Profile["plan"][] = ["pro_monthly", "pro_quarterly"];

export function isProPlan(profile: Pick<Profile, "plan" | "plan_expires_at"> | null | undefined): boolean {
  if (!profile || !PRO_PLANS.includes(profile.plan)) return false;
  if (!profile.plan_expires_at) return true;
  return new Date(profile.plan_expires_at).getTime() > Date.now();
}

export function isFreePlan(profile: Pick<Profile, "plan" | "plan_expires_at"> | null | undefined): boolean {
  return !isProPlan(profile);
}

export function remainingFreeTrades(currentTradeCount: number): number {
  return Math.max(0, FREE_TRADE_LIMIT - currentTradeCount);
}
