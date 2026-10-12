create table if not exists public.pending_payment_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'wiapy',
  event_key text not null unique,
  email text not null,
  checkout_id text not null,
  payment_status text not null,
  payload jsonb not null default '{}'::jsonb,
  processed_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists pending_payment_events_email_idx
  on public.pending_payment_events (lower(email)) where processed_at is null;
alter table public.pending_payment_events enable row level security;
revoke all on public.pending_payment_events from anon, authenticated;

create or replace function public.claim_pending_payment_for_user(target_user_id uuid, target_email text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  pending record;
  checkout_plan uuid;
  subscription_id uuid;
  claimed integer := 0;
  subscription jsonb;
begin
  for pending in
    select * from public.pending_payment_events
    where processed_at is null and lower(email) = lower(trim(target_email))
    order by created_at asc
  loop
    select plan_id into checkout_plan from public.checkout_settings where provider_checkout_id = pending.checkout_id limit 1;
    if checkout_plan is null then continue; end if;
    subscription := case when jsonb_typeof(pending.payload->'subscription') = 'object' then pending.payload->'subscription' else '{}'::jsonb end;
    insert into public.subscriptions (user_id, plan_id, status, starts_at, expires_at, renews_at, origin, provider_subscription_id, notes)
    values (
      target_user_id, checkout_plan,
      case when pending.payment_status = 'paid' then 'active'::public.subscription_status
           when pending.payment_status in ('refunded','chargedback') then 'cancelled'::public.subscription_status
           else 'expired'::public.subscription_status end,
      coalesce(nullif(subscription->>'dt_start','')::timestamptz, now()),
      nullif(subscription->>'dt_end','')::timestamptz,
      nullif(subscription->>'next_billing','')::timestamptz,
      'wiapy', coalesce(nullif(subscription->>'id',''), pending.payload->'payment'->>'id'),
      'Vinculado automaticamente após criação da conta'
    ) returning id into subscription_id;
    update public.pending_payment_events set processed_at = now() where id = pending.id;
    claimed := claimed + 1;
  end loop;
  return claimed;
end;
$$;
revoke all on function public.claim_pending_payment_for_user(uuid,text) from public, anon, authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, email)
  values (new.id, new.raw_user_meta_data ->> 'name', new.email)
  on conflict (id) do update set email = excluded.email;
  insert into public.user_roles (user_id, role)
  values (new.id, 'customer'::public.app_role)
  on conflict (user_id) do nothing;
  perform public.claim_pending_payment_for_user(new.id, new.email);
  return new;
end;
$$;
