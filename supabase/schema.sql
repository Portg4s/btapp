-- BT multiplayer lobby schema.
-- V1 privée/test : RLS est activee avec policies permissives pour permettre
-- creation/join/lobby via la cle anon. Durcir ces policies avant une V1 publique.

create extension if not exists pgcrypto;

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  host_name text not null,
  status text not null default 'lobby',
  game_mode text null,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint rooms_status_check check (status in ('lobby', 'playing', 'finished'))
);

create table if not exists public.room_players (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  nickname text not null,
  is_host boolean not null default false,
  joined_at timestamp with time zone not null default now(),
  last_seen_at timestamp with time zone not null default now()
);

create index if not exists rooms_code_idx on public.rooms(code);
create index if not exists room_players_room_id_idx on public.room_players(room_id);

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
