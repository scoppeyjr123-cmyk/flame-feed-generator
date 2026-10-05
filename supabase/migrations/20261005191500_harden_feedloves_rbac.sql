revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;

create index if not exists audit_logs_admin_id_idx on public.audit_logs(admin_id);
create index if not exists episodes_plan_id_idx on public.episodes(plan_id);
create index if not exists media_created_by_idx on public.media(created_by);
create index if not exists series_created_by_idx on public.series(created_by);
create index if not exists series_updated_by_idx on public.series(updated_by);
create index if not exists site_settings_updated_by_idx on public.site_settings(updated_by);
create index if not exists subscription_history_performed_by_idx on public.subscription_history(performed_by);
create index if not exists subscriptions_created_by_idx on public.subscriptions(created_by);
create index if not exists subscriptions_updated_by_idx on public.subscriptions(updated_by);
