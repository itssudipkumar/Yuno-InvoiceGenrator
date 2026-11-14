import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseExpenseCents } from '../src/features/expenses/expenseMoney.ts'

test('parses AUD amounts as exact integer cents', () => {
  assert.equal(parseExpenseCents('0'), 0)
  assert.equal(parseExpenseCents('0.01'), 1)
  assert.equal(parseExpenseCents('100.25'), 10025)
  assert.equal(parseExpenseCents('10.3'), 1030)
  assert.equal(parseExpenseCents('99999999.99'), 9999999999)
})

test('rejects invalid and over-precision amounts', () => {
  for (const value of ['', '-1', '1.234', '1.', '.10', '1e3', '100000000', 'NaN']) {
    assert.equal(parseExpenseCents(value), null, value)
  }
})
