// ─── Invoice Types ────────────────────────────────────────
export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  amount: number
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'on-hold' | 'disputed'

export interface BusinessInfo {
  name: string
  abn: string
  email: string
  phone: string
  address: string
  logo?: string
  accountName?: string
  bankName?: string
  bsb?: string
  accountNumber?: string
  website?: string
}

export interface ClientInfo {
  name: string
  email: string
  phone: string
  address: string
  company?: string
}

export interface Invoice {
  id: string
  userId: string
  invoiceNumber: string
  status: InvoiceStatus
  statusNote: string
  design: string
  businessInfo: BusinessInfo
  client: ClientInfo
  items: InvoiceItem[]
  subtotal: number
  taxRate: number
  taxAmount: number
  total: number
  invoiceDate: string
  dueDate: string
  notes: string
  paymentTerms: string
  createdAt: string
  updatedAt: string
}

export type RecurringFrequency = 'weekly' | 'fortnightly' | 'monthly' | 'quarterly' | 'yearly'

export interface RecurringInvoice {
  id: string
  userId: string
  name: string
  frequency: RecurringFrequency
  anchorDate: string
  nextInvoiceDate: string
  active: boolean
  template: Invoice
  createdAt: string
  updatedAt: string
}

// ─── Client Types ─────────────────────────────────────────
export interface Client {
  id: string
  userId: string
  name: string
  company?: string
  email: string
  phone: string
  address: string
  createdAt: string
}

// ─── Status Options ───────────────────────────────────────
export const STATUS_OPTIONS: Array<{ v: InvoiceStatus; label: string; desc: string }> = [
  { v: 'sent',     label: '📤 Sent',      desc: 'Invoice sent, awaiting payment' },
  { v: 'paid',     label: '✅ Paid',       desc: 'Payment received' },
  { v: 'overdue',  label: '⏰ Overdue',    desc: 'Past due date, unpaid' },
  { v: 'on-hold',  label: '⏸ On Hold',    desc: 'Pending approval or dispute' },
  { v: 'disputed', label: '⚠️ Disputed',  desc: 'Client raised an issue' },
  { v: 'draft',    label: '📝 Draft',      desc: 'Not yet sent' },
]

// ─── Invoice Designs ──────────────────────────────────────
export const INVOICE_DESIGNS = [
  { id: 'slate', label: 'Slate', desc: 'Clean, understated monochrome' },
  { id: 'prestige', label: 'Prestige', desc: 'Elegant charcoal and gold' },
  { id: 'frost', label: 'Frost', desc: 'Confident navy and blue' },
  { id: 'terra', label: 'Terra', desc: 'Warm terracotta and cream' },
  { id: 'flora', label: 'Flora', desc: 'Calm, natural sage' },
] as const

export type InvoiceDesign = typeof INVOICE_DESIGNS[number]['id']

export function resolveInvoiceDesign(design: string): InvoiceDesign {
  const legacyDesigns: Record<string, InvoiceDesign> = {
    prism: 'frost',
    linen: 'terra',
    blueprint: 'slate',
  }
  return INVOICE_DESIGNS.find(option => option.id === design)?.id ?? legacyDesigns[design] ?? 'slate'
}
