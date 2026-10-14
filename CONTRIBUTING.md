# Contributing

Thank you for considering a contribution.

## Before Opening an Issue or Pull Request

- Read the [Schema Specification](docs/schema-specification.md) and [Implementation Roadmap](docs/implementation-roadmap.md).
- Keep the core limited to DTO metadata, schema generation, and parsing.
- Keep authentication, persistence, tenant policy, and UI framework code in examples or host applications.
- Propose a core feature only when at least two independent domain examples need the same abstraction.

## Local Development

```bash
npm ci
npm test
```

Run the demonstrations with `npm run example` or `npm run example:supplier`.

## Contract Changes

Schemas and validation errors are public contracts. A pull request that changes an existing schema key, component meaning, validation rule, error path, or error message must:

1. Update the relevant fixtures and tests.
2. Update [Schema Specification](docs/schema-specification.md).
3. Explain whether the change is breaking and include migration guidance when it is.

## Pull Requests

Keep each pull request focused. Include a minimal reproduction for bugs and run `npm test` before opening it.
