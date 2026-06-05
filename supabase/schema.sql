-- BT multiplayer schema.
-- Private/test V1: RLS is enabled with permissive policies so the anon key can
-- create rooms, join players and play rounds. Harden these policies before a
-- public multiplayer release.

create extension if not exists pgcrypto;

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  host_name text not null,
  status text not null default 'lobby',
  game_mode text null,
  current_round_index integer not null default 0,
  round_started_at timestamp with time zone null,
  revealed_at timestamp with time zone null,
  finished_at timestamp with time zone null,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint rooms_status_check check (status in ('lobby', 'playing', 'reveal', 'finished'))
);

alter table public.rooms
  add column if not exists current_round_index integer not null default 0,
  add column if not exists round_started_at timestamp with time zone null,
  add column if not exists revealed_at timestamp with time zone null,
  add column if not exists finished_at timestamp with time zone null;

alter table public.rooms drop constraint if exists rooms_status_check;
alter table public.rooms
  add constraint rooms_status_check
  check (status in ('lobby', 'playing', 'reveal', 'finished'));

create table if not exists public.room_players (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  nickname text not null,
  is_host boolean not null default false,
  joined_at timestamp with time zone not null default now(),
  last_seen_at timestamp with time zone not null default now()
);

create table if not exists public.room_tracks (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  round_index integer not null,
  track_data jsonb not null,
  created_at timestamp with time zone not null default now(),
  constraint room_tracks_round_unique unique (room_id, round_index)
);

create table if not exists public.room_answers (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  player_id uuid not null references public.room_players(id) on delete cascade,
  round_index integer not null,
  answer_value text not null,
  is_correct boolean not null,
  created_at timestamp with time zone not null default now(),
  constraint room_answers_player_round_unique unique (room_id, player_id, round_index)
);

create index if not exists rooms_code_idx on public.rooms(code);
create index if not exists room_players_room_id_idx on public.room_players(room_id);
create index if not exists room_tracks_room_id_idx on public.room_tracks(room_id);
create index if not exists room_answers_room_id_idx on public.room_answers(room_id);
create index if not exists room_answers_player_id_idx on public.room_answers(player_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists rooms_set_updated_at on public.rooms;
create trigger rooms_set_updated_at
before update on public.rooms
for each row
execute function public.set_updated_at();

alter table public.rooms enable row level security;
alter table public.room_players enable row level security;
alter table public.room_tracks enable row level security;
alter table public.room_answers enable row level security;

drop policy if exists "rooms_select_v1" on public.rooms;
create policy "rooms_select_v1"
on public.rooms for select
using (true);

drop policy if exists "rooms_insert_v1" on public.rooms;
create policy "rooms_insert_v1"
on public.rooms for insert
with check (true);

drop policy if exists "rooms_update_v1" on public.rooms;
create policy "rooms_update_v1"
on public.rooms for update
using (true)
with check (true);

drop policy if exists "rooms_delete_v1" on public.rooms;
create policy "rooms_delete_v1"
on public.rooms for delete
using (true);

drop policy if exists "room_players_select_v1" on public.room_players;
create policy "room_players_select_v1"
on public.room_players for select
using (true);

drop policy if exists "room_players_insert_v1" on public.room_players;
create policy "room_players_insert_v1"
on public.room_players for insert
with check (true);

drop policy if exists "room_players_update_v1" on public.room_players;
create policy "room_players_update_v1"
on public.room_players for update
using (true)
with check (true);

drop policy if exists "room_tracks_select_v1" on public.room_tracks;
create policy "room_tracks_select_v1"
on public.room_tracks for select
using (true);

drop policy if exists "room_tracks_insert_v1" on public.room_tracks;
create policy "room_tracks_insert_v1"
on public.room_tracks for insert
with check (true);

drop policy if exists "room_tracks_update_v1" on public.room_tracks;
create policy "room_tracks_update_v1"
on public.room_tracks for update
using (true)
with check (true);

drop policy if exists "room_tracks_delete_v1" on public.room_tracks;
create policy "room_tracks_delete_v1"
on public.room_tracks for delete
using (true);

drop policy if exists "room_answers_select_v1" on public.room_answers;
create policy "room_answers_select_v1"
on public.room_answers for select
using (true);

drop policy if exists "room_answers_insert_v1" on public.room_answers;
create policy "room_answers_insert_v1"
on public.room_answers for insert
with check (true);

drop policy if exists "room_answers_update_v1" on public.room_answers;
create policy "room_answers_update_v1"
on public.room_answers for update
using (true)
with check (true);

drop policy if exists "room_answers_delete_v1" on public.room_answers;
create policy "room_answers_delete_v1"
on public.room_answers for delete
using (true);
