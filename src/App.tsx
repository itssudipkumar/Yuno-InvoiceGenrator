import { useState, useEffect } from 'react'
import Landing from './pages/Landing'
import Login from './features/auth/Login'
import Dashboard from './features/dashboard/Dashboard'
import GuestInvoice from './features/invoices/GuestInvoice'
import RegisteredInvoice from './features/invoices/RegisteredInvoice'
import Clients from './features/clients/Clients'
import Account from './features/account/Account'
import Expenses from './features/expenses/Expenses'
import { AuthProvider, useAuth } from './context/AuthContext'
import type { Invoice } from './types/invoice.types'

export type Page = 'landing'|'login'|'dashboard'|'create-invoice'|'clients'|'account'|'expenses'

function AppContent() {
  const { user, loading, error, retry, recovering, logout } = useAuth()
  const [page, setPage] = useState<Page>('landing')
  const [guestFallback, setGuestFallback] = useState(false)
  const [logoutError, setLogoutError] = useState('')
  const [editingDraft, setEditingDraft] = useState<Invoice|undefined>(undefined)
  const nav = (p: Page) => { if(p==='login') setGuestFallback(false); setPage(p); if(p!=='create-invoice') setEditingDraft(undefined) }

  useEffect(()=>{
    if(recovering) return
    if(user&&(page==='landing'||page==='login')) setPage('dashboard')
    if(!user&&['dashboard','clients','account','expenses'].includes(page)) setPage('landing')
  },[user, page, recovering])

  // FIX #9: handle edit draft from dashboard
  const handleEditDraft=(inv:Invoice)=>{ setEditingDraft(inv); setPage('create-invoice') }

  if(loading) return <div className="auth-container" role="status">Restoring your session…</div>
  if(error && !guestFallback) return <div className="auth-container"><div className="auth-card">
    <div className="auth-msg error" role="alert">{error}</div>
    {logoutError && <div className="auth-msg error" role="alert">{logoutError}</div>}
    <p>Check your connection and Supabase configuration. Email confirmation and password recovery redirects must allow {window.location.origin} in Supabase Auth URL settings.</p>
    <button className="btn-gold" onClick={retry}>Retry</button>{' '}
    <button className="btn-gold" onClick={() => { setGuestFallback(true); setPage('create-invoice') }}>Continue as guest</button>{' '}
    <button className="btn-gold" onClick={() => { void logout().then(() => { setLogoutError(''); retry() }).catch(e => setLogoutError(e instanceof Error ? e.message : 'Could not sign out.')) }}>Sign out</button>
  </div></div>
  if(error && guestFallback) return <><div role="alert" className="auth-msg error">Cloud authentication unavailable: {error} <button onClick={() => { setGuestFallback(false); retry() }}>Retry</button></div>{page === 'create-invoice' ? <GuestInvoice nav={nav}/> : <Landing nav={nav}/>}</>
  if(recovering) return <Login nav={nav}/>
  if(!user){
    if(page==='login') return <Login nav={nav}/>
    if(page==='create-invoice') return <GuestInvoice nav={nav}/>
    return <Landing nav={nav}/>
  }

  switch(page){
    case 'dashboard':      return <Dashboard nav={nav} onEditDraft={handleEditDraft}/>
    case 'create-invoice': return <RegisteredInvoice nav={nav} editInvoice={editingDraft}/>
    case 'clients':        return <Clients nav={nav}/>
    case 'expenses':       return <Expenses nav={nav}/>
    case 'account':        return <Account nav={nav}/>
    default:               return <Dashboard nav={nav} onEditDraft={handleEditDraft}/>
  }
}

export default function App(){
  return <AuthProvider><AppContent/></AuthProvider>
}
