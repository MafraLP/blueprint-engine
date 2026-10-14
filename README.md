# Blueprint Engine

[![CI](https://github.com/MafraLP/blueprint-engine/actions/workflows/ci.yml/badge.svg)](https://github.com/MafraLP/blueprint-engine/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@blueprint-engine/core.svg)](https://www.npmjs.com/package/@blueprint-engine/core)
[![license](https://img.shields.io/npm/l/@blueprint-engine/core.svg)](LICENSE)

Declarative TypeScript blueprints for server-defined forms and validated commands.

Blueprint Engine helps B2B and multi-tenant applications add configurable product flows without spreading customer-specific `if` statements across controllers, pages, and persistence code. Define the input contract once in the backend; publish a JSON-friendly schema to the client; validate the submitted payload against that same contract.

```text
Blueprint DTO -> schemaFor() -> client renderer
Client input  -> parse()     -> validated command
```

## Why Blueprint Engine?

The first customer usually fits a hard-coded form. The second customer often needs a different field, constraint, or nested configuration. Copying pages and branching shared services makes each new product flow more expensive.

Blueprint Engine keeps that variability close to the product contract. A host application owns catalog and access policy; the engine owns declaration metadata, schema generation, and server-side input validation.

## Install

```bash
npm install @blueprint-engine/core
```

Requirements: Node.js 18 or newer and TypeScript with decorators enabled.

## Quick start

```ts
import {
  Field,
  FieldComponent,
  Nested,
  parse,
  schemaFor
} from '@blueprint-engine/core'

class Topping {
  @Field({ component: FieldComponent.Text, label: 'Topping', required: true })
  declare name: string
}

class BirthdayCake {
  @Field({ component: FieldComponent.Text, label: 'Cake message', required: true })
  declare message: string

  @Field({ component: FieldComponent.Number, label: 'Tiers', required: true, min: 1 })
  declare tiers: number

  @Nested({ dto: Topping, label: 'Topping configuration', required: true })
  declare topping: Topping
}

const schema = schemaFor(BirthdayCake)
const result = parse(BirthdayCake, request.body)

if (!result.success) return result.errors
// result.value is a hydrated BirthdayCake command.
```

`FieldComponent` is a typed set of the currently supported components: `Text`, `Number`, `Boolean`, `Select`, and `Upload`. String values such as `component: 'text'` remain supported when they are more convenient. `SCHEMA_VERSION` exposes the current public schema contract version.

## What it provides

- `@Field` declares a primitive input, rendering hint, and intrinsic validation.
- `@Nested` composes reusable DTO contracts.
- `schemaFor()` generates a deterministic, JSON-friendly schema for a client renderer.
- `parse()` rejects malformed or unknown input, validates it, and hydrates a DTO instance.
- Structured errors use stable field paths, including nested paths such as `topping.name`.

## Architecture boundary

Blueprint Engine is deliberately small. It is not a UI component library, ORM, authorization system, tenant registry, upload service, generic rules engine, or full JSON Schema implementation.

Your application must authenticate the request, resolve tenant/user/product access, select an allowed DTO, and then call `schemaFor()` or `parse()`. Never trust a blueprint key selected by the client as an authorization decision.

## Bring your own renderer and design system

Blueprint Engine provides the schema; your front-end provides the rendering engine. Map schema component types to your React, Vue, Angular, native, or vanilla JavaScript inputs, then apply your own CSS, design tokens, layout, accessibility behavior, and file-storage flow.

You can freely add product-specific DTO properties using `@Field` and `@Nested`. Creating a new *component type* (for example, `currency` or `date-range`) is different: it requires a public schema and validation contract and is not yet an extension point. See [Renderer integration](docs/renderer-integration.md) for a practical renderer map, recursive nested rendering, custom CSS, and the boundary between a new DTO field and a new engine component.

## Examples

Two runnable examples exercise the same public API and shared renderer:

| Example | Demonstrates | Run |
| --- | --- | --- |
| [Cake Shop](examples/cake-shop/README.md) | Product variants, nested topping configuration, and server validation | `npm run example` |
| [Supplier Onboarding](examples/supplier-onboarding/README.md) | A second domain with nested business details and policy-controlled availability | `npm run example:supplier` |

After starting an example, open the address printed in the terminal. The visible profile selector is a teaching control only; it is not authentication.

## Documentation

- [Schema specification](docs/schema-specification.md): wire contract, validation behavior, and compatibility policy.
- [Development context](docs/development-context.md): problem statement and package boundaries.
- [Context and policy design](docs/context-policy.md): host-controlled blueprint availability.
- [Renderer integration](docs/renderer-integration.md): build and style an application-owned front-end renderer.
- [Domain comparison](docs/domain-comparison.md): evidence across two unrelated domains.
- [Implementation roadmap](docs/implementation-roadmap.md): path from experimental `0.x` to a stable release.

## Project status

`@blueprint-engine/core@0.1.0` is publicly available on npm. The API is experimental until `1.0.0`; breaking changes in `0.x` are documented in the [changelog](CHANGELOG.md).

The core is dependency-free at runtime and tested against Node.js 18 and 20 in CI.

## Contributing

Bug reports, domain examples, and API feedback are welcome. Please read the [contribution guide](CONTRIBUTING.md) and [code of conduct](CODE_OF_CONDUCT.md) before opening an issue or pull request.

## License

[MIT](LICENSE) © Lucas Mafra Pinheiro
