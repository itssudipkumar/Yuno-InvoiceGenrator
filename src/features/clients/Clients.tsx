import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import Nav from '../../components/layout/Nav'
import type { Client } from '../../utils/invoice'
import { getClients, saveClient, deleteClient } from '../../utils/invoice'
import { createId } from '../../utils/id'
import type { Page } from '../../App'

export default function Clients({ nav }: { nav: (p: Page) => void }) {
  const { user } = useAuth()
  const [clients, setClients] = useState<Client[]>([])
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<Client | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', company: '', email: '', phone: '', address: '' })
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) return
    let active = true
    getClients(user.id).then(result => { if (active) setClients(result) })
      .catch(error => { console.error('Could not load clients', error); if (active) setError('Could not load clients. Please check your connection and try again.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [user])

  const filtered = clients.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.company || '').toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  )

  const openNew = () => {
    setEditing(null)
    setForm({ name: '', company: '', email: '', phone: '', address: '' })
    setShowForm(true)
  }

  const openEdit = (c: Client) => {
    setEditing(c)
    setForm({ name: c.name, company: c.company || '', email: c.email, phone: c.phone, address: c.address })
    setShowForm(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email) { setMsg('Name and email are required'); return }
    if (!user) return
    const client: Client = {
      id: editing?.id || createId(),
      userId: user.id,
      ...form,
      createdAt: editing?.createdAt || new Date().toISOString(),
    }
    try {
      setSaving(true)
      await saveClient(client)
      setClients(previous => editing ? previous.map(existing => existing.id === client.id ? client : existing) : [...previous, client])
      setShowForm(false)
      setMsg(editing ? '✅ Client updated!' : '✅ Client added!')
      setError('')
      setTimeout(() => setMsg(''), 3000)
    } catch (error) { console.error('Could not save client', error); setError('Could not save the client. Please try again.') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!user || !confirm('Delete this client?')) return
    try {
      await deleteClient(id, user.id)
      setClients(previous => previous.filter(client => client.id !== id))
      setMsg('✅ Client deleted.')
      setError('')
      setTimeout(() => setMsg(''), 2000)
    } catch (error) { console.error('Could not delete client', error); setError('Could not delete the client. Please try again.') }
  }

  return (
    <div className="page-clients">
      <Nav nav={nav} current="clients" />
      <div className="clients-container">
        <div className="clients-header">
          <div><p className="workspace-eyebrow">YOUR WORKSPACE / CLIENTS</p><h1>Clients</h1><p className="workspace-subtitle">Keep the people you work with close at hand.</p></div>
          <button className="btn-gold" onClick={openNew}>+ Add Client</button>
        </div>

        {msg && <div className="save-msg">{msg}</div>}
        {error && <div className="error-msg" role="alert">{error}</div>}

        <div className="clients-search">
          <input aria-label="Search clients" className="search-input wide" placeholder="Search by name, company, or email..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {loading ? <p>Loading clients…</p> : error && clients.length === 0 ? null : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <p>{search ? 'No clients match your search.' : 'No clients yet. Add your first client!'}</p>
            {!search && <button className="btn-gold sm" onClick={openNew}>Add Client</button>}
          </div>
        ) : (
          <div className="clients-grid">
            {filtered.map(c => (
              <div key={c.id} className="client-card">
                <div className="client-avatar">{c.name[0]?.toUpperCase()}</div>
                <div className="client-info">
                  <div className="client-name">{c.name}</div>
                  {c.company && <div className="client-co">{c.company}</div>}
                  <div className="client-email">{c.email}</div>
                  {c.phone && <div className="client-phone">{c.phone}</div>}
                  {c.address && <div className="client-addr">{c.address}</div>}
                </div>
                <div className="client-actions">
                  <button className="act-btn" aria-label={`Edit ${c.name}`} onClick={() => openEdit(c)}>✏️</button>
                  <button className="act-btn del" aria-label={`Delete ${c.name}`} onClick={() => handleDelete(c.id)}>🗑</button>
                  <button className="act-btn inv" aria-label="Create invoice" onClick={() => nav('create-invoice')} title="Create invoice">📄</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editing ? 'Edit Client' : 'Add Client'}</h2>
              <button className="modal-close" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <form onSubmit={handleSave} className="modal-form">
              {error && <div className="error-msg" role="alert">{error}</div>}
              <div className="form-row-2">
                <div className="fg"><label>Full Name *</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
                <div className="fg"><label>Company</label><input value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} /></div>
              </div>
              <div className="form-row-2">
                <div className="fg"><label>Email *</label><input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required /></div>
                <div className="fg"><label>Phone</label><input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
              </div>
              <div className="fg"><label>Address</label><input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></div>
              <div className="modal-footer">
                <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn-gold" disabled={saving}>{saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Client'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
