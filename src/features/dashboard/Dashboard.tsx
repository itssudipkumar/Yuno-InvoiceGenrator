import { useState, useEffect } from 'react'
import { ArrowDownToLine, ArrowRight, CalendarDays, CheckCircle2, Clock3, Eye, FileText, Pencil, Plus, Printer, RefreshCw, Settings2, Trash2, TriangleAlert, Users, WalletCards } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Nav from '../../components/layout/Nav'
import { InvoicePreview } from '../../components/invoice/InvoiceTemplates'
import RevenueAnalytics from '../../components/dashboard/RevenueAnalytics'
import { getInvoices, saveInvoice, deleteInvoice, formatCurrency, formatDate, getAustralianTaxDates, getRecurringInvoices, processDueRecurringInvoices, saveRecurringInvoice, deleteRecurringInvoice } from '../../utils/invoice'
import { printInvoice } from '../../utils/print'
import { downloadInvoicePdf } from '../../utils/pdf'
import type { Invoice, InvoiceStatus, RecurringInvoice, RecurringFrequency } from '../../types/invoice.types'
import { STATUS_OPTIONS } from '../../types/invoice.types'
import type { Page } from '../../App'
import './dashboard.css'

interface Props { nav:(p:Page)=>void; onEditDraft?:(inv:Invoice)=>void }

