import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http'
import { readFile } from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import { parse, schemaFor, type Constructor } from '../../../src/index.js'

export interface DemoProduct {
  key: string
  label: string
  dto: Constructor
}

const webRoot = resolve(process.cwd(), 'examples/shared/web')
const maxBodyBytes = 1_000_000
const contentTypes: Record<string, string> = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8'
}

function json(response: ServerResponse, status: number, body: unknown): void {
  response.writeHead(status, { 'content-type': 'application/json; charset=utf-8' })
  response.end(JSON.stringify(body))
}

async function bodyFrom(request: IncomingMessage): Promise<unknown> {
  let body = ''
  for await (const chunk of request) {
    body += Buffer.from(chunk).toString('utf8')
    if (Buffer.byteLength(body) > maxBodyBytes) throw new Error('Request body is too large.')
  }

  try {
    return JSON.parse(body || 'null') as unknown
  } catch {
    throw new Error('Request body must be valid JSON.')
  }
}

async function serveAsset(pathname: string, response: ServerResponse): Promise<void> {
  const asset = pathname === '/' ? 'index.html' : pathname.slice(1)
  if (!['index.html', 'app.js', 'styles.css'].includes(asset)) {
    json(response, 404, { message: 'Not found.' })
    return
  }

  const content = await readFile(resolve(webRoot, asset))
  response.writeHead(200, { 'content-type': contentTypes[extname(asset)] ?? 'application/octet-stream' })
  response.end(content)
}

export function createDemoServer(products: readonly DemoProduct[]): Server {
  return createServer(async (request, response) => {
    const url = new URL(request.url ?? '/', 'http://localhost')
    const parts = url.pathname.split('/')

    try {
      if (request.method === 'GET' && url.pathname === '/api/products') {
        json(response, 200, { products: products.map(({ key, label }) => ({ key, label })) })
        return
      }

      const product = parts[1] === 'api' && parts[2] === 'products'
        ? products.find(({ key }) => key === parts[3])
        : undefined
      if (product && request.method === 'GET' && parts[4] === 'schema') {
        json(response, 200, { product: { key: product.key, label: product.label }, schema: schemaFor(product.dto) })
        return
      }

      if (product && request.method === 'POST' && parts[4] === 'submit') {
        const result = parse(product.dto, await bodyFrom(request))
        if (!result.success) {
          json(response, 422, { errors: result.errors })
          return
        }

        json(response, 201, { order: { product: product.key, configuration: result.value } })
        return
      }

      if (url.pathname.startsWith('/api/')) {
        json(response, 404, { message: 'Unknown product or endpoint.' })
        return
      }

      await serveAsset(url.pathname, response)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unexpected error.'
      json(response, 400, { message })
    }
  })
}
