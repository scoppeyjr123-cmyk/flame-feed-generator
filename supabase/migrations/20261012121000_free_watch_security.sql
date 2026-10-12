revoke execute on function public.get_free_watch_usage() from anon;
revoke execute on function public.limit_free_watch_progress() from anon, authenticated;
grant execute on function public.get_free_watch_usage() to authenticated;
