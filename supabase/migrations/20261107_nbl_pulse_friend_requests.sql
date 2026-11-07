-- NBL Pulse: private, consent-based friendships. No direct browser access.
create table if not exists public.nbl_pulse_friend_requests (
 requester_id text not null check (requester_id ~ '^user_[A-Za-z0-9_-]+$'),
 recipient_id text not null check (recipient_id ~ '^user_[A-Za-z0-9_-]+$'),
 status text not null default 'pending' check (status in ('pending','accepted')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 constraint nbl_pulse_friend_pk primary key(requester_id,recipient_id),
 constraint nbl_pulse_friend_no_self check(requester_id<>recipient_id)
);
create unique index if not exists nbl_pulse_pair_unique
 on public.nbl_pulse_friend_requests ((least(requester_id,recipient_id)),(greatest(requester_id,recipient_id)));
create index if not exists nbl_pulse_recipient_idx
 on public.nbl_pulse_friend_requests(recipient_id,created_at desc);
alter table public.nbl_pulse_friend_requests enable row level security;
revoke all on public.nbl_pulse_friend_requests from anon,authenticated;