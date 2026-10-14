import assert from 'node:assert/strict'
import { once } from 'node:events'
import test from 'node:test'
import { createSupplierOnboardingServer } from '../../../.example-dist/examples/supplier-onboarding/api/server.js'

async function withServer(callback) {
  const server = createSupplierOnboardingServer()
  server.listen(0)
  await once(server, 'listening')
  const address = server.address()
  if (!address || typeof address === 'string') throw new Error('Expected a TCP server address.')

  try {
    await callback(`http://127.0.0.1:${address.port}`)
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve())
      server.closeAllConnections()
    })
  }
}

test('uses the shared renderer protocol for supplier onboarding', async () => {
  await withServer(async (baseUrl) => {
    const page = await fetch(baseUrl)
    assert.match(await page.text(), /One engine, many product flows/)

    const products = await fetch(`${baseUrl}/api/products`).then((response) => response.json())
    assert.deepEqual(products, {
      products: [
        { key: 'sole-trader', label: 'Sole trader supplier' },
        { key: 'corporate', label: 'Corporate supplier' }
      ]
    })

    const schema = await fetch(`${baseUrl}/api/products/corporate/schema`).then((response) => response.json())
    assert.equal(schema.schema.properties.address.type, 'object')
    assert.equal(schema.schema.properties.employeeCount.minimum, 1)

    const invalid = await fetch(`${baseUrl}/api/products/corporate/submit`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ registeredName: 'Blueprint Ltd.' })
    })
    assert.equal(invalid.status, 422)
    assert.deepEqual((await invalid.json()).errors, [
      { path: 'registrationNumber', message: 'is required' },
      { path: 'employeeCount', message: 'is required' },
      { path: 'address', message: 'is required' }
    ])
  })
})

test('uses a dummy profile to demonstrate blueprint availability', async () => {
  await withServer(async (baseUrl) => {
    const products = await fetch(`${baseUrl}/api/products?profile=starter`).then((response) => response.json())
    assert.deepEqual(products, { products: [{ key: 'sole-trader', label: 'Sole trader supplier' }] })

    assert.equal((await fetch(`${baseUrl}/api/products/sole-trader/schema?profile=starter`)).status, 200)
    assert.equal((await fetch(`${baseUrl}/api/products/sole-trader/submit?profile=starter`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        legalName: 'Ava Stone',
        personalTaxId: 'TAX-123',
        tradeLicenseUrl: 'https://example.test/license.pdf',
        address: { street: '1 Market Street', city: 'Porto Alegre', country: 'Brazil' }
      })
    })).status, 201)

    assert.equal((await fetch(`${baseUrl}/api/products/corporate/schema?profile=starter`, {
      headers: { 'x-plan': 'business' }
    })).status, 404)
    assert.equal((await fetch(`${baseUrl}/api/products/corporate/submit?profile=starter`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-plan': 'business' },
      body: JSON.stringify({ plan: 'business', registeredName: 'Blueprint Ltd.' })
    })).status, 404)
  })
})
