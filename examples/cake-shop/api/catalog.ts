import type { DemoProduct } from '../../shared/api/create-demo-server.js'
import { BirthdayCake, NakedCake } from './blueprints.js'

// This is application policy, not Blueprint Engine configuration.
export const cakeProducts: readonly DemoProduct[] = [
  { key: 'birthday-cake', label: 'Birthday Cake', dto: BirthdayCake },
  { key: 'naked-cake', label: 'Naked Cake', dto: NakedCake }
]
