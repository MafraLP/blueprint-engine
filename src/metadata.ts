import type { Constructor, Definition, FieldDefinition, FieldOptions, NestedDefinition, NestedOptions } from './types.js'

const definitionsByPrototype = new WeakMap<object, Definition[]>()

function ownDefinitions(target: object): Definition[] {
  const definitions = definitionsByPrototype.get(target)
  if (definitions) return definitions

  const created: Definition[] = []
  definitionsByPrototype.set(target, created)
  return created
}

function propertyName(key: string | symbol): string {
  if (typeof key !== 'string') {
    throw new TypeError('Blueprint properties must use string keys.')
  }

  return key
}

export function Field(options: FieldOptions): PropertyDecorator {
  return (target, key) => {
    ownDefinitions(target).push({ ...options, key: propertyName(key), kind: 'field' })
  }
}

export function Nested(options: NestedOptions): PropertyDecorator {
  return (target, key) => {
    ownDefinitions(target).push({ ...options, key: propertyName(key), kind: 'nested' })
  }
}

export function definitionsFor(dto: Constructor): Definition[] {
  const prototypes: object[] = []
  let prototype: object | null = dto.prototype

  while (prototype && prototype !== Object.prototype) {
    prototypes.push(prototype)
    prototype = Object.getPrototypeOf(prototype) as object | null
  }

  const definitions = new Map<string, Definition>()
  for (const current of prototypes.reverse()) {
    for (const definition of definitionsByPrototype.get(current) ?? []) {
      definitions.set(definition.key, definition)
    }
  }

  return [...definitions.values()]
}

export type { FieldDefinition, NestedDefinition }
