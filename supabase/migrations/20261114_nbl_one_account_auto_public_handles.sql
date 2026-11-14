-- An NBL login always maps to the same Clerk user and the same public NBL profile.
-- If a member has not chosen a public handle, assign an editable, non-personal
-- default. Do not create a second Pulse/Messenger identity or expose an email.
-- Existing custom/Founder handles stay unchanged.
alter table public.nbl_account_profiles
  alter column username set default
    ('NBLMember' || left(replace(gen_random_uuid()::text, '-', ''), 16));

-- Heal profiles already created by the single-account sign-in before this fix.
-- One random handle is written once per existing account; the unique index on
-- lower(username) continues enforcing identity uniqueness.
update public.nbl_account_profiles
   set username='NBLMember' || left(replace(gen_random_uuid()::text, '-', ''), 16),
       updated_at=now()
 where username is null or btrim(username)='';
