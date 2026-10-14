import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { Field, Nested, parse, schemaFor } from '../dist/index.js'

const fixture = async (name) => JSON.parse(await readFile(new URL(`./fixtures/${name}`, import.meta.url), 'utf8'))

class NestedContract {
  note
}
Field({ component: 'text', label: 'Note', required: true })(NestedContract.prototype, 'note')

class AllComponentsContract {
  text
  number
  boolean
  select
  upload
  nested
  optionalText
}
Field({ component: 'text', label: 'Text', required: true })(AllComponentsContract.prototype, 'text')
Field({ component: 'number', label: 'Number', required: true, min: 1, max: 10 })(AllComponentsContract.prototype, 'number')
Field({ component: 'boolean', label: 'Boolean', required: true })(AllComponentsContract.prototype, 'boolean')
Field({ component: 'select', label: 'Select', required: true, options: ['first', 'second'] })(AllComponentsContract.prototype, 'select')
Field({ component: 'upload', label: 'Upload', required: true })(AllComponentsContract.prototype, 'upload')
Nested({ dto: NestedContract, label: 'Nested', required: true })(AllComponentsContract.prototype, 'nested')
Field({ component: 'text', label: 'Optional text' })(AllComponentsContract.prototype, 'optionalText')

test('matches the versioned schema fixture for every supported component', async () => {
  assert.deepEqual(schemaFor(AllComponentsContract), await fixture('all-components.schema.json'))
})

test('rejects unknown keys and invalid nested values with the documented error contract', async () => {
  const result = parse(AllComponentsContract, {
    text: 42,
    number: 0,
    boolean: 'true',
    select: 'other',
    upload: 9,
    nested: { note: '', unexpected: true },
    unexpected: true
  })

  assert.deepEqual(result, { success: false, errors: await fixture('all-components.errors.json') })
})

test('matches fixtures for the remaining validation errors', async () => {
  const cases = await fixture('validation-cases.json')
  for (const validationCase of cases) {
    assert.deepEqual(parse(AllComponentsContract, validationCase.input), {
      success: false,
      errors: validationCase.errors
    }, validationCase.name)
  }
})

test('keeps optional empty values unset and rejects non-object roots', () => {
  const result = parse(AllComponentsContract, {
    text: 'valid',
    number: 1,
    boolean: false,
    select: 'first',
    upload: 'https://example.test/topper.png',
    nested: { note: 'nested' },
    optionalText: ''
  })
  assert.equal(result.success, true)
  if (result.success) assert.equal(result.value.optionalText, undefined)

  assert.deepEqual(parse(AllComponentsContract, []), {
    success: false,
    errors: [{ path: '$', message: 'must be an object' }]
  })
})

test('allows subclasses to override inherited field definitions', () => {
  class BaseContract {
    name
  }
  Field({ component: 'text', label: 'Base name' })(BaseContract.prototype, 'name')

  class DerivedContract extends BaseContract {
    extra
  }
  Field({ component: 'text', label: 'Required name', required: true })(DerivedContract.prototype, 'name')
  Field({ component: 'number', label: 'Extra', required: true, min: 1 })(DerivedContract.prototype, 'extra')

  assert.deepEqual(schemaFor(DerivedContract), {
    schemaVersion: 1,
    type: 'object',
    properties: {
      name: { type: 'text', title: 'Required name' },
      extra: { type: 'number', title: 'Extra', minimum: 1 }
    },
    required: ['name', 'extra']
  })
})

test('rejects invalid field configuration at declaration time', () => {
  assert.throws(
    () => Field({ component: 'select', label: 'Missing options' }),
    /Select fields must define at least one option/
  )
  assert.throws(
    () => Field({ component: 'text', label: 'Text', min: 1 }),
    /Only number fields may define minimum or maximum values/
  )
})
