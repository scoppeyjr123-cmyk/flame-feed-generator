create extension if not exists pgcrypto;

do $$
begin
  create type public.app_role as enum ('admin', 'customer');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.subscription_status as enum ('active', 'pending', 'paused', 'cancelled', 'expired', 'lifetime');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.content_status as enum ('draft', 'published', 'scheduled', 'hidden');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.episode_access_type as enum ('free', 'subscriber', 'specific_plan');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.billing_interval as enum ('week', 'month', 'year', 'lifetime');
exception
  when duplicate_object then null;
end $$;

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated;

create table if not exists public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role public.app_role not null default 'customer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  price numeric(12,2) not null check (price >= 0),
  currency text not null default 'BRL' check (char_length(currency) = 3),
  billing_interval public.billing_interval not null,
  benefits jsonb not null default '[]'::jsonb,
  active boolean not null default true,
  featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.checkout_settings (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null unique references public.plans(id) on delete cascade,
  provider text,
  primary_url text,
  alternate_url text,
  primary_enabled boolean not null default true,
  alternate_enabled boolean not null default false,
  public_parameters jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id uuid references public.plans(id) on delete restrict,
  status public.subscription_status not null default 'pending',
  starts_at timestamptz,
  expires_at timestamptz,
  renews_at timestamptz,
  origin text not null default 'checkout',
  provider_subscription_id text,
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (expires_at is null or starts_at is null or expires_at >= starts_at),
  check (status = 'lifetime' or plan_id is not null)
);

create index if not exists subscriptions_user_id_idx on public.subscriptions(user_id);
create index if not exists subscriptions_status_idx on public.subscriptions(status);
create index if not exists subscriptions_plan_id_idx on public.subscriptions(plan_id);

create table if not exists public.subscription_history (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid references public.subscriptions(id) on delete set null,
  user_id uuid not null references auth.users(id) on delete cascade,
  action text not null,
  before_data jsonb,
  after_data jsonb,
  performed_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists subscription_history_user_id_idx on public.subscription_history(user_id);
create index if not exists subscription_history_subscription_id_idx on public.subscription_history(subscription_id);

create table if not exists public.series (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  short_description text,
  description text,
  category text,
  genre text,
  cover_url text,
  banner_url text,
  thumbnail_url text,
  age_rating text,
  status public.content_status not null default 'draft',
  featured boolean not null default false,
  sort_order integer not null default 0,
  published_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists series_status_idx on public.series(status);
create index if not exists series_featured_idx on public.series(featured) where featured = true;

create table if not exists public.episodes (
  id uuid primary key default gen_random_uuid(),
  series_id uuid not null references public.series(id) on delete cascade,
  episode_number integer not null check (episode_number > 0),
  title text not null,
  description text,
  video_url text,
  video_provider text,
  duration_seconds integer check (duration_seconds is null or duration_seconds >= 0),
  thumbnail_url text,
  status public.content_status not null default 'draft',
  access_type public.episode_access_type not null default 'subscriber',
  plan_id uuid references public.plans(id) on delete restrict,
  scheduled_at timestamptz,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (series_id, episode_number),
  check (access_type <> 'specific_plan' or plan_id is not null),
  check (access_type = 'specific_plan' or plan_id is null)
);

create index if not exists episodes_series_id_idx on public.episodes(series_id);
create index if not exists episodes_status_idx on public.episodes(status);

create table if not exists public.home_sections (
  id uuid primary key default gen_random_uuid(),
  section_key text not null unique,
  title text not null,
  section_type text not null,
  visible boolean not null default true,
  sort_order integer not null default 0,
  configuration jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  id boolean primary key default true check (id),
  platform_name text not null default 'Feed Loves',
  logo_url text,
  favicon_url text,
  institutional_texts jsonb not null default '{}'::jsonb,
  subscription_settings jsonb not null default '{}'::jsonb,
  media_settings jsonb not null default '{}'::jsonb,
  content_settings jsonb not null default '{}'::jsonb,
  public_parameters jsonb not null default '{}'::jsonb,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  bucket_id text not null default 'feedloves-media',
  storage_path text not null unique,
  public_url text,
  media_type text not null,
  mime_type text,
  size_bytes bigint check (size_bytes is null or size_bytes >= 0),
  alt_text text,
  series_id uuid references public.series(id) on delete set null,
  episode_id uuid references public.episodes(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists media_series_id_idx on public.media(series_id);
create index if not exists media_episode_id_idx on public.media(episode_id);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  before_data jsonb,
  after_data jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_created_at_idx on public.audit_logs(created_at desc);
create index if not exists audit_logs_entity_idx on public.audit_logs(entity_type, entity_id);

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = (select auth.uid())
      and role = 'admin'::public.app_role
  );
$$;

create or replace function private.has_active_subscription(target_plan_id uuid default null)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.subscriptions
    where user_id = (select auth.uid())
      and status in ('active'::public.subscription_status, 'lifetime'::public.subscription_status)
      and (target_plan_id is null or plan_id = target_plan_id)
      and (status = 'lifetime'::public.subscription_status or expires_at is null or expires_at > now())
  );
$$;

create or replace function private.can_access_episode(
  target_access public.episode_access_type,
  target_plan_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select target_access = 'free'::public.episode_access_type
    or (
      (select auth.uid()) is not null
      and private.has_active_subscription(
        case when target_access = 'specific_plan'::public.episode_access_type then target_plan_id else null end
      )
    );
$$;

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function private.log_row_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  row_id text;
begin
  row_id := coalesce(to_jsonb(new)->>'id', to_jsonb(old)->>'id');

  insert into public.audit_logs (
    admin_id,
    action,
    entity_type,
    entity_id,
    before_data,
    after_data
  )
  values (
    (select auth.uid()),
    lower(tg_op),
    tg_table_name,
    row_id,
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) else null end,
    case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) else null end
  );

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, name, email)
  values (new.id, new.raw_user_meta_data ->> 'name', new.email)
  on conflict (id) do update set email = excluded.email;

  insert into public.user_roles (user_id, role)
  values (new.id, 'customer'::public.app_role)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'user_roles', 'profiles', 'plans', 'checkout_settings', 'subscriptions',
    'series', 'episodes', 'home_sections', 'site_settings'
  ] loop
    execute format('drop trigger if exists set_updated_at on public.%I', table_name);
    execute format('create trigger set_updated_at before update on public.%I for each row execute function private.set_updated_at()', table_name);
  end loop;
