import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createDemoServer, type DemoContext } from '../../shared/api/create-demo-server.js'
import { cakeContexts, cakeProducts } from './catalog.js'

export function createCakeShopServer(context: DemoContext = cakeContexts.demo) {
  return createDemoServer(cakeProducts, () => context)
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const server = createCakeShopServer()
  server.listen(3000, () => {
    console.log('Cake Shop demo: http://localhost:3000')
  })
}
