import { useState } from 'react'
import Nav from '../../components/layout/Nav'
import { InvoicePreview } from '../../components/invoice/InvoiceTemplates'
import { LineItemsTable } from '../../components/ui/LineItemsTable'
import { TotalsSidebar } from '../../components/ui/TotalsSidebar'
import { AutocompleteInput, useAddressAutocomplete } from '../../components/ui/AutocompleteInput'
import { printInvoice } from '../../utils/print'
import { INVOICE_DESIGNS } from '../../types/invoice.types'
import { formatCurrency } from '../../utils/invoice'
import type { Invoice, InvoiceItem, BusinessInfo, ClientInfo } from '../../types/invoice.types'
import type { Page } from '../../App'

interface Props { nav:(p:Page)=>void }

const today=new Date().toISOString().split('T')[0]
const due30=new Date(Date.now()+30*864e5).toISOString().split('T')[0]

const DEFAULT_BIZ:BusinessInfo={name:'',abn:'',email:'',phone:'',address:'',logo:'',bankName:'',bsb:'',accountNumber:'',accountName:''}
const DEFAULT_CLIENT:ClientInfo={name:'',email:'',phone:'',address:'',company:''}

export default function GuestInvoice({nav}:Props){
  const [design,setDesign]=useState('slate')
  const [biz,setBiz]=useState<BusinessInfo>(DEFAULT_BIZ)
  const [client,setClient]=useState<ClientInfo>(DEFAULT_CLIENT)
  const [items,setItems]=useState<InvoiceItem[]>([{id:'1',description:'',quantity:1,unitPrice:0,amount:0}])
  const [form,setForm]=useState({
    invoiceNumber:'INV-0001', invoiceDate:today,
    dueDate:due30, hasDueDate:true,
    notes:'Thank you for your business. Payment is due within 30 days.',
    taxRate:10,
  })
  const [showPreview,setShowPreview]=useState(false)
  const [msg,setMsg]=useState('')
  const fetchAddresses=useAddressAutocomplete()
  const [clientAddrQ,setClientAddrQ]=useState('')
  const [bizAddrQ,setBizAddrQ]=useState('')

  const subtotal=items.reduce((s,i)=>s+i.amount,0)
  const taxAmount=subtotal*form.taxRate/100
  const total=subtotal+taxAmount

  const buildInvoice=():Invoice=>({
    id:Date.now().toString(), userId:'guest',
    invoiceNumber:form.invoiceNumber, status:'draft', statusNote:'',
    design, businessInfo:biz, client, items,
    subtotal, taxRate:form.taxRate, taxAmount, total,
    invoiceDate:form.invoiceDate,
    dueDate:form.hasDueDate?form.dueDate:'',
    notes:form.notes, paymentTerms:'',
    createdAt:new Date().toISOString(), updatedAt:new Date().toISOString(),
  })

  const logoUpload=(e:React.ChangeEvent<HTMLInputElement>)=>{
    const file=e.target.files?.[0]; if(!file) return
    const reader=new FileReader()
    reader.onload=ev=>setBiz(b=>({...b,logo:ev.target?.result as string}))
    reader.readAsDataURL(file)
  }

  const handleEmail=()=>{
    if(!client.email){setMsg('Please enter client email first.');return}
    const inv=buildInvoice()
    const sub=encodeURIComponent('Invoice '+inv.invoiceNumber+' from '+inv.businessInfo.name)
    const body=encodeURIComponent('Hi '+inv.client.name+',\n\nInvoice '+inv.invoiceNumber+' for '+formatCurrency(inv.total)+'.\n\nDue: '+(inv.dueDate||'On receipt')+'\n\nThank you,\n'+inv.businessInfo.name)
    window.open('mailto:'+inv.client.email+'?subject='+sub+'&body='+body)
  }

  const currentInvoice=buildInvoice()

  return(
    <div className="page-create">
      <Nav nav={nav} current="create-invoice"/>
      <div className="guest-banner">
        <span>👋 Guest mode — invoices won't be saved.</span>
        <button onClick={()=>nav('login')}>Create free account to save →</button>
      </div>
      <div className="create-container">
        <div className="create-header">
          <h1>Create Invoice</h1>
          {msg&&<div className="save-msg">{msg}</div>}
        </div>

        {/* Design Selector */}
        <div className="form-card" style={{marginBottom:20}}>
          <h3>🎨 Invoice Design</h3>
          <div className="design-options">
            {INVOICE_DESIGNS.map(d=>(
              <button key={d.id} className={`design-opt${design===d.id?' active':''}`} onClick={()=>setDesign(d.id)}>
                <span className="design-name">{d.label}</span>
                <span className="design-desc">{d.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="create-layout">
          <div className="create-form">

            {/* Business Info */}
            <div className="form-card">
              <h3>🏢 Your Business Information</h3>
              <p style={{fontSize:12,color:'var(--text3)',marginTop:-6}}>
                <button onClick={()=>nav('login')} style={{background:'none',border:'none',color:'var(--gold)',cursor:'pointer',fontSize:12,fontFamily:"'DM Sans',sans-serif"}}>Sign up free</button>{' '}to save this permanently — never fill it in again.
              </p>
              <div className="logo-upload">
                {biz.logo?<img src={biz.logo} alt="logo" className="logo-preview"/>:<div style={{width:80,height:52,flexShrink:0}}/>}
                <div>
                  <label className="upload-btn">{biz.logo?'Change Logo':'Upload Logo'}<input type="file" accept="image/*" onChange={logoUpload} hidden/></label>
                  <p className="upload-hint">PNG/JPG/SVG · Optional</p>
                  {biz.logo&&<button type="button" className="remove-logo" onClick={()=>setBiz(b=>({...b,logo:''}))}>Remove logo</button>}
                </div>
              </div>
              <div className="form-row-2">
                <div className="fg"><label>Business Name *</label><input value={biz.name} onChange={e=>setBiz(b=>({...b,name:e.target.value}))} placeholder="Acme Solutions Pty Ltd"/></div>
                <div className="fg"><label>ABN</label><input value={biz.abn} onChange={e=>setBiz(b=>({...b,abn:e.target.value}))} placeholder="12 345 678 901"/></div>
              </div>
              <div className="form-row-2">
                <div className="fg"><label>Business Email</label><input type="email" value={biz.email} onChange={e=>setBiz(b=>({...b,email:e.target.value}))} placeholder="hello@yourbusiness.com.au"/></div>
                <div className="fg"><label>Phone</label><input value={biz.phone} onChange={e=>setBiz(b=>({...b,phone:e.target.value}))} placeholder="+61 2 0000 0000"/></div>
              </div>
              <div className="fg">
                <label>Business Address</label>
                <AutocompleteInput value={bizAddrQ} onChange={v=>{setBizAddrQ(v);setBiz(b=>({...b,address:v}))}} onSelect={v=>{setBizAddrQ(v);setBiz(b=>({...b,address:v}))}} fetchOptions={fetchAddresses} placeholder="Start typing for AU address suggestions..." minChars={3}/>
              </div>
            </div>

            {/* Bank Details — FIX #8: account name added */}
            <div className="form-card">
              <h3>🏦 Bank Details <span style={{fontSize:12,color:'var(--text3)',fontWeight:400}}>(shown on invoice)</span></h3>
              <div className="form-row-2">
                <div className="fg"><label>Account Name</label><input value={biz.accountName||''} onChange={e=>setBiz(b=>({...b,accountName:e.target.value}))} placeholder="John Smith or Acme Pty Ltd"/></div>
                <div className="fg"><label>Bank Name</label><input value={biz.bankName||''} onChange={e=>setBiz(b=>({...b,bankName:e.target.value}))} placeholder="ANZ, CBA…"/></div>
              </div>
              <div className="form-row-2">
                <div className="fg"><label>BSB</label><input value={biz.bsb||''} onChange={e=>setBiz(b=>({...b,bsb:e.target.value}))} placeholder="062-000"/></div>
                <div className="fg"><label>Account Number</label><input value={biz.accountNumber||''} onChange={e=>setBiz(b=>({...b,accountNumber:e.target.value}))}/></div>
              </div>
            </div>

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
                    :<div style={{padding:'9px 12px',background:'var(--navy4)',border:'1px solid var(--border)',borderRadius:8,fontSize:13,color:'var(--text3)'}}>No due date on invoice</div>
                  }
                </div>
              </div>
            </div>

            {/* Client */}
            <div className="form-card">
              <h3>👤 Client Information</h3>
              <div className="form-row-2">
                <div className="fg"><label>Client Name *</label><input value={client.name} onChange={e=>setClient(c=>({...c,name:e.target.value}))} placeholder="Client full name"/></div>
                <div className="fg"><label>Company</label><input value={client.company||''} onChange={e=>setClient(c=>({...c,company:e.target.value}))} placeholder="Optional"/></div>
              </div>
              <div className="form-row-2">
                <div className="fg"><label>Email</label><input type="email" value={client.email} onChange={e=>setClient(c=>({...c,email:e.target.value}))} placeholder="client@example.com"/></div>
                <div className="fg"><label>Phone</label><input value={client.phone} onChange={e=>setClient(c=>({...c,phone:e.target.value}))} placeholder="+61 4 0000 0000"/></div>
              </div>
              <div className="fg">
                <label>Client Address</label>
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
              <button className="action-btn preview" onClick={()=>setShowPreview(true)}>👁 Preview</button>
              <button className="action-btn print" onClick={()=>printInvoice('guest-print-area')}>🖨 Print</button>
              <button className="action-btn email" onClick={handleEmail}>📧 Email to Client</button>
            </div>
            <div className="signup-nudge">
              <p>💡 <strong style={{color:'var(--gold)'}}>Save time every invoice.</strong><br/>Sign up free — save your business info, clients, bank details and access your full dashboard.</p>
              <button className="btn-gold full" onClick={()=>nav('login')}>Sign Up Free — 30 Seconds</button>
            </div>
          </div>
        </div>
      </div>

      <div id="guest-print-area" style={{position:'absolute',left:'-9999px',top:0,width:'210mm',background:'#fff'}}>
        <InvoicePreview invoice={currentInvoice}/>
      </div>

      {showPreview&&(
        <div className="preview-overlay" onClick={()=>setShowPreview(false)}>
          <div className="preview-modal" onClick={e=>e.stopPropagation()}>
            <div className="preview-header">
              <h2>Preview — {design.charAt(0).toUpperCase()+design.slice(1)}</h2>
              <div style={{display:'flex',gap:8}}>
                <button className="btn-gold sm" onClick={()=>printInvoice('guest-print-area')}>🖨 Print</button>
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
