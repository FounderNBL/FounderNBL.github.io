-- Public NBL Pulse profile pictures: the picture is optional, not a new identity.
-- All reads/writes go through existing Clerk-authenticated nbl-social Edge Function.
-- No new grants or client direct access; preserve existing nbl_account_profiles RLS.
alter table public.nbl_account_profiles
  add column if not exists avatar_url text;

comment on column public.nbl_account_profiles.avatar_url is
  'Optional NBL public profile image URL from verified Stream image upload; server validated.';
