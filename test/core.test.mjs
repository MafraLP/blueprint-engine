import assert from 'node:assert/strict'
import test from 'node:test'
import { Field, Nested, parse, schemaFor } from '../dist/index.js'

class Topping {
  name
}
Field({ component: 'text', label: 'Topping', required: true })(Topping.prototype, 'name')

class BirthdayCake {
  message
  tiers
  topping
}
Field({ component: 'text', label: 'Cake message', required: true })(BirthdayCake.prototype, 'message')
Field({ component: 'number', label: 'Tiers', required: true, min: 1 })(BirthdayCake.prototype, 'tiers')
Nested({ dto: Topping, label: 'Topping configuration', required: true })(BirthdayCake.prototype, 'topping')

test('generates a stable nested schema', () => {
  assert.deepEqual(schemaFor(BirthdayCake), {
    schemaVersion: 1,
    type: 'object',
    properties: {
      message: { type: 'text', title: 'Cake message' },
      tiers: { type: 'number', title: 'Tiers', minimum: 1 },
      topping: {
        type: 'object',
        title: 'Topping configuration',
        properties: { name: { type: 'text', title: 'Topping' } },
        required: ['name']
      }
    },
    required: ['message', 'tiers', 'topping']
  })
})

test('hydrates valid input and rejects invalid nested input', () => {
  const valid = parse(BirthdayCake, { message: 'Happy birthday', tiers: 2, topping: { name: 'Strawberry' } })
  assert.equal(valid.success, true)
  if (valid.success) assert.equal(valid.value.topping.name, 'Strawberry')

  const invalid = parse(BirthdayCake, { message: '', tiers: 0, topping: {} })
  assert.deepEqual(invalid, {
    success: false,
    errors: [
      { path: 'message', message: 'is required' },
      { path: 'tiers', message: 'must be at least 1' },
      { path: 'topping.name', message: 'is required' }
    ]
  })
})
