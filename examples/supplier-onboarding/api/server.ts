import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createDemoServer } from '../../shared/api/create-demo-server.js'
import { supplierDemoProfiles, supplierProducts } from './catalog.js'

export function createSupplierOnboardingServer() {
  return createDemoServer([{
    key: 'supplier-onboarding',
    label: 'Supplier Onboarding',
    products: supplierProducts,
    profiles: supplierDemoProfiles
  }])
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const server = createSupplierOnboardingServer()
  server.listen(3002, () => {
    console.log('Supplier onboarding demo: http://localhost:3002')
  })
}
