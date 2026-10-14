import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createDemoServer } from '../../shared/api/create-demo-server.js'
import { cakeDemoProfiles, cakeProducts } from '../../cake-shop/api/catalog.js'
import { supplierDemoProfiles, supplierProducts } from '../../supplier-onboarding/api/catalog.js'

export function createGalleryServer() {
  return createDemoServer([
    {
      key: 'cake-shop',
      label: 'Cake Shop',
      products: cakeProducts,
      profiles: cakeDemoProfiles
    },
    {
      key: 'supplier-onboarding',
      label: 'Supplier Onboarding',
      products: supplierProducts,
      profiles: supplierDemoProfiles
    }
  ])
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const server = createGalleryServer()
  server.listen(3004, () => {
    console.log('Blueprint Gallery: http://localhost:3004')
  })
}
