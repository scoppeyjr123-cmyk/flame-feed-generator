-- Global free viewing allowance. The allowance is shared across every episode.
create or replace function private.free_watch_seconds(target_user_id uuid)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(sum(least(coalesce(wp.position_seconds, 0), coalesce(wp.duration_seconds, 0))), 0)::integer
  from public.watch_progress wp
  where wp.user_id = target_user_id;
$$;

create or replace function public.get_free_watch_usage()
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select private.free_watch_seconds((select auth.uid()));
$$;
revoke all on function public.get_free_watch_usage() from public;
grant execute on function public.get_free_watch_usage() to authenticated;

create or replace function private.has_free_watch_remaining(target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select private.free_watch_seconds(target_user_id) < 1200;
$$;

create or replace function public.limit_free_watch_progress()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  used_seconds integer;
  existing_seconds integer;
  remaining_seconds integer;
begin
  if not exists (
    select 1 from public.subscriptions
    where user_id = new.user_id
      and status in ('active'::public.subscription_status, 'lifetime'::public.subscription_status)
      and (status = 'lifetime'::public.subscription_status or expires_at is null or expires_at > now())
  ) then
    select coalesce(sum(least(coalesce(position_seconds, 0), coalesce(duration_seconds, 0))), 0)::integer
      into used_seconds
      from public.watch_progress
      where user_id = new.user_id and episode_id <> new.episode_id;
    select coalesce(position_seconds, 0)::integer into existing_seconds
      from public.watch_progress
      where user_id = new.user_id and episode_id = new.episode_id;
    remaining_seconds := greatest(0, 1200 - used_seconds);
    new.position_seconds := least(greatest(coalesce(new.position_seconds, 0), coalesce(existing_seconds, 0)), remaining_seconds);
    new.completed := new.completed and new.position_seconds >= greatest(coalesce(new.duration_seconds, 0) - 3, 0);
  end if;
  return new;
end;
$$;

drop trigger if exists limit_free_watch_progress on public.watch_progress;
create trigger limit_free_watch_progress
before insert or update on public.watch_progress
for each row execute function public.limit_free_watch_progress();

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
  select (
    target_access = 'free'::public.episode_access_type
    and (select auth.uid()) is not null
    and private.has_free_watch_remaining((select auth.uid()))
  )
  or (
    (select auth.uid()) is not null
    and private.has_active_subscription(
      case when target_access = 'specific_plan'::public.episode_access_type then target_plan_id else null end
    )
  );
$$;
