// Re-export types from the types file for backward compat
export type { Invoice, InvoiceItem, Client, InvoiceStatus, BusinessInfo, ClientInfo } from '../types/invoice.types'

import type { Invoice, Client } from '../types/invoice.types'

const INV_KEY = 'yuno_invoices'
const CLI_KEY = 'yuno_clients'

export function getInvoices(userId: string): Invoice[] {
  try {
    const all: Invoice[] = JSON.parse(localStorage.getItem(INV_KEY) || '[]')
    return all.filter(i => i.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  } catch { return [] }
}

export function saveInvoice(inv: Invoice): void {
  const all: Invoice[] = JSON.parse(localStorage.getItem(INV_KEY) || '[]')
  const idx = all.findIndex(i => i.id === inv.id)
  if (idx !== -1) all[idx] = inv; else all.push(inv)
  localStorage.setItem(INV_KEY, JSON.stringify(all))
}

export function deleteInvoice(id: string): void {
  const all: Invoice[] = JSON.parse(localStorage.getItem(INV_KEY) || '[]')
  localStorage.setItem(INV_KEY, JSON.stringify(all.filter(i => i.id !== id)))
}

export function getClients(userId: string): Client[] {
  try {
    const all: Client[] = JSON.parse(localStorage.getItem(CLI_KEY) || '[]')
    return all.filter(c => c.userId === userId)
  } catch { return [] }
}

export function saveClient(c: Client): void {
  const all: Client[] = JSON.parse(localStorage.getItem(CLI_KEY) || '[]')
  const idx = all.findIndex(x => x.id === c.id)
  if (idx !== -1) all[idx] = c; else all.push(c)
  localStorage.setItem(CLI_KEY, JSON.stringify(all))
}

export function deleteClient(id: string): void {
  const all: Client[] = JSON.parse(localStorage.getItem(CLI_KEY) || '[]')
  localStorage.setItem(CLI_KEY, JSON.stringify(all.filter(c => c.id !== id)))
}

export function generateInvoiceNumber(userId: string): string {
  const invoices = getInvoices(userId)
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
