import { useState } from 'react'
import { saveInvoice } from '../../utils/invoice'
import type { Invoice, InvoiceStatus } from '../../types/invoice.types'
import { STATUS_OPTIONS } from '../../types/invoice.types'

interface Props {
  invoice: Invoice
  onDone: () => void
  onStay: () => void
  title?: string
}

export function StatusPicker({ invoice, onDone, onStay, title }: Props) {
  const [status, setStatus] = useState<InvoiceStatus>(
    invoice.status === 'draft' ? 'sent' : invoice.status
  )
  const [note, setNote] = useState('')

  const save = () => {
    saveInvoice({ ...invoice, status, statusNote: note, updatedAt: new Date().toISOString() })
    onDone()
  }

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: 480 }}>
        <div className="modal-header">
          <h2>{title || `✅ Invoice Saved — ${invoice.invoiceNumber}`}</h2>
        </div>
        <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <p style={{ fontSize: 13, color: 'var(--text2)' }}>
            Set the status — you can update this anytime from the dashboard.
          </p>
          <div className="status-picker">
            {STATUS_OPTIONS.map(s => (
              <button
                key={s.v}
                className={`status-opt${status === s.v ? ' active' : ''}`}
                onClick={() => setStatus(s.v)}
              >
                <span className="so-label">{s.label}</span>
                <span className="so-desc">{s.desc}</span>
              </button>
            ))}
          </div>
          <div className="fg">
            <label>Notes (optional)</label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="e.g. Payment expected by 15 Feb..."
              rows={2}
            />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
            <button className="btn-ghost" onClick={onStay}>Stay on Invoice</button>
            <button className="btn-gold" onClick={save}>Save &amp; Go to Dashboard</button>
          </div>
        </div>
      </div>
    </div>
  )
}
