import { useAuth } from '../../context/AuthContext'
import type { Page } from '../../App'

export default function Nav({ nav, current }: { nav: (p: Page) => void; current?: Page }) {
  const { user, logout } = useAuth()
  return (
    <nav className="yuno-nav">
      <div className="nav-brand" onClick={() => nav(user ? 'dashboard' : 'landing')}>
        <svg viewBox="0 0 40 40" fill="none" width="34" height="34">
          <circle cx="20" cy="20" r="20" fill="#C9A84C"/>
          <text x="20" y="26" textAnchor="middle" fontSize="18" fontWeight="800" fill="#0A0F1E">Y</text>
        </svg>
        <span className="nav-brand-name">YUNO</span>
      </div>
      <div className="nav-links">
        {user ? (
          <>
            <button className={`nav-link${current==='dashboard'?' active':''}`} onClick={()=>nav('dashboard')}>Dashboard</button>
            <button className={`nav-link${current==='create-invoice'?' active':''}`} onClick={()=>nav('create-invoice')}>New Invoice</button>
            <button className={`nav-link${current==='clients'?' active':''}`} onClick={()=>nav('clients')}>Clients</button>
            <button className={`nav-link${current==='account'?' active':''}`} onClick={()=>nav('account')}>Account</button>
            <button className="nav-btn-logout" onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <button className="nav-link" onClick={()=>nav('create-invoice')}>Try Free</button>
            <button className="nav-btn-primary" onClick={()=>nav('login')}>Sign In</button>
          </>
        )}
      </div>
    </nav>
  )
}
