export function parseExpenseCents(value: string): number | null {
  if (!/^\d{1,8}(?:\.\d{1,2})?$/.test(value)) return null
  const [whole, fraction = ''] = value.split('.')
  return Number(whole) * 100 + Number(fraction.padEnd(2, '0'))
}
