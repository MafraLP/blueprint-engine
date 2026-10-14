import { Field, Nested } from '../../../src/index.js'

export class BusinessAddress {
  @Field({ component: 'text', label: 'Street address', required: true })
  declare street: string

  @Field({ component: 'text', label: 'City', required: true })
  declare city: string

  @Field({ component: 'select', label: 'Country', required: true, options: ['Brazil', 'United States', 'Portugal'] })
  declare country: string
}

export class SoleTraderSupplier {
  @Field({ component: 'text', label: 'Legal name', required: true })
  declare legalName: string

  @Field({ component: 'text', label: 'Personal tax identifier', required: true })
  declare personalTaxId: string

  @Field({ component: 'upload', label: 'Trade license URL', required: true })
  declare tradeLicenseUrl: string

  @Nested({ dto: BusinessAddress, label: 'Business address', required: true })
  declare address: BusinessAddress
}

export class CorporateSupplier {
  @Field({ component: 'text', label: 'Registered company name', required: true })
  declare registeredName: string

  @Field({ component: 'text', label: 'Company registration number', required: true })
  declare registrationNumber: string

  @Field({ component: 'number', label: 'Employee count', required: true, min: 1 })
  declare employeeCount: number

  @Field({ component: 'boolean', label: 'Confirm authorized representative' })
  declare confirmedRepresentative?: boolean

  @Nested({ dto: BusinessAddress, label: 'Headquarters address', required: true })
  declare address: BusinessAddress
}
