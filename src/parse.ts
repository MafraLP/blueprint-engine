import { definitionsFor } from './metadata.js'
import type { Constructor, Definition, ParseResult, ValidationError } from './types.js'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isEmpty(value: unknown): boolean {
  return value === undefined || value === null || value === ''
}

function validateField(definition: Extract<Definition, { kind: 'field' }>, value: unknown, path: string): ValidationError[] {
  if (isEmpty(value)) {
    return definition.required ? [{ path, message: 'is required' }] : []
  }

  const errors: ValidationError[] = []
  if (definition.component === 'number' && typeof value !== 'number') errors.push({ path, message: 'must be a number' })
  if ((definition.component === 'text' || definition.component === 'upload') && typeof value !== 'string') errors.push({ path, message: 'must be a string' })
  if (definition.component === 'boolean' && typeof value !== 'boolean') errors.push({ path, message: 'must be a boolean' })
  if (definition.component === 'select' && (typeof value !== 'string' || !definition.options?.includes(value))) {
    errors.push({ path, message: 'must be one of the configured options' })
  }

  if (typeof value === 'number' && definition.min !== undefined && value < definition.min) errors.push({ path, message: `must be at least ${definition.min}` })
  if (typeof value === 'number' && definition.max !== undefined && value > definition.max) errors.push({ path, message: `must be at most ${definition.max}` })
  return errors
}

function parseInto<T extends object>(dto: Constructor<T>, input: unknown, prefix: string): ParseResult<T> {
  if (!isRecord(input)) return { success: false, errors: [{ path: prefix || '$', message: 'must be an object' }] }

  const value = new dto()
  const errors: ValidationError[] = []
  const definitions = definitionsFor(dto)
  const knownKeys = new Set(definitions.map((definition) => definition.key))
  for (const key of Object.keys(input)) {
    if (!knownKeys.has(key)) {
      errors.push({ path: prefix ? `${prefix}.${key}` : key, message: 'is not allowed' })
    }
  }

  for (const definition of definitions) {
    const fieldPath = prefix ? `${prefix}.${definition.key}` : definition.key
    const rawValue = input[definition.key]

    if (definition.kind === 'nested') {
      if (isEmpty(rawValue)) {
        if (definition.required) errors.push({ path: fieldPath, message: 'is required' })
        continue
      }

      const nested = parseInto(definition.dto, rawValue, fieldPath)
      if (nested.success) Object.assign(value, { [definition.key]: nested.value })
      else errors.push(...nested.errors)
      continue
    }

    errors.push(...validateField(definition, rawValue, fieldPath))
    if (!isEmpty(rawValue)) Object.assign(value, { [definition.key]: rawValue })
  }

  return errors.length ? { success: false, errors } : { success: true, value }
}

export function parse<T extends object>(dto: Constructor<T>, input: unknown): ParseResult<T> {
  return parseInto(dto, input, '')
}
