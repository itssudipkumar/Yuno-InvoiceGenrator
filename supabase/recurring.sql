-- Run after setup.sql. Creates recurring drafts and advances the schedule atomically.
create or replace function public.yuno_generate_recurring(
  schedule_id text, occurrence_date text, next_date text, invoice_data jsonb
) returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  owner uuid := auth.uid();
  schedule jsonb;
  next_number bigint;
  draft jsonb;
begin
  if owner is null then raise exception 'Authentication required'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(owner::text, 0));
  select data into schedule from public.yuno_recurring_invoices
    where owner_id = owner and id = schedule_id for update;
  if schedule is null or schedule->>'active' <> 'true'
     or schedule->>'nextInvoiceDate' <> occurrence_date then
    return false;
  end if;
  if (next_date::date <= occurrence_date::date) or occurrence_date::date > current_date + 1 then
    raise exception 'Invalid recurring dates';
  end if;
  select coalesce(max(substring(data->>'invoiceNumber' from '([0-9]+)$')::bigint), 0) + 1
    into next_number from public.yuno_invoices where owner_id = owner;
  draft := invoice_data || jsonb_build_object(
    'id', 'recurring-' || schedule_id || '-' || occurrence_date,
    'userId', owner::text,
    'invoiceNumber', 'INV-' || lpad(next_number::text, greatest(4, length(next_number::text)), '0'),
    'status', 'draft'
  );
  insert into public.yuno_invoices(owner_id, id, data)
    values (owner, draft->>'id', draft)
    on conflict (owner_id, id) do nothing;
  update public.yuno_recurring_invoices
    set data = jsonb_set(jsonb_set(schedule, '{nextInvoiceDate}', to_jsonb(next_date)), '{updatedAt}', to_jsonb(now()::text))
    where owner_id = owner and id = schedule_id;
  return true;
end
$$;
revoke all on function public.yuno_generate_recurring(text, text, text, jsonb) from public, anon;
grant execute on function public.yuno_generate_recurring(text, text, text, jsonb) to authenticated;
