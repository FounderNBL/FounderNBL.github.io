-- A private, per-conversation contact label set by each recipient.
-- Does not rename the other person's NBL public identity or expose the alias.
alter table public.nbl_social_thread_members
  add column if not exists contact_nickname text;

alter table public.nbl_social_thread_members
  drop constraint if exists nbl_social_contact_nickname_length;

alter table public.nbl_social_thread_members
  add constraint nbl_social_contact_nickname_length
  check (
    contact_nickname is null
    or (
      char_length(contact_nickname) between 1 and 48
      and contact_nickname = btrim(contact_nickname)
      and contact_nickname !~ '[[:cntrl:]]'
    )
  );
