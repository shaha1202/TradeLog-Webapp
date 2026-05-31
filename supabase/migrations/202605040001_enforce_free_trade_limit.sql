create or replace function public.enforce_free_trade_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  user_plan text;
  expires_at timestamptz;
  existing_trades integer;
begin
  select plan, plan_expires_at
    into user_plan, expires_at
    from public.profiles
    where id = new.user_id;

  if user_plan in ('pro_monthly', 'pro_quarterly')
    and (expires_at is null or expires_at > now()) then
    return new;
  end if;

  select count(*)
    into existing_trades
    from public.trades
    where user_id = new.user_id;

  if existing_trades >= 3 then
    raise exception 'free_trade_limit_reached' using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_free_trade_limit_before_insert on public.trades;

create trigger enforce_free_trade_limit_before_insert
before insert on public.trades
for each row execute function public.enforce_free_trade_limit();
