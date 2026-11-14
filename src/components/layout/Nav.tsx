import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import type { Page } from '../../App'
import yunoLight from '../../../yuno_light.svg'
import yunoDark from '../../../yuno_dark.svg'

export default function Nav({ nav, current }: { nav: (p: Page) => void; current?: Page }) {
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [logoutError, setLogoutError] = useState('')
  const [loggingOut, setLoggingOut] = useState(false)
  const navigate = (page: Page) => { setMenuOpen(false); nav(page) }
  const handleLogout = async () => {
    setLoggingOut(true); setLogoutError('')
    try { await logout(); setMenuOpen(false) }
    catch (error) { setLogoutError(error instanceof Error ? error.message : 'Could not sign out.') }
    finally { setLoggingOut(false) }
  }
  return (
    <nav className="yuno-nav" aria-label="Main navigation" onKeyDown={e => { if (e.key === 'Escape') setMenuOpen(false) }}>
      <button type="button" className="nav-brand" onClick={() => navigate(user ? 'dashboard' : 'landing')} aria-label={user ? 'YUNO dashboard' : 'YUNO home'}>
        <img src={yunoLight} alt="" className="nav-logo-img nav-logo-on-light" />
        <img src={yunoDark} alt="" className="nav-logo-img nav-logo-on-dark" />
      </button>
      <button type="button" className="nav-menu-toggle" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} aria-controls="main-nav-links" onClick={() => setMenuOpen(open => !open)}>
        {menuOpen ? <X size={21} /> : <Menu size={21} />}
      </button>
      <div id="main-nav-links" className={`nav-links${menuOpen ? ' nav-links--open' : ''}`}>
        {user ? (
          <>
            <button className={`nav-link${current === 'dashboard' ? ' active' : ''}`} onClick={() => navigate('dashboard')}>Dashboard</button>
            <button className={`nav-link${current === 'create-invoice' ? ' active' : ''}`} onClick={() => navigate('create-invoice')}>New Invoice</button>
            <button className={`nav-link${current === 'clients' ? ' active' : ''}`} onClick={() => navigate('clients')}>Clients</button>
            <button className={`nav-link${current === 'expenses' ? ' active' : ''}`} onClick={() => navigate('expenses')}>Expenses</button>
            <button className={`nav-link${current === 'account' ? ' active' : ''}`} onClick={() => navigate('account')}>Account</button>
            <button className="nav-btn-logout" disabled={loggingOut} onClick={handleLogout}>{loggingOut ? 'Signing out…' : 'Logout'}</button>
          </>
        ) : (
          <>
            <button className="nav-link" onClick={() => navigate('create-invoice')}>Try Free</button>
            <button className="nav-btn-primary" onClick={() => navigate('login')}>Sign In</button>
          </>
        )}
      </div>
      {logoutError && <span role="alert">{logoutError}</span>}
    </nav>
  )
}
