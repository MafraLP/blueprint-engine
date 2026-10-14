import { definitionsFor } from './metadata.js'
import type { BlueprintSchema, Constructor } from './types.js'

export function schemaFor(dto: Constructor): BlueprintSchema {
  const properties: Record<string, unknown> = {}
  const required: string[] = []

  for (const definition of definitionsFor(dto)) {
    if (definition.required) required.push(definition.key)

    if (definition.kind === 'nested') {
      properties[definition.key] = {
        type: 'object',
        title: definition.label,
        properties: schemaFor(definition.dto).properties,
        required: schemaFor(definition.dto).required
      }
      continue
    }

    properties[definition.key] = {
      type: definition.component,
      title: definition.label,
      ...(definition.min === undefined ? {} : { minimum: definition.min }),
      ...(definition.max === undefined ? {} : { maximum: definition.max }),
      ...(definition.options === undefined ? {} : { enum: definition.options })
    }
  }

  return { type: 'object', properties, required }
}
