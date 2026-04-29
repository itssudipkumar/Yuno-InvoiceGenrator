import { useState, useEffect } from 'react'
import Landing from './pages/Landing'
import Login from './features/auth/Login'
import Dashboard from './features/dashboard/Dashboard'
import GuestInvoice from './features/invoices/GuestInvoice'
import RegisteredInvoice from './features/invoices/RegisteredInvoice'
import Clients from './features/clients/Clients'
import Account from './features/account/Account'
import { AuthProvider, useAuth } from './context/AuthContext'
import type { Invoice } from './types/invoice.types'

export type Page = 'landing'|'login'|'dashboard'|'create-invoice'|'clients'|'account'

function AppContent() {
  const { user } = useAuth()
  const [page, setPage] = useState<Page>('landing')
  const [editingDraft, setEditingDraft] = useState<Invoice|undefined>(undefined)
  const nav = (p: Page) => { setPage(p); if(p!=='create-invoice') setEditingDraft(undefined) }

  useEffect(()=>{
    if(user&&(page==='landing'||page==='login')) setPage('dashboard')
    if(!user&&['dashboard','clients','account'].includes(page)) setPage('landing')
  },[user])

  // FIX #9: handle edit draft from dashboard
  const handleEditDraft=(inv:Invoice)=>{ setEditingDraft(inv); setPage('create-invoice') }

  if(!user){
    if(page==='login') return <Login nav={nav}/>
    if(page==='create-invoice') return <GuestInvoice nav={nav}/>
    return <Landing nav={nav}/>
  }

  switch(page){
    case 'dashboard':      return <Dashboard nav={nav} onEditDraft={handleEditDraft}/>
    case 'create-invoice': return <RegisteredInvoice nav={nav} editInvoice={editingDraft}/>
    case 'clients':        return <Clients nav={nav}/>
    case 'account':        return <Account nav={nav}/>
    default:               return <Dashboard nav={nav} onEditDraft={handleEditDraft}/>
  }
}

export default function App(){
  return <AuthProvider><AppContent/></AuthProvider>
}
