import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import Nav from '../../components/layout/Nav'
import { InvoicePreview } from '../../components/invoice/InvoiceTemplates'
import { getInvoices, saveInvoice, deleteInvoice, formatCurrency, formatDate, getAustralianTaxDates } from '../../utils/invoice'
import { printInvoice } from '../../utils/print'
import type { Invoice, InvoiceStatus } from '../../types/invoice.types'
import { STATUS_OPTIONS } from '../../types/invoice.types'
import type { Page } from '../../App'

interface Props { nav:(p:Page)=>void; onEditDraft?:(inv:Invoice)=>void }

export default function Dashboard({ nav, onEditDraft }: Props) {
  const { user } = useAuth()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [previewInv, setPreviewInv] = useState<Invoice|null>(null)
  const [printInv, setPrintInv] = useState<Invoice|null>(null)
  const taxDates = getAustralianTaxDates()

  useEffect(()=>{ if(user) setInvoices(getInvoices(user.id)) },[user])
  const reload=()=>{ if(user) setInvoices(getInvoices(user.id)) }

  const filtered=invoices.filter(inv=>{
    const ms=!search||inv.invoiceNumber.toLowerCase().includes(search.toLowerCase())||inv.client.name.toLowerCase().includes(search.toLowerCase())
    const mf=filterStatus==='all'||inv.status===filterStatus
    return ms&&mf
  })

  const stats={
    total:invoices.reduce((s,i)=>s+i.total,0),
    paid:invoices.filter(i=>i.status==='paid').reduce((s,i)=>s+i.total,0),
    pending:invoices.filter(i=>i.status==='sent').reduce((s,i)=>s+i.total,0),
    overdue:invoices.filter(i=>i.status==='overdue').reduce((s,i)=>s+i.total,0),
    count:invoices.length,
  }

  // FIX #4: inline dropdown status change
  const handleStatusChange=(inv:Invoice, newStatus:InvoiceStatus)=>{
    saveInvoice({...inv,status:newStatus,updatedAt:new Date().toISOString()})
    reload()
  }

  const handleDelete=(id:string)=>{
    if(!confirm('Delete this invoice?')) return
    deleteInvoice(id); reload()
  }

  // FIX #9: edit draft — navigate to create invoice with draft data
  const handleEditDraft=(inv:Invoice)=>{
    if(onEditDraft) onEditDraft(inv)
  }

  // FIX #5: reprint from dashboard
  const handlePrintFromDashboard=(inv:Invoice)=>{
    setPrintInv(inv)
    setTimeout(()=>printInvoice('dashboard-print-area'),100)
  }

  const taxColor=(t:string)=>({bas:'#C9A84C',super:'#2DD4A7',tax:'#FF8C42',tpar:'#B17BDE'}[t]||'#888')

  const sc=(s:string)=>({paid:'status-paid',sent:'status-sent',draft:'status-draft',overdue:'status-overdue','on-hold':'status-hold',disputed:'status-disputed'}[s]||'status-draft')

  return(
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
                    {STATUS_OPTIONS.map(s=><option key={s.v} value={s.v}>{s.label}</option>)}
                  </select>
                </div>
              </div>
              {filtered.length===0?(
                <div className="empty-state">
                  <div className="empty-icon">📄</div>
                  <p>{search?'No invoices match your search.':'No invoices yet.'}</p>
                  {!search&&<button className="btn-gold sm" onClick={()=>nav('create-invoice')}>Create your first invoice</button>}
                </div>
              ):(
                <div className="invoice-table-wrap">
                  <table className="invoice-table">
                    <thead><tr><th>Invoice #</th><th>Client</th><th>Date</th><th>Due</th><th>Amount</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>
                      {filtered.map(inv=>(
                        <tr key={inv.id}>
                          <td className="inv-num">{inv.invoiceNumber}</td>
                          <td><div className="client-name">{inv.client.name}</div>{inv.client.company&&<div className="client-co">{inv.client.company}</div>}</td>
                          <td>{formatDate(inv.invoiceDate)}</td>
                          <td>{inv.dueDate?formatDate(inv.dueDate):<span style={{color:'var(--text3)'}}>—</span>}</td>
                          <td className="amount">{formatCurrency(inv.total)}</td>
                          {/* FIX #4: dropdown status inline */}
                          <td>
                            <select
                              className={`status-dropdown ${sc(inv.status)}`}
                              value={inv.status}
                              onChange={e=>handleStatusChange(inv,e.target.value as InvoiceStatus)}
                            >
                              {STATUS_OPTIONS.map(s=><option key={s.v} value={s.v}>{s.label}</option>)}
                            </select>
                          </td>
                          <td>
                            <div className="action-btns">
                              <button className="act-btn" title="Preview" onClick={()=>setPreviewInv(inv)}>👁</button>
                              {/* FIX #5: print from dashboard */}
                              <button className="act-btn" title="Print" onClick={()=>handlePrintFromDashboard(inv)}>🖨</button>
                              {/* FIX #9: edit draft */}
                              {inv.status==='draft'&&<button className="act-btn edit" title="Edit draft" onClick={()=>handleEditDraft(inv)}>✏️</button>}
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
              {taxDates.length===0?<p className="muted-text">No upcoming deadlines in 120 days.</p>:(
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
      {previewInv&&(
        <div className="preview-overlay" onClick={()=>setPreviewInv(null)}>
          <div className="preview-modal" onClick={e=>e.stopPropagation()}>
            <div className="preview-header">
              <h2>{previewInv.invoiceNumber} — {previewInv.client.name}</h2>
              <div style={{display:'flex',gap:8}}>
                <button className="btn-gold sm" onClick={()=>handlePrintFromDashboard(previewInv)}>🖨 Print</button>
                <button className="preview-close" onClick={()=>setPreviewInv(null)}>✕</button>
              </div>
            </div>
            <div className="preview-body">
              <div className="preview-a4"><InvoicePreview invoice={previewInv}/></div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden print area for dashboard reprints */}
      {printInv&&(
        <div id="dashboard-print-area" style={{position:'absolute',left:'-9999px',top:0,width:'210mm',background:'#fff'}}>
          <InvoicePreview invoice={printInv}/>
        </div>
      )}
    </div>
  )
}
