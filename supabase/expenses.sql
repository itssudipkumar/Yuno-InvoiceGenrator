-- Run in the SQL editor of the YUNO Supabase project.
begin;

create table public.yuno_expenses (
  owner_id uuid not null references auth.users(id) on delete cascade,
  id text not null,
  data jsonb not null,
  primary key (owner_id, id),
  constraint yuno_expenses_data_object check (jsonb_typeof(data) = 'object'),
  constraint yuno_expenses_data_id check ((data->>'id' = id) is true),
  constraint yuno_expenses_data_owner check ((data->>'userId' = owner_id::text) is true)
);

alter table public.yuno_expenses enable row level security;
create policy "Users manage their own expenses" on public.yuno_expenses
  for all to authenticated using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);
revoke all on public.yuno_expenses from public, anon;
grant select, insert, update, delete on public.yuno_expenses to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('yuno-receipts', 'yuno-receipts', false, 5242880,
  array['application/pdf', 'image/jpeg', 'image/png', 'image/webp']);

create policy "Users view their own receipts" on storage.objects
  for select to authenticated using (bucket_id = 'yuno-receipts' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Users upload their own receipts" on storage.objects
  for insert to authenticated with check (bucket_id = 'yuno-receipts' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Users delete their own receipts" on storage.objects
  for delete to authenticated using (bucket_id = 'yuno-receipts' and (storage.foldername(name))[1] = (select auth.uid())::text);

commit;
