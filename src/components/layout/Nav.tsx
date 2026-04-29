import { useAuth } from '../../context/AuthContext'
import type { Page } from '../../App'
import yunoLogo from '../../assets/yuno-logo.png'

export default function Nav({ nav, current }: { nav: (p: Page) => void; current?: Page }) {
  const { user, logout } = useAuth()
  return (
    <nav className="yuno-nav">
      <div className="nav-brand" onClick={() => nav(user ? 'dashboard' : 'landing')}>
        <img src={yunoLogo} alt="YUNO" className="nav-logo-img" />
        <span className="nav-brand-name">YUNO</span>
      </div>
      <div className="nav-links">
        {user ? (
          <>
            <button className={`nav-link${current === 'dashboard' ? ' active' : ''}`} onClick={() => nav('dashboard')}>Dashboard</button>
            <button className={`nav-link${current === 'create-invoice' ? ' active' : ''}`} onClick={() => nav('create-invoice')}>New Invoice</button>
            <button className={`nav-link${current === 'clients' ? ' active' : ''}`} onClick={() => nav('clients')}>Clients</button>
            <button className={`nav-link${current === 'account' ? ' active' : ''}`} onClick={() => nav('account')}>Account</button>
            <button className="nav-btn-logout" onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <button className="nav-link" onClick={() => nav('create-invoice')}>Try Free</button>
            <button className="nav-btn-primary" onClick={() => nav('login')}>Sign In</button>
          </>
        )}
      </div>
    </nav>
  )
}
