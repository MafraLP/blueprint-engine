import type { DemoContext, DemoProduct } from '../../shared/api/create-demo-server.js'
import { CorporateSupplier, SoleTraderSupplier } from './blueprints.js'

export const supplierContexts = {
  demo: { id: 'supplier-demo' },
  starter: { id: 'starter-organization' },
  business: { id: 'business-organization' }
} as const satisfies Record<string, DemoContext>

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