export default function Dashboard({ nav, onEditDraft }: Props) {
  const { user } = useAuth()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [recurringInvoices, setRecurringInvoices] = useState<RecurringInvoice[]>([])
  const [generatedRecurringCount, setGeneratedRecurringCount] = useState(0)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [previewInv, setPreviewInv] = useState<Invoice|null>(null)
  const [printInv, setPrintInv] = useState<Invoice|null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const taxDates = getAustralianTaxDates()

  useEffect(()=>{
    if (!user) return
    let active = true
    const load = async () => {
      try {
        const generated = await processDueRecurringInvoices(user.id)
        const [loadedInvoices, loadedSchedules] = await Promise.all([getInvoices(user.id), getRecurringInvoices(user.id)])
        if (active) {
          setGeneratedRecurringCount(generated)
          setInvoices(loadedInvoices)
          setRecurringInvoices(loadedSchedules)
          setLoadError('')
        }
      } catch (error) {
        console.error('Could not load cloud data', error)
        if (active) setLoadError('Could not load your cloud data. Check your connection and try again.')
      } finally {
        if (active) setLoading(false)
      }
    }
    void load()
    return () => { active = false }
  },[user])
  const reload=async()=>{
    if (!user) return
    const [loadedInvoices, loadedSchedules] = await Promise.all([getInvoices(user.id), getRecurringInvoices(user.id)])
    setInvoices(loadedInvoices)
    setRecurringInvoices(loadedSchedules)
  }

  const filtered=invoices.filter(inv=>{
    const ms=!search||inv.invoiceNumber.toLowerCase().includes(search.toLowerCase())||inv.client.name.toLowerCase().includes(search.toLowerCase())
    const mf=filterStatus==='all'||inv.status===filterStatus
    return ms&&mf
  })

  const issuedInvoices=invoices.filter(invoice=>invoice.status!=='draft')
  const stats={
    total:issuedInvoices.reduce((s,i)=>s+i.total,0),
    paid:invoices.filter(i=>i.status==='paid').reduce((s,i)=>s+i.total,0),
    pending:invoices.filter(i=>i.status==='sent').reduce((s,i)=>s+i.total,0),
    overdue:invoices.filter(i=>i.status==='overdue').reduce((s,i)=>s+i.total,0),
    count:issuedInvoices.length,
  }

  const handleStatusChange=async(inv:Invoice, newStatus:InvoiceStatus)=>{
    try { await saveInvoice({...inv,status:newStatus,updatedAt:new Date().toISOString()}); await reload() }
    catch (error) { console.error('Could not update invoice', error); alert('Could not update the invoice. Please try again.') }
  }

  const handleDelete=async(id:string)=>{
    if(!user || !confirm('Delete this invoice?')) return
    try { await deleteInvoice(id, user.id); await reload() }
    catch (error) { console.error('Could not delete invoice', error); alert('Could not delete the invoice. Please try again.') }
  }

  const handleEditDraft=(inv:Invoice)=>{
    if(onEditDraft) onEditDraft(inv)
  }

  const handlePrintFromDashboard=(inv:Invoice)=>{
    setPrintInv(inv)
    setTimeout(()=>printInvoice('dashboard-print-area'),100)
  }

  const handleRecurringToggle=async(schedule:RecurringInvoice)=>{
    try { await saveRecurringInvoice({...schedule,active:!schedule.active,updatedAt:new Date().toISOString()}); await reload() }
    catch (error) { console.error('Could not update recurring schedule', error); alert('Could not update the schedule. Please try again.') }
  }

  const handleRecurringDelete=async(id:string)=>{
    if(!user || !confirm('Delete this recurring schedule? Existing invoices will not be deleted.')) return
    try { await deleteRecurringInvoice(id, user.id); await reload() }
    catch (error) { console.error('Could not delete recurring schedule', error); alert('Could not delete the schedule. Please try again.') }
  }

  const frequencyLabel=(frequency:RecurringFrequency)=>({
    weekly:'Weekly',
    fortnightly:'Every 2 weeks',
    monthly:'Monthly',
    quarterly:'Quarterly',
    yearly:'Yearly',
  }[frequency])

  const taxColor=(t:string)=>({bas:'#557e72',super:'#8a76a6',tax:'#ce8b59',tpar:'#6c94a7'}[t]||'#888')

  const sc=(s:string)=>({paid:'status-paid',sent:'status-sent',draft:'status-draft',overdue:'status-overdue','on-hold':'status-hold',disputed:'status-disputed'}[s]||'status-draft')

  if (loading || loadError) return (
    <div className="page-dashboard"><Nav nav={nav} current="dashboard"/><div className="dashboard-container">
      {loading ? <p>Loading your workspace…</p> : <div className="error-msg" role="alert">{loadError} <button onClick={()=>window.location.reload()}>Retry</button></div>}
    </div></div>
  )

  return(
    <div className="page-dashboard">
      <Nav nav={nav} current="dashboard"/>
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div>
            <p className="dashboard-eyebrow"><span /> Your workspace <span className="dashboard-eyebrow-divider">/</span> Overview</p>
            <h1>Welcome back, <span>{user?.businessInfo.name||user?.email.split('@')[0]}</span></h1>
            <p className="dashboard-date">Here’s what’s happening with your business today.</p>
            <p className="dashboard-today"><CalendarDays size={15} aria-hidden="true"/>{new Date().toLocaleDateString('en-AU',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</p>
          </div>
          <button className="dashboard-primary" onClick={()=>nav('create-invoice')}><Plus size={17} aria-hidden="true"/> New invoice</button>
        </div>

        <div className="stats-grid">
          <div className="stat-card total"><div className="stat-top"><span className="stat-label">Total invoiced</span><span className="stat-icon"><WalletCards size={18}/></span></div><div className="stat-value">{formatCurrency(stats.total)}</div><div className="stat-sub">{stats.count} issued invoice{stats.count!==1?'s':''}</div></div>
          <div className="stat-card paid"><div className="stat-top"><span className="stat-label">Received</span><span className="stat-icon"><CheckCircle2 size={18}/></span></div><div className="stat-value">{formatCurrency(stats.paid)}</div><div className="stat-sub">{invoices.filter(i=>i.status==='paid').length} paid invoice{invoices.filter(i=>i.status==='paid').length!==1?'s':''}</div></div>
          <div className="stat-card pending"><div className="stat-top"><span className="stat-label">Awaiting payment</span><span className="stat-icon"><Clock3 size={18}/></span></div><div className="stat-value">{formatCurrency(stats.pending)}</div><div className="stat-sub">{invoices.filter(i=>i.status==='sent').length} outstanding</div></div>
          <div className="stat-card overdue"><div className="stat-top"><span className="stat-label">Overdue</span><span className="stat-icon"><TriangleAlert size={18}/></span></div><div className="stat-value">{formatCurrency(stats.overdue)}</div><div className="stat-sub">{invoices.filter(i=>i.status==='overdue').length} overdue</div></div>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-main">
        <RevenueAnalytics invoices={invoices}/>

        {generatedRecurringCount>0&&(
          <div className="save-msg recurring-generated">
            {generatedRecurringCount} recurring invoice draft{generatedRecurringCount===1?'':'s'} ready for review.
          </div>
        )}

        <section className="section-card recurring-list">
          <div className="section-header">
            <div>
              <span className="dashboard-section-kicker">ON YOUR SCHEDULE</span>
              <h2>Recurring invoices</h2>
              <p>Schedules create drafts for you to review; nothing is sent automatically.</p>
            </div>
            <button className="dashboard-secondary" onClick={()=>nav('create-invoice')}><Plus size={15} aria-hidden="true"/> New schedule</button>
          </div>
          {recurringInvoices.length===0?(
            <div className="dashboard-recurring-empty"><span className="dashboard-empty-icon"><RefreshCw size={18}/></span><div><strong>Nothing on repeat yet</strong><p>Create a schedule in the invoice builder and we’ll prepare drafts when they’re due.</p></div></div>
          ):(
            <div className="recurring-list-items">
              {recurringInvoices.map(schedule=>(
                <div className="recurring-row" key={schedule.id}>
                  <div className="recurring-row-main">
                    <strong>{schedule.name}</strong>
                    <span>{frequencyLabel(schedule.frequency)} · {schedule.template.client.name}</span>
                  </div>
                  <div className="recurring-row-next">
                    <span>{schedule.active?'Next draft':'Paused'}</span>
                    <strong>{schedule.active?formatDate(schedule.nextInvoiceDate):'—'}</strong>
                  </div>
                  <div className="recurring-row-actions">
                    <button className="act-btn" onClick={()=>handleRecurringToggle(schedule)}>
                      {schedule.active?'Pause':'Resume'}
                    </button>
                    <button className="act-btn del" onClick={()=>handleRecurringDelete(schedule.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

            <div className="section-card dashboard-invoices">
              <div className="section-header">
                <div><span className="dashboard-section-kicker">YOUR WORK</span><h2>Invoices <span className="dashboard-count">{invoices.length}</span></h2><p className="dashboard-section-description">Find, update and manage your invoices.</p></div>
                <div className="filters">
                  <input aria-label="Search invoices" className="search-input" placeholder="Search invoices" value={search} onChange={e=>setSearch(e.target.value)}/>
                  <select aria-label="Filter invoices by status" value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} className="filter-select">
                    <option value="all">All</option>
                    {STATUS_OPTIONS.map(s=><option key={s.v} value={s.v}>{s.label}</option>)}
                  </select>
                </div>
              </div>
              {filtered.length===0?(
                <div className="empty-state">
                  <div className="dashboard-empty-icon"><FileText size={22} aria-hidden="true"/></div>
                  <strong>{search||filterStatus!=='all'?'No matching invoices':'A fresh start'}</strong>
                  <p>{search||filterStatus!=='all'?'Try a different search or status.':'Your invoices will appear here once you create one.'}</p>
                  {!search&&filterStatus==='all'&&<button className="dashboard-secondary" onClick={()=>nav('create-invoice')}><Plus size={15} aria-hidden="true"/> Create your first invoice</button>}
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
                          <td>
                            <select
                              aria-label={`Status for ${inv.invoiceNumber}`}
                              className={`status-dropdown ${sc(inv.status)}`}
                              value={inv.status}
                              onChange={e=>handleStatusChange(inv,e.target.value as InvoiceStatus)}
                            >
                              {STATUS_OPTIONS.map(s=><option key={s.v} value={s.v}>{s.label}</option>)}
                            </select>
                          </td>
                          <td>
                            <div className="action-btns">
                              <button className="act-btn" title="Preview" aria-label={`Preview ${inv.invoiceNumber}`} onClick={()=>setPreviewInv(inv)}><Eye size={15}/></button>
                              <button className="act-btn" title="Print" aria-label={`Print ${inv.invoiceNumber}`} onClick={()=>handlePrintFromDashboard(inv)}><Printer size={15}/></button>
                              <button className="act-btn" title="Download PDF" aria-label={`Download PDF for ${inv.invoiceNumber}`} onClick={()=>downloadInvoicePdf(inv)}><ArrowDownToLine size={15}/></button>
                              {inv.status==='draft'&&<button className="act-btn edit" title="Edit draft" aria-label={`Edit ${inv.invoiceNumber}`} onClick={()=>handleEditDraft(inv)}><Pencil size={15}/></button>}
                              <button className="act-btn del" title="Delete" aria-label={`Delete ${inv.invoiceNumber}`} onClick={()=>handleDelete(inv.id)}><Trash2 size={15}/></button>
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
              <div className="dashboard-side-heading"><span className="dashboard-side-icon"><CalendarDays size={18}/></span><div><h2>Important dates</h2><p>Upcoming ATO deadlines</p></div></div>
              {taxDates.length===0?<p className="dashboard-side-empty">No upcoming deadlines in the next 120 days.</p>:(
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
                <span><span className="dot" style={{background:taxColor('bas')}}/>BAS</span>
                <span><span className="dot" style={{background:taxColor('super')}}/>Super</span>
                <span><span className="dot" style={{background:taxColor('tax')}}/>Tax</span>
                <span><span className="dot" style={{background:taxColor('tpar')}}/>TPAR</span>
              </div>
            </div>
            <div className="section-card">
              <div className="dashboard-side-heading"><span className="dashboard-side-icon"><ArrowRight size={18}/></span><div><h2>Quick actions</h2><p>Pick up where you left off</p></div></div>
              <div className="quick-actions">
                <button className="quick-btn" onClick={()=>nav('create-invoice')}><FileText size={16}/> New invoice <ArrowRight size={15}/></button>
                <button className="quick-btn" onClick={()=>nav('clients')}><Users size={16}/> Manage clients <ArrowRight size={15}/></button>
                <button className="quick-btn" onClick={()=>nav('account')}><Settings2 size={16}/> Business details <ArrowRight size={15}/></button>
              </div>
            </div>
            <div className="coffee-widget">
              <span className="dashboard-section-kicker">INDEPENDENTLY MADE</span>
              <h2>A little support goes a long way.</h2>
              <p>If YUNO has made your day easier, you can help us keep it that way.</p>
              <a href="https://www.buymeacoffee.com/technoforty" target="_blank" rel="noopener noreferrer">Support YUNO <ArrowRight size={14} aria-hidden="true"/></a>
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
                <button className="btn-gold sm" onClick={()=>downloadInvoicePdf(previewInv)}>⬇ PDF</button>
                <button className="preview-close" aria-label="Close preview" onClick={()=>setPreviewInv(null)}>✕</button>
              </div>
            </div>
            <p className="preview-scroll-hint">Swipe sideways to see the full invoice.</p>
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
