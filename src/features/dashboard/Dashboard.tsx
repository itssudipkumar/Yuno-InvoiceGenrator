import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import Nav from '../../components/layout/Nav'
import { InvoicePreview } from '../../components/invoice/InvoiceTemplates'
import { getInvoices, saveInvoice, deleteInvoice, formatCurrency, formatDate, getAustralianTaxDates } from '../../utils/invoice'
import type { Invoice } from '../../utils/invoice'
import type { Page } from '../../App'

const STATUS_OPTS: Array<{v:Invoice['status'];label:string}> = [
  {v:'sent',label:'📤 Sent'},{v:'paid',label:'✅ Paid'},
  {v:'overdue',label:'⏰ Overdue'},{v:'on-hold',label:'⏸ On Hold'},
  {v:'disputed',label:'⚠️ Disputed'},{v:'draft',label:'📝 Draft'},
]

export default function Dashboard({ nav }: { nav:(p:Page)=>void }) {
  const { user } = useAuth()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [previewInv, setPreviewInv] = useState<Invoice|null>(null)
  const [editStatusInv, setEditStatusInv] = useState<Invoice|null>(null)
  const [newStatus, setNewStatus] = useState<Invoice['status']>('sent')
  const [newNote, setNewNote] = useState('')
  const taxDates = getAustralianTaxDates()

  useEffect(() => { if(user) setInvoices(getInvoices(user.id)) }, [user])

  const reload = () => { if(user) setInvoices(getInvoices(user.id)) }

  const filtered = invoices.filter(inv => {
    const ms = !search || inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.client.name.toLowerCase().includes(search.toLowerCase())
    const mf = filterStatus==='all' || inv.status===filterStatus
    return ms && mf
  })

  const stats = {
    total: invoices.reduce((s,i)=>s+i.total,0),
    paid: invoices.filter(i=>i.status==='paid').reduce((s,i)=>s+i.total,0),
    pending: invoices.filter(i=>i.status==='sent').reduce((s,i)=>s+i.total,0),
    overdue: invoices.filter(i=>i.status==='overdue').reduce((s,i)=>s+i.total,0),
    count: invoices.length,
  }

  const handleDelete = (id:string) => {
    if(!confirm('Delete this invoice?')) return
    deleteInvoice(id); reload()
  }

  const openEditStatus = (inv:Invoice) => {
    setEditStatusInv(inv); setNewStatus(inv.status); setNewNote(inv.statusNote||'')
  }

  const saveStatus = () => {
    if(!editStatusInv) return
    saveInvoice({...editStatusInv,status:newStatus,statusNote:newNote,updatedAt:new Date().toISOString()})
    setEditStatusInv(null); reload()
  }

  const sc = (s:string) => ({
    paid:'status-paid', sent:'status-sent', draft:'status-draft',
    overdue:'status-overdue', 'on-hold':'status-hold', disputed:'status-disputed'
  }[s]||'status-draft')

  const taxColor = (t:string) => ({bas:'#C9A84C',super:'#2DD4A7',tax:'#FF8C42',tpar:'#B17BDE'}[t]||'#888')

  return (
    <div className="page-dashboard">
      <Nav nav={nav} current="dashboard"/>
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div>
            <h1>Welcome back, {user?.businessInfo.name||user?.email.split('@')[0]}</h1>
            <p className="dashboard-date">{new Date().toLocaleDateString('en-AU',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</p>
          </div>
          <button className="btn-gold" onClick={()=>nav('create-invoice')}>+ New Invoice</button>
        </div>

        <div className="stats-grid">
          <div className="stat-card total"><div className="stat-label">Total Invoiced</div><div className="stat-value">{formatCurrency(stats.total)}</div><div className="stat-sub">{stats.count} invoice{stats.count!==1?'s':''}</div></div>
          <div className="stat-card paid"><div className="stat-label">Received</div><div className="stat-value">{formatCurrency(stats.paid)}</div><div className="stat-sub">{invoices.filter(i=>i.status==='paid').length} paid</div></div>
          <div className="stat-card pending"><div className="stat-label">Pending</div><div className="stat-value">{formatCurrency(stats.pending)}</div><div className="stat-sub">{invoices.filter(i=>i.status==='sent').length} outstanding</div></div>
          <div className="stat-card overdue"><div className="stat-label">Overdue</div><div className="stat-value">{formatCurrency(stats.overdue)}</div><div className="stat-sub">{invoices.filter(i=>i.status==='overdue').length} overdue</div></div>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-main">
            <div className="section-card">
              <div className="section-header">
                <h2>Invoices</h2>
                <div className="filters">
                  <input className="search-input" placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)}/>
                  <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} className="filter-select">
                    <option value="all">All</option>
                    {STATUS_OPTS.map(s=><option key={s.v} value={s.v}>{s.label}</option>)}
                  </select>
                </div>
              </div>
              {filtered.length===0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📄</div>
                  <p>{search?'No invoices match your search.':'No invoices yet.'}</p>
                  {!search&&<button className="btn-gold sm" onClick={()=>nav('create-invoice')}>Create your first invoice</button>}
                </div>
              ) : (
                <div className="invoice-table-wrap">
                  <table className="invoice-table">
                    <thead><tr><th>Invoice #</th><th>Client</th><th>Date</th><th>Due</th><th>Amount</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>
                      {filtered.map(inv=>(
                        <tr key={inv.id}>
                          <td className="inv-num">{inv.invoiceNumber}</td>
                          <td><div className="client-name">{inv.client.name}</div>{inv.client.company&&<div className="client-co">{inv.client.company}</div>}</td>
                          <td>{formatDate(inv.invoiceDate)}</td>
                          <td>{formatDate(inv.dueDate)}</td>
                          <td className="amount">{formatCurrency(inv.total)}</td>
                          <td>
                            <button className={`status-badge ${sc(inv.status)}`} onClick={()=>openEditStatus(inv)} title="Click to update status">
                              {inv.status}
                            </button>
                          </td>
                          <td>
                            <div className="action-btns">
                              <button className="act-btn view" title="Preview" onClick={()=>setPreviewInv(inv)}>👁</button>
                              <button className="act-btn edit" title="Update status" onClick={()=>openEditStatus(inv)}>✏️</button>
                              <button className="act-btn del" title="Delete" onClick={()=>handleDelete(inv.id)}>🗑</button>
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

          <div className="dashboard-sidebar">
            <div className="section-card">
              <div className="section-header"><h2>🇦🇺 ATO Deadlines</h2></div>
              {taxDates.length===0 ? <p className="muted-text">No upcoming deadlines in 120 days.</p> : (
                <div className="tax-list">
                  {taxDates.map((t,i)=>(
                    <div key={i} className={`tax-item${t.overdue?' tax-overdue':''}`}>
                      <div className="tax-dot" style={{backgroundColor:taxColor(t.type)}}/>
                      <div className="tax-info">
                        <div className="tax-label">{t.label}</div>
                        <div className="tax-desc">{t.desc}</div>
                        <div className="tax-date">{t.date.toLocaleDateString('en-AU',{day:'2-digit',month:'short',year:'numeric'})}</div>
                      </div>
                      <div className={`tax-days ${t.overdue?'text-red':t.daysLeft<=14?'text-amber':'text-teal'}`}>
                        {t.overdue?'OVERDUE':`${t.daysLeft}d`}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="tax-legend">
                <span><span className="dot" style={{background:'#C9A84C'}}/>BAS</span>
                <span><span className="dot" style={{background:'#2DD4A7'}}/>Super</span>
                <span><span className="dot" style={{background:'#FF8C42'}}/>Tax</span>
                <span><span className="dot" style={{background:'#B17BDE'}}/>TPAR</span>
              </div>
            </div>
            <div className="section-card">
              <h2 style={{fontSize:'1rem',fontFamily:"'DM Sans',sans-serif",fontWeight:600,marginBottom:12}}>Quick Actions</h2>
              <div className="quick-actions">
                <button className="quick-btn" onClick={()=>nav('create-invoice')}>📄 New Invoice</button>
                <button className="quick-btn" onClick={()=>nav('clients')}>👥 Add Client</button>
                <button className="quick-btn" onClick={()=>nav('account')}>⚙️ Business Info</button>
              </div>
            </div>
            <div className="coffee-widget">
              <div className="coffee-emoji">☕</div>
              <p>YUNO saves you time. Support us!</p>
              <a href="https://www.buymeacoffee.com/technoforty" target="_blank" rel="noopener noreferrer" className="btn-coffee sm">Buy us a coffee</a>
            </div>
          </div>
        </div>
      </div>

      {/* Preview modal */}
      {previewInv && (
        <div className="preview-overlay" onClick={()=>setPreviewInv(null)}>
          <div className="preview-modal" onClick={e=>e.stopPropagation()}>
            <div className="preview-header">
              <h2>{previewInv.invoiceNumber} — {previewInv.client.name}</h2>
              <button className="preview-close" onClick={()=>setPreviewInv(null)}>✕</button>
            </div>
            <div style={{padding:24,background:'#f5f5f5',maxHeight:'80vh',overflowY:'auto'}}>
              <div style={{width:'100%',maxWidth:700,margin:'0 auto',background:'#fff',boxShadow:'0 4px 24px rgba(0,0,0,.15)'}}>
                <InvoicePreview invoice={previewInv}/>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit status modal */}
      {editStatusInv && (
        <div className="modal-overlay">
          <div className="modal-card" style={{maxWidth:480}}>
            <div className="modal-header">
              <h2>Update Status — {editStatusInv.invoiceNumber}</h2>
              <button className="modal-close" onClick={()=>setEditStatusInv(null)}>✕</button>
            </div>
            <div style={{padding:'20px 22px',display:'flex',flexDirection:'column',gap:14}}>
              <div className="status-picker">
                {STATUS_OPTS.map(s=>(
                  <button key={s.v} className={`status-opt${newStatus===s.v?' active':''}`} onClick={()=>setNewStatus(s.v)}>
                    <span className="so-label">{s.label}</span>
                  </button>
                ))}
              </div>
              <div className="fg">
                <label>Notes</label>
                <textarea value={newNote} onChange={e=>setNewNote(e.target.value)} placeholder="Add a note about this status..." rows={2}/>
              </div>
              {editStatusInv.statusNote && (
                <div style={{fontSize:12,color:'var(--text3)',padding:'8px 12px',background:'var(--navy4)',borderRadius:6}}>
                  Previous note: {editStatusInv.statusNote}
                </div>
              )}
              <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
                <button className="btn-ghost" onClick={()=>setEditStatusInv(null)}>Cancel</button>
                <button className="btn-gold" onClick={saveStatus}>Save Status</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
