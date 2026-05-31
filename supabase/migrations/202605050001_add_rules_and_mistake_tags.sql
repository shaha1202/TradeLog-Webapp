alter table public.profiles
  add column if not exists trading_rules text[];

alter table public.trades
  add column if not exists mistake_tags text[],
  add column if not exists rule_checklist jsonb;
