import { definitionsFor } from './metadata.js'
import type { BlueprintSchema, Constructor, SchemaProperty } from './types.js'

export function schemaFor(dto: Constructor): BlueprintSchema {
  const properties: Record<string, SchemaProperty> = {}
  const required: string[] = []

  for (const definition of definitionsFor(dto)) {
    if (definition.required) required.push(definition.key)

    if (definition.kind === 'nested') {
      const nestedSchema = schemaFor(definition.dto)
      properties[definition.key] = {
        type: 'object',
        title: definition.label,
        properties: nestedSchema.properties,
        required: nestedSchema.required
      }
      continue
    }

    properties[definition.key] = {
      type: definition.component,
      title: definition.label,
      ...(definition.min === undefined ? {} : { minimum: definition.min }),
      ...(definition.max === undefined ? {} : { maximum: definition.max }),
      ...(definition.options === undefined ? {} : { enum: [...definition.options] })
    }
  }

  return { schemaVersion: 1, type: 'object', properties, required }
}
