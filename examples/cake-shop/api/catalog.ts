import type { Constructor } from '../../../src/index.js'
import { BirthdayCake, NakedCake } from './blueprints.js'

export interface CakeProduct {
  key: string
  label: string
  dto: Constructor
}

// This is application policy, not Blueprint Engine configuration.
const products: readonly CakeProduct[] = [
  { key: 'birthday-cake', label: 'Birthday Cake', dto: BirthdayCake },
  { key: 'naked-cake', label: 'Naked Cake', dto: NakedCake }
]

export function availableProducts(): readonly Pick<CakeProduct, 'key' | 'label'>[] {
  return products.map(({ key, label }) => ({ key, label }))
}

export function resolveProduct(key: string): CakeProduct | undefined {
  return products.find((product) => product.key === key)
}
