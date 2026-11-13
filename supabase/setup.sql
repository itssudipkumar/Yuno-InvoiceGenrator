-- Run once in the SQL editor of the intended Supabase project.
-- These tables are deliberately separate from YUNO's existing browser data.
begin;

create table public.yuno_profiles (
  owner_id uuid primary key references auth.users(id) on delete cascade,
  business_info jsonb not null default '{}'::jsonb,
  invoice_design text not null default 'slate',
  constraint yuno_profiles_business_object check (jsonb_typeof(business_info) = 'object')
);

create table public.yuno_invoices (
  owner_id uuid not null references auth.users(id) on delete cascade,
  id text not null,
  data jsonb not null,
  primary key (owner_id, id),
  constraint yuno_invoices_data_object check (jsonb_typeof(data) = 'object'),
  constraint yuno_invoices_data_id check ((data->>'id' = id) is true),
  constraint yuno_invoices_data_owner check ((data->>'userId' = owner_id::text) is true)
);

create table public.yuno_clients (
  owner_id uuid not null references auth.users(id) on delete cascade,
  id text not null,
  data jsonb not null,
  primary key (owner_id, id),
  constraint yuno_clients_data_object check (jsonb_typeof(data) = 'object'),
  constraint yuno_clients_data_id check ((data->>'id' = id) is true),
  constraint yuno_clients_data_owner check ((data->>'userId' = owner_id::text) is true)
);

create table public.yuno_recurring_invoices (
  owner_id uuid not null references auth.users(id) on delete cascade,
  id text not null,
  data jsonb not null,
  primary key (owner_id, id),
  constraint yuno_recurring_data_object check (jsonb_typeof(data) = 'object'),
  constraint yuno_recurring_data_id check ((data->>'id' = id) is true),
  constraint yuno_recurring_data_owner check ((data->>'userId' = owner_id::text) is true)
);

alter table public.yuno_profiles enable row level security;
alter table public.yuno_invoices enable row level security;
alter table public.yuno_clients enable row level security;
alter table public.yuno_recurring_invoices enable row level security;

create policy "Users manage their own profile" on public.yuno_profiles
  for all to authenticated using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);
create policy "Users manage their own invoices" on public.yuno_invoices
  for all to authenticated using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);
create policy "Users manage their own clients" on public.yuno_clients
  for all to authenticated using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);
create policy "Users manage their own recurring invoices" on public.yuno_recurring_invoices
  for all to authenticated using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

revoke all on public.yuno_profiles, public.yuno_invoices,
  public.yuno_clients, public.yuno_recurring_invoices from public, anon;
grant select, insert, update, delete on public.yuno_profiles, public.yuno_invoices,
  public.yuno_clients, public.yuno_recurring_invoices to authenticated;

commit;
