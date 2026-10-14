export type Constructor<T extends object = object> = new () => T

export type FieldComponent = 'text' | 'number' | 'boolean' | 'select' | 'upload'

export interface FieldOptions {
  component: FieldComponent
  label: string
  required?: boolean
  min?: number
  max?: number
  options?: readonly string[]
}

export interface NestedOptions {
  dto: Constructor
  label: string
  required?: boolean
}

export interface FieldDefinition extends FieldOptions {
  key: string
  kind: 'field'
}

export interface NestedDefinition extends NestedOptions {
  key: string
  kind: 'nested'
}

export type Definition = FieldDefinition | NestedDefinition

export interface ValidationError {
  path: string
  message: string
}

export type ParseResult<T> =
  | { success: true; value: T }
  | { success: false; errors: ValidationError[] }

export interface BlueprintSchema {
  type: 'object'
  properties: Record<string, unknown>
  required: string[]
}
