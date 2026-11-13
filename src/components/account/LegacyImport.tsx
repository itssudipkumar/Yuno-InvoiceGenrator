import { useState } from 'react'
import { supabase } from '../../utils/supabase'

interface LegacyAccount {
  id: string
  email: string
  businessInfo?: Record<string, unknown>
  invoiceDesign?: string
}

interface Props { user: { id: string; email: string } }

function readArray(key: string): unknown[] {
  const raw = localStorage.getItem(key)
  if (!raw) return []
  const parsed: unknown = JSON.parse(raw)
  if (!Array.isArray(parsed)) throw new Error(`${key} is not a valid list`)
  return parsed
}

function object(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function legacyAccount(value: unknown): value is LegacyAccount {
  return object(value) && typeof value.id === 'string' && typeof value.email === 'string'
    && (value.businessInfo === undefined || object(value.businessInfo))
    && (value.invoiceDesign === undefined || typeof value.invoiceDesign === 'string')
}

function validInvoice(value: unknown): boolean {
  if (!object(value) || !object(value.client) || !object(value.businessInfo) || !Array.isArray(value.items)) return false
  return typeof value.invoiceNumber === 'string' && typeof value.client.name === 'string'
    && typeof value.invoiceDate === 'string' && typeof value.dueDate === 'string'
    && typeof value.createdAt === 'string' && typeof value.status === 'string'
    && typeof value.total === 'number' && typeof value.subtotal === 'number'
    && typeof value.taxRate === 'number' && typeof value.taxAmount === 'number'
    && value.items.every(item => object(item) && typeof item.id === 'string'
      && typeof item.description === 'string' && typeof item.quantity === 'number'
      && typeof item.unitPrice === 'number' && typeof item.amount === 'number')
}

export default function LegacyImport({ user }: Props) {
  const [includeProfile, setIncludeProfile] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const importData = async () => {
    setBusy(true); setError(''); setMessage('')
    try {
      const accounts = readArray('yuno_users').filter(legacyAccount).filter(account =>
        account.email.toLowerCase() === user.email.toLowerCase())
      if (accounts.length !== 1) {
        throw new Error(accounts.length ? 'More than one local account matches this email. Import cannot continue safely.' : 'No local account with this email was found in this browser.')
      }
      const account = accounts[0]
      const tables = [
        ['yuno_invoices', 'yuno_invoices'],
        ['yuno_clients', 'yuno_clients'],
        ['yuno_recurring_invoices', 'yuno_recurring_invoices'],
      ] as const
      let total = 0
      const batches = tables.map(([key, table]) => {
        const records = readArray(key).filter(object).filter(value => value.userId === account.id)
        const rows = records.map(record => {
          if (typeof record.id !== 'string' || !record.id) throw new Error(`A record in ${key} has no valid ID.`)
          if (table === 'yuno_invoices' && !validInvoice(record)) throw new Error('A local invoice is invalid.')
          if (table === 'yuno_clients' && (typeof record.name !== 'string' || typeof record.email !== 'string' || typeof record.createdAt !== 'string')) throw new Error('A local client is invalid.')
          const id = `legacy-${account.id}-${record.id}`
          const data: Record<string, unknown> = { ...record, id, userId: user.id }
          if (table === 'yuno_recurring_invoices') {
            if (!object(record.template) || !validInvoice(record.template) || typeof record.nextInvoiceDate !== 'string' || typeof record.anchorDate !== 'string' || typeof record.frequency !== 'string' || typeof record.active !== 'boolean') throw new Error('A recurring schedule is invalid.')
            data.template = { ...record.template, userId: user.id }
          }
          return { owner_id: user.id, id, data }
        })
        return { table, rows }
      })
      if (includeProfile && !object(account.businessInfo)) throw new Error('The local business profile is missing or invalid.')
      for (const { table, rows } of batches) {
        if (rows.length) {
          const { error: saveError } = await supabase.from(table).upsert(rows, { onConflict: 'owner_id,id', ignoreDuplicates: true })
          if (saveError) throw saveError
          total += rows.length
        }
      }
      if (includeProfile) {
        const { error: profileError } = await supabase.from('yuno_profiles').update({
          business_info: account.businessInfo,
          invoice_design: account.invoiceDesign || 'slate',
        }).eq('owner_id', user.id)
        if (profileError) throw profileError
      }
      setMessage(`Import completed for ${total} local invoice, client and schedule records. Existing local data was not deleted.${includeProfile ? ' Reload the page to see the imported business profile.' : ''}`)
    } catch (reason) {
      console.error('Local import failed', reason)
      const duplicate = object(reason) && reason.code === '23505'
      const detail = duplicate
        ? 'An invoice number is already in use in your cloud account. Resolve the duplicate before importing.'
        : reason instanceof Error ? reason.message : 'Import failed.'
      setError(`${detail} Some records may already have been imported; retrying will not overwrite them.`)
    } finally { setBusy(false) }
  }

  return <details className="form-card" style={{marginBottom: 16}}>
    <summary style={{cursor:'pointer', color:'#315d50', fontWeight:600}}>Import data from this browser</summary>
    <div style={{display:'flex', flexDirection:'column', gap:12, marginTop:12}}>
    <p className="muted-text">Copy invoices, clients and recurring schedules from a local YUNO account with the same email. Nothing is deleted from this browser. Existing imported records are not overwritten on retry.</p>
    <label style={{display:'flex', alignItems:'center', gap:8}}>
      <input type="checkbox" checked={includeProfile} onChange={event => setIncludeProfile(event.target.checked)} style={{width:16}} />
      Also replace my cloud business details and default design with this browser’s values.
    </label>
    <button type="button" className="btn-ghost" disabled={busy} onClick={importData}>{busy ? 'Importing…' : 'Import local data'}</button>
    {message && <div className="save-msg" role="status">{message}</div>}
    {error && <div className="error-msg" role="alert">{error}</div>}
    </div>
  </details>
}
