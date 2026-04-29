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
  { id: 'prestige',  label: 'Prestige',   desc: 'Luxury dark, Cormorant serif' },
  { id: 'frost',     label: 'Frost',      desc: 'Corporate navy gradient' },
  { id: 'terra',     label: 'Terra',      desc: 'Warm terracotta & cream' },
  { id: 'prism',     label: 'Prism',      desc: 'Light with indigo geometric' },
  { id: 'linen',     label: 'Linen',      desc: 'Editorial cream & italic' },
  { id: 'blueprint', label: 'Blueprint',  desc: 'Monospace technical' },
  { id: 'flora',     label: 'Flora',      desc: 'Sage green organic' },
  { id: 'slate',     label: 'Slate',      desc: 'Ultra minimal Bauhaus' },
]

// FIX #8: add accountName to BusinessInfo
// Already added inline — this ensures it's in the main interface
