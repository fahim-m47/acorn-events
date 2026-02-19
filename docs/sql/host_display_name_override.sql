-- Allow per-event host display names (used for limited, allowlisted admin posting)

alter table public.events
  add column if not exists host_display_name text;

update public.events
set host_display_name = null
where host_display_name is not null
  and length(trim(host_display_name)) = 0;

alter table public.events
  drop constraint if exists events_host_display_name_length_check;

alter table public.events
  add constraint events_host_display_name_length_check check (
    host_display_name is null
    or (
      length(trim(host_display_name)) > 0
      and length(host_display_name) <= 100
    )
  );