end $$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'user_roles', 'plans', 'checkout_settings', 'subscriptions', 'series',
    'episodes', 'home_sections', 'site_settings', 'media'
  ] loop
    execute format('drop trigger if exists audit_row_change on public.%I', table_name);
    execute format('create trigger audit_row_change after insert or update or delete on public.%I for each row execute function private.log_row_change()', table_name);
  end loop;
end $$;

grant execute on function private.is_admin() to authenticated;
grant execute on function private.has_active_subscription(uuid) to anon, authenticated;
grant execute on function private.can_access_episode(public.episode_access_type, uuid) to anon, authenticated;

alter table public.user_roles enable row level security;
alter table public.profiles enable row level security;
alter table public.plans enable row level security;
alter table public.checkout_settings enable row level security;
alter table public.subscriptions enable row level security;
alter table public.subscription_history enable row level security;
alter table public.series enable row level security;
alter table public.episodes enable row level security;
alter table public.home_sections enable row level security;
alter table public.site_settings enable row level security;
alter table public.media enable row level security;
alter table public.audit_logs enable row level security;

grant select on public.plans, public.checkout_settings, public.series, public.episodes,
  public.home_sections, public.site_settings, public.media to anon, authenticated;
grant select, insert, update, delete on public.user_roles, public.profiles,
  public.plans, public.checkout_settings, public.subscriptions, public.subscription_history,
  public.series, public.episodes, public.home_sections, public.site_settings,
  public.media, public.audit_logs to authenticated;

drop policy if exists "Admins manage user roles" on public.user_roles;
create policy "Admins manage user roles" on public.user_roles for all to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));

drop policy if exists "Users can view their role" on public.user_roles;
create policy "Users can view their role" on public.user_roles for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Admins manage profiles" on public.profiles;
create policy "Admins manage profiles" on public.profiles for all to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));

drop policy if exists "Users can view their profile" on public.profiles;
create policy "Users can view their profile" on public.profiles for select to authenticated
  using (id = (select auth.uid()));

drop policy if exists "Users can update their profile" on public.profiles;
create policy "Users can update their profile" on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

