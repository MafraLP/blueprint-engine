import assert from 'node:assert/strict'
import { once } from 'node:events'
import test from 'node:test'
import { createCakeShopServer } from '../../../.example-dist/examples/cake-shop/api/server.js'

async function withServer(callback) {
  const server = createCakeShopServer()
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

test('serves two schemas and rejects a manipulated birthday cake payload', async () => {
  await withServer(async (baseUrl) => {
    const pageResponse = await fetch(baseUrl)
    assert.equal(pageResponse.status, 200)
    assert.match(await pageResponse.text(), /One engine, many product flows/)

    const productResponse = await fetch(`${baseUrl}/api/products`)
    assert.deepEqual(await productResponse.json(), {
      products: [
        { key: 'birthday-cake', label: 'Birthday Cake' },
        { key: 'naked-cake', label: 'Naked Cake' }
      ]
    })

    const schemaResponse = await fetch(`${baseUrl}/api/products/birthday-cake/schema`)
    const schemaPayload = await schemaResponse.json()
    assert.equal(schemaPayload.schema.properties.message.type, 'text')
    assert.equal(schemaPayload.schema.properties.tiers.type, 'number')
    assert.equal(schemaPayload.schema.properties.includeCandles.type, 'boolean')
    assert.equal(schemaPayload.schema.properties.topping.type, 'object')
    assert.equal(schemaPayload.schema.properties.topping.properties.topperImageUrl.type, 'upload')

    const invalidResponse = await fetch(`${baseUrl}/api/products/birthday-cake/submit`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ message: '', tiers: 0, topping: { flavour: 'vanilla', colour: 'white' } })
    })
    assert.equal(invalidResponse.status, 422)
    assert.deepEqual((await invalidResponse.json()).errors, [
      { path: 'message', message: 'is required' },
      { path: 'tiers', message: 'must be at least 1' }
    ])

    const validResponse = await fetch(`${baseUrl}/api/products/naked-cake/submit`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ fruit: 'fig', tiers: 2 })
    })
    assert.equal(validResponse.status, 201)
  })
})
