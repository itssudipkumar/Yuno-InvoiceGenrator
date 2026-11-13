import { useId, useRef, useState } from 'react'
import { Check, ChevronDown, Eye } from 'lucide-react'
import { INVOICE_DESIGNS } from '../../types/invoice.types'
import type { InvoiceDesign } from '../../types/invoice.types'
import './invoice-design-picker.css'

interface Props {
  design: InvoiceDesign
  onChange: (design: InvoiceDesign) => void
  onPreview: () => void
  isRegistered?: boolean
}

export function InvoiceDesignPicker({ design, onChange, onPreview, isRegistered = false }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const optionsId = useId()
  const toggleRef = useRef<HTMLButtonElement>(null)
  const selected = INVOICE_DESIGNS.find(option => option.id === design)

  return (
    <section className="invoice-design-picker" aria-labelledby="invoice-design-heading">
      <div className="invoice-design-picker__header">
        <div className="invoice-design-picker__summary">
          <h2 id="invoice-design-heading">Invoice design</h2>
          <p><strong>{selected?.label}</strong> <span>— {selected?.desc}</span></p>
        </div>
        <div className="invoice-design-picker__actions">
          <button type="button" ref={toggleRef} className="invoice-design-picker__toggle" aria-expanded={isOpen} aria-controls={optionsId} onClick={() => setIsOpen(open => !open)}>
            {isOpen ? 'Close designs' : 'Change design'} <ChevronDown size={16} aria-hidden="true" className={isOpen ? 'is-open' : ''} />
          </button>
          <button type="button" className="invoice-design-picker__preview" onClick={onPreview}>
            <Eye size={16} aria-hidden="true" /> Preview invoice
          </button>
        </div>
      </div>
      <div id={optionsId} hidden={!isOpen} className="invoice-design-picker__panel">
        <p className="invoice-design-picker__instructions">Choose a style, then preview it with your invoice details.</p>
        <div className="invoice-design-picker__options" role="group" aria-label="Invoice design">
        {INVOICE_DESIGNS.map(option => (
          <button
            key={option.id}
            type="button"
            className={`invoice-design-choice invoice-design-choice--${option.id}${design === option.id ? ' is-selected' : ''}`}
            aria-label={`${option.label}: ${option.desc}`}
            aria-pressed={design === option.id}
            onClick={() => {
              onChange(option.id)
              setIsOpen(false)
              toggleRef.current?.focus()
            }}
          >
            <span className="invoice-design-choice__paper" aria-hidden="true">
              <span className="invoice-design-choice__masthead"><span /><span /></span>
              <span className="invoice-design-choice__body">
                <span className="invoice-design-choice__details"><span /><span /></span>
                <span className="invoice-design-choice__lines"><span /><span /><span /></span>
                <span className="invoice-design-choice__total" />
              </span>
            </span>
            <span className="invoice-design-choice__name">{option.label}<span className="invoice-design-choice__check"><Check size={13} aria-hidden="true" /></span></span>
            <span className="invoice-design-choice__description">{option.desc}</span>
          </button>
        ))}
        </div>
        <p className="invoice-design-picker__note">
          {isRegistered ? 'This choice applies to this invoice. Change your default in Account.' : 'Your selected design is used for preview, print and PDF.'}
        </p>
      </div>
    </section>
  )
}
