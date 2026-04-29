import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import Nav from '../../components/layout/Nav'
import { InvoicePreview } from '../../components/invoice/InvoiceTemplates'
import { LineItemsTable } from '../../components/ui/LineItemsTable'
import { TotalsSidebar } from '../../components/ui/TotalsSidebar'
import { AutocompleteInput, useAddressAutocomplete } from '../../components/ui/AutocompleteInput'
import { saveInvoice, generateInvoiceNumber, getClients, formatCurrency } from '../../utils/invoice'
import { printInvoice } from '../../utils/print'
import type { Invoice, InvoiceItem, Client, ClientInfo } from '../../types/invoice.types'
import type { Page } from '../../App'

interface Props { nav:(p:Page)=>void; editInvoice?:Invoice }

const today = new Date().toISOString().split('T')[0]
const due30 = new Date(Date.now()+30*864e5).toISOString().split('T')[0]

export default function RegisteredInvoice({ nav, editInvoice }: Props) {
  const { user } = useAuth()
  const design = user?.invoiceDesign || 'slate'
  const [clients, setClients] = useState<Client[]>([])
  const [msg, setMsg] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const isEditing = !!editInvoice

  const [clientQ, setClientQ] = useState(editInvoice?.client.name||'')
  const [clientOpts, setClientOpts] = useState<Array<{label:string;sublabel?:string;value:string}>>([])
  const [clientAddrQ, setClientAddrQ] = useState(editInvoice?.client.address||'')
  const fetchAddresses = useAddressAutocomplete()

  const [form, setForm] = useState({
    invoiceNumber: editInvoice?.invoiceNumber||(user?generateInvoiceNumber(user.id):'INV-0001'),
    invoiceDate: editInvoice?.invoiceDate||today,
    dueDate: editInvoice?.dueDate||due30,
    hasDueDate: editInvoice ? !!editInvoice.dueDate : true,
    notes: editInvoice?.notes||'Thank you for your business. Payment is due within 30 days.',
    taxRate: editInvoice?.taxRate??10,
  })

  const [client, setClient] = useState<ClientInfo>(
    editInvoice?.client||{name:'',email:'',phone:'',address:'',company:''}
  )
  const [items, setItems] = useState<InvoiceItem[]>(
    editInvoice?.items||[{id:'1',description:'',quantity:1,unitPrice:0,amount:0}]
  )

  useEffect(()=>{
    if(user){
      const loaded=getClients(user.id)
      setClients(loaded)
      setClientOpts(loaded.map(c=>({label:c.name,sublabel:c.company||c.email,value:c.id})))
    }
  },[user])

  const subtotal=items.reduce((s,i)=>s+i.amount,0)
  const taxAmount=subtotal*form.taxRate/100
  const total=subtotal+taxAmount

  const selectClient=(id:string)=>{
    const c=clients.find(x=>x.id===id); if(!c) return
    setClient({name:c.name,email:c.email,phone:c.phone,address:c.address,company:c.company||''})
    setClientQ(c.name); setClientAddrQ(c.address||'')
  }

  const buildInvoice=(status:Invoice['status']):Invoice=>({
    id: editInvoice?.id||Date.now().toString(),
    userId: user?.id||'',
    invoiceNumber: form.invoiceNumber,
    status, statusNote: editInvoice?.statusNote||'',
    design,
    businessInfo:{
      name:user?.businessInfo.name||'',
      abn:user?.businessInfo.abn||'',
      email:user?.businessInfo.email||'',
      phone:user?.businessInfo.phone||'',
      address:user?.businessInfo.address||'',
      logo:user?.businessInfo.logo||'',
      bankName:user?.businessInfo.bankName||'',
      bsb:user?.businessInfo.bsb||'',
      accountNumber:user?.businessInfo.accountNumber||'',
      accountName:user?.businessInfo.accountName||'',
    },
    client, items, subtotal,
    taxRate:form.taxRate, taxAmount, total,
    invoiceDate:form.invoiceDate,
    dueDate:form.hasDueDate?form.dueDate:'',
    notes:form.notes, paymentTerms:'',
    createdAt:editInvoice?.createdAt||new Date().toISOString(),
    updatedAt:new Date().toISOString(),
  })

  // FIX #4: generate = auto-save sent, straight to dashboard, no status modal
  const handleGenerate=()=>{
    if(!client.name){setMsg('Please enter a client name.');return}
    if(items.every(i=>!i.description)){setMsg('Please add at least one item.');return}
    saveInvoice(buildInvoice('sent'))
    nav('dashboard')
  }

  const handleSaveDraft=()=>{
    saveInvoice(buildInvoice('draft'))
    setMsg(isEditing?'✅ Draft updated!':'✅ Saved as draft!')
    setTimeout(()=>nav('dashboard'),1200)
  }

  const handleEmail=()=>{
    const inv=buildInvoice('sent')
    saveInvoice({...inv,status:'sent'})
    const sub=encodeURIComponent('Invoice '+inv.invoiceNumber+' from '+inv.businessInfo.name)
    const body=encodeURIComponent('Hi '+inv.client.name+',\n\nInvoice '+inv.invoiceNumber+' for '+formatCurrency(inv.total)+'.\n\nDue: '+(inv.dueDate||'On receipt')+'\n\nThank you,\n'+inv.businessInfo.name)
    window.open('mailto:'+inv.client.email+'?subject='+sub+'&body='+body)
    setMsg('✅ Marked as sent!')
  }

  const currentInvoice=buildInvoice('draft')

  return (
    <div className="page-create">
      <Nav nav={nav} current="create-invoice"/>
      <div className="create-container">
        <div className="create-header">
          <h1>{isEditing?`Editing ${editInvoice.invoiceNumber}`:'Create Invoice'}</h1>
          {msg&&<div className="save-msg">{msg}</div>}
        </div>
        <div className="create-layout">
          <div className="create-form">

            {/* Invoice Details */}
            <div className="form-card">
              <h3>📋 Invoice Details</h3>
              <div className="form-row-3">
                <div className="fg"><label>Invoice #</label><input value={form.invoiceNumber} onChange={e=>setForm(f=>({...f,invoiceNumber:e.target.value}))}/></div>
                <div className="fg"><label>Date</label><input type="date" value={form.invoiceDate} onChange={e=>setForm(f=>({...f,invoiceDate:e.target.value}))}/></div>
                {/* FIX #7: optional due date */}
                <div className="fg">
                  <label style={{display:'flex',alignItems:'center',gap:8}}>
                    Due Date
                    <span style={{display:'flex',alignItems:'center',gap:4,fontWeight:400,color:'var(--text3)'}}>
                      <input type="checkbox" checked={form.hasDueDate} onChange={e=>setForm(f=>({...f,hasDueDate:e.target.checked,dueDate:e.target.checked?due30:''}))} style={{width:14,height:14}}/>
                      <span style={{fontSize:11}}>include</span>
                    </span>
                  </label>
                  {form.hasDueDate
                    ?<input type="date" value={form.dueDate} onChange={e=>setForm(f=>({...f,dueDate:e.target.value}))}/>
                    :<div style={{padding:'9px 12px',background:'var(--navy4)',border:'1px solid var(--border)',borderRadius:8,fontSize:13,color:'var(--text3)'}}>No due date shown on invoice</div>
                  }
                </div>
              </div>
              <div className="biz-info-note">
                <span>📁</span>
                <span>Business info auto-filled from your <button onClick={()=>nav('account')}>Account</button>{user?.businessInfo.name?` — ${user.businessInfo.name}`:' (not yet set)'}</span>
              </div>
            </div>

            {/* Client */}
            <div className="form-card">
              <h3>👤 Client Information</h3>
              <div className="form-row-2">
                <div className="fg">
                  <label>Client Name *</label>
                  <AutocompleteInput value={clientQ} onChange={v=>{setClientQ(v);setClient(c=>({...c,name:v}))}} onSelect={(id,opt)=>{selectClient(id);if(opt)setClientQ(opt.label)}} options={clientOpts} placeholder="Type to search saved clients..."/>
                </div>
                <div className="fg"><label>Company</label><input value={client.company||''} onChange={e=>setClient(c=>({...c,company:e.target.value}))}/></div>
              </div>
              <div className="form-row-2">
                <div className="fg"><label>Email</label><input type="email" value={client.email} onChange={e=>setClient(c=>({...c,email:e.target.value}))}/></div>
                <div className="fg"><label>Phone</label><input value={client.phone} onChange={e=>setClient(c=>({...c,phone:e.target.value}))}/></div>
              </div>
              <div className="fg">
                <label>Address</label>
                <AutocompleteInput value={clientAddrQ} onChange={v=>{setClientAddrQ(v);setClient(c=>({...c,address:v}))}} onSelect={v=>{setClientAddrQ(v);setClient(c=>({...c,address:v}))}} fetchOptions={fetchAddresses} placeholder="Start typing for AU address suggestions..." minChars={3}/>
              </div>
            </div>

            <div className="form-card"><h3>📦 Line Items</h3><LineItemsTable items={items} onChange={setItems}/></div>

            <div className="form-card">
              <h3>📝 Notes</h3>
              <div className="fg"><label>Notes (centred at bottom of invoice)</label><textarea value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} rows={3}/></div>
            </div>
          </div>

          <div className="create-sidebar">
            <TotalsSidebar subtotal={subtotal} taxRate={form.taxRate} taxAmount={taxAmount} total={total} onTaxRateChange={r=>setForm(f=>({...f,taxRate:r}))}/>
            <div className="action-card">
              <h3>Actions</h3>
              <button className="action-btn generate" onClick={handleGenerate}>✅ {isEditing?'Save Changes':'Generate Invoice'}</button>
              <button className="action-btn draft" onClick={handleSaveDraft}>💾 Save as Draft</button>
              <button className="action-btn preview" onClick={()=>setShowPreview(true)}>👁 Preview</button>
              <button className="action-btn print" onClick={()=>printInvoice('reg-print-area')}>🖨 Print</button>
              <button className="action-btn email" onClick={handleEmail}>📧 Email to Client</button>
            </div>
            <div className="design-badge-card">
              <span>🎨 <strong style={{color:'var(--gold)',textTransform:'capitalize'}}>{design}</strong></span>
              <button onClick={()=>nav('account')}>Change →</button>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden A4 print area */}
      <div id="reg-print-area" style={{position:'absolute',left:'-9999px',top:0,width:'210mm',background:'#fff'}}>
        <InvoicePreview invoice={currentInvoice}/>
      </div>

      {/* A4 Preview Modal */}
      {showPreview&&(
        <div className="preview-overlay" onClick={()=>setShowPreview(false)}>
          <div className="preview-modal" onClick={e=>e.stopPropagation()}>
            <div className="preview-header">
              <h2>Preview — {design.charAt(0).toUpperCase()+design.slice(1)}</h2>
              <div style={{display:'flex',gap:8}}>
                <button className="btn-gold sm" onClick={()=>printInvoice('reg-print-area')}>🖨 Print</button>
                <button className="preview-close" onClick={()=>setShowPreview(false)}>✕</button>
              </div>
            </div>
            <div className="preview-body">
              <div className="preview-a4"><InvoicePreview invoice={currentInvoice}/></div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
