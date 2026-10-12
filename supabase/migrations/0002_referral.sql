-- LOONO — referral codes.
--
-- Run after 0001_chat_core.sql, in the Supabase SQL editor or via
-- `supabase db push`. Idempotent: safe to re-run.
--
-- The model
-- ---------
-- Every profile owns a `ref_code`. A member shares
-- `https://loono.app/auth?ref=<their code>`; whoever signs up through it gets
-- `referred_by` pointing at the sharer's profile row. That keeps the whole
-- attribution chain inside one table — `referred_by` is a self-referencing FK
-- — so partners, tiered agents and ordinary members are all just profiles
-- with a code, which is what the existing `profiles` schema expects.
--
-- Attribution is first-touch: `ref_code` is assigned once at insert and is
-- immutable afterwards, and `referred_by` is only ever written when the
-- profile row is first created (see `lib/supabase/profile.ts`). A member who
-- later clicks a different link keeps their original referrer.

/* ─────────────────────────── uniqueness ─────────────────────────────────── */

/*
  Partial, because NULL is still legal — 0001 predates this column and any
  row created before the triggers below landed is backfilled at the end of
  this migration.
*/
create unique index if not exists profiles_ref_code_key
  on public.profiles (ref_code)
  where ref_code is not null;

/* ───────────────────────── code generation ──────────────────────────────── */

/*
  Eight characters from a 32-symbol alphabet with the confusable glyphs
  removed (no 0/O, 1/I/L, 5/S, 8/B, 2/Z). Codes get read aloud at parties and
  typed from screenshots, so legibility matters more than entropy — and 32^8
  is still ~1.1e12 combinations.

  `random()` is not a CSPRNG, which is the right trade here: a code is a share
  link, not a secret, and nothing authorises on it.
*/
create or replace function public.generate_ref_code()
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  alphabet constant text := 'ABCDEFGHJKMNPQRTUVWXY34679';
  candidate text;
  attempt integer := 0;
begin
  loop
    candidate := '';

    for position in 1..8 loop
      candidate := candidate
        || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    end loop;

    exit when not exists (
      select 1 from public.profiles where ref_code = candidate
    );

    -- Birthday-bound: with ~1e12 codes a collision is vanishingly unlikely,
    -- but the loop must still terminate on an unlucky or pathological draw.
    attempt := attempt + 1;

    if attempt > 25 then
      raise exception 'could not generate a unique ref_code after % attempts', attempt;
    end if;
  end loop;

  return candidate;
end;
$$;

/* ──────────────────────── assign on insert ──────────────────────────────── */

/*
  A caller may supply a code (seeding an agency with a memorable one such as
  ALEX60); otherwise one is generated. Either way it is normalised to upper
  case so `?ref=alex60` and `?ref=ALEX60` cannot end up as two profiles.
*/
create or replace function public.profiles_assign_ref_code()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.ref_code is null or btrim(new.ref_code) = '' then
    new.ref_code := public.generate_ref_code();
  else
    new.ref_code := upper(btrim(new.ref_code));
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_assign_ref_code on public.profiles;

create trigger profiles_assign_ref_code
  before insert on public.profiles
  for each row
  execute function public.profiles_assign_ref_code();

/* ───────────── backfill rows created before this migration ─────────────── */

/*
  Runs after the insert trigger exists so any row somehow created in between
  already has a code, and before the immutability trigger is attached below
  (this statement is an UPDATE, which that trigger would otherwise reject).
*/
update public.profiles
   set ref_code = public.generate_ref_code()
 where ref_code is null;

/* ───────────────────── ref_code is immutable ────────────────────────────── */

/*
  Once a code is in circulation it must keep resolving to the same profile,
  or every link already handed out would silently re-point at somebody else.
  Reassignment is therefore rejected outright rather than merely discouraged.
*/
create or replace function public.profiles_ref_code_is_immutable()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.ref_code is distinct from old.ref_code then
    raise exception 'ref_code is assigned once and cannot be changed'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_ref_code_immutable on public.profiles;

create trigger profiles_ref_code_immutable
  before update on public.profiles
  for each row
  execute function public.profiles_ref_code_is_immutable();

-- `?ref=CODE` is resolved on every signup that carries one; the unique index
-- above already covers that lookup.