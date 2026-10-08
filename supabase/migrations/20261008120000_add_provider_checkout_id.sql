alter table public.checkout_settings
  add column if not exists provider_checkout_id text;

create unique index if not exists checkout_settings_provider_checkout_id_idx
  on public.checkout_settings(provider_checkout_id)
  where provider_checkout_id is not null;
