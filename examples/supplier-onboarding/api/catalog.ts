import type { DemoProduct } from '../../shared/api/create-demo-server.js'
import { CorporateSupplier, SoleTraderSupplier } from './blueprints.js'

// The host application decides which supplier flows are available.
export const supplierProducts: readonly DemoProduct[] = [
  { key: 'sole-trader', label: 'Sole trader supplier', dto: SoleTraderSupplier },
  { key: 'corporate', label: 'Corporate supplier', dto: CorporateSupplier }
]
