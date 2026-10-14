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

export interface FieldSchema {
  type: FieldComponent
  title: string
  minimum?: number
  maximum?: number
  enum?: readonly string[]
}

export interface NestedSchema {
  type: 'object'
  title: string
  properties: Record<string, SchemaProperty>
  required: string[]
}

export type SchemaProperty = FieldSchema | NestedSchema

export interface BlueprintSchema {
  schemaVersion: 1
  type: 'object'
  properties: Record<string, SchemaProperty>
  required: string[]
}
