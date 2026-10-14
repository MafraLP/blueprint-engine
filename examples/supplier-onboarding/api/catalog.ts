import type { DemoContext, DemoProduct, DemoProfile } from '../../shared/api/create-demo-server.js'
import { CorporateSupplier, SoleTraderSupplier } from './blueprints.js'

export const supplierContexts = {
  demo: { id: 'supplier-demo' },
  starter: { id: 'starter-organization' },
  business: { id: 'business-organization' }
} as const satisfies Record<string, DemoContext>

export const supplierDemoProfiles: readonly DemoProfile[] = [
  { key: 'all-suppliers', label: 'All Supplier Flows', context: supplierContexts.demo },
  { key: 'starter', label: 'Starter Organization', context: supplierContexts.starter },
  { key: 'business', label: 'Business Organization', context: supplierContexts.business }
]

// The host application decides which supplier flows are available.
export const supplierProducts: readonly DemoProduct[] = [
  {
    key: 'sole-trader',
    label: 'Sole trader supplier',
    dto: SoleTraderSupplier,
    isAllowed: (context) => context.id === supplierContexts.demo.id
      || context.id === supplierContexts.starter.id
      || context.id === supplierContexts.business.id
  },
  {
    key: 'corporate',
    label: 'Corporate supplier',
    dto: CorporateSupplier,
    isAllowed: (context) => context.id === supplierContexts.demo.id || context.id === supplierContexts.business.id
  }
]
