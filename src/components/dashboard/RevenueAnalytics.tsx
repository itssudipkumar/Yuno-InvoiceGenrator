import type { Invoice } from '../../types/invoice.types'
import { formatCurrency } from '../../utils/invoice'

interface Props {
  invoices: Invoice[]
}

interface MonthTotals {
  invoiced: number
  received: number
}

const MONTHS = Array.from({ length: 12 }, (_, month) =>
  new Intl.DateTimeFormat('en-AU', { month: 'short' }).format(new Date(2024, month, 1)),
)

export default function RevenueAnalytics({ invoices }: Props) {
  const now = new Date()
  const year = now.getFullYear()
  const months: MonthTotals[] = Array.from({ length: 12 }, () => ({ invoiced: 0, received: 0 }))

  invoices.forEach(invoice => {
    if (!invoice.invoiceDate || invoice.status === 'draft') return
    const invoiceYear = Number(invoice.invoiceDate.slice(0, 4))
    const month = Number(invoice.invoiceDate.slice(5, 7)) - 1
    if (!Number.isFinite(invoiceYear) || invoiceYear !== year || !Number.isInteger(month) || month < 0 || month > 11) return
    months[month].invoiced += invoice.total
    if (invoice.status === 'paid') months[month].received += invoice.total
  })

  const currentMonthStart = new Date(year, now.getMonth(), 1)
  const previousMonthStart = new Date(year, now.getMonth() - 1, 1)
  const previousCutoff = new Date(
    previousMonthStart.getFullYear(),
    previousMonthStart.getMonth(),
    Math.min(now.getDate(), new Date(year, now.getMonth(), 0).getDate()),
  )
  const withinRange = (date: string, start: Date, end: Date) => {
    const value = new Date(`${date}T00:00:00`)
    return value >= start && value <= end
  }
  const currentMonthToDate = invoices.reduce((sum, invoice) => (
    invoice.status !== 'draft' &&
    withinRange(invoice.invoiceDate, currentMonthStart, now)
      ? sum + invoice.total
      : sum
  ), 0)
  const previousMonthToDate = invoices.reduce((sum, invoice) => (
    invoice.status !== 'draft' &&
    withinRange(invoice.invoiceDate, previousMonthStart, previousCutoff)
      ? sum + invoice.total
      : sum
  ), 0)
  const growth = previousMonthToDate === 0
    ? null
    : ((currentMonthToDate - previousMonthToDate) / previousMonthToDate) * 100
  const yearlyInvoiced = months.reduce((sum, month) => sum + month.invoiced, 0)
  const yearlyReceived = months.reduce((sum, month) => sum + month.received, 0)
  const maxValue = Math.max(1, ...months.flatMap(month => [month.invoiced, month.received]))

  const chartWidth = 780
  const chartHeight = 240
  const chartTop = 12
  const chartBottom = 195
  const groupWidth = chartWidth / 12
  const barWidth = 12
  const gap = 4
  const formatTooltip = (month: string, kind: string, value: number) =>
    `${month}: ${kind} ${formatCurrency(value)}`

  return (
    <section className="section-card revenue-card" aria-labelledby="revenue-title">
      <div className="section-header revenue-header">
        <div>
          <span className="dashboard-section-kicker">THE BIG PICTURE</span>
          <h2 id="revenue-title">Revenue overview</h2>
          <p>Invoices dated this year · {year}</p>
        </div>
        <div className="revenue-legend" aria-label="Chart legend">
          <span><i className="legend-invoiced" />Invoiced</span>
          <span><i className="legend-received" />Received</span>
        </div>
      </div>

      <div className="revenue-summary">
        <div><span>Invoiced this year</span><strong>{formatCurrency(yearlyInvoiced)}</strong></div>
        <div><span>Received this year</span><strong>{formatCurrency(yearlyReceived)}</strong></div>
        <div>
          <span>Month to date</span>
          <strong className={growth !== null && growth < 0 ? 'growth-down' : 'growth-up'}>
            {growth === null ? '—' : `${growth >= 0 ? '+' : ''}${growth.toFixed(0)}%`}
          </strong>
          <small>{growth === null ? 'No previous-month comparison' : 'vs same days last month'}</small>
        </div>
      </div>

      <div className="revenue-chart-scroll">
        <svg
          className="revenue-chart"
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          role="img"
          aria-label={`Monthly invoiced and received totals for ${year}. Hover or focus bars for exact amounts.`}
        >
          {[0, 1, 2, 3].map(line => {
            const y = chartTop + ((chartBottom - chartTop) / 3) * line
            return <line key={line} x1="0" x2={chartWidth} y1={y} y2={y} className="chart-gridline" />
          })}
          {months.map((totals, month) => {
            const x = month * groupWidth + (groupWidth - barWidth * 2 - gap) / 2
            const invoicedHeight = (totals.invoiced / maxValue) * (chartBottom - chartTop)
            const receivedHeight = (totals.received / maxValue) * (chartBottom - chartTop)
            const monthLabel = MONTHS[month]
            return (
              <g key={month}>
                <rect
                  x={x}
                  y={chartBottom - invoicedHeight}
                  width={barWidth}
                  height={Math.max(totals.invoiced ? 2 : 0, invoicedHeight)}
                  rx="3"
                  className="chart-bar-invoiced"
                  tabIndex={0}
                >
                  <title>{formatTooltip(monthLabel, 'Invoiced', totals.invoiced)}</title>
                </rect>
                <rect
                  x={x + barWidth + gap}
                  y={chartBottom - receivedHeight}
                  width={barWidth}
                  height={Math.max(totals.received ? 2 : 0, receivedHeight)}
                  rx="3"
                  className="chart-bar-received"
                  tabIndex={0}
                >
                  <title>{formatTooltip(monthLabel, 'Received', totals.received)}</title>
                </rect>
                <text x={month * groupWidth + groupWidth / 2} y="222" className="chart-month">
                  {monthLabel}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
      <p className="revenue-note">Drafts are excluded. Monthly totals are grouped by invoice date.</p>
    </section>
  )
}
