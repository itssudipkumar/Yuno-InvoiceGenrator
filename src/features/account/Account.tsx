import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import Nav from '../../components/layout/Nav'
import type { Page } from '../../App'

const DESIGNS = [
  {id:'prestige',label:'Prestige',desc:'Luxury dark, Cormorant serif'},
  {id:'frost',label:'Frost',desc:'Corporate navy gradient'},
  {id:'terra',label:'Terra',desc:'Warm terracotta & cream'},
  {id:'prism',label:'Prism',desc:'Light with indigo geometric'},
  {id:'linen',label:'Linen',desc:'Editorial cream & italic'},
  {id:'blueprint',label:'Blueprint',desc:'Monospace technical'},
  {id:'flora',label:'Flora',desc:'Sage green organic'},
  {id:'slate',label:'Slate',desc:'Ultra minimal Bauhaus'},
]

export default function Account({ nav }: { nav:(p:Page)=>void }) {
  const { user, updateUser, logout } = useAuth()
  const [tab, setTab] = useState<'business'|'profile'|'security'>('business')
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  const [biz, setBiz] = useState({
    name: user?.businessInfo.name||'',
    abn: user?.businessInfo.abn||'',
    email: user?.businessInfo.email||'',
    phone: user?.businessInfo.phone||'',
    address: user?.businessInfo.address||'',
    website: user?.businessInfo.website||'',
    bsb: user?.businessInfo.bsb||'',
    accountNumber: user?.businessInfo.accountNumber||'',
    bankName: user?.businessInfo.bankName||'',
    logo: user?.businessInfo.logo||'',
  })
  const [design, setDesign] = useState(user?.invoiceDesign||'slate')
  const [profile, setProfile] = useState({email:user?.email||''})
  const [security, setSecurity] = useState({current:'',newP:'',confirm:''})

  const show = (ok:boolean,m:string) => {
    ok?setMsg(m):setErr(m)
    ok?setErr(''):setMsg('')
    setTimeout(()=>{setMsg('');setErr('')},3500)
  }

  const saveBiz = (e:React.FormEvent) => {
    e.preventDefault()
    if(!user) return
    updateUser({...user,businessInfo:{...user.businessInfo,...biz},invoiceDesign:design})
    show(true,'✅ Business info saved!')
  }

  const saveProfile = (e:React.FormEvent) => {
    e.preventDefault()
    if(!user) return
    updateUser({...user,email:profile.email})
    show(true,'✅ Profile updated!')
  }

  const savePassword = (e:React.FormEvent) => {
    e.preventDefault()
    if(!user) return
    if(user.password!==btoa(security.current)){show(false,'Current password incorrect');return}
    if(security.newP!==security.confirm){show(false,'Passwords do not match');return}
    if(security.newP.length<6){show(false,'Min 6 characters');return}
    updateUser({...user,password:btoa(security.newP)})
    setSecurity({current:'',newP:'',confirm:''})
    show(true,'✅ Password updated!')
  }

  const logoUpload = (e:React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if(!file) return
    const reader = new FileReader()
    reader.onload = ev => setBiz(b=>({...b,logo:ev.target?.result as string}))
    reader.readAsDataURL(file)
  }

  return (
    <div className="page-account">
      <Nav nav={nav} current="account"/>
      <div className="account-container">
        <div className="account-header">
          <div className="account-avatar">
            {biz.logo
              ? <img src={biz.logo} alt="logo" style={{width:60,height:60,objectFit:'contain',borderRadius:'50%'}}/>
              : (user?.businessInfo.name||user?.email||'U')[0].toUpperCase()
            }
          </div>
          <div style={{flex:1}}>
            <h1>{user?.businessInfo.name||'My Business'}</h1>
            <p>{user?.email}</p>
            <p className="muted-text">Member since {user?new Date(user.createdAt).toLocaleDateString('en-AU',{year:'numeric',month:'long'}):''}</p>
          </div>
          <button className="btn-logout" onClick={logout}>Logout</button>
        </div>

        <div className="account-tabs">
          {(['business','profile','security'] as const).map(t=>(
            <button key={t} className={`account-tab${tab===t?' active':''}`} onClick={()=>setTab(t)}>
              {t==='business'?'🏢 Business':t==='profile'?'👤 Profile':'🔒 Security'}
            </button>
          ))}
        </div>

        {msg && <div className="save-msg" style={{marginBottom:12}}>{msg}</div>}
        {err && <div className="error-msg" style={{marginBottom:12}}>{err}</div>}

        {tab==='business' && (
          <form onSubmit={saveBiz} className="account-form">
            {/* Logo */}
            <div className="form-card">
              <h3>Business Logo</h3>
              <div className="logo-upload">
                {biz.logo
                  ? <img src={biz.logo} alt="logo" className="logo-preview"/>
                  : <div style={{width:80,height:52,flexShrink:0}}/>
                }
                <div>
                  <label className="upload-btn">Upload Logo<input type="file" accept="image/*" onChange={logoUpload} hidden/></label>
                  <p className="upload-hint">PNG/JPG/SVG. Shown on all invoices. Optional.</p>
                  {biz.logo && <button type="button" className="remove-logo" onClick={()=>setBiz(b=>({...b,logo:''}))}>Remove logo</button>}
                </div>
              </div>
            </div>

            {/* Business details */}
            <div className="form-card">
              <h3>Business Details</h3>
              <div className="form-row-2">
                <div className="fg"><label>Business Name *</label><input value={biz.name} onChange={e=>setBiz(b=>({...b,name:e.target.value}))} required/></div>
                <div className="fg"><label>ABN</label><input value={biz.abn} onChange={e=>setBiz(b=>({...b,abn:e.target.value}))} placeholder="12 345 678 901"/></div>
              </div>
              <div className="form-row-2">
                <div className="fg"><label>Business Email</label><input type="email" value={biz.email} onChange={e=>setBiz(b=>({...b,email:e.target.value}))}/></div>
                <div className="fg"><label>Phone</label><input value={biz.phone} onChange={e=>setBiz(b=>({...b,phone:e.target.value}))}/></div>
              </div>
              <div className="fg"><label>Business Address</label><input value={biz.address} onChange={e=>setBiz(b=>({...b,address:e.target.value}))}/></div>
              <div className="fg"><label>Website</label><input value={biz.website} onChange={e=>setBiz(b=>({...b,website:e.target.value}))} placeholder="https://yourbusiness.com.au"/></div>
            </div>

            {/* Bank details */}
            <div className="form-card">
              <h3>Bank Details <span style={{fontSize:12,color:'var(--text3)',fontWeight:400}}>(shown on invoices)</span></h3>
              <div className="form-row-3">
                <div className="fg"><label>Bank Name</label><input value={biz.bankName} onChange={e=>setBiz(b=>({...b,bankName:e.target.value}))} placeholder="ANZ, CBA, NAB…"/></div>
                <div className="fg"><label>BSB</label><input value={biz.bsb} onChange={e=>setBiz(b=>({...b,bsb:e.target.value}))} placeholder="062-000"/></div>
                <div className="fg"><label>Account Number</label><input value={biz.accountNumber} onChange={e=>setBiz(b=>({...b,accountNumber:e.target.value}))}/></div>
              </div>
              <div className="fg"><label>Account Name</label><input value={(biz as any).accountName||''} onChange={e=>setBiz(b=>({...b,accountName:e.target.value}))} placeholder="e.g. John Smith Trading"/></div>
              <div style={{display:'none'}}>
              </div>
            </div>

            {/* Invoice design */}
            <div className="form-card">
              <h3>Default Invoice Design</h3>
              <div className="design-options">
                {DESIGNS.map(d=>(
                  <button key={d.id} type="button" className={`design-opt${design===d.id?' active':''}`} onClick={()=>setDesign(d.id)}>
                    <span className="design-name">{d.label}</span>
                    <span className="design-desc">{d.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" className="btn-gold">Save Business Info</button>
          </form>
        )}

        {tab==='profile' && (
          <form onSubmit={saveProfile} className="account-form">
            <div className="form-card">
              <h3>Account Details</h3>
              <div className="fg"><label>Email Address</label><input type="email" value={profile.email} onChange={e=>setProfile(p=>({...p,email:e.target.value}))} required/></div>
            </div>
            <button type="submit" className="btn-gold">Save Profile</button>
          </form>
        )}

        {tab==='security' && (
          <form onSubmit={savePassword} className="account-form">
            <div className="form-card">
              <h3>Change Password</h3>
              <div className="fg"><label>Current Password</label><input type="password" value={security.current} onChange={e=>setSecurity(s=>({...s,current:e.target.value}))} required/></div>
              <div className="form-row-2">
                <div className="fg"><label>New Password</label><input type="password" value={security.newP} onChange={e=>setSecurity(s=>({...s,newP:e.target.value}))} required/></div>
                <div className="fg"><label>Confirm New Password</label><input type="password" value={security.confirm} onChange={e=>setSecurity(s=>({...s,confirm:e.target.value}))} required/></div>
              </div>
            </div>
            <button type="submit" className="btn-gold">Update Password</button>
          </form>
        )}
      </div>
    </div>
  )
}
