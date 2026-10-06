alter table public.episodes
  add column if not exists bunny_video_id text,
  add column if not exists bunny_library_id bigint,
  add column if not exists video_processing_status text not null default 'none',
  add column if not exists video_encode_progress integer,
  add column if not exists video_storage_bytes bigint,
  add column if not exists video_error text,
  add column if not exists video_ready_at timestamptz;

alter table public.episodes
  drop constraint if exists episodes_video_processing_status_check;

alter table public.episodes
  add constraint episodes_video_processing_status_check
  check (video_processing_status in ('none', 'created', 'uploading', 'processing', 'ready', 'error'));

alter table public.episodes
  drop constraint if exists episodes_video_encode_progress_check;

alter table public.episodes
  add constraint episodes_video_encode_progress_check
  check (video_encode_progress is null or (video_encode_progress >= 0 and video_encode_progress <= 100));

create unique index if not exists episodes_bunny_video_id_uidx
  on public.episodes(bunny_video_id)
  where bunny_video_id is not null;

create index if not exists episodes_video_processing_status_idx
  on public.episodes(video_processing_status);

comment on column public.episodes.bunny_video_id is 'Bunny Stream video GUID. Never stores a Bunny API key.';
comment on column public.episodes.bunny_library_id is 'Bunny Stream library ID used for this video.';
comment on column public.episodes.video_processing_status is 'Normalized FeedLoves lifecycle for Bunny video processing.';