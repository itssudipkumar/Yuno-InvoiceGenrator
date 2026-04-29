import React from "react"
import type { Invoice } from '../../types/invoice.types'
import { formatCurrency, formatDate } from '../../utils/invoice'

interface Props { invoice: Invoice }

/* ── Logo: show img or nothing ── */
function Logo({ src, dark }: { src?: string; dark?: boolean }) {
  if (!src) return <div style={{ width: 80, height: 52, flexShrink: 0 }} />
  return (
    <div style={{ width: 80, height: 52, flexShrink: 0, display: 'flex', alignItems: 'center' }}>
      <img src={src} alt="logo" style={{ maxWidth: 80, maxHeight: 52, objectFit: 'contain',
        filter: dark ? 'brightness(0) invert(1)' : 'none' }} />
    </div>
  )
}

/* ── Bank block (inline after totals) ── */
function BankBlock({ biz, bgColor, labelColor, valColor, borderColor }:
  { biz: Invoice['businessInfo']; accentColor: string; bgColor: string; labelColor: string; valColor: string; borderColor: string }) {
  if (!biz.bankName && !biz.bsb && !biz.accountNumber) return null
  const cells = [
    { l: 'Bank', v: biz.bankName },
    { l: 'BSB', v: biz.bsb },
    { l: 'Account Name', v: (biz as any).accountName },
    { l: 'Account No.', v: biz.accountNumber },
  ].filter(c => c.v)
  if (cells.length === 0) return null
  return (
    <div style={{ display: 'flex', border: `1px solid ${borderColor}`, borderRadius: 6, overflow: 'hidden', marginTop: 12, fontSize: '0.75em' }}>
      {cells.map((c, i) => (
        <div key={i} style={{ flex: 1, padding: '6px 8px', background: bgColor, borderRight: i < cells.length - 1 ? `1px solid ${borderColor}` : 'none' }}>
          <div style={{ fontSize: '0.8em', letterSpacing: 1, textTransform: 'uppercase', color: labelColor, marginBottom: 2 }}>{c.l}</div>
          <div style={{ fontWeight: 600, color: valColor }}>{c.v}</div>
        </div>
      ))}
    </div>
  )
}

/* ── Notes ── */
function Notes({ text, color, borderColor, bg }: { text: string; color: string; borderColor: string; bg: string }) {
  if (!text) return null
  return (
    <div style={{ textAlign: 'center', padding: '10px 20px', fontSize: '0.78em', fontStyle: 'italic',
      color, borderTop: `1px solid ${borderColor}`, background: bg, marginTop: 'auto' }}>
      {text}
    </div>
  )
}

/* ── Item rows ── */
function ItemRows({ items, tdStyle }: { items: Invoice['items']; tdStyle?: React.CSSProperties }) {
  return <>
    {items.map(item => (
      <tr key={item.id}>
        <td style={tdStyle}>{item.description}</td>
        <td style={{ ...tdStyle, textAlign: 'right' }}>{item.quantity}</td>
        <td style={{ ...tdStyle, textAlign: 'right' }}>{formatCurrency(item.unitPrice)}</td>
        <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 600 }}>{formatCurrency(item.amount)}</td>
      </tr>
    ))}
  </>
}

