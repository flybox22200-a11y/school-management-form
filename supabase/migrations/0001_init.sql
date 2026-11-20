-- School Management Research Portal: initial schema
-- Run this in the Supabase SQL editor (or with `supabase db push`).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Submissions
-- ---------------------------------------------------------------------------
create table if not exists public.submissions (
  id                     uuid primary key default gen_random_uuid(),
  created_at             timestamptz not null default now(),
  campus                 text not null,
  respondent_role        text not null,
  management_involvement text not null,
  employee_count         text,
  management_familiarity text,
  answers                jsonb not null default '{}'::jsonb,
  status                 text not null default 'new',
  reference_code         text not null unique,
  admin_notes            text,
  schema_version         integer not null default 1,

  constraint submissions_campus_chk check (campus in ('ring_road', 'kabootar_chowk', 'both')),
  constraint submissions_status_chk check (status in ('new', 'reviewed', 'follow_up', 'excluded')),
  constraint submissions_answers_obj_chk check (jsonb_typeof(answers) = 'object'),
  constraint submissions_answers_size_chk check (pg_column_size(answers) < 200000)
);

create index if not exists submissions_created_at_idx on public.submissions (created_at desc);
create index if not exists submissions_campus_idx on public.submissions (campus);
create index if not exists submissions_status_idx on public.submissions (status);

-- ---------------------------------------------------------------------------
-- Admin allow-list. Add the researcher's auth user id here after creating the
-- user in Supabase Auth (Dashboard → Authentication → Users → Add user):
--   insert into public.admins (user_id) values ('<auth-user-uuid>');
-- ---------------------------------------------------------------------------
create table if not exists public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.submissions enable row level security;
alter table public.admins enable row level security;

-- Anyone (anonymous respondents) may INSERT a new submission, but only with
-- the default status and no admin notes. They can never read submissions.
drop policy if exists "public can submit" on public.submissions;
create policy "public can submit"
  on public.submissions
  for insert
  to anon, authenticated
  with check (status = 'new' and admin_notes is null);

drop policy if exists "admins can read" on public.submissions;
create policy "admins can read"
  on public.submissions
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "admins can update" on public.submissions;
create policy "admins can update"
  on public.submissions
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "admins can delete" on public.submissions;
create policy "admins can delete"
  on public.submissions
  for delete
  to authenticated
  using (public.is_admin());

drop policy if exists "admins can see admin list" on public.admins;
create policy "admins can see admin list"
  on public.admins
  for select
  to authenticated
  using (user_id = auth.uid());

-- Column-level privileges: anon may only write the respondent columns.
revoke all on public.submissions from anon;
grant insert (campus, respondent_role, management_involvement, employee_count,
              management_familiarity, answers, reference_code, schema_version)
  on public.submissions to anon;

revoke all on public.submissions from authenticated;
grant select, insert, delete on public.submissions to authenticated;
grant update (status, admin_notes) on public.submissions to authenticated;

revoke all on public.admins from anon;
grant select on public.admins to authenticated;