drop policy if exists "Public can view active plans" on public.plans;
create policy "Public can view active plans" on public.plans for select to anon, authenticated
  using (active = true);
drop policy if exists "Admins manage plans" on public.plans;
create policy "Admins manage plans" on public.plans for all to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));

drop policy if exists "Public can view checkout settings for active plans" on public.checkout_settings;
create policy "Public can view checkout settings for active plans" on public.checkout_settings for select to anon, authenticated
  using (exists (select 1 from public.plans where plans.id = checkout_settings.plan_id and plans.active = true));
drop policy if exists "Admins manage checkout settings" on public.checkout_settings;
create policy "Admins manage checkout settings" on public.checkout_settings for all to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));

drop policy if exists "Users can view their subscriptions" on public.subscriptions;
create policy "Users can view their subscriptions" on public.subscriptions for select to authenticated
  using (user_id = (select auth.uid()));
drop policy if exists "Admins manage subscriptions" on public.subscriptions;
create policy "Admins manage subscriptions" on public.subscriptions for all to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));

drop policy if exists "Users can view their subscription history" on public.subscription_history;
create policy "Users can view their subscription history" on public.subscription_history for select to authenticated
  using (user_id = (select auth.uid()));
drop policy if exists "Admins manage subscription history" on public.subscription_history;
create policy "Admins manage subscription history" on public.subscription_history for all to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));

drop policy if exists "Public can view published series" on public.series;
create policy "Public can view published series" on public.series for select to anon, authenticated
  using (status = 'published'::public.content_status);
drop policy if exists "Admins manage series" on public.series;
create policy "Admins manage series" on public.series for all to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));

drop policy if exists "Public can view accessible episodes" on public.episodes;
create policy "Public can view accessible episodes" on public.episodes for select to anon, authenticated
  using (
    status = 'published'::public.content_status
    and private.can_access_episode(access_type, plan_id)
  );
drop policy if exists "Admins manage episodes" on public.episodes;
create policy "Admins manage episodes" on public.episodes for all to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));

drop policy if exists "Public can view visible home sections" on public.home_sections;
create policy "Public can view visible home sections" on public.home_sections for select to anon, authenticated
  using (visible = true);
drop policy if exists "Admins manage home sections" on public.home_sections;
create policy "Admins manage home sections" on public.home_sections for all to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));

drop policy if exists "Public can view site settings" on public.site_settings;
create policy "Public can view site settings" on public.site_settings for select to anon, authenticated
  using (true);
drop policy if exists "Admins manage site settings" on public.site_settings;
create policy "Admins manage site settings" on public.site_settings for all to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));

drop policy if exists "Public can view media metadata" on public.media;
create policy "Public can view media metadata" on public.media for select to anon, authenticated
  using (true);
drop policy if exists "Admins manage media" on public.media;
create policy "Admins manage media" on public.media for all to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));

drop policy if exists "Admins view audit logs" on public.audit_logs;
create policy "Admins view audit logs" on public.audit_logs for select to authenticated
  using ((select private.is_admin()));
drop policy if exists "Admins insert audit logs" on public.audit_logs;
create policy "Admins insert audit logs" on public.audit_logs for insert to authenticated
  with check ((select private.is_admin()));

insert into storage.buckets (id, name, public)
values ('feedloves-media', 'feedloves-media', true)
on conflict (id) do nothing;

drop policy if exists "Public can view Feed Loves media" on storage.objects;
create policy "Public can view Feed Loves media" on storage.objects for select to anon, authenticated
  using (bucket_id = 'feedloves-media');
drop policy if exists "Admins upload Feed Loves media" on storage.objects;
create policy "Admins upload Feed Loves media" on storage.objects for insert to authenticated
  with check (bucket_id = 'feedloves-media' and (select private.is_admin()));
drop policy if exists "Admins update Feed Loves media" on storage.objects;
create policy "Admins update Feed Loves media" on storage.objects for update to authenticated
  using (bucket_id = 'feedloves-media' and (select private.is_admin()))
  with check (bucket_id = 'feedloves-media' and (select private.is_admin()));
drop policy if exists "Admins delete Feed Loves media" on storage.objects;
create policy "Admins delete Feed Loves media" on storage.objects for delete to authenticated
  using (bucket_id = 'feedloves-media' and (select private.is_admin()));
