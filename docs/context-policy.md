# Demo Profiles and Application Policy

## Purpose

Blueprint Engine is about one relationship: backend DTO declarations produce a front-end schema, and the same declarations validate submitted input on the backend.

Authentication and authorization are outside that relationship. The package does not authenticate users, store tenants, decide entitlements, or expose a policy API.

## Demo Profiles

The examples include a **Demo profile** selector so visitors can see that the same renderer receives different blueprint catalogs:

| Demo | Profile | Visible blueprints |
|---|---|---|
| Cake Shop | All Cake Products | Birthday Cake, Naked Cake |
| Cake Shop | Nanda — Birthday Cakes | Birthday Cake |
| Cake Shop | Thiago — Naked Cakes | Naked Cake |
| Supplier Onboarding | All Supplier Flows | Sole trader, Corporate supplier |
| Supplier Onboarding | Starter Organization | Sole trader |
| Supplier Onboarding | Business Organization | Sole trader, Corporate supplier |

The selected profile is a `?profile=` query parameter. It is deliberately visible and mutable because it is a teaching control, not an identity claim. Its only purpose is to demonstrate that a host application may choose which DTOs it passes to `schemaFor()` and `parse()`.

## Production Boundary

In production, the host application owns authentication and policy. It should authenticate the request with its own session, JWT, API key, middleware, or infrastructure, then resolve the applicable DTO before calling Blueprint Engine.

```text
host authentication and policy
  -> authorized DTO constructor
  -> schemaFor(Dto)
  -> parse(Dto, submittedInput)
```

The core package never receives a user, tenant, role, token, database connection, or entitlement. It only receives a DTO constructor and input to validate.

```ts
const context = await hostAuthentication(request)
const dto = hostCatalog.resolve(context, request.params.productKey)

if (!dto) return response.status(404).json({ message: 'Product is unavailable.' })

return schemaFor(dto)
```

## What This Demonstration Proves

- A host catalog can map an external context to one or more DTOs.
- The generic front-end renderer does not need to know the domain or the policy.
- The backend still validates submitted data using the selected DTO.
- Adding a product flow remains a DTO and host-catalog change, not a core-package change.

## What It Does Not Prove

- The query parameter is not authentication or authorization.
- It does not protect a real tenant or hide a real product.
- It does not implement JWT, sessions, OAuth, RBAC, billing, or tenant storage.
- It does not make a tenant a DDD bounded context.

Use the selector to understand the blueprint flow. Replace it with your own authenticated host context in a real application.
