import type { Invoice } from '../../types/invoice.types'
import { resolveInvoiceDesign } from '../../types/invoice.types'
import { formatCurrency, formatDate } from '../../utils/invoice'
import './invoice-designs.css'

interface Props { invoice: Invoice }

export function InvoicePreview({ invoice }: Props) {
  const design = resolveInvoiceDesign(invoice.design)
  const business = invoice.businessInfo
  const client = invoice.client
  const paymentDetails = [
    { label: 'Bank', value: business.bankName },
    { label: 'Account name', value: business.accountName },
    { label: 'BSB', value: business.bsb },
    { label: 'Account number', value: business.accountNumber },
  ].filter(detail => detail.value)

  return (
    <article className={`invoice-document invoice-document--${design}`} aria-label={`${design} invoice preview`}>
      <header className="invoice-document__header" data-pdf-avoid>
        <div className="invoice-document__business">
          {business.logo && <img className="invoice-document__logo" src={business.logo} alt="Business logo" />}
          <div className="invoice-document__business-text">
            <div className="invoice-document__business-name">{business.name || 'Your business'}</div>
            {business.abn && <div>ABN {business.abn}</div>}
            {business.email && <div>{business.email}</div>}
            {business.phone && <div>{business.phone}</div>}
            {business.address && <div>{business.address}</div>}
            {business.website && <div>{business.website}</div>}
          </div>
        </div>
        <div className="invoice-document__heading">
          <div className="invoice-document__eyebrow">Tax invoice</div>
          <h1>Invoice</h1>
          <div className="invoice-document__number">{invoice.invoiceNumber || '—'}</div>
        </div>
      </header>

      <main className="invoice-document__body">
        <div className="invoice-document__details" data-pdf-avoid>
          <section className="invoice-document__client">
            <div className="invoice-document__label">Bill to</div>
            <div className="invoice-document__client-name">{client.name || 'Client name'}</div>
            {client.company && <div>{client.company}</div>}
            {client.email && <div>{client.email}</div>}
            {client.phone && <div>{client.phone}</div>}
            {client.address && <div>{client.address}</div>}
          </section>
          <section className="invoice-document__dates" aria-label="Invoice dates">
            <div><span className="invoice-document__label">Date issued</span><strong>{invoice.invoiceDate ? formatDate(invoice.invoiceDate) : '—'}</strong></div>
            {invoice.dueDate && <div><span className="invoice-document__label">Due date</span><strong>{formatDate(invoice.dueDate)}</strong></div>}
          </section>
        </div>

        <table className="invoice-document__items">
          <thead>
            <tr>
              <th>Description</th><th>Qty</th><th>Rate</th><th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map(item => (
              <tr key={item.id} data-pdf-avoid>
                <td>{item.description || '—'}</td>
                <td>{item.quantity}</td>
                <td>{formatCurrency(item.unitPrice)}</td>
                <td>{formatCurrency(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="invoice-document__totals" data-pdf-avoid>
          <div><span>Subtotal</span><span>{formatCurrency(invoice.subtotal)}</span></div>
          <div><span>GST ({invoice.taxRate}%)</span><span>{formatCurrency(invoice.taxAmount)}</span></div>
          <div className="invoice-document__total"><span>Total due <small>AUD</small></span><strong>{formatCurrency(invoice.total)}</strong></div>
        </div>

        {paymentDetails.length > 0 && (
          <section className="invoice-document__payment" data-pdf-avoid>
            <div className="invoice-document__label">Payment details</div>
            <div className="invoice-document__payment-grid">
              {paymentDetails.map(detail => (
                <div key={detail.label}>
                  <span>{detail.label}</span><strong>{detail.value}</strong>
                </div>
              ))}
            </div>
          </section>
        )}

        {invoice.notes && (
          <section className="invoice-document__notes" data-pdf-avoid>
            <div className="invoice-document__label">Notes</div>
            <div>{invoice.notes}</div>
          </section>
        )}
      </main>
      <footer className="invoice-document__footer" data-pdf-avoid>
        <span>{business.name || 'Invoice'}</span>
        <span>{invoice.invoiceNumber || '—'}</span>
      </footer>
    </article>
  )
}
