# Domain Comparison

Blueprint Engine has two independently modeled examples:

| Concern | Cake Shop | Supplier Onboarding | Shared engine behavior |
|---|---|---|---|
| Product variants | Birthday Cake, Naked Cake | Sole trader, Corporate supplier | A host catalog selects a DTO |
| Nested contract | Topping configuration | Business address | `@Nested` generates a nested schema and validates nested input |
| Product-specific constraint | Cake tier bounds and topping choices | Employee count minimum and required trade license | `@Field` declarations remain with the product DTO |
| Client | Generic schema renderer | The same generic schema renderer | `/api/products`, schema, and submit endpoints |
| Server validation | `parse(BirthdayCake | NakedCake, input)` | `parse(SoleTraderSupplier | CorporateSupplier, input)` | Same parser and error contract |

## Adding a Product Flow

The host application adds a DTO and a catalog entry. The core package and generic renderer do not change.

```text
examples/<domain>/api/blueprints.ts  -> declare product fields and nested DTOs
examples/<domain>/api/catalog.ts     -> expose the product to that host application
src/                                 -> unchanged
examples/shared/web/                 -> unchanged
```

For comparison, a hard-coded flow usually changes a server route, server validation, a client form, client validation, field visibility logic, and shared tenant/product branches. This repository does not claim those changes disappear; it demonstrates that the input contract and its validation are localized to the product DTO.

## Evidence Collected

- Both domains compile against the same public core API.
- Both servers expose the same schema and submission protocol.
- Both servers serve the same renderer assets.
- Both domains have an end-to-end test that proves server-side validation remains authoritative.
- No code under `src/` changed to add Supplier Onboarding.
