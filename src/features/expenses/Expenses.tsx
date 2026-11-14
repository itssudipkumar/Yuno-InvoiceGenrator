import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { format } from 'date-fns'
import type { Page } from '../../App'
import Nav from '../../components/layout/Nav'
import { useAuth } from '../../context/AuthContext'
import type { Expense } from '../../types/invoice.types'
import { createId } from '../../utils/id'
import { deleteExpense, formatCurrency, getExpenses, saveExpense } from '../../utils/invoice'
import { supabase } from '../../utils/supabase'
import { parseExpenseCents } from './expenseMoney'
import './expenses.css'

const receiptTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
const receiptLimit = 5 * 1024 * 1024
const blankForm = () => ({
  date: format(new Date(), 'yyyy-MM-dd'),
  supplier: '', description: '', category: '', amount: '', gst: '0',
})

export default function Expenses({ nav }: { nav: (page: Page) => void }) {
  const { user } = useAuth()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [loadFailed, setLoadFailed] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [editing, setEditing] = useState<Expense | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(blankForm)
  const [receipt, setReceipt] = useState<File | null>(null)
  const [receiptLink, setReceiptLink] = useState<{ id: string; url: string } | null>(null)

  useEffect(() => {
    if (!user) return
    let active = true
    getExpenses(user.id)
      .then(result => { if (active) { setExpenses(result); setLoadFailed(false) } })
      .catch(error => {
        console.error('Could not load expenses', error)
        if (active) { setLoadFailed(true); setError('Could not load expenses. Check your connection and confirm the expense setup has been applied.') }
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [user])

  const openForm = (expense: Expense | null) => {
    setEditing(expense)
    setReceipt(null)
    setError('')
    setNotice('')
    setForm(expense ? {
      date: expense.date, supplier: expense.supplier, description: expense.description,
      category: expense.category, amount: (expense.amountCents / 100).toFixed(2), gst: (expense.gstCents / 100).toFixed(2),
    } : blankForm())
    setShowForm(true)
  }

  const handleSave = async (event: FormEvent) => {
    event.preventDefault()
    if (!user || busy) return
    const amountCents = parseExpenseCents(form.amount)
    const gstCents = parseExpenseCents(form.gst)
    if (amountCents === null || amountCents <= 0 || gstCents === null) {
      setError('Enter a positive amount and a GST amount, each with at most two decimal places.')
      return
    }
    if (!form.supplier.trim() || !form.category.trim() || !form.date) {
      setError('Date, supplier and category are required.')
      return
    }
    if (receipt && (!receiptTypes.includes(receipt.type) || receipt.size > receiptLimit || receipt.size === 0)) {
      setError('Choose a PDF, JPEG, PNG or WebP receipt up to 5 MB.')
      return
    }

    setBusy(true)
    setError('')
    const id = editing?.id ?? createId()
    let receiptPath = editing?.receiptPath ?? null
    let uploadedPath: string | null = null
    try {
      if (receipt) {
        uploadedPath = `${user.id}/${id}/${createId()}`
        const { error } = await supabase.storage.from('yuno-receipts').upload(uploadedPath, receipt, { contentType: receipt.type })
        if (error) throw error
        receiptPath = uploadedPath
      }
      const now = new Date().toISOString()
      const expense: Expense = {
        id, userId: user.id, date: form.date, supplier: form.supplier.trim(),
        description: form.description.trim(), category: form.category.trim(), amountCents, gstCents,
        receiptPath, createdAt: editing?.createdAt ?? now, updatedAt: now,
      }
      await saveExpense(expense)
      setExpenses(previous => [expense, ...previous.filter(item => item.id !== id)]
        .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)))
      setShowForm(false)
      setReceiptLink(null)
      setNotice(editing ? 'Expense updated.' : 'Expense saved.')
      if (editing?.receiptPath && uploadedPath) {
        const { error } = await supabase.storage.from('yuno-receipts').remove([editing.receiptPath])
        if (error) {
          console.error('Could not remove previous receipt', error)
          setError('Expense saved, but the previous receipt could not be removed from storage.')
        }
      }
    } catch (error) {
      console.error('Could not save expense', error)
      setError(uploadedPath ? 'Could not confirm the expense was saved. Check your list before retrying; the uploaded receipt may remain in storage.' : 'Could not save the expense. Please check the expense setup and try again.')
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async (expense: Expense) => {
    if (!user || busy || !confirm('Delete this expense and its receipt?')) return
    setBusy(true)
    setError('')
    setNotice('')
    try {
      await deleteExpense(expense.id, user.id)
      setExpenses(previous => previous.filter(item => item.id !== expense.id))
      setReceiptLink(null)
      setNotice('Expense deleted.')
      if (expense.receiptPath) {
        const { error } = await supabase.storage.from('yuno-receipts').remove([expense.receiptPath])
        if (error) {
          console.error('Could not remove receipt', error)
          setError('Expense deleted, but its receipt could not be removed from storage.')
        }
      }
    } catch (error) {
      console.error('Could not delete expense', error)
      setError('Could not delete the expense. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  const prepareReceipt = async (expense: Expense) => {
    if (!expense.receiptPath) return
    setError('')
    setReceiptLink(null)
    try {
      const { data, error } = await supabase.storage.from('yuno-receipts').createSignedUrl(expense.receiptPath, 60)
      if (error) throw error
      setReceiptLink({ id: expense.id, url: data.signedUrl })
    } catch (error) {
      console.error('Could not open receipt', error)
      setError('Could not access the receipt. Please try again.')
    }
  }

  const total = expenses.reduce((sum, expense) => sum + expense.amountCents + expense.gstCents, 0)
  return (
    <div className="page-clients page-expenses">
      <Nav nav={nav} current="expenses" />
      <main className="clients-container">
        <div className="clients-header">
          <div><p className="workspace-eyebrow">YOUR WORKSPACE / EXPENSES</p><h1>Expenses</h1><p className="workspace-subtitle">Keep business spending and receipts together.</p></div>
          <button className="btn-gold" onClick={() => openForm(null)} disabled={loading || loadFailed}>+ Add expense</button>
        </div>
        {notice && <div className="save-msg" role="status">{notice}</div>}
        {error && !showForm && <div className="error-msg" role="alert">{error}</div>}
        {loading ? <p>Loading expenses…</p> : loadFailed ? <button className="btn-ghost" onClick={() => window.location.reload()}>Retry</button> : (
          <>
            <div className="expense-summary"><span>Total spending, including GST</span><strong>{formatCurrency(total / 100)}</strong></div>
            {expenses.length === 0 ? <div className="empty-state"><p>No expenses yet. Add your first expense.</p></div> : (
              <div className="expense-list">
                {expenses.map(expense => (
                  <article className="expense-card" key={expense.id}>
                    <div className="expense-details">
                      <strong>{expense.supplier}</strong>
                      <span>{expense.date} · {expense.category}</span>
                      {expense.description && <span>{expense.description}</span>}
                      <span>Before GST: {formatCurrency(expense.amountCents / 100)} · GST: {formatCurrency(expense.gstCents / 100)}</span>
                    </div>
                    <div className="expense-actions">
                      <strong>{formatCurrency((expense.amountCents + expense.gstCents) / 100)}</strong>
                      <div>
                        {expense.receiptPath && <>
                          {receiptLink?.id === expense.id && <a href={receiptLink.url} target="_blank" rel="noopener noreferrer">Open receipt</a>}
                          <button type="button" onClick={() => void prepareReceipt(expense)}>{receiptLink?.id === expense.id ? 'Refresh link' : 'View receipt'}</button>
                        </>}
                        <button type="button" disabled={busy} onClick={() => openForm(expense)}>Edit</button>
                        <button type="button" disabled={busy} onClick={() => void handleDelete(expense)}>Delete</button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </main>
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="expense-form-title">
            <div className="modal-header"><h2 id="expense-form-title">{editing ? 'Edit expense' : 'Add expense'}</h2><button className="modal-close" type="button" aria-label="Close" disabled={busy} onClick={() => setShowForm(false)}>×</button></div>
            <form className="modal-form" onSubmit={handleSave}>
              {error && <div className="error-msg" role="alert">{error}</div>}
              <div className="form-row-2">
                <label className="fg">Date<input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required /></label>
                <label className="fg">Supplier<input value={form.supplier} onChange={e => setForm(f => ({ ...f, supplier: e.target.value }))} required /></label>
              </div>
              <label className="fg">Category<input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="e.g. Software" required /></label>
              <label className="fg">Description (optional)<input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></label>
              <div className="form-row-2">
                <label className="fg">Amount before GST (AUD)<input type="number" min="0.01" max="99999999.99" step="0.01" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required /></label>
                <label className="fg">GST amount (AUD)<input type="number" min="0" max="99999999.99" step="0.01" value={form.gst} onChange={e => setForm(f => ({ ...f, gst: e.target.value }))} required /></label>
              </div>
              <label className="fg">{editing?.receiptPath ? 'Replace receipt (optional)' : 'Receipt (optional)'}<input type="file" accept="application/pdf,image/jpeg,image/png,image/webp" onChange={e => setReceipt(e.target.files?.[0] ?? null)} /><span>PDF, JPEG, PNG or WebP, up to 5 MB.</span></label>
              <div className="modal-footer"><button type="button" className="btn-ghost" disabled={busy} onClick={() => setShowForm(false)}>Cancel</button><button type="submit" className="btn-gold" disabled={busy}>{busy ? 'Saving…' : 'Save expense'}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
