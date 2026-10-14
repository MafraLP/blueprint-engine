import { Field, Nested } from '../../../src/index.js'

export class ToppingConfiguration {
  @Field({
    component: 'select',
    label: 'Topping flavour',
    required: true,
    options: ['vanilla', 'chocolate', 'strawberry']
  })
  declare flavour: string

  @Field({
    component: 'select',
    label: 'Topping colour',
    required: true,
    options: ['white', 'pink', 'blue', 'gold']
  })
  declare colour: string

  @Field({
    component: 'upload',
    label: 'Topper image URL'
  })
  declare topperImageUrl?: string
}

export class BirthdayCake {
  @Field({ component: 'text', label: 'Cake message', required: true })
  declare message: string

  @Field({ component: 'number', label: 'Tiers', required: true, min: 1, max: 6 })
  declare tiers: number

  @Field({ component: 'boolean', label: 'Include candles?' })
  declare includeCandles?: boolean

  @Nested({ dto: ToppingConfiguration, label: 'Topping configuration', required: true })
  declare topping: ToppingConfiguration
}

export class NakedCake {
  @Field({
    component: 'select',
    label: 'Fruit on top',
    required: true,
    options: ['strawberry', 'blueberry', 'fig', 'mixed berries']
  })
  declare fruit: string

  @Field({ component: 'number', label: 'Tiers', required: true, min: 1, max: 4 })
  declare tiers: number

  @Field({ component: 'text', label: 'Allergy notes' })
  declare allergyNotes?: string
}
