// Re-export types from the types file for backward compat
export type { Invoice, InvoiceItem, Client, InvoiceStatus, BusinessInfo, ClientInfo } from '../types/invoice.types'

import type { Invoice, Client, Expense } from '../types/invoice.types'
import type { RecurringFrequency, RecurringInvoice } from '../types/invoice.types'
import { addDays, addMonths, addYears, differenceInCalendarDays, format, parseISO } from 'date-fns'
import { supabase } from './supabase'

type CloudTable = 'yuno_invoices' | 'yuno_clients' | 'yuno_recurring_invoices' | 'yuno_expenses'

async function list<T>(table: CloudTable, userId: string): Promise<T[]> {
  const result: T[] = []
  const pageSize = 1000
  for (let offset = 0; ;) {
    const { data, error } = await supabase.from(table).select('data').eq('owner_id', userId)
      .order('id').range(offset, offset + pageSize - 1)
    if (error) throw error
    result.push(...data.map(row => row.data as T))
    if (data.length === 0) return result
    offset += data.length
  }
}

async function save<T extends { id: string; userId: string }>(table: CloudTable, value: T): Promise<void> {
  const { error } = await supabase.from(table).upsert({ owner_id: value.userId, id: value.id, data: value })
  if (error) throw error
}

async function remove(table: CloudTable, id: string, userId: string): Promise<void> {
  const { error } = await supabase.from(table).delete().eq('owner_id', userId).eq('id', id)
  if (error) throw error
}

export async function getInvoices(userId: string): Promise<Invoice[]> {
  return (await list<Invoice>('yuno_invoices', userId))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}
export const saveInvoice = (invoice: Invoice) => save('yuno_invoices', invoice)
export const deleteInvoice = (id: string, userId: string) => remove('yuno_invoices', id, userId)
export const getClients = (userId: string) => list<Client>('yuno_clients', userId)
export const saveClient = (client: Client) => save('yuno_clients', client)
export const deleteClient = (id: string, userId: string) => remove('yuno_clients', id, userId)
export async function getExpenses(userId: string): Promise<Expense[]> {
  return (await list<Expense>('yuno_expenses', userId))
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
}
export const saveExpense = (expense: Expense) => save('yuno_expenses', expense)
export const deleteExpense = (id: string, userId: string) => remove('yuno_expenses', id, userId)
export async function getRecurringInvoices(userId: string): Promise<RecurringInvoice[]> {
  return (await list<RecurringInvoice>('yuno_recurring_invoices', userId))
    .sort((a, b) => a.nextInvoiceDate.localeCompare(b.nextInvoiceDate))
}
export const saveRecurringInvoice = (schedule: RecurringInvoice) => save('yuno_recurring_invoices', schedule)
export const deleteRecurringInvoice = (id: string, userId: string) => remove('yuno_recurring_invoices', id, userId)

function nextOccurrence(date: string, frequency: RecurringFrequency, anchorDate: string): string {
  const parsed = parseISO(date)
  let next: Date
  if (frequency === 'weekly') next = addDays(parsed, 7)
  else if (frequency === 'fortnightly') next = addDays(parsed, 14)
  else if (frequency === 'monthly' || frequency === 'quarterly') {
    next = addMonths(parsed, frequency === 'monthly' ? 1 : 3)
    const anchorDay = Number(anchorDate.slice(-2))
    const lastDay = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate()
    next.setDate(Math.min(anchorDay, lastDay))
  } else {
    next = addYears(parsed, 1)
    const anchorDay = Number(anchorDate.slice(-2))
    const lastDay = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate()
    next.setDate(Math.min(anchorDay, lastDay))
  }
  return format(next, 'yyyy-MM-dd')
}

export async function processDueRecurringInvoices(userId: string, now = new Date()): Promise<number> {
  const today = format(now, 'yyyy-MM-dd')
  const schedules = await getRecurringInvoices(userId)
  let generated = 0

  for (const schedule of schedules) {
    let nextDate = schedule.nextInvoiceDate
    while (schedule.active && nextDate <= today && generated < 100) {
      const invoiceDate = parseISO(nextDate)
      const templateDate = parseISO(schedule.template.invoiceDate)
      const dueOffset = schedule.template.dueDate
        ? differenceInCalendarDays(parseISO(schedule.template.dueDate), templateDate)
        : null
      const dueDate = dueOffset === null ? '' : format(addDays(invoiceDate, dueOffset), 'yyyy-MM-dd')

      const invoice: Invoice = {
        ...schedule.template,
        id: `recurring-${schedule.id}-${nextDate}`,
        userId,
        invoiceNumber: '',
        status: 'draft',
        statusNote: `Created from recurring schedule: ${schedule.name}`,
        invoiceDate: nextDate,
        dueDate,
        items: schedule.template.items.map(item => ({ ...item })),
        client: { ...schedule.template.client },
        businessInfo: { ...schedule.template.businessInfo },
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      }
      const followingDate = nextOccurrence(nextDate, schedule.frequency, schedule.anchorDate)
      const { data, error } = await supabase.rpc('yuno_generate_recurring', {
        schedule_id: schedule.id,
        occurrence_date: nextDate,
        next_date: followingDate,
        invoice_data: invoice,
      })
      if (error) throw error
      if (!data) break
      nextDate = followingDate
      generated += 1
    }

    if (generated >= 100) break
  }

  return generated
}

export async function generateInvoiceNumber(userId: string): Promise<string> {
  const invoices = await getInvoices(userId)
  const nums = invoices.map(i => {
    const m = i.invoiceNumber.match(/(\d+)$/)
    return m ? parseInt(m[1]) : 0
  })
  const next = nums.length ? Math.max(...nums) + 1 : 1
  return `INV-${String(next).padStart(4, '0')}`
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(amount || 0)
}

export function formatDate(d: string): string {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function getAustralianTaxDates() {
  const now = new Date()
  const y = now.getFullYear()
  const dates = [
    { label: 'BAS Q1',    date: new Date(y, 9, 28),    desc: 'Jul–Sep BAS lodgement',   type: 'bas' },
    { label: 'BAS Q2',    date: new Date(y + 1, 0, 28), desc: 'Oct–Dec BAS lodgement',   type: 'bas' },
    { label: 'BAS Q3',    date: new Date(y + 1, 3, 28), desc: 'Jan–Mar BAS lodgement',   type: 'bas' },
    { label: 'BAS Q4',    date: new Date(y + 1, 6, 28), desc: 'Apr–Jun BAS lodgement',   type: 'bas' },
    { label: 'Super Q1',  date: new Date(y, 9, 28),     desc: 'Jul–Sep Superannuation',  type: 'super' },
    { label: 'Super Q2',  date: new Date(y + 1, 0, 28), desc: 'Oct–Dec Superannuation',  type: 'super' },
    { label: 'Super Q3',  date: new Date(y + 1, 3, 28), desc: 'Jan–Mar Superannuation',  type: 'super' },
    { label: 'Tax Return',date: new Date(y, 9, 31),     desc: 'Individual/company tax',  type: 'tax' },
    { label: 'TPAR',      date: new Date(y, 7, 28),     desc: 'Taxable Payments Report', type: 'tpar' },
  ]
  return dates
    .map(d => ({ ...d, daysLeft: Math.ceil((d.date.getTime() - now.getTime()) / 86400000) }))
    .map(d => ({ ...d, overdue: d.daysLeft < 0 }))
    .filter(d => d.daysLeft > -7 && d.daysLeft < 120)
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 6)
}
