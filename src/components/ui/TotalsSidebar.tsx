import { formatCurrency } from '../../utils/invoice'

interface Props {
  subtotal: number
  taxRate: number
  taxAmount: number
  total: number
  onTaxRateChange: (r: number) => void
}

export function TotalsSidebar({ subtotal, taxRate, taxAmount, total, onTaxRateChange }: Props) {
  return (
    <div className="totals-card">
      <h3>Summary</h3>
      <div className="totals-row">
        <span>Subtotal</span>
        <span>{formatCurrency(subtotal)}</span>
      </div>
      <div className="totals-row tax-row">
        <span>GST Rate</span>
        <div className="tax-input-wrap">
          <input
            type="number"
            className="tax-rate-input"
            value={taxRate}
            min={0}
            max={100}
            onChange={e => onTaxRateChange(+e.target.value)}
          />
          <span>%</span>
        </div>
      </div>
      <div className="totals-row">
        <span>GST ({taxRate}%)</span>
        <span>{formatCurrency(taxAmount)}</span>
      </div>
      <div className="totals-divider" />
      <div className="totals-total">
        <span>Total (AUD)</span>
        <span>{formatCurrency(total)}</span>
      </div>
    </div>
  )
}
