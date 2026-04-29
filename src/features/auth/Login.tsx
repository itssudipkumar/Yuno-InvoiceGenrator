import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import Nav from '../../components/layout/Nav'

type Page = 'landing' | 'login' | 'dashboard' | 'create-invoice' | 'clients' | 'account'

export default function Login({ nav }: { nav: (p: Page) => void }) {
  const { login, register } = useAuth()
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [bizName, setBizName] = useState('')
  const [confirm, setConfirm] = useState('')
  const [msg, setMsg] = useState('')
  const [ok, setOk] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    const r = login(email, password)
    if (r.ok) { nav('dashboard') } else { setMsg(r.msg); setOk(false) }
  }

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) { setMsg('Passwords do not match'); setOk(false); return }
    if (password.length < 6) { setMsg('Password must be at least 6 characters'); setOk(false); return }
    const r = register(email, password, bizName)
    if (r.ok) { nav('dashboard') } else { setMsg(r.msg); setOk(false) }
  }

  return (
    <div className="page-auth">
      <Nav nav={nav} current="login" />
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-logo">
            <svg viewBox="0 0 40 40" fill="none" width="48" height="48">
              <circle cx="20" cy="20" r="20" fill="#C9A84C"/>
              <text x="20" y="26" textAnchor="middle" fontSize="18" fontWeight="800" fill="#0A0F1E">Y</text>
            </svg>
            <div>
              <div className="auth-brand">YUNO</div>
              <div className="auth-sub">by TechnoForty</div>
            </div>
          </div>

          <div className="auth-tabs">
            <button className={tab === 'login' ? 'auth-tab active' : 'auth-tab'} onClick={() => { setTab('login'); setMsg('') }}>Sign In</button>
            <button className={tab === 'register' ? 'auth-tab active' : 'auth-tab'} onClick={() => { setTab('register'); setMsg('') }}>Create Account</button>
          </div>

          {msg && <div className={ok ? 'auth-msg success' : 'auth-msg error'}>{msg}</div>}

          {tab === 'login' ? (
            <form onSubmit={handleLogin} className="auth-form">
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@business.com.au" required />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Your password" required />
              </div>
              <button type="submit" className="btn-gold full">Sign In</button>
              <p className="auth-hint">Don't have an account? <button type="button" onClick={() => setTab('register')}>Create one free</button></p>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="auth-form">
              <div className="form-group">
                <label>Business Name</label>
                <input type="text" value={bizName} onChange={e => setBizName(e.target.value)} placeholder="Acme Pty Ltd" required />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@business.com.au" required />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters" required />
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Confirm your password" required />
              </div>
              <button type="submit" className="btn-gold full">Create Free Account</button>
              <p className="auth-hint">Already have an account? <button type="button" onClick={() => setTab('login')}>Sign in</button></p>
            </form>
          )}

          <div className="auth-guest">
            <span>Just browsing?</span>
            <button onClick={() => nav('create-invoice')}>Try without account →</button>
          </div>
        </div>
      </div>
    </div>
  )
}
