import assert from 'node:assert/strict'
import { once } from 'node:events'
import test from 'node:test'
import { createGalleryServer } from '../../../.example-dist/examples/gallery/api/server.js'

async function withServer(callback) {
  const server = createGalleryServer()
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

test('renders multiple domains through one schema gallery server', async () => {
  await withServer(async (baseUrl) => {
    const page = await fetch(baseUrl)
    assert.match(await page.text(), /Generated schema/)

    const demos = await fetch(`${baseUrl}/api/demos`).then((response) => response.json())
    assert.deepEqual(demos, {
      demos: [
        { key: 'cake-shop', label: 'Cake Shop' },
        { key: 'supplier-onboarding', label: 'Supplier Onboarding' }
      ]
    })

    const cakeSchema = await fetch(`${baseUrl}/api/products/birthday-cake/schema?demo=cake-shop&profile=nanda`).then((response) => response.json())
    assert.equal(cakeSchema.schema.properties.topping.type, 'object')

    const supplierSchema = await fetch(`${baseUrl}/api/products/corporate/schema?demo=supplier-onboarding&profile=business`).then((response) => response.json())
    assert.equal(supplierSchema.schema.properties.employeeCount.type, 'number')

    assert.equal((await fetch(`${baseUrl}/api/products/naked-cake/schema?demo=cake-shop&profile=nanda`)).status, 404)
    assert.equal((await fetch(`${baseUrl}/api/products/corporate/schema?demo=supplier-onboarding&profile=starter`)).status, 404)
  })
})
