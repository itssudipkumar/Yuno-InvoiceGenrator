import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import Nav from '../../components/layout/Nav'
import { InvoicePreview } from '../../components/invoice/InvoiceTemplates'
import { LineItemsTable } from '../../components/ui/LineItemsTable'
import { TotalsSidebar } from '../../components/ui/TotalsSidebar'
import { AutocompleteInput, useAddressAutocomplete } from '../../components/ui/AutocompleteInput'
import { StatusPicker } from '../../components/ui/StatusPicker'
import { saveInvoice, generateInvoiceNumber, getClients, formatCurrency } from '../../utils/invoice'
import type { Invoice, InvoiceItem, Client, ClientInfo } from '../../types/invoice.types'
import type { Page } from '../../App'

interface Props { nav: (p: Page) => void }

const today = new Date().toISOString().split('T')[0]
const due30 = new Date(Date.now() + 30 * 864e5).toISOString().split('T')[0]

export default function RegisteredInvoice({ nav }: Props) {
  const { user } = useAuth()
  const design = user?.invoiceDesign || 'slate'
  const [clients, setClients] = useState<Client[]>([])
  const [msg, setMsg] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [savedInvoice, setSavedInvoice] = useState<Invoice | null>(null)
  const [showStatusModal, setShowStatusModal] = useState(false)

  // Client autocomplete
  const [clientQ, setClientQ] = useState('')
  const [clientOpts, setClientOpts] = useState<Array<{ label: string; sublabel?: string; value: string }>>([])
  const [clientAddrQ, setClientAddrQ] = useState('')
  const fetchAddresses = useAddressAutocomplete()

  const [form, setForm] = useState({
    invoiceNumber: user ? generateInvoiceNumber(user.id) : 'INV-0001',
    invoiceDate: today,
    dueDate: due30,
    notes: 'Thank you for your business. Payment is due within 30 days.',
    taxRate: 10,
  })

  const [client, setClient] = useState<ClientInfo>({
    name: '', email: '', phone: '', address: '', company: ''
  })

  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', description: '', quantity: 1, unitPrice: 0, amount: 0 }
  ])

  useEffect(() => {
    if (user) {
      const loaded = getClients(user.id)
      setClients(loaded)
      setClientOpts(loaded.map(c => ({
        label: c.name,
        sublabel: c.company || c.email,
        value: c.id,
      })))
    }
  }, [user])

  const subtotal = items.reduce((s, i) => s + i.amount, 0)
  const taxAmount = subtotal * form.taxRate / 100
  const total = subtotal + taxAmount

  const selectClient = (id: string) => {
    const c = clients.find(x => x.id === id)
    if (!c) return
    setClient({ name: c.name, email: c.email, phone: c.phone, address: c.address, company: c.company || '' })
    setClientQ(c.name)
    setClientAddrQ(c.address || '')
  }

  const buildInvoice = (status: Invoice['status']): Invoice => ({
    id: Date.now().toString(),
    userId: user?.id || '',
    invoiceNumber: form.invoiceNumber,
    status,
    statusNote: '',
    design,
    businessInfo: {
      name: user?.businessInfo.name || '',
      abn: user?.businessInfo.abn || '',
      email: user?.businessInfo.email || '',
      phone: user?.businessInfo.phone || '',
      address: user?.businessInfo.address || '',
      logo: user?.businessInfo.logo || '',
      bankName: user?.businessInfo.bankName || '',
      bsb: user?.businessInfo.bsb || '',
      accountNumber: user?.businessInfo.accountNumber || '',
    },
    client,
    items,
    subtotal,
    taxRate: form.taxRate,
    taxAmount,
    total,
    invoiceDate: form.invoiceDate,
    dueDate: form.dueDate,
    notes: form.notes,
    paymentTerms: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })

  const handleSave = (status: Invoice['status']) => {
    if (!client.name) { setMsg('Please enter a client name.'); return }
    if (items.every(i => !i.description)) { setMsg('Please add at least one item.'); return }
    const inv = buildInvoice(status)
    saveInvoice(inv)
    setSavedInvoice(inv)
    if (status === 'draft') {
      setMsg('✅ Saved as draft!')
    } else {
      setShowStatusModal(true)
    }
  }

  const handlePrint = () => {
    const html = document.getElementById('reg-print-area')?.innerHTML || ''
    const w = window.open('', '_blank', 'width=900,height=700')
    if (!w) return
    const gf = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght'
      + '@0,400;0,600;0,700;0,800;1,400;1,700&family=DM+Sans:wght@300;400;500;600'
      + '&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400'
      + '&family=Syne:wght@400;700;800&family=IBM+Plex+Mono:wght@400;500'
      + '&family=Fraunces:ital,wght@0,300;0,700;1,300'
      + '&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap'
    const doc = '<!DOCTYPE html><html><head>'
      + '<link href="' + gf + '" rel="stylesheet">'
      + '<style>*{box-sizing:border-box;margin:0;padding:0;}body{background:#fff;}</style>'
      + '</head><body>' + html + '</body></html>'
    w.document.write(doc)
    w.document.close()
    setTimeout(() => { w.focus(); w.print() }, 600)
  }

  const handleEmail = () => {
    const inv = buildInvoice('sent')
    saveInvoice({ ...inv, status: 'sent' })
    const sub = encodeURIComponent('Invoice ' + inv.invoiceNumber + ' from ' + inv.businessInfo.name)
    const body = encodeURIComponent(
      'Hi ' + inv.client.name + ',\n\nPlease find your invoice '
      + inv.invoiceNumber + ' for ' + formatCurrency(inv.total)
      + '.\n\nDue: ' + inv.dueDate + '\n\nThank you,\n' + inv.businessInfo.name
    )
    window.open('mailto:' + inv.client.email + '?subject=' + sub + '&body=' + body)
    setMsg('✅ Marked as sent!')
  }

  const currentInvoice = buildInvoice('draft')

  return (
    <div className="page-create">
      <Nav nav={nav} current="create-invoice" />

      <div className="create-container">
        <div className="create-header">
          <h1>Create Invoice</h1>
          {msg && <div className="save-msg">{msg}</div>}
        </div>

        <div className="create-layout">
          <div className="create-form">

            {/* Invoice Details */}
            <div className="form-card">
              <h3>📋 Invoice Details</h3>
              <div className="form-row-3">
                <div className="fg">
                  <label>Invoice #</label>
                  <input value={form.invoiceNumber} onChange={e => setForm(f => ({ ...f, invoiceNumber: e.target.value }))} />
                </div>
                <div className="fg">
                  <label>Date</label>
                  <input type="date" value={form.invoiceDate} onChange={e => setForm(f => ({ ...f, invoiceDate: e.target.value }))} />
                </div>
                <div className="fg">
                  <label>Due Date</label>
                  <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
                </div>
              </div>
              <div className="biz-info-note">
                <span>📁</span>
                <span>
                  Business info auto-filled from your{' '}
                  <button onClick={() => nav('account')}>Account</button>
                  {user?.businessInfo.name ? ` — ${user.businessInfo.name}` : ' (not yet set)'}
                </span>
              </div>
            </div>

            {/* Client */}
            <div className="form-card">
              <h3>👤 Client Information</h3>
              <div className="form-row-2">
                <div className="fg">
                  <label>Client Name *</label>
                  <AutocompleteInput
                    value={clientQ}
                    onChange={v => { setClientQ(v); setClient(c => ({ ...c, name: v })) }}
                    onSelect={(id, opt) => {
                      selectClient(id)
                      if (opt) setClientQ(opt.label)
                    }}
                    options={clientOpts}
                    placeholder="Type to search saved clients..."
                  />
                </div>
                <div className="fg">
                  <label>Company</label>
                  <input value={client.company || ''} onChange={e => setClient(c => ({ ...c, company: e.target.value }))} />
                </div>
              </div>
              <div className="form-row-2">
                <div className="fg">
                  <label>Email</label>
                  <input type="email" value={client.email} onChange={e => setClient(c => ({ ...c, email: e.target.value }))} />
                </div>
                <div className="fg">
                  <label>Phone</label>
                  <input value={client.phone} onChange={e => setClient(c => ({ ...c, phone: e.target.value }))} />
                </div>
              </div>
              <div className="fg">
                <label>Address</label>
                <AutocompleteInput
                  value={clientAddrQ}
                  onChange={v => { setClientAddrQ(v); setClient(c => ({ ...c, address: v })) }}
                  onSelect={v => { setClientAddrQ(v); setClient(c => ({ ...c, address: v })) }}
                  fetchOptions={fetchAddresses}
                  placeholder="Start typing for AU address suggestions..."
                  minChars={3}
                />
              </div>
            </div>

            {/* Line Items */}
            <div className="form-card">
              <h3>📦 Line Items</h3>
              <LineItemsTable items={items} onChange={setItems} />
            </div>

            {/* Notes */}
            <div className="form-card">
              <h3>📝 Notes</h3>
              <div className="fg">
                <label>Notes (appears centred at bottom of invoice)</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3} />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="create-sidebar">
            <TotalsSidebar
              subtotal={subtotal}
              taxRate={form.taxRate}
              taxAmount={taxAmount}
              total={total}
              onTaxRateChange={r => setForm(f => ({ ...f, taxRate: r }))}
            />

            <div className="action-card">
              <h3>Actions</h3>
              <button className="action-btn generate" onClick={() => handleSave('sent')}>✅ Generate &amp; Save</button>
              <button className="action-btn draft" onClick={() => handleSave('draft')}>💾 Save as Draft</button>
              <button className="action-btn preview" onClick={() => setShowPreview(true)}>👁 Preview Invoice</button>
              <button className="action-btn print" onClick={handlePrint}>🖨 Print</button>
              <button className="action-btn email" onClick={handleEmail}>📧 Email to Client</button>
            </div>

            <div className="design-badge-card">
              <span>🎨 Design: <strong style={{ color: 'var(--gold)', textTransform: 'capitalize' }}>{design}</strong></span>
              <button onClick={() => nav('account')}>Change →</button>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden print area */}
      <div id="reg-print-area" style={{ position: 'absolute', left: '-9999px', top: 0, width: '210mm', background: '#fff' }}>
        <InvoicePreview invoice={currentInvoice} />
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="preview-overlay" onClick={() => setShowPreview(false)}>
          <div className="preview-modal" onClick={e => e.stopPropagation()}>
            <div className="preview-header">
              <h2>Invoice Preview — {design.charAt(0).toUpperCase() + design.slice(1)}</h2>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn-gold sm" onClick={handlePrint}>🖨 Print</button>
                <button className="preview-close" onClick={() => setShowPreview(false)}>✕</button>
              </div>
            </div>
            <div style={{ padding: 24, background: '#f5f5f5', maxHeight: '80vh', overflowY: 'auto' }}>
              <div style={{ width: '100%', maxWidth: 700, margin: '0 auto', background: '#fff', boxShadow: '0 4px 24px rgba(0,0,0,.15)' }}>
                <InvoicePreview invoice={currentInvoice} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Modal */}
      {showStatusModal && savedInvoice && (
        <StatusPicker
          invoice={savedInvoice}
          onDone={() => { setShowStatusModal(false); nav('dashboard') }}
          onStay={() => setShowStatusModal(false)}
        />
      )}
    </div>
  )
}
