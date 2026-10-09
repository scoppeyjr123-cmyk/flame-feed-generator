alter table public.episodes
  add column if not exists video_source text not null default 'bunny',
  add column if not exists telegram_chat_id text,
  add column if not exists telegram_message_id bigint,
  add column if not exists telegram_file_id text,
  add column if not exists telegram_import_status text not null default 'not_configured',
  add column if not exists telegram_import_error text;

alter table public.episodes
  drop constraint if exists episodes_video_source_check;

alter table public.episodes
  add constraint episodes_video_source_check
  check (video_source in ('bunny', 'url', 'telegram'));

alter table public.episodes
  drop constraint if exists episodes_telegram_import_status_check;

alter table public.episodes
  add constraint episodes_telegram_import_status_check
  check (telegram_import_status in ('not_configured', 'pending', 'importing', 'ready', 'error'));

create index if not exists episodes_telegram_source_idx
  on public.episodes(video_source, telegram_chat_id, telegram_message_id)
  where video_source = 'telegram';

comment on column public.episodes.video_source is 'Source selected for playback/import: bunny, url, or telegram.';
comment on column public.episodes.telegram_file_id is 'Telegram file identifier captured by the private import integration. Never expose bot credentials.';
