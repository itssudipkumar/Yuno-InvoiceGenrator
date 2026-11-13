import type { InvoiceItem } from '../../types/invoice.types'
import { formatCurrency } from '../../utils/invoice'

interface Props {
  items: InvoiceItem[]
  onChange: (items: InvoiceItem[]) => void
}

export function LineItemsTable({ items, onChange }: Props) {
  const update = (id: string, field: string, val: string | number) => {
    onChange(items.map(item => {
      if (item.id !== id) return item
      const u = { ...item, [field]: val }
      u.amount = u.quantity * u.unitPrice
      return u
    }))
  }

  const add = () => onChange([
    ...items,
    { id: Date.now().toString(), description: '', quantity: 1, unitPrice: 0, amount: 0 }
  ])

  const remove = (id: string) => {
    if (items.length <= 1) return
    onChange(items.filter(i => i.id !== id))
  }

  return (
    <>
      <div className="items-table-wrap">
        <table className="items-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Amount</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id}>
                <td data-label="Description">
                  <input
                    className="desc-input"
                    aria-label="Item description"
                    value={item.description}
                    onChange={e => update(item.id, 'description', e.target.value)}
                    placeholder="Service or product description"
                  />
                </td>
                <td data-label="Quantity">
                  <input
                    type="number"
                    className="num-input"
                    aria-label="Quantity"
                    value={item.quantity}
                    min={1}
                    onChange={e => update(item.id, 'quantity', +e.target.value)}
                  />
                </td>
                <td data-label="Unit price">
                  <input
                    type="number"
                    className="num-input"
                    aria-label="Unit price"
                    value={item.unitPrice}
                    min={0}
                    step={0.01}
                    onChange={e => update(item.id, 'unitPrice', +e.target.value)}
                  />
                </td>
                <td className="item-amt" data-label="Amount">{formatCurrency(item.amount)}</td>
                <td className="item-remove">
                  {items.length > 1 && (
                    <button className="remove-item" aria-label={`Remove ${item.description || 'item'}`} onClick={() => remove(item.id)}>✕</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button className="add-item-btn" onClick={add}>+ Add Item</button>
    </>
  )
}
