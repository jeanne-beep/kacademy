-- K's Academy of Excellence schema. Each person logs in with their own account;
-- app_metadata.person is one of jeanne | jackson | ryley and drives every policy.
create table if not exists kv (key text primary key, value jsonb not null, updated_at timestamptz not null default now());
alter table kv enable row level security;

create or replace function public.kae_me() returns text language sql stable as
$$ select auth.jwt() -> 'app_metadata' ->> 'person' $$;

drop policy if exists kae_read on kv;
drop policy if exists kae_ins on kv;
drop policy if exists kae_upd on kv;
drop policy if exists kae_del on kv;

-- Parent reads everything. Students read only their own work/grades plus shared items.
create policy kae_read on kv for select to authenticated using (
  public.kae_me() = 'jeanne'
  or (public.kae_me() in ('jackson','ryley') and (
        key like 'sub/' || public.kae_me() || '/%'
     or key like 'grade/' || public.kae_me() || '/%'
     or key = 'custom' or key like 'notes/%' or key like 'cal/%' or key like 'playOK/%')));

-- Parent writes everything. Students write only their own submissions and calendar events.
create policy kae_ins on kv for insert to authenticated with check (
  public.kae_me() = 'jeanne'
  or (public.kae_me() in ('jackson','ryley') and (key like 'sub/' || public.kae_me() || '/%' or key like 'cal/%')));
create policy kae_upd on kv for update to authenticated using (
  public.kae_me() = 'jeanne'
  or (public.kae_me() in ('jackson','ryley') and (key like 'sub/' || public.kae_me() || '/%' or key like 'cal/%')))
  with check (
  public.kae_me() = 'jeanne'
  or (public.kae_me() in ('jackson','ryley') and (key like 'sub/' || public.kae_me() || '/%' or key like 'cal/%')));
create policy kae_del on kv for delete to authenticated using (
  public.kae_me() = 'jeanne'
  or (public.kae_me() in ('jackson','ryley') and (key like 'sub/' || public.kae_me() || '/%' or key like 'cal/%')));

do $$ begin
  alter publication supabase_realtime add table kv;
exception when duplicate_object then null; end $$;

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.kv to authenticated;

-- Phone reminders (Web Push). Placeholders __PROJECT_REF__ and __CRON_SECRET__ are filled in at setup time.
create table if not exists push_subs (endpoint text primary key, person text not null, sub jsonb not null, created_at timestamptz not null default now());
create table if not exists reminders (
  id text primary key, person text not null, task_id text,
  fire_at timestamptz not null, title text, body text, sent boolean not null default false);
create index if not exists reminders_due on reminders (fire_at) where not sent;
alter table push_subs enable row level security;
alter table reminders enable row level security;
drop policy if exists own on push_subs;
drop policy if exists own on reminders;
create policy own on push_subs for all to authenticated using (person = public.kae_me()) with check (person = public.kae_me());
create policy own on reminders for all to authenticated using (person = public.kae_me()) with check (person = public.kae_me());
grant select, insert, update, delete on public.push_subs, public.reminders to authenticated;

create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;
select cron.unschedule(jobid) from cron.job where jobname = 'send-reminders';
select cron.schedule('send-reminders', '* * * * *', $cron$
  select net.http_post(
    url := 'https://__PROJECT_REF__.supabase.co/functions/v1/send-reminders',
    headers := '{"x-cron-secret": "__CRON_SECRET__"}'::jsonb,
    body := '{}'::jsonb);
$cron$);

grant usage on schema public to service_role;
grant all on public.kv, public.reminders, public.push_subs to service_role;
