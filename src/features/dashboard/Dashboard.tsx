import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import Nav from '../../components/layout/Nav'
import { InvoicePreview } from '../../components/invoice/InvoiceTemplates'
import { getInvoices, saveInvoice, deleteInvoice, formatCurrency, formatDate, getAustralianTaxDates } from '../../utils/invoice'
import { printInvoiceHTML } from '../../utils/printInvoice'
import type { Invoice, InvoiceStatus } from '../../types/invoice.types'
import { STATUS_OPTIONS } from '../../types/invoice.types'
import type { Page } from '../../App'

// ── Australian FY tax rates 2024-25 ──────────────────────
function calcIncomeTax(income: number): number {
  if (income <= 18200) return 0
  if (income <= 45000) return (income - 18200) * 0.19
  if (income <= 120000) return 5092 + (income - 45000) * 0.325
  if (income <= 180000) return 29467 + (income - 120000) * 0.37
  return 51667 + (income - 180000) * 0.45
}
function calcMedicare(income: number): number {
  if (income <= 26000) return 0
  return income * 0.02
}
function calcGST(income: number, gstRegistered: boolean): number {
  if (!gstRegistered) return 0
  return income / 11 // GST collected = 1/11 of GST-inclusive price
}

export default function Dashboard({ nav }: { nav: (p: Page) => void }) {
  const { user } = useAuth()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [previewInv, setPreviewInv] = useState<Invoice | null>(null)
  const [editingInv, setEditingInv] = useState<Invoice | null>(null)
  const [activeTab, setActiveTab] = useState<'invoices' | 'tax'>('invoices')
  const [gstRegistered, setGstRegistered] = useState(true)
  const taxDates = getAustralianTaxDates()

  useEffect(() => { if (user) setInvoices(getInvoices(user.id)) }, [user])
  const reload = () => { if (user) setInvoices(getInvoices(user.id)) }

  const filtered = invoices.filter(inv => {
    const ms = !search || inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.client.name.toLowerCase().includes(search.toLowerCase())
    const mf = filterStatus === 'all' || inv.status === filterStatus
    return ms && mf
  })

  const stats = {
    total: invoices.reduce((s, i) => s + i.total, 0),
    paid: invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0),
    pending: invoices.filter(i => i.status === 'sent').reduce((s, i) => s + i.total, 0),
    overdue: invoices.filter(i => i.status === 'overdue').reduce((s, i) => s + i.total, 0),
    count: invoices.length,
  }

  // Tax calc based on paid invoices
  const paidIncome = stats.paid
  const incomeTax = calcIncomeTax(paidIncome)
  const medicare = calcMedicare(paidIncome)
  const gst = calcGST(paidIncome, gstRegistered)
  const totalTaxLiability = incomeTax + medicare + gst

  const handleDelete = (id: string) => {
    if (!confirm('Delete this invoice?')) return
    deleteInvoice(id); reload()
  }

  const handleStatusChange = (inv: Invoice, newStatus: InvoiceStatus) => {
    saveInvoice({ ...inv, status: newStatus, updatedAt: new Date().toISOString() })
    reload()
  }

  const handlePrintInv = (inv: Invoice) => {
    // Render invoice to hidden div then print
    setPreviewInv(inv)
    setTimeout(() => {
      printInvoiceHTML('dashboard-print-area')
    }, 150)
  }

  const handleEditDraft = (inv: Invoice) => {
    setEditingInv({ ...inv })
  }

  const handleSaveDraftEdit = () => {
    if (!editingInv) return
    saveInvoice({ ...editingInv, updatedAt: new Date().toISOString() })
    setEditingInv(null)
    reload()
  }

  const sc = (s: string) => ({
    paid: 'status-paid', sent: 'status-sent', draft: 'status-draft',
    overdue: 'status-overdue', 'on-hold': 'status-hold', disputed: 'status-disputed'
  }[s] || 'status-draft')

  const taxColor = (t: string) => ({ bas: '#C9A84C', super: '#2DD4A7', tax: '#FF8C42', tpar: '#B17BDE' }[t] || '#888')

  return (
    <div className="page-dashboard">
      <Nav nav={nav} current="dashboard" />
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div>
            <h1>Welcome back, {user?.businessInfo.name || user?.email.split('@')[0]}</h1>
            <p className="dashboard-date">{new Date().toLocaleDateString('en-AU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <button className="btn-gold" onClick={() => nav('create-invoice')}>+ New Invoice</button>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card total"><div className="stat-label">Total Invoiced</div><div className="stat-value">{formatCurrency(stats.total)}</div><div className="stat-sub">{stats.count} invoice{stats.count !== 1 ? 's' : ''}</div></div>
          <div className="stat-card paid"><div className="stat-label">Received</div><div className="stat-value">{formatCurrency(stats.paid)}</div><div className="stat-sub">{invoices.filter(i => i.status === 'paid').length} paid</div></div>
          <div className="stat-card pending"><div className="stat-label">Pending</div><div className="stat-value">{formatCurrency(stats.pending)}</div><div className="stat-sub">{invoices.filter(i => i.status === 'sent').length} outstanding</div></div>
          <div className="stat-card overdue"><div className="stat-label">Overdue</div><div className="stat-value">{formatCurrency(stats.overdue)}</div><div className="stat-sub">{invoices.filter(i => i.status === 'overdue').length} overdue</div></div>
        </div>

        {/* Tab switcher */}
        <div className="dash-tabs">
          <button className={`dash-tab${activeTab === 'invoices' ? ' active' : ''}`} onClick={() => setActiveTab('invoices')}>📄 Invoices</button>
          <button className={`dash-tab${activeTab === 'tax' ? ' active' : ''}`} onClick={() => setActiveTab('tax')}>🧾 Tax Estimator</button>
        </div>

        {activeTab === 'invoices' && (
          <div className="dashboard-grid">
            <div className="dashboard-main">
              <div className="section-card">
                <div className="section-header">
                  <h2>Invoices</h2>
                  <div className="filters">
                    <input className="search-input" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="filter-select">
                      <option value="all">All</option>
                      {STATUS_OPTIONS.map(s => <option key={s.v} value={s.v}>{s.label}</option>)}
                    </select>
                  </div>
                </div>
                {filtered.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">📄</div>
                    <p>{search ? 'No invoices match.' : 'No invoices yet.'}</p>
                    {!search && <button className="btn-gold sm" onClick={() => nav('create-invoice')}>Create your first invoice</button>}
                  </div>
                ) : (
                  <div className="invoice-table-wrap">
                    <table className="invoice-table">
                      <thead><tr><th>Invoice #</th><th>Client</th><th>Date</th><th>Due</th><th>Amount</th><th>Status</th><th>Actions</th></tr></thead>
                      <tbody>
                        {filtered.map(inv => (
                          <tr key={inv.id}>
                            <td className="inv-num">{inv.invoiceNumber}</td>
                            <td><div className="client-name">{inv.client.name}</div>{inv.client.company && <div className="client-co">{inv.client.company}</div>}</td>
                            <td>{formatDate(inv.invoiceDate)}</td>
                            <td>{inv.dueDate ? formatDate(inv.dueDate) : <span style={{ color: 'var(--text3)', fontSize: 11 }}>—</span>}</td>
                            <td className="amount">{formatCurrency(inv.total)}</td>
                            <td>
                              {/* Status dropdown */}
                              <select
                                className={`status-select ${sc(inv.status)}`}
                                value={inv.status}
                                onChange={e => handleStatusChange(inv, e.target.value as InvoiceStatus)}
                              >
                                {STATUS_OPTIONS.map(s => <option key={s.v} value={s.v}>{s.label}</option>)}
                              </select>
                            </td>
                            <td>
                              <div className="action-btns">
                                <button className="act-btn view" title="Preview" onClick={() => setPreviewInv(inv)}>👁</button>
                                <button className="act-btn print" title="Print" onClick={() => handlePrintInv(inv)}>🖨</button>
                                {inv.status === 'draft' && (
                                  <button className="act-btn edit" title="Edit draft" onClick={() => handleEditDraft(inv)}>✏️</button>
                                )}
                                <button className="act-btn del" title="Delete" onClick={() => handleDelete(inv.id)}>🗑</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="dashboard-sidebar">
              <div className="section-card">
                <div className="section-header"><h2>🇦🇺 ATO Deadlines</h2></div>
                {taxDates.length === 0 ? <p className="muted-text">No upcoming deadlines.</p> : (
                  <div className="tax-list">
                    {taxDates.map((t, i) => (
                      <div key={i} className={`tax-item${t.overdue ? ' tax-overdue' : ''}`}>
                        <div className="tax-dot" style={{ backgroundColor: taxColor(t.type) }} />
                        <div className="tax-info">
                          <div className="tax-label">{t.label}</div>
                          <div className="tax-desc">{t.desc}</div>
                          <div className="tax-date">{t.date.toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                        </div>
                        <div className={`tax-days ${t.overdue ? 'text-red' : t.daysLeft <= 14 ? 'text-amber' : 'text-teal'}`}>
                          {t.overdue ? 'OVERDUE' : `${t.daysLeft}d`}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="tax-legend">
                  <span><span className="dot" style={{ background: '#C9A84C' }} />BAS</span>
                  <span><span className="dot" style={{ background: '#2DD4A7' }} />Super</span>
                  <span><span className="dot" style={{ background: '#FF8C42' }} />Tax</span>
                  <span><span className="dot" style={{ background: '#B17BDE' }} />TPAR</span>
                </div>
              </div>
              <div className="section-card">
                <h2 style={{ fontSize: '1rem', fontFamily: "'DM Sans',sans-serif", fontWeight: 600, marginBottom: 12 }}>Quick Actions</h2>
                <div className="quick-actions">
                  <button className="quick-btn" onClick={() => nav('create-invoice')}>📄 New Invoice</button>
                  <button className="quick-btn" onClick={() => nav('clients')}>👥 Add Client</button>
                  <button className="quick-btn" onClick={() => nav('account')}>⚙️ Business Info</button>
                </div>
              </div>
              <div className="coffee-widget">
                <div className="coffee-emoji">☕</div>
                <p>YUNO saves you time. Support us!</p>
                <a href="https://www.buymeacoffee.com/technoforty" target="_blank" rel="noopener noreferrer" className="btn-coffee sm">Buy us a coffee</a>
              </div>
            </div>
          </div>
        )}

        {/* ── TAX ESTIMATOR TAB ── */}
        {activeTab === 'tax' && (
          <div className="tax-estimator">
            <div className="tax-est-grid">
              <div className="section-card">
                <h2 style={{ marginBottom: 16 }}>🧾 FY Tax Estimator</h2>
                <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 20, lineHeight: 1.7 }}>
                  Estimate your Australian tax obligations based on invoices marked as <strong style={{ color: 'var(--teal)' }}>Paid</strong>.
                  This is a guide only — consult a registered tax agent for advice.
                </p>

                <div className="tax-est-toggle">
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14 }}>
                    <input type="checkbox" checked={gstRegistered} onChange={e => setGstRegistered(e.target.checked)}
                      style={{ width: 16, height: 16, accentColor: 'var(--gold)' }} />
                    I am registered for GST
                  </label>
                </div>

                <div className="tax-income-display">
                  <div className="tid-label">Total Received This FY</div>
                  <div className="tid-value">{formatCurrency(paidIncome)}</div>
                  <div className="tid-sub">Based on {invoices.filter(i => i.status === 'paid').length} paid invoices</div>
                </div>

                <div className="tax-breakdown">
                  <div className="tbr-row">
                    <div>
                      <div className="tbr-label">Income Tax</div>
                      <div className="tbr-desc">2024–25 individual rates (0–45%)</div>
                    </div>
                    <div className="tbr-amount">{formatCurrency(incomeTax)}</div>
                  </div>
                  <div className="tbr-row">
                    <div>
                      <div className="tbr-label">Medicare Levy</div>
                      <div className="tbr-desc">2% of taxable income</div>
                    </div>
                    <div className="tbr-amount">{formatCurrency(medicare)}</div>
                  </div>
                  {gstRegistered && (
                    <div className="tbr-row">
                      <div>
                        <div className="tbr-label">GST Payable</div>
                        <div className="tbr-desc">1/11 of GST-inclusive income</div>
                      </div>
                      <div className="tbr-amount">{formatCurrency(gst)}</div>
                    </div>
                  )}
                  <div className="tbr-total">
                    <span>Estimated Total Tax Liability</span>
                    <span>{formatCurrency(totalTaxLiability)}</span>
                  </div>
                  <div className="tbr-keep">
                    <span>💡 Suggested amount to set aside</span>
                    <span style={{ color: 'var(--amber)', fontWeight: 700 }}>
                      {formatCurrency(totalTaxLiability)} ({paidIncome > 0 ? ((totalTaxLiability / paidIncome) * 100).toFixed(0) : 0}%)
                    </span>
                  </div>
                </div>

                {/* Tax brackets info */}
                <div className="tax-brackets">
                  <div className="tbk-title">2024–25 Individual Tax Brackets</div>
                  {[
                    { range: '$0 – $18,200', rate: '0%', note: 'Tax-free threshold' },
                    { range: '$18,201 – $45,000', rate: '19%', note: '' },
                    { range: '$45,001 – $120,000', rate: '32.5%', note: '' },
                    { range: '$120,001 – $180,000', rate: '37%', note: '' },
                    { range: '$180,001+', rate: '45%', note: '' },
                  ].map((b, i) => (
                    <div key={i} className={`tbk-row${paidIncome > 0 && ((i === 0 && paidIncome <= 18200) || (i === 1 && paidIncome > 18200 && paidIncome <= 45000) || (i === 2 && paidIncome > 45000 && paidIncome <= 120000) || (i === 3 && paidIncome > 120000 && paidIncome <= 180000) || (i === 4 && paidIncome > 180000)) ? ' tbk-active' : ''}`}>
                      <span className="tbk-range">{b.range}</span>
                      <span className="tbk-rate">{b.rate}</span>
                      {b.note && <span className="tbk-note">{b.note}</span>}
                    </div>
                  ))}
                </div>

                <div className="tax-disclaimer">
                  ⚠️ This is an estimate only. Deductions, offsets, and business structure affect your actual tax.
                  Always consult a registered tax agent or accountant.
                  <a href="https://www.ato.gov.au/individuals-and-families/income-deductions-offsets-and-records/income-you-must-declare" target="_blank" rel="noopener noreferrer"> ATO website →</a>
                </div>
              </div>

              {/* ATO deadlines sidebar */}
              <div>
                <div className="section-card" style={{ marginBottom: 16 }}>
                  <div className="section-header"><h2>🇦🇺 ATO Deadlines</h2></div>
                  {taxDates.length === 0 ? <p className="muted-text">No upcoming deadlines.</p> : (
                    <div className="tax-list">
                      {taxDates.map((t, i) => (
                        <div key={i} className={`tax-item${t.overdue ? ' tax-overdue' : ''}`}>
                          <div className="tax-dot" style={{ backgroundColor: taxColor(t.type) }} />
                          <div className="tax-info">
                            <div className="tax-label">{t.label}</div>
                            <div className="tax-desc">{t.desc}</div>
                            <div className="tax-date">{t.date.toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                          </div>
                          <div className={`tax-days ${t.overdue ? 'text-red' : t.daysLeft <= 14 ? 'text-amber' : 'text-teal'}`}>
                            {t.overdue ? 'OVERDUE' : `${t.daysLeft}d`}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="section-card">
                  <h2 style={{ fontSize: '1rem', fontFamily: "'DM Sans',sans-serif", fontWeight: 600, marginBottom: 8 }}>Useful Links</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                    {[
                      { label: 'ATO Tax Calculator', url: 'https://www.ato.gov.au/calculators-and-tools' },
                      { label: 'Register for GST', url: 'https://www.ato.gov.au/businesses-and-organisations/gst-excise-and-indirect-taxes/gst/registering-for-gst' },
                      { label: 'BAS Lodgement', url: 'https://www.ato.gov.au/businesses-and-organisations/preparing-lodging-and-paying/activity-statements/bas' },
                      { label: 'Super Guarantee', url: 'https://www.ato.gov.au/businesses-and-organisations/super-for-employers/work-out-if-super-is-payable' },
                    ].map(l => (
                      <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: 13, color: 'var(--gold)', textDecoration: 'none', padding: '6px 10px', background: 'var(--gold-dim)', borderRadius: 6 }}>
                        {l.label} →
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Preview modal */}
      {previewInv && (
        <div className="preview-overlay" onClick={() => setPreviewInv(null)}>
          <div className="preview-modal a4-preview" onClick={e => e.stopPropagation()}>
            <div className="preview-header">
              <h2>{previewInv.invoiceNumber} — {previewInv.client.name}</h2>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn-gold sm" onClick={() => printInvoiceHTML('dashboard-print-area')}>🖨 Print</button>
                <button className="preview-close" onClick={() => setPreviewInv(null)}>✕</button>
              </div>
            </div>
            <div className="preview-a4-wrap">
              <div className="preview-a4-sheet">
                <InvoicePreview invoice={previewInv} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden print area */}
      {previewInv && (
        <div id="dashboard-print-area" style={{ position: 'absolute', left: '-9999px', top: 0, width: '210mm', background: '#fff' }}>
          <InvoicePreview invoice={previewInv} />
        </div>
      )}

      {/* Edit draft modal */}
      {editingInv && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: 700 }}>
            <div className="modal-header">
              <h2>✏️ Edit Draft — {editingInv.invoiceNumber}</h2>
              <button className="modal-close" onClick={() => setEditingInv(null)}>✕</button>
            </div>
            <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14, maxHeight: '70vh', overflowY: 'auto' }}>
              <div className="form-row-2">
                <div className="fg"><label>Client Name</label>
                  <input value={editingInv.client.name} onChange={e => setEditingInv(i => i ? { ...i, client: { ...i.client, name: e.target.value } } : null)} />
                </div>
                <div className="fg"><label>Client Email</label>
                  <input value={editingInv.client.email} onChange={e => setEditingInv(i => i ? { ...i, client: { ...i.client, email: e.target.value } } : null)} />
                </div>
              </div>
              <div className="form-row-3">
                <div className="fg"><label>Invoice #</label>
                  <input value={editingInv.invoiceNumber} onChange={e => setEditingInv(i => i ? { ...i, invoiceNumber: e.target.value } : null)} />
                </div>
                <div className="fg"><label>Date</label>
                  <input type="date" value={editingInv.invoiceDate} onChange={e => setEditingInv(i => i ? { ...i, invoiceDate: e.target.value } : null)} />
                </div>
                <div className="fg"><label>Due Date <span style={{ fontSize: 11, color: 'var(--text3)' }}>(optional)</span></label>
                  <input type="date" value={editingInv.dueDate} onChange={e => setEditingInv(i => i ? { ...i, dueDate: e.target.value } : null)} />
                </div>
              </div>
              <div className="fg"><label>Notes</label>
                <textarea value={editingInv.notes} onChange={e => setEditingInv(i => i ? { ...i, notes: e.target.value } : null)} rows={2} />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                <button className="btn-ghost" onClick={() => setEditingInv(null)}>Cancel</button>
                <button className="btn-gold" onClick={handleSaveDraftEdit}>Save Changes</button>
                <button className="btn-gold" style={{ background: 'var(--teal)', color: 'var(--navy)' }}
                  onClick={() => { saveInvoice({ ...editingInv!, status: 'sent', updatedAt: new Date().toISOString() }); setEditingInv(null); reload() }}>
                  Save &amp; Mark as Sent
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
