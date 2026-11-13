-- Prevent two devices from saving the same invoice number for one account.
-- This fails without changing existing data if duplicate numbers already exist.
create unique index yuno_invoices_owner_number_unique
  on public.yuno_invoices (owner_id, (data->>'invoiceNumber'));
