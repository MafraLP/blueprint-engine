# Development Context

## Problem

Many B2B and multi-tenant applications begin with one customer-specific flow. A second customer introduces a different set of fields, validation rules, nesting, or permitted products. Copying pages, seeders, and `if (tenant === ...)` branches makes every new customer modify shared application code.

Blueprint Engine isolates that variability. A blueprint declares the input contract for one product or flow. The engine derives a transport-friendly schema from the declaration and validates incoming data against the same declaration.

## Core Concepts

- **Blueprint DTO**: a TypeScript class that declares the input required by a flow.
- **Field**: a primitive input with rendering hints and intrinsic validation.
- **Nested DTO**: a reusable child contract composed into another blueprint.
- **Schema**: a serializable description generated from a DTO for a front-end renderer.
- **Command**: an instantiated, validated DTO returned by `parse`.
- **Context policy**: application-owned logic that decides which blueprint a tenant, product, or actor may use. It is intentionally outside the core package.

The engine is not a page builder, ORM, authorization system, or business-rule engine. It owns declaration metadata, schema generation, and input validation only.

## Design Rules

1. The server remains authoritative: front-end schemas are rendering instructions, never trusted validation.
2. A DTO is the single source of truth for its input shape.
3. The core has no dependency on a database, HTTP framework, or UI framework.
4. Tenant selection is not baked into decorators. Applications resolve an allowed blueprint before calling `schemaFor` or `parse`.
5. Conditional display and cross-field business rules remain a future extension until a real use case proves a minimal API.

## Development Workflow

```bash
npm install
npm test
```

Add behavior through a failing contract test first. Public schemas are API contracts: changing their keys or meaning is a breaking change. Keep examples domain-neutral and do not import application entities, tenant data, or proprietary services into this repository.

## Initial Scope

The first release supports primitive fields, required values, number bounds, select options, nested DTOs, deterministic schemas, and server-side hydration/validation. It deliberately omits catalogs, action services, conditional visibility, persistence, and front-end components.

## Future Validation

Before expanding the API, validate the core against at least two unrelated product flows. Add a feature only when both flows need the same abstraction. The expected next candidates are context-aware blueprint catalogs and declarative conditions; neither belongs in the initial public contract yet.