/* ════════════════ 1 · PRESTIGE ════════════════ */
export function Prestige({ invoice }: Props) {
  const b = invoice.businessInfo
  return (
    <div style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1a1208', background: '#fff', display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <div style={{ background: '#1a1208', padding: '28px 32px', display: 'flex', alignItems: 'flex-start', gap: 16 }}>
        <Logo src={b.logo} dark />
        <div style={{ flex: 1 }}>
          <div style={{ color: '#C9A84C', fontSize: '1.05rem', fontWeight: 600, letterSpacing: 1 }}>{b.name}</div>
          {b.abn && <div style={{ fontSize: '0.7rem', color: 'rgba(201,168,76,.45)', letterSpacing: 2, marginTop: 3 }}>ABN {b.abn}</div>}
          <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,.4)', lineHeight: 1.8, marginTop: 6 }}>
            {b.email}{b.phone ? ` · ${b.phone}` : ''}{b.address ? <><br />{b.address}</> : null}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#fff', letterSpacing: 4, lineHeight: 1 }}>INVOICE</div>
          <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,.35)', letterSpacing: 2, marginTop: 4 }}>{invoice.invoiceNumber}</div>
          <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,.3)', lineHeight: 1.8, marginTop: 8 }}>
            Issued: {formatDate(invoice.invoiceDate)}<br />Due: {formatDate(invoice.dueDate)}
          </div>
        </div>
      </div>
      <div style={{ height: 3, background: 'linear-gradient(90deg,#C9A84C,#8B6914,transparent)' }} />
      <div style={{ padding: '20px 32px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18, paddingBottom: 14, borderBottom: '1px solid #ede0c4' }}>
          <div>
            <div style={{ fontSize: '0.62rem', letterSpacing: 3, textTransform: 'uppercase', color: '#C9A84C', marginBottom: 5, fontFamily: "'DM Sans',sans-serif" }}>Billed To</div>
            <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>{invoice.client.name}</div>
            {invoice.client.company && <div style={{ fontSize: '0.72rem', color: '#7a6040' }}>{invoice.client.company}</div>}
            <div style={{ fontSize: '0.7rem', color: '#7a6040', lineHeight: 1.7, marginTop: 2 }}>
              {invoice.client.email}{invoice.client.phone ? <><br />{invoice.client.phone}</> : null}
              {invoice.client.address ? <><br />{invoice.client.address}</> : null}
            </div>
          </div>
          <div style={{ textAlign: 'right', fontFamily: "'DM Sans',sans-serif" }}>
            <div style={{ fontSize: '0.62rem', letterSpacing: 2, color: '#aaa', textTransform: 'uppercase', marginBottom: 4 }}>Invoice Date</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{formatDate(invoice.invoiceDate)}</div>
            <div style={{ fontSize: '0.62rem', letterSpacing: 2, color: '#aaa', textTransform: 'uppercase', marginTop: 8, marginBottom: 4 }}>Payment Due</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{formatDate(invoice.dueDate)}</div>
          </div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 12 }}>
          <thead><tr>
            {['Description','Qty','Rate','Amount'].map((h,i) => (
              <th key={h} style={{ fontSize: '0.62rem', letterSpacing: 2, textTransform: 'uppercase', color: '#C9A84C', borderBottom: '1px solid #e8d9b5', padding: '7px 0', fontWeight: 500, fontFamily: "'DM Sans',sans-serif", textAlign: i === 0 ? 'left' : 'right' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody><ItemRows items={invoice.items} tdStyle={{ padding: '8px 0', fontSize: '0.72rem', color: '#333', borderBottom: '1px solid #f5ede0' }} /></tbody>
        </table>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, padding: '10px 0' }}>
          <div style={{ display: 'flex', gap: 40, fontSize: '0.68rem', color: '#888', fontFamily: "'DM Sans',sans-serif" }}><span>Subtotal</span><span>{formatCurrency(invoice.subtotal)}</span></div>
          <div style={{ display: 'flex', gap: 40, fontSize: '0.68rem', color: '#888', fontFamily: "'DM Sans',sans-serif" }}><span>GST ({invoice.taxRate}%)</span><span>{formatCurrency(invoice.taxAmount)}</span></div>
          <div style={{ display: 'flex', gap: 40, fontSize: '1rem', fontWeight: 700, borderTop: '2px solid #C9A84C', paddingTop: 8, marginTop: 4 }}><span>Total Due (AUD)</span><span>{formatCurrency(invoice.total)}</span></div>
        </div>
        <BankBlock biz={b} accentColor="#C9A84C" bgColor="#faf5ec" labelColor="#C9A84C" valColor="#1a1208" borderColor="#e8d9b5" />
        <div style={{ flex: 1 }} />
      </div>
      <Notes text={invoice.notes} color="#a89060" borderColor="#ede0c4" bg="#faf5ec" />
    </div>
  )
}

/* ════════════════ 2 · FROST ════════════════ */
export function Frost({ invoice }: Props) {
  const b = invoice.businessInfo
  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: '#0f172a', background: '#fff', display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <div style={{ background: 'linear-gradient(135deg,#0f172a 0%,#1e3a5f 100%)', padding: '24px 30px', display: 'flex', alignItems: 'flex-start', gap: 16 }}>
        <Logo src={b.logo} dark />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>{b.name}</div>
          {b.abn && <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,.4)', letterSpacing: 1.5, marginTop: 2 }}>ABN {b.abn}</div>}
          <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,.38)', lineHeight: 1.8, marginTop: 5 }}>
            {b.email}{b.phone ? ` · ${b.phone}` : ''}{b.address ? <><br />{b.address}</> : null}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.62rem', letterSpacing: 3, color: 'rgba(255,255,255,.35)', textTransform: 'uppercase' }}>Tax Invoice</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', lineHeight: 1.1, marginTop: 2 }}>{invoice.invoiceNumber}</div>
          <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,.35)', lineHeight: 1.8, marginTop: 6 }}>
            Issued: {formatDate(invoice.invoiceDate)}<br />Due: {formatDate(invoice.dueDate)}
          </div>
        </div>
      </div>
      <div style={{ padding: '20px 30px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 14, borderBottom: '1px solid #e2e8f0' }}>
          <div>
            <div style={{ fontSize: '0.62rem', letterSpacing: 2, textTransform: 'uppercase', color: '#64748b', marginBottom: 5, fontWeight: 600 }}>Billed To</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{invoice.client.name}</div>
            {invoice.client.company && <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{invoice.client.company}</div>}
            <div style={{ fontSize: '0.68rem', color: '#64748b', lineHeight: 1.7, marginTop: 2 }}>
              {invoice.client.email}{invoice.client.address ? <><br />{invoice.client.address}</> : null}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.62rem', letterSpacing: 2, textTransform: 'uppercase', color: '#94a3b8', marginBottom: 5 }}>Payment Due</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{formatDate(invoice.dueDate)}</div>
          </div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 10 }}>
          <thead><tr>
            {['Description','Qty','Rate','Amount'].map((h,i) => (
              <th key={h} style={{ fontSize: '0.62rem', letterSpacing: 1.5, textTransform: 'uppercase', color: '#94a3b8', padding: '7px 0', borderBottom: '1px solid #e2e8f0', fontWeight: 600, textAlign: i === 0 ? 'left' : 'right' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody><ItemRows items={invoice.items} tdStyle={{ padding: '8px 0', fontSize: '0.72rem', color: '#334155', borderBottom: '1px solid #f1f5f9' }} /></tbody>
        </table>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 24, fontSize: '0.65rem', color: '#94a3b8', padding: '4px 0' }}>
          <span>Subtotal {formatCurrency(invoice.subtotal)}</span>
          <span>GST ({invoice.taxRate}%) {formatCurrency(invoice.taxAmount)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
          <div style={{ background: '#0f172a', color: '#fff', padding: '12px 18px', borderRadius: 8, textAlign: 'right', minWidth: 180 }}>
            <div style={{ fontSize: '0.62rem', letterSpacing: 1.5, color: 'rgba(255,255,255,.45)', textTransform: 'uppercase' }}>Total Due (AUD)</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: 2 }}>{formatCurrency(invoice.total)}</div>
          </div>
        </div>
        <BankBlock biz={b} accentColor="#0f172a" bgColor="#f8faff" labelColor="#94a3b8" valColor="#0f172a" borderColor="#e2e8f0" />
        <div style={{ flex: 1 }} />
      </div>
      <Notes text={invoice.notes} color="#94a3b8" borderColor="#e2e8f0" bg="#f8faff" />
    </div>
  )
}

