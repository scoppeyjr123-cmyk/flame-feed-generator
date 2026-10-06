create or replace function public.get_published_episode_catalog(target_series_id uuid default null)
returns table (
  id uuid,
  series_id uuid,
  episode_number integer,
  title text,
  description text,
  thumbnail_url text,
  duration_seconds integer,
  status public.content_status,
  access_type public.episode_access_type,
  plan_id uuid,
  plan_name text,
  sort_order integer
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    e.id,
    e.series_id,
    e.episode_number,
    e.title,
    e.description,
    e.thumbnail_url,
    e.duration_seconds,
    e.status,
    e.access_type,
    e.plan_id,
    p.name as plan_name,
    e.sort_order
  from public.episodes e
  left join public.plans p on p.id = e.plan_id
  where e.status = 'published'
    and (target_series_id is null or e.series_id = target_series_id)
  order by e.sort_order, e.episode_number;
$$;

revoke all on function public.get_published_episode_catalog(uuid) from public;
grant execute on function public.get_published_episode_catalog(uuid) to anon, authenticated;
