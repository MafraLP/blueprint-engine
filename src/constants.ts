/** Components supported by the Blueprint Schema contract. */
export const FieldComponent = {
  Text: 'text',
  Number: 'number',
  Boolean: 'boolean',
  Select: 'select',
  Upload: 'upload'
} as const

export type FieldComponent = typeof FieldComponent[keyof typeof FieldComponent]

/** Current version of the JSON-friendly Blueprint Schema wire contract. */
export const SCHEMA_VERSION = 1