/* ════════════════ 3 · TERRA ════════════════ */
export function Terra({ invoice }: Props) {
  const b = invoice.businessInfo
  return (
    <div style={{ fontFamily: "'Fraunces',serif", color: '#2c1810', background: '#faf6f1', display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <div style={{ background: '#2c1810', padding: '24px 30px', display: 'flex', alignItems: 'flex-start', gap: 16 }}>
        <Logo src={b.logo} dark />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.95rem', color: '#e8c9a0', fontWeight: 600 }}>{b.name}</div>
          <div style={{ fontSize: '0.68rem', color: 'rgba(232,201,160,.45)', lineHeight: 1.8, marginTop: 5 }}>
            {b.abn ? `ABN ${b.abn} · ` : ''}{b.email}{b.phone ? ` · ${b.phone}` : ''}{b.address ? <><br />{b.address}</> : null}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.4rem', color: '#fff', fontWeight: 700, letterSpacing: 3, lineHeight: 1 }}>INVOICE</div>
          <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,.35)', letterSpacing: 2, marginTop: 4 }}>{invoice.invoiceNumber}</div>
          <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,.3)', lineHeight: 1.8, marginTop: 6 }}>
            Issued: {formatDate(invoice.invoiceDate)}<br />Due: {formatDate(invoice.dueDate)}
          </div>
        </div>
      </div>
      <div style={{ height: 4, background: 'linear-gradient(90deg,#C4622D,#E8924A,#C4622D)' }} />
      <div style={{ padding: '20px 30px', flex: 1, display: 'flex', flexDirection: 'column', background: '#faf6f1' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 14, borderBottom: '1px solid #e8d5c0' }}>
          <div>
            <div style={{ fontSize: '0.62rem', letterSpacing: 2.5, textTransform: 'uppercase', color: '#C4622D', marginBottom: 5 }}>Billed To</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{invoice.client.name}</div>
            {invoice.client.company && <div style={{ fontSize: '0.7rem', color: '#7a5840', fontStyle: 'italic' }}>{invoice.client.company}</div>}
            <div style={{ fontSize: '0.68rem', color: '#7a5840', lineHeight: 1.7, marginTop: 2 }}>
              {invoice.client.email}{invoice.client.address ? <><br />{invoice.client.address}</> : null}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.62rem', letterSpacing: 2, textTransform: 'uppercase', color: '#C4622D', marginBottom: 4 }}>Due Date</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{formatDate(invoice.dueDate)}</div>
          </div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 10 }}>
          <thead><tr>
            {['Description','Qty','Rate','Amount'].map((h,i) => (
              <th key={h} style={{ fontSize: '0.62rem', letterSpacing: 1.5, textTransform: 'uppercase', color: '#C4622D', borderBottom: '2px solid #C4622D', padding: '7px 0', fontWeight: 400, textAlign: i === 0 ? 'left' : 'right' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody><ItemRows items={invoice.items} tdStyle={{ padding: '8px 0', fontSize: '0.72rem', color: '#44271a', borderBottom: '1px solid #ead5bf' }} /></tbody>
        </table>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3, padding: '10px 0' }}>
          <div style={{ display: 'flex', gap: 40, fontSize: '0.68rem', color: '#7a5840', fontFamily: "'DM Sans',sans-serif" }}><span>Subtotal</span><span>{formatCurrency(invoice.subtotal)}</span></div>
          <div style={{ display: 'flex', gap: 40, fontSize: '0.68rem', color: '#7a5840', fontFamily: "'DM Sans',sans-serif" }}><span>GST ({invoice.taxRate}%)</span><span>{formatCurrency(invoice.taxAmount)}</span></div>
          <div style={{ display: 'flex', gap: 40, fontSize: '1rem', fontWeight: 700, color: '#C4622D', fontStyle: 'italic', borderTop: '1px solid #C4622D', paddingTop: 8, marginTop: 4 }}><span>Total Due (AUD)</span><span>{formatCurrency(invoice.total)}</span></div>
        </div>
        <BankBlock biz={b} accentColor="#C4622D" bgColor="#f0e8dc" labelColor="#a08060" valColor="#2c1810" borderColor="#e8d5c0" />
        <div style={{ flex: 1 }} />
      </div>
      <Notes text={invoice.notes} color="#a08060" borderColor="#e8d5c0" bg="#f0e8dc" />
    </div>
  )
}

/* ════════════════ 4 · PRISM ════════════════ */
export function Prism({ invoice }: Props) {
  const b = invoice.businessInfo
  return (
    <div style={{ fontFamily: "'Syne',sans-serif", color: '#1a1a2e', background: '#fff', display: 'flex', flexDirection: 'column', minHeight: '100%', position: 'relative' }}>
      <div style={{ position: 'relative', padding: '24px 30px', display: 'flex', alignItems: 'flex-start', gap: 16, overflow: 'hidden', background: '#fff' }}>
        {/* geometric bg */}
        <div style={{ position: 'absolute', top: -60, right: -40, width: 220, height: 220, borderRadius: '50%', border: '40px solid rgba(99,102,241,.06)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 10, right: 30, width: 100, height: 140, borderRadius: '50%', background: 'linear-gradient(135deg,rgba(99,102,241,.05),rgba(139,92,246,.03))', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '35%', right: '12%', width: 50, height: 50, borderRadius: 8, background: 'rgba(99,102,241,.04)', transform: 'rotate(20deg)', pointerEvents: 'none' }} />
        <Logo src={b.logo} />
        <div style={{ flex: 1, position: 'relative', zIndex: 2 }}>
          <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#1a1a2e', letterSpacing: 1, textTransform: 'uppercase' }}>{b.name}</div>
          {b.abn && <div style={{ fontSize: '0.65rem', color: '#9ca3af', letterSpacing: 1, marginTop: 2 }}>ABN {b.abn}</div>}
          <div style={{ fontSize: '0.65rem', color: '#6b7280', lineHeight: 1.8, marginTop: 5 }}>
            {b.email}{b.phone ? ` · ${b.phone}` : ''}{b.address ? <><br />{b.address}</> : null}
          </div>
        </div>
        <div style={{ textAlign: 'right', position: 'relative', zIndex: 2 }}>
          <div style={{ fontSize: '0.62rem', letterSpacing: 3, color: '#6366f1', textTransform: 'uppercase', fontWeight: 700 }}>Invoice</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1a1a2e', lineHeight: 1, marginTop: 2 }}>{invoice.invoiceNumber}</div>
          <div style={{ fontSize: '0.65rem', color: '#6b7280', lineHeight: 1.8, marginTop: 6 }}>
            Issued: {formatDate(invoice.invoiceDate)}<br />Due: {formatDate(invoice.dueDate)}
          </div>
        </div>
      </div>
      <div style={{ height: 3, background: 'linear-gradient(90deg,#6366f1,#8b5cf6,#a78bfa,#c4b5fd)' }} />
      <div style={{ padding: '18px 30px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #f3f4f6' }}>
          <div>
            <div style={{ fontSize: '0.62rem', letterSpacing: 2, textTransform: 'uppercase', color: '#6366f1', marginBottom: 5, fontWeight: 700 }}>Billed To</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{invoice.client.name}</div>
            {invoice.client.company && <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>{invoice.client.company}</div>}
            <div style={{ fontSize: '0.68rem', color: '#6b7280', lineHeight: 1.7, marginTop: 2 }}>
              {invoice.client.email}{invoice.client.address ? <><br />{invoice.client.address}</> : null}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.62rem', letterSpacing: 2, textTransform: 'uppercase', color: '#6366f1', marginBottom: 5, fontWeight: 700 }}>Payment Due</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{formatDate(invoice.dueDate)}</div>
          </div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 10 }}>
          <thead><tr>
            {['Description','Qty','Rate','Amount'].map((h,i) => (
              <th key={h} style={{ fontSize: '0.62rem', letterSpacing: 1.5, textTransform: 'uppercase', color: '#6366f1', padding: '7px 0', borderBottom: '2px solid #e0e7ff', fontWeight: 700, textAlign: i === 0 ? 'left' : 'right' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody><ItemRows items={invoice.items} tdStyle={{ padding: '8px 0', fontSize: '0.72rem', color: '#374151', borderBottom: '1px solid #f9fafb' }} /></tbody>
        </table>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, marginTop: 8 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#9ca3af', padding: '3px 0' }}><span>Subtotal</span><span>{formatCurrency(invoice.subtotal)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#9ca3af', padding: '3px 0' }}><span>GST ({invoice.taxRate}%)</span><span>{formatCurrency(invoice.taxAmount)}</span></div>
          </div>
          <div style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', padding: '12px 16px', borderRadius: 10, textAlign: 'right', minWidth: 140 }}>
            <div style={{ fontSize: '0.6rem', letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,.65)' }}>Total Due (AUD)</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: 2 }}>{formatCurrency(invoice.total)}</div>
          </div>
        </div>
        <BankBlock biz={b} accentColor="#6366f1" bgColor="#eef2ff" labelColor="#818cf8" valColor="#1a1a2e" borderColor="#e0e7ff" />
        <div style={{ flex: 1 }} />
      </div>
      <Notes text={invoice.notes} color="#9ca3af" borderColor="#f3f4f6" bg="#fff" />
      {/* corner accents */}
      <svg style={{ position: 'absolute', bottom: 0, left: 0, width: 60, height: 60, opacity: 0.05 }} viewBox="0 0 60 60"><circle cx="0" cy="60" r="50" fill="#6366f1" /></svg>
    </div>
  )
}

/* ════════════════ 5 · LINEN ════════════════ */
export function Linen({ invoice }: Props) {
  const b = invoice.businessInfo
  return (
    <div style={{ fontFamily: "'Cormorant Garamond',serif", color: '#1c1c1c', background: '#f9f4ed', display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <div style={{ display: 'flex' }}>
        <div style={{ width: 6, background: '#1c1c1c', flexShrink: 0 }} />
        <div style={{ flex: 1, padding: '22px 26px', display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          <Logo src={b.logo} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: -0.5 }}>{b.name}</div>
            {b.abn && <div style={{ fontSize: '0.65rem', color: '#bbb', letterSpacing: 2, textTransform: 'uppercase', marginTop: 2, fontFamily: "'DM Sans',sans-serif" }}>ABN {b.abn}</div>}
            <div style={{ fontSize: '0.65rem', color: '#888', lineHeight: 1.8, marginTop: 5 }}>
              {b.email}{b.phone ? ` · ${b.phone}` : ''}{b.address ? <><br />{b.address}</> : null}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '2.4rem', fontWeight: 300, color: '#e8e0d4', lineHeight: 1, fontStyle: 'italic' }}>Invoice</div>
            <div style={{ fontSize: '0.72rem', color: '#1c1c1c', letterSpacing: 2, fontFamily: "'DM Sans',sans-serif", fontWeight: 600 }}>{invoice.invoiceNumber}</div>
            <div style={{ fontSize: '0.62rem', color: '#aaa', lineHeight: 1.8, marginTop: 6, fontFamily: "'DM Sans',sans-serif" }}>
              Issued: {formatDate(invoice.invoiceDate)}<br />Due: {formatDate(invoice.dueDate)}
            </div>
          </div>
        </div>
      </div>
      <div style={{ height: 1, background: '#d8cfc4', marginLeft: 6 }} />
      <div style={{ padding: '18px 26px 18px 32px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 14, borderBottom: '1px solid #e0d8cf' }}>
          <div>
            <div style={{ fontSize: '0.62rem', letterSpacing: 3, textTransform: 'uppercase', color: '#aaa', marginBottom: 5, fontFamily: "'DM Sans',sans-serif" }}>Billed To</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, fontStyle: 'italic' }}>{invoice.client.name}</div>
            {invoice.client.company && <div style={{ fontSize: '0.7rem', color: '#888' }}>{invoice.client.company}</div>}
            <div style={{ fontSize: '0.68rem', color: '#888', lineHeight: 1.7, marginTop: 2 }}>
              {invoice.client.email}{invoice.client.address ? <><br />{invoice.client.address}</> : null}
            </div>
          </div>
          <div style={{ textAlign: 'right', fontFamily: "'DM Sans',sans-serif" }}>
            <div style={{ fontSize: '0.62rem', letterSpacing: 2, textTransform: 'uppercase', color: '#aaa', marginBottom: 5 }}>Due Date</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, fontStyle: 'italic', fontFamily: "'Cormorant Garamond',serif" }}>{formatDate(invoice.dueDate)}</div>
          </div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 10 }}>
          <thead><tr>
            {['Description','Qty','Rate','Amount'].map((h,i) => (
              <th key={h} style={{ fontSize: '0.62rem', letterSpacing: 2, textTransform: 'uppercase', color: '#aaa', padding: '7px 0', borderBottom: '1px solid #d8d0c8', fontWeight: 400, fontFamily: "'DM Sans',sans-serif", textAlign: i === 0 ? 'left' : 'right' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody><ItemRows items={invoice.items} tdStyle={{ padding: '8px 0', fontSize: '0.72rem', color: '#444', borderBottom: '1px solid #ede6df' }} /></tbody>
        </table>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 24, fontSize: '0.62rem', color: '#aaa', padding: '4px 0', fontFamily: "'DM Sans',sans-serif" }}>
          <span>Subtotal {formatCurrency(invoice.subtotal)}</span>
          <span>GST {formatCurrency(invoice.taxAmount)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '10px 0 0', borderTop: '2px solid #1c1c1c', marginTop: 6 }}>
          <div style={{ fontSize: '0.65rem', letterSpacing: 3, textTransform: 'uppercase', color: '#888', fontFamily: "'DM Sans',sans-serif" }}>Total Due (AUD)</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, fontStyle: 'italic' }}>{formatCurrency(invoice.total)}</div>
        </div>
        <BankBlock biz={b} accentColor="#1c1c1c" bgColor="#f0ebe3" labelColor="#bbb" valColor="#555" borderColor="#d8cfc4" />
        <div style={{ flex: 1 }} />
      </div>
      <Notes text={invoice.notes} color="#aaa" borderColor="#e0d8cf" bg="#f0ebe3" />
    </div>
  )
}

/* ════════════════ 6 · BLUEPRINT ════════════════ */
export function Blueprint({ invoice }: Props) {
  const b = invoice.businessInfo
  return (
    <div style={{ fontFamily: "'IBM Plex Mono',monospace", color: '#1a2332', background: '#eef3fb', display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <div style={{ background: '#1a2332', borderLeft: '6px solid #4a9eff', padding: '22px 26px', display: 'flex', alignItems: 'flex-start', gap: 16 }}>
        <Logo src={b.logo} dark />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 500, color: '#4a9eff' }}>{b.name}</div>
          {b.abn && <div style={{ fontSize: '0.62rem', color: 'rgba(74,158,255,.4)', marginTop: 2 }}>ABN_{b.abn}</div>}
          <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,.35)', lineHeight: 1.8, marginTop: 5 }}>
            {b.email}{b.phone ? ` · ${b.phone}` : ''}{b.address ? <><br />{b.address}</> : null}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.6rem', color: '#4a9eff', letterSpacing: 2, textTransform: 'uppercase' }}>TAX_INVOICE</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 500, color: '#fff', lineHeight: 1.1, marginTop: 2 }}>{invoice.invoiceNumber}</div>
          <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,.3)', lineHeight: 1.8, marginTop: 5 }}>
            ISSUED: {invoice.invoiceDate}<br />DUE___: {invoice.dueDate}
          </div>
        </div>
      </div>
      <div style={{ padding: '18px 26px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: '#dce8f7', border: '1px solid #b8cfe8', borderRadius: 6, padding: '12px 14px', marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.6rem', letterSpacing: 2, textTransform: 'uppercase', color: '#4a9eff', marginBottom: 4 }}>Billed_To</div>
            <div style={{ fontSize: '0.78rem', fontWeight: 500 }}>{invoice.client.name}</div>
            {invoice.client.company && <div style={{ fontSize: '0.65rem', color: '#4a6380' }}>{invoice.client.company}</div>}
            <div style={{ fontSize: '0.62rem', color: '#4a6380', lineHeight: 1.7, marginTop: 2 }}>{invoice.client.email}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.6rem', letterSpacing: 2, textTransform: 'uppercase', color: '#4a9eff', marginBottom: 4 }}>Due_Date</div>
            <div style={{ fontSize: '0.78rem', fontWeight: 500 }}>{invoice.dueDate}</div>
          </div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 10 }}>
          <thead><tr>
            {['DESCRIPTION','QTY','RATE','AMOUNT'].map((h,i) => (
              <th key={h} style={{ fontSize: '0.6rem', letterSpacing: 1.5, textTransform: 'uppercase', color: '#4a9eff', padding: '7px 0', borderTop: '1px solid #b8cfe8', borderBottom: '1px solid #b8cfe8', fontWeight: 500, textAlign: i === 0 ? 'left' : 'right' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody><ItemRows items={invoice.items} tdStyle={{ padding: '7px 0', fontSize: '0.68rem', color: '#2a3d52', borderBottom: '1px dashed #c4d8ee' }} /></tbody>
        </table>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 24, fontSize: '0.6rem', color: '#6a8aaa', padding: '4px 0' }}>
          <span>SUBTOTAL: {formatCurrency(invoice.subtotal)}</span>
          <span>GST_{invoice.taxRate}%: {formatCurrency(invoice.taxAmount)}</span>
        </div>
        <div style={{ background: '#1a2332', padding: '10px 14px', borderRadius: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
          <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,.4)', letterSpacing: 1 }}>TOTAL_DUE_AUD</span>
          <span style={{ fontSize: '0.95rem', fontWeight: 500, color: '#4a9eff' }}>{formatCurrency(invoice.total)}</span>
        </div>
        <BankBlock biz={b} accentColor="#4a9eff" bgColor="#dce8f7" labelColor="#4a9eff" valColor="#1a2332" borderColor="#b8cfe8" />
        <div style={{ flex: 1 }} />
      </div>
      <Notes text={invoice.notes} color="#6a8aaa" borderColor="#b8cfe8" bg="#dce8f7" />
    </div>
  )
}

/* ════════════════ 7 · FLORA ════════════════ */
export function Flora({ invoice }: Props) {
  const b = invoice.businessInfo
  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: '#1d2b1e', background: '#f4f9f4', display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <div style={{ height: 5, background: 'linear-gradient(90deg,#3d7a45,#7ab87e,#b5d6b0)' }} />
      <div style={{ padding: '20px 26px', display: 'flex', alignItems: 'flex-start', gap: 16, borderBottom: '1px solid #c8dfc9' }}>
        <Logo src={b.logo} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{b.name}</div>
          {b.abn && <div style={{ fontSize: '0.62rem', color: '#6a9070', marginTop: 2 }}>ABN {b.abn}</div>}
          <div style={{ fontSize: '0.62rem', color: '#6a9070', lineHeight: 1.8, marginTop: 4 }}>
            {b.email}{b.phone ? ` · ${b.phone}` : ''}{b.address ? <><br />{b.address}</> : null}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.6rem', letterSpacing: 2, textTransform: 'uppercase', color: '#3d7a45', fontWeight: 600, marginBottom: 4 }}>Tax Invoice</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1d2b1e' }}>{invoice.invoiceNumber}</div>
          <div style={{ fontSize: '0.62rem', color: '#6a9070', lineHeight: 1.8, marginTop: 4 }}>
            Issued: {formatDate(invoice.invoiceDate)}<br />Due: {formatDate(invoice.dueDate)}
          </div>
        </div>
      </div>
      <div style={{ padding: '18px 26px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14, paddingBottom: 12, borderBottom: '1px solid #c8dfc9' }}>
          <div>
            <div style={{ fontSize: '0.6rem', letterSpacing: 2, textTransform: 'uppercase', color: '#3d7a45', marginBottom: 5, fontWeight: 600 }}>Billed To</div>
            <div style={{ fontSize: '0.84rem', fontWeight: 600 }}>{invoice.client.name}</div>
            {invoice.client.company && <div style={{ fontSize: '0.68rem', color: '#6a9070' }}>{invoice.client.company}</div>}
            <div style={{ fontSize: '0.65rem', color: '#6a9070', lineHeight: 1.7, marginTop: 2 }}>
              {invoice.client.email}{invoice.client.address ? <><br />{invoice.client.address}</> : null}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.6rem', letterSpacing: 2, textTransform: 'uppercase', color: '#3d7a45', marginBottom: 5, fontWeight: 600 }}>Payment Due</div>
            <div style={{ fontSize: '0.84rem', fontWeight: 600 }}>{formatDate(invoice.dueDate)}</div>
          </div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 10 }}>
          <thead><tr>
            {['Description','Qty','Rate','Amount'].map((h,i) => (
              <th key={h} style={{ fontSize: '0.6rem', letterSpacing: 1.5, textTransform: 'uppercase', color: '#3d7a45', padding: '7px 0', borderBottom: '2px solid #c8dfc9', fontWeight: 600, textAlign: i === 0 ? 'left' : 'right' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody><ItemRows items={invoice.items} tdStyle={{ padding: '8px 0', fontSize: '0.7rem', color: '#2e3f30', borderBottom: '1px solid #dceedd' }} /></tbody>
        </table>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 24, fontSize: '0.62rem', color: '#6a9070', padding: '4px 0' }}>
          <span>Subtotal {formatCurrency(invoice.subtotal)}</span>
          <span>GST ({invoice.taxRate}%) {formatCurrency(invoice.taxAmount)}</span>
        </div>
        <div style={{ background: '#1d2b1e', color: '#f4f9f4', padding: '12px 16px', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
          <span style={{ fontSize: '0.62rem', letterSpacing: 1.5, textTransform: 'uppercase', color: '#7ab87e' }}>Total Due (AUD)</span>
          <span style={{ fontSize: '1rem', fontWeight: 700 }}>{formatCurrency(invoice.total)}</span>
        </div>
        <BankBlock biz={b} accentColor="#3d7a45" bgColor="#e8f3e9" labelColor="#3d7a45" valColor="#1d2b1e" borderColor="#c8dfc9" />
        <div style={{ flex: 1 }} />
      </div>
      <Notes text={invoice.notes} color="#6a9070" borderColor="#c8dfc9" bg="#e8f3e9" />
    </div>
  )
}

/* ════════════════ 8 · SLATE ════════════════ */
export function Slate({ invoice }: Props) {
  const b = invoice.businessInfo
  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif", color: '#111', background: '#fff', display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <div style={{ padding: '26px 30px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 18 }}>
          <Logo src={b.logo} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{b.name}</div>
            {b.abn && <div style={{ fontSize: '0.65rem', color: '#bbb', marginTop: 2 }}>ABN {b.abn}</div>}
            <div style={{ fontSize: '0.65rem', color: '#999', lineHeight: 1.8, marginTop: 4 }}>
              {b.email}{b.phone ? ` · ${b.phone}` : ''}{b.address ? <><br />{b.address}</> : null}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.65rem', letterSpacing: 3, color: '#bbb', textTransform: 'uppercase' }}>Invoice</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#111', letterSpacing: -1, lineHeight: 1, marginTop: 2 }}>{invoice.invoiceNumber}</div>
            <div style={{ fontSize: '0.62rem', color: '#bbb', lineHeight: 1.8, marginTop: 4 }}>
              Issued: {formatDate(invoice.invoiceDate)}<br />Due: {formatDate(invoice.dueDate)}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 3 }}>
          <div style={{ height: 3, background: '#111', flex: 1 }} />
          <div style={{ height: 3, background: '#ccc', width: 50 }} />
          <div style={{ height: 3, background: '#eee', width: 25 }} />
        </div>
      </div>
      <div style={{ padding: '16px 30px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 14, borderBottom: '1px solid #f0f0f0' }}>
          <div>
            <div style={{ fontSize: '0.62rem', letterSpacing: 2, textTransform: 'uppercase', color: '#bbb', marginBottom: 5 }}>Billed To</div>
            <div style={{ fontSize: '0.84rem', fontWeight: 600 }}>{invoice.client.name}</div>
            {invoice.client.company && <div style={{ fontSize: '0.7rem', color: '#888' }}>{invoice.client.company}</div>}
            <div style={{ fontSize: '0.65rem', color: '#888', lineHeight: 1.7, marginTop: 2 }}>
              {invoice.client.email}{invoice.client.address ? <><br />{invoice.client.address}</> : null}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.62rem', letterSpacing: 2, textTransform: 'uppercase', color: '#bbb', marginBottom: 5 }}>Due Date</div>
            <div style={{ fontSize: '0.84rem', fontWeight: 600 }}>{formatDate(invoice.dueDate)}</div>
          </div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 10 }}>
          <thead><tr>
            {['Description','Qty','Rate','Amount'].map((h,i) => (
              <th key={h} style={{ fontSize: '0.62rem', letterSpacing: 1.5, textTransform: 'uppercase', color: '#ccc', padding: '7px 0', borderBottom: '1px solid #f0f0f0', fontWeight: 500, textAlign: i === 0 ? 'left' : 'right' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody><ItemRows items={invoice.items} tdStyle={{ padding: '8px 0', fontSize: '0.72rem', color: '#444', borderBottom: '1px solid #f8f8f8' }} /></tbody>
        </table>
        <div style={{ paddingTop: 10, borderTop: '1px solid #111', marginTop: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#aaa', padding: '3px 0' }}><span>Subtotal</span><span>{formatCurrency(invoice.subtotal)}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#aaa', padding: '3px 0' }}><span>GST ({invoice.taxRate}%)</span><span>{formatCurrency(invoice.taxAmount)}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 700, color: '#111', paddingTop: 8, marginTop: 4, borderTop: '1px solid #111' }}>
            <span>Total Due (AUD)</span><span>{formatCurrency(invoice.total)}</span>
          </div>
        </div>
        <BankBlock biz={b} accentColor="#111" bgColor="#f8f8f8" labelColor="#ccc" valColor="#444" borderColor="#eee" />
        <div style={{ flex: 1 }} />
      </div>
      <Notes text={invoice.notes} color="#bbb" borderColor="#f0f0f0" bg="#f8f8f8" />
    </div>
  )
}

/* ── Dispatcher ── */
export function InvoicePreview({ invoice }: Props) {
  const map: Record<string, React.FC<Props>> = {
    prestige: Prestige, frost: Frost, terra: Terra, prism: Prism,
    linen: Linen, blueprint: Blueprint, flora: Flora, slate: Slate,
  }
  const Comp = map[invoice.design] || Slate
  return <Comp invoice={invoice} />
}
