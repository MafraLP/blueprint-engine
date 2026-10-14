import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createDemoServer } from '../../shared/api/create-demo-server.js'
import { cakeDemoProfiles, cakeProducts } from './catalog.js'

export function createCakeShopServer() {
  return createDemoServer([{
    key: 'cake-shop',
    label: 'Cake Shop',
    products: cakeProducts,
    profiles: cakeDemoProfiles
  }])
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const server = createCakeShopServer()
  server.listen(3000, () => {
    console.log('Cake Shop demo: http://localhost:3000')
  })
}
