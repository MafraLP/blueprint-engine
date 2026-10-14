# Blueprint Engine

Declarative TypeScript blueprints for server-defined forms and validated commands.

Blueprint Engine helps applications support different product or tenant flows without spreading customer-specific branches across controllers, pages, and persistence code. Declare a DTO once, generate a schema for the client, and validate the submitted input on the server.

## Status

Experimental. The public API is intentionally small and may change before `1.0`.

## Example

```ts
import { Field, Nested, parse, schemaFor } from '@blueprint-engine/core'

class Topping {
  @Field({ component: 'text', label: 'Topping', required: true })
  declare name: string
}

class BirthdayCake {
  @Field({ component: 'text', label: 'Cake message', required: true })
  declare message: string

  @Field({ component: 'number', label: 'Tiers', required: true, min: 1 })
  declare tiers: number

  @Nested({ dto: Topping, label: 'Topping configuration', required: true })
  declare topping: Topping
}

const schema = schemaFor(BirthdayCake)
const result = parse(BirthdayCake, request.body)

if (!result.success) return result.errors
// result.value is a hydrated BirthdayCake command.
```

## What it does

- Declares fields and nested contracts with decorators.
- Produces deterministic, JSON-friendly schemas.
- Validates and hydrates submitted input on the server.
- Keeps product/tenant policy outside the shared engine.

## What it does not do

- Render a UI, persist data, authorize tenants, or execute domain actions.
- Replace a complete JSON Schema implementation.
- Eliminate conditionals; it keeps variable rules close to the blueprint that owns them.

## Development

```bash
npm install
npm test
```

## Runnable demo

The Cake Shop example renders two server-defined product forms and validates submissions with the same DTOs:

```bash
npm install
npm run example
```

Open [http://localhost:3000](http://localhost:3000). See [the example guide](examples/cake-shop/README.md) for its boundaries.

The same renderer also supports the [Supplier Onboarding example](examples/supplier-onboarding/README.md):

```bash
npm run example:supplier
```

Open [http://localhost:3002](http://localhost:3002).

## Authentication and authorization

Blueprint Engine is intentionally authentication- and authorization-agnostic. Its job is to turn backend DTO declarations into schemas and to validate the submitted values against those declarations. The demo profile selector is only a visual way to show how a host application can expose different blueprints; it is not authentication.

In a real application, authenticate the request in your own stack, resolve the tenant, user, plan, or product entitlement there, and only then choose the DTO passed to `schemaFor()` and `parse()`.

See [Development Context](docs/development-context.md) for the concept and boundaries, the [Schema Specification](docs/schema-specification.md) for the public wire contract, [Domain Comparison](docs/domain-comparison.md) for validation across two domains, [Demo Profile Design](docs/context-policy.md) for the M4 demonstration boundary, and the [Implementation Roadmap](docs/implementation-roadmap.md) for the path from the experimental core to a mature open-source package.

## License

[MIT](LICENSE)
