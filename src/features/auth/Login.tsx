import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import Nav from '../../components/layout/Nav'
import type { Page } from '../../App'

type Tab = 'login' | 'register' | 'forgot' | 'recovery'
export default function Login({ nav }: { nav: (p: Page) => void }) {
  const { login, register, requestReset, resetPassword, cancelRecovery, recovering, recoveryError, user } = useAuth()
  const [tab, setTab] = useState<Tab>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [bizName, setBizName] = useState('')
  const [confirm, setConfirm] = useState('')
  const [msg, setMsg] = useState('')
  const [ok, setOk] = useState(false)
  const [busy, setBusy] = useState(false)
  const activeTab = recovering ? (user ? 'recovery' : 'forgot') : tab
  const changeTab = (next:Tab) => { setTab(next); setMsg(''); setPassword(''); setConfirm('') }
  const handleSubmit = async (e:React.FormEvent) => {
    e.preventDefault(); setMsg(''); setOk(false)
    if ((activeTab === 'register' || activeTab === 'recovery') && password !== confirm) { setMsg('Passwords do not match'); return }
    if ((activeTab === 'register' || activeTab === 'recovery') && password.length < 6) { setMsg('Password must be at least 6 characters'); return }
    setBusy(true)
    try {
      if (activeTab === 'login') { await login(email,password) }
      if (activeTab === 'register') { await register(email,password,bizName); setOk(true); setMsg('If this address can be registered, check your email for a verification link before signing in.') }
      if (activeTab === 'forgot') { await requestReset(email); setOk(true); setMsg('If an account exists for this address, a password reset email has been sent.') }
      if (activeTab === 'recovery') { await resetPassword(password); setPassword(''); setConfirm(''); setOk(true); setMsg('Password updated.'); nav('dashboard') }
    } catch (error) { setMsg(error instanceof Error ? error.message : 'Something went wrong. Please try again.') }
    finally { setBusy(false) }
  }
  const handleCancelRecovery = async () => {
    setBusy(true); setMsg('')
    try { await cancelRecovery(); changeTab('login') }
    catch (error) { setMsg(error instanceof Error ? error.message : 'Unable to cancel recovery.') }
    finally { setBusy(false) }
  }
  return (
    <div className="page-auth">
      <Nav nav={nav} current="login" />
      <div className="auth-container"><div className="auth-card">
        <div className="auth-logo">
          <svg viewBox="0 0 40 40" fill="none" width="48" height="48"><circle cx="20" cy="20" r="20" fill="#C9A84C"/><text x="20" y="26" textAnchor="middle" fontSize="18" fontWeight="800" fill="#0A0F1E">Y</text></svg>
          <div><div className="auth-brand">YUNO</div><div className="auth-sub">by TechnoForty</div></div>
        </div>
        <div className="auth-intro">
          <p className="workspace-eyebrow">WELCOME TO YUNO</p>
          <h1>{activeTab === 'login' ? 'Good to see you again.' : activeTab === 'register' ? 'Make room for your work.' : activeTab === 'forgot' ? 'Forgot your password?' : 'Set a new password.'}</h1>
          <p>{activeTab === 'login' ? 'Sign in to pick up where you left off.' : activeTab === 'register' ? 'Create a free account and verify your email to get started.' : activeTab === 'forgot' ? 'Enter your email and we will send a reset link.' : 'Choose a new password for your account.'}</p>
          {(activeTab === 'register' || activeTab === 'forgot') && <p className="auth-hint">Email links require Supabase email confirmation and {window.location.origin} in the Auth redirect URL allowlist.</p>}
        </div>
        {!recovering && <div className="auth-tabs">
          <button type="button" className={activeTab === 'login' ? 'auth-tab active' : 'auth-tab'} onClick={() => changeTab('login')}>Sign In</button>
          <button type="button" className={activeTab === 'register' ? 'auth-tab active' : 'auth-tab'} onClick={() => changeTab('register')}>Create Account</button>
        </div>}
        {msg && <div role={ok ? 'status' : 'alert'} className={ok ? 'auth-msg success' : 'auth-msg error'}>{msg}</div>}
        {recovering && !user && !ok && <div className="auth-msg error" role="alert">{recoveryError || 'Recovery session unavailable or expired. Request a new reset link.'}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          {activeTab === 'register' && <div className="form-group"><label>Business Name</label><input value={bizName} onChange={e => setBizName(e.target.value)} placeholder="Acme Pty Ltd" required /></div>}
          {activeTab !== 'recovery' && <div className="form-group"><label>Email Address</label><input type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@business.com.au" required /></div>}
          {activeTab !== 'forgot' && <div className="form-group"><label>{activeTab === 'recovery' ? 'New Password' : 'Password'}</label><input type="password" autoComplete={activeTab === 'login' ? 'current-password' : 'new-password'} value={password} onChange={e => setPassword(e.target.value)} placeholder={activeTab === 'login' ? 'Your password' : 'Min. 6 characters'} required /></div>}
          {(activeTab === 'register' || activeTab === 'recovery') && <div className="form-group"><label>Confirm Password</label><input type="password" autoComplete="new-password" value={confirm} onChange={e => setConfirm(e.target.value)} required /></div>}
          <button type="submit" disabled={busy || (activeTab === 'recovery' && !user)} className="btn-gold full">{busy ? 'Please wait…' : activeTab === 'login' ? 'Sign In' : activeTab === 'register' ? 'Create Free Account' : activeTab === 'forgot' ? 'Send Reset Link' : 'Update Password'}</button>
          {activeTab === 'login' && <p className="auth-hint"><button type="button" onClick={() => changeTab('forgot')}>Forgot password?</button></p>}
          {activeTab === 'forgot' && <p className="auth-hint"><button type="button" disabled={busy} onClick={recovering ? handleCancelRecovery : () => changeTab('login')}>Back to sign in</button></p>}
          {activeTab === 'recovery' && <p className="auth-hint"><button type="button" disabled={busy} onClick={handleCancelRecovery}>Cancel and sign out</button></p>}
        </form>
        {activeTab !== 'recovery' && <div className="auth-guest"><span>Just browsing?</span><button onClick={() => nav('create-invoice')}>Try without account →</button></div>}
      </div></div>
    </div>
  )
}
