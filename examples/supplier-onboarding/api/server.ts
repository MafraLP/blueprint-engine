import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createDemoServer, type DemoContext } from '../../shared/api/create-demo-server.js'
import { supplierContexts, supplierProducts } from './catalog.js'

export function createSupplierOnboardingServer(context: DemoContext = supplierContexts.demo) {
  return createDemoServer(supplierProducts, () => context)
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const server = createSupplierOnboardingServer()
  server.listen(3002, () => {
    console.log('Supplier onboarding demo: http://localhost:3002')
  })
}
