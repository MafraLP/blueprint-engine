# Blueprint Schema Specification

## Status and Versioning

Blueprint Schema is the JSON-friendly contract returned by `schemaFor`. It is not JSON Schema. Every root document includes `schemaVersion: 1`; consumers must reject or explicitly handle an unsupported version.

The package follows semantic versioning. A patch release may clarify documentation or fix behavior that contradicts this specification. A minor release may add optional fields or components. A major release is required to remove or rename a schema field, change a component's meaning, change an error path or message, or alter validation behavior for an existing valid payload.

## Root Object

```json
{
  "schemaVersion": 1,
  "type": "object",
  "properties": {},
  "required": []
}
```

- `schemaVersion` is the version of this wire contract, not the npm package version.
- `properties` maps DTO property names to field or nested-object schemas.
- `required` contains the direct property names that must be present and non-empty. A nested object's required fields are declared in that nested object.

## Primitive Field Schemas

All primitive fields have `type` and `title`.

| Component | Schema | Accepted value | Extra keys |
|---|---|---|---|
| `text` | `{ "type": "text", "title": "Name" }` | string | None |
| `number` | `{ "type": "number", "title": "Tiers", "minimum": 1, "maximum": 6 }` | number | `minimum`, `maximum` |
| `boolean` | `{ "type": "boolean", "title": "Candles" }` | boolean | None |
| `select` | `{ "type": "select", "title": "Fruit", "enum": ["fig"] }` | one configured string | `enum` |
| `upload` | `{ "type": "upload", "title": "Image URL" }` | string reference or metadata | None |

`upload` does not upload binary files. The host application decides how a file is stored and passes a string reference or metadata value that its own domain accepts.

## Nested Schemas

`@Nested` generates an object property:

```json
{
  "type": "object",
  "title": "Topping configuration",
  "properties": {
    "flavour": { "type": "select", "title": "Flavour", "enum": ["vanilla"] }
  },
  "required": ["flavour"]
}
```

Nested objects do not repeat `schemaVersion`; only the root document carries it.

## Parsing and Errors

`parse(Dto, input)` is server-side validation. A client-side renderer may use this specification for convenience, but must not be treated as authoritative.

On failure, `parse` returns:

```json
{
  "success": false,
  "errors": [{ "path": "topping.flavour", "message": "is required" }]
}
```

Error paths use dot notation. The root has the path `$`. Errors are emitted in deterministic order: unknown keys at the current object, declared fields in declaration order, then nested errors at the position of their parent field.

| Condition | Message |
|---|---|
| Missing required value | `is required` |
| Unknown object key | `is not allowed` |
| Non-object root or nested value | `must be an object` |
| Wrong text/upload value type | `must be a string` |
| Wrong number value type | `must be a number` |
| Wrong boolean value type | `must be a boolean` |
| Invalid select value | `must be one of the configured options` |
| Number below/above bounds | `must be at least N` / `must be at most N` |

## Unknown Input Policy

Unknown keys are rejected at every object level. This prevents submitted data from silently reaching future DTO properties or host application persistence code. Host applications that need to preserve arbitrary user-defined data should declare an explicit field for it rather than relying on pass-through input.

Optional `undefined`, `null`, and empty-string values are treated as unset. The parser does not replace a DTO's existing property value for them; a class field initializer may therefore leave an own property with the value `undefined`. `false` is a valid boolean value and is assigned.

## Decorator Configuration Rules

- Field labels must not be empty.
- `select` fields require at least one option.
- Only `select` fields may define `options`.
- Only `number` fields may define `min` or `max`.
- `min` must not exceed `max`.

Invalid decorator configuration throws while the DTO is declared, before schema generation or input parsing.
