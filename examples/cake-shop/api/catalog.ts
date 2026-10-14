import type { DemoContext, DemoProduct, DemoProfile } from '../../shared/api/create-demo-server.js'
import { BirthdayCake, NakedCake } from './blueprints.js'

export const cakeContexts = {
  demo: { id: 'cake-demo' },
  nanda: { id: 'nanda' },
  thiago: { id: 'thiago' }
} as const satisfies Record<string, DemoContext>

export const cakeDemoProfiles: readonly DemoProfile[] = [
  { key: 'all-cakes', label: 'All Cake Products', context: cakeContexts.demo },
  { key: 'nanda', label: 'Nanda — Birthday Cakes', context: cakeContexts.nanda },
  { key: 'thiago', label: 'Thiago — Naked Cakes', context: cakeContexts.thiago }
]

// This is application policy, not Blueprint Engine configuration.
export const cakeProducts: readonly DemoProduct[] = [
  {
    key: 'birthday-cake',
    label: 'Birthday Cake',
    dto: BirthdayCake,
    isAllowed: (context) => context.id === cakeContexts.demo.id || context.id === cakeContexts.nanda.id
  },
  {
    key: 'naked-cake',
    label: 'Naked Cake',
    dto: NakedCake,
    isAllowed: (context) => context.id === cakeContexts.demo.id || context.id === cakeContexts.thiago.id
  }
]
