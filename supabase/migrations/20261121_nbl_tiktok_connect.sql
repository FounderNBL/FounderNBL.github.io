-- Dedicated TikTok integration; never grant browser roles access to credentials.
create table if not exists public.nbl_tiktok_grants (
  member_id text not null, environment text not null check(environment in ('sandbox','production')),
  open_id text not null, label text not null, scopes text[] not null,
  access_cipher text not null, refresh_cipher text not null,
  access_until timestamptz not null, refresh_until timestamptz not null,
  connected_at timestamptz not null default now(), refresh_lock timestamptz,
  primary key(member_id,environment)
);
create index if not exists nbl_tiktok_grants_external on public.nbl_tiktok_grants(environment,open_id);
create table if not exists public.nbl_tiktok_states (
  state_hash text primary key, member_id text not null,
  environment text not null check(environment in ('sandbox','production')),
  expires_at timestamptz not null, consumed_at timestamptz
);
create index if not exists nbl_tiktok_states_expiry on public.nbl_tiktok_states(expires_at);
create table if not exists public.nbl_tiktok_posts (
  member_id text not null, environment text not null check(environment in ('sandbox','production')),
  open_id text not null, publish_id text not null, created_at timestamptz not null default now(),
  primary key(member_id,environment,publish_id)
);
alter table public.nbl_tiktok_grants enable row level security;
alter table public.nbl_tiktok_states enable row level security;
alter table public.nbl_tiktok_posts enable row level security;
revoke all on public.nbl_tiktok_grants,public.nbl_tiktok_states,public.nbl_tiktok_posts from public,anon,authenticated;
grant select,insert,update,delete on public.nbl_tiktok_grants,public.nbl_tiktok_states,public.nbl_tiktok_posts to service_role;
