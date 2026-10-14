# Context and Policy Design

## Purpose

Blueprint Engine defines an input contract. It does not decide who may use that contract. The host application must resolve trusted request context and authorize a blueprint before it calls either `schemaFor` or `parse`.

This document is the implementation boundary for M4. It deliberately does not add authentication, roles, tenant storage, billing, or authorization code to the core package.

## Trust Boundary

The product key is a client request. A tenant identifier, organization identifier, user role, or subscription plan is not trustworthy merely because the client sends it in a URL, request body, or arbitrary header.

The host application must derive context from an already-validated source, such as:

- A verified session or JWT handled by host middleware.
- A validated API key mapped to an organization.
- A trusted subdomain resolved by infrastructure or host middleware.
- A server-to-server identity established before the request reaches the blueprint route.

The core package receives only a DTO constructor that the host has already authorized.

```text
HTTP request
  -> host authentication
  -> trusted context
  -> host catalog policy
  -> authorized DTO constructor
  -> schemaFor() or parse()
```

## Minimal Host Contract

The host can keep policy entirely in application code. No Blueprint Engine interface is required yet.

```ts
type RequestContext = {
  organizationId: string
  plan: 'starter' | 'business'
}

type ProductPolicy = {
  key: string
  dto: Constructor
  isAllowed(context: RequestContext): boolean
}

function resolveBlueprint(
  context: RequestContext,
  productKey: string,
  products: readonly ProductPolicy[]
): ProductPolicy | undefined {
  return products.find((product) => product.key === productKey && product.isAllowed(context))
}
```

The route resolves context once, then uses the same authorized product for both read and write paths:

```ts
const context = await authenticateAndResolveContext(request)
const product = resolveBlueprint(context, request.params.productKey, products)

if (!product) return response.status(404).json({ message: 'Product is unavailable.' })

if (request.method === 'GET') return response.json(schemaFor(product.dto))

const result = parse(product.dto, request.body)
```

Returning `404` is a conservative default because it does not reveal whether a product exists for another tenant. A host may return `403` when revealing that distinction is useful and safe for its API.

## Example Policies

These policies are illustrative only. They are application configuration, not library configuration.

| Trusted context | Allowed product keys | Denied product keys |
|---|---|---|
| Cake Shop tenant `nanda` | `birthday-cake` | `naked-cake` |
| Cake Shop tenant `thiago` | `naked-cake` | `birthday-cake` |
| Supplier organization on `starter` | `sole-trader` | `corporate` |
| Supplier organization on `business` | `sole-trader`, `corporate` | None |

The policy may be a static list, a database query, a feature flag, or an entitlement service. The engine does not care, as long as the host supplies an authorized DTO constructor.

## Required M4 Changes

1. Change the shared demo server to accept a host-provided context resolver and product resolver.
2. Keep the current public product list only for a deliberate, authorized context; never list every catalog entry by default.
3. Update Cake Shop and Supplier Onboarding to model two trusted contexts each.
4. Resolve policy before serving a schema and before parsing a submission.
5. Add end-to-end tests for an allowed schema, denied schema, allowed submission, and denied submission.
6. Ensure denied requests cannot reveal the schema or validation behavior of the unavailable DTO.
7. Add a short security note to each example README explaining where real authentication belongs.

## Acceptance Tests

M4 is complete only when these tests exist for both example domains:

| Scenario | Expected result |
|---|---|
| Authorized context requests an allowed schema | `200` with that schema |
| Authorized context submits valid input to an allowed product | `201` |
| Authorized context requests another context's schema | `404` or documented `403` |
| Authorized context submits to another context's product | `404` or documented `403` |
| Client changes only the product key | Policy is still enforced |
| Client sends a tenant value in the body or arbitrary header | It has no effect on authorization |

## DDD Terminology

A tenant is an access, ownership, or configuration boundary. It is not automatically a DDD bounded context. A bounded context exists where the model and ubiquitous language have a distinct meaning. M4 protects product availability by context; it does not claim to discover or define bounded contexts.

## Non-Goals

- Implementing JWT verification, sessions, OAuth, RBAC, or API-key management.
- Storing tenants or policies in the core package.
- Adding a `Tenant` decorator or global registry to Blueprint Engine.
- Treating a user-controlled request header as proof of identity.
- Adding a database just for the examples.

## Decision Rule for a Future Helper

Keep this as documentation and application code until both example applications duplicate the same safe resolver shape. If they do, a small optional helper may be considered outside the core package. It must accept an already-trusted context and must not perform authentication itself.
