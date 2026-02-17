-- Waitlist feature migration

alter table public.events
  add column if not exists capacity integer check (capacity > 0);

create table if not exists public.event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  status text not null check (status in ('going', 'waitlist')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  waitlisted_at timestamptz,
  going_at timestamptz,
  unique (event_id, user_id),
  constraint waitlisted_requires_timestamp check (
    status <> 'waitlist' or waitlisted_at is not null
  ),
  constraint going_requires_timestamp check (
    status <> 'going' or going_at is not null
  )
);

create index if not exists idx_event_registrations_event_status
  on public.event_registrations(event_id, status);

create index if not exists idx_event_registrations_waitlist
  on public.event_registrations(event_id, waitlisted_at, created_at, id)
  where status = 'waitlist';

create index if not exists idx_event_registrations_user
  on public.event_registrations(user_id);

create or replace function public.set_event_registrations_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_event_registrations_updated_at on public.event_registrations;
create trigger trg_event_registrations_updated_at
before update on public.event_registrations
for each row
execute function public.set_event_registrations_updated_at();

alter table public.event_registrations enable row level security;

drop policy if exists "Event registrations visible to owner or event creator"
  on public.event_registrations;
create policy "Event registrations visible to owner or event creator"
  on public.event_registrations
  for select
  using (
    auth.uid() = user_id
    or exists (
      select 1
      from public.events e
      where e.id = event_id
        and e.creator_id = auth.uid()
    )
  );

drop policy if exists "Users can insert own event registrations"
  on public.event_registrations;
create policy "Users can insert own event registrations"
  on public.event_registrations
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own event registrations"
  on public.event_registrations;
create policy "Users can update own event registrations"
  on public.event_registrations
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own event registrations"
  on public.event_registrations;
create policy "Users can delete own event registrations"
  on public.event_registrations
  for delete
  using (auth.uid() = user_id);

grant select, insert, update, delete on table public.event_registrations to authenticated;

create or replace function public.join_event(p_event_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_creator_id uuid;
  v_capacity integer;
  v_going_count integer;
  v_existing_status text;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  perform pg_advisory_xact_lock(hashtext(p_event_id::text));

  select creator_id, capacity
  into v_creator_id, v_capacity
  from public.events
  where id = p_event_id;

  if not found then
    raise exception 'Event not found';
  end if;

  if v_capacity is null then
    raise exception 'Event has unlimited capacity';
  end if;

  if v_user_id = v_creator_id then
    raise exception 'Creator cannot RSVP to own event';
  end if;

  select status
  into v_existing_status
  from public.event_registrations
  where event_id = p_event_id
    and user_id = v_user_id;

  if found then
    return v_existing_status;
  end if;

  select count(*)
  into v_going_count
  from public.event_registrations
  where event_id = p_event_id
    and status = 'going';

  if v_going_count < v_capacity then
    insert into public.event_registrations (
      event_id,
      user_id,
      status,
      going_at,
      waitlisted_at
    )
    values (
      p_event_id,
      v_user_id,
      'going',
      now(),
      null
    );

    return 'going';
  end if;

  insert into public.event_registrations (
    event_id,
    user_id,
    status,
    going_at,
    waitlisted_at
  )
  values (
    p_event_id,
    v_user_id,
    'waitlist',
    null,
    now()
  );

  return 'waitlist';
end;
$$;

create or replace function public.leave_event(p_event_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_creator_id uuid;
  v_removed_status text;
  v_capacity integer;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  perform pg_advisory_xact_lock(hashtext(p_event_id::text));

  select creator_id, capacity
  into v_creator_id, v_capacity
  from public.events
  where id = p_event_id;

  if not found then
    raise exception 'Event not found';
  end if;

  delete from public.event_registrations
  where event_id = p_event_id
    and user_id = v_user_id
  returning status
  into v_removed_status;

  if v_removed_status = 'going' and v_capacity is not null then
    with next_up as (
      select id
      from public.event_registrations
      where event_id = p_event_id
        and status = 'waitlist'
        and user_id <> v_creator_id
      order by waitlisted_at asc, created_at asc, id asc
      limit 1
      for update skip locked
    )
    update public.event_registrations er
    set
      status = 'going',
      going_at = now(),
      updated_at = now()
    from next_up
    where er.id = next_up.id;
  end if;

  return coalesce(v_removed_status, 'none');
end;
$$;

create or replace function public.get_event_capacity_snapshot(p_event_id uuid)
returns table (
  capacity integer,
  seats_remaining integer,
  going_count integer,
  waitlist_count integer,
  is_full boolean,
  user_status text,
  waitlist_position integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_creator_id uuid;
  v_capacity integer;
begin
  select e.creator_id, e.capacity
  into v_creator_id, v_capacity
  from public.events e
  where e.id = p_event_id;

  if not found or v_capacity is null then
    return;
  end if;

  return query
  with counts as (
    select
      count(*) filter (where er.status = 'going')::integer as going_count,
      count(*) filter (where er.status = 'waitlist')::integer as waitlist_count
    from public.event_registrations er
    where er.event_id = p_event_id
      and er.user_id <> v_creator_id
  ),
  me as (
    select
      er.id,
      er.status,
      er.waitlisted_at,
      er.created_at
    from public.event_registrations er
    where er.event_id = p_event_id
      and er.user_id = v_user_id
      and er.user_id <> v_creator_id
    limit 1
  ),
  wait_pos as (
    select case
      when exists (select 1 from me where status = 'waitlist')
      then (
        select count(*)::integer
        from public.event_registrations er, me
        where er.event_id = p_event_id
          and er.status = 'waitlist'
          and er.user_id <> v_creator_id
          and (
            er.waitlisted_at < me.waitlisted_at
            or (er.waitlisted_at = me.waitlisted_at and er.created_at < me.created_at)
            or (er.waitlisted_at = me.waitlisted_at and er.created_at = me.created_at and er.id <= me.id)
          )
      )
      else null::integer
    end as waitlist_position
  )
  select
    v_capacity,
    greatest(v_capacity - counts.going_count, 0)::integer as seats_remaining,
    counts.going_count,
    counts.waitlist_count,
    (counts.going_count >= v_capacity) as is_full,
    (select status from me),
    wait_pos.waitlist_position
  from counts
  cross join wait_pos;
end;
$$;

grant execute on function public.join_event(uuid) to authenticated;
grant execute on function public.leave_event(uuid) to authenticated;
grant execute on function public.get_event_capacity_snapshot(uuid) to anon, authenticated;
