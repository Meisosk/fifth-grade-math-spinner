-- Run once in the Supabase SQL Editor (Dashboard -> SQL Editor -> New query).

-- One row per user from the sign-in dropdown, holding that user's spinner names.
create table if not exists name_lists (
  user_name text primary key,
  names text[] not null default '{}',
  updated_at timestamptz not null default now()
);

-- RLS on with no policies: the browser (anon key) can't read or write this table.
-- Only server/index.js, which uses the service role key, can.
alter table name_lists enable row level security;

insert into name_lists (user_name) values ('4B'), ('5Math')
on conflict (user_name) do nothing;
