create table if not exists public.watch_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  episode_id uuid not null references public.episodes(id) on delete cascade,
  position_seconds integer not null default 0 check (position_seconds >= 0),
  duration_seconds integer not null default 0 check (duration_seconds >= 0),
  completed boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, episode_id)
);

create table if not exists public.watchlist (
  user_id uuid not null references auth.users(id) on delete cascade,
  series_id uuid not null references public.series(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, series_id)
);

create index if not exists watch_progress_user_updated_idx
  on public.watch_progress(user_id, updated_at desc);

create index if not exists watchlist_user_created_idx
  on public.watchlist(user_id, created_at desc);

alter table public.watch_progress enable row level security;
alter table public.watchlist enable row level security;

grant select, insert, update, delete on public.watch_progress, public.watchlist to authenticated;

drop policy if exists "Users manage their watch progress" on public.watch_progress;
create policy "Users manage their watch progress"
  on public.watch_progress for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "Users manage their watchlist" on public.watchlist;
create policy "Users manage their watchlist"
  on public.watchlist for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
