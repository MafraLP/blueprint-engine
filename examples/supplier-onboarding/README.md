# Supplier Onboarding Demo

This second domain proves that Blueprint Engine is not a Cake Shop-specific form generator. It uses the same `@Field`, `@Nested`, `schemaFor`, and `parse` API as the Cake Shop, plus the same generic schema renderer.

Run it from the repository root:

```bash
npm install
npm run example:supplier
```

Open [http://localhost:3002](http://localhost:3002). The host application owns the catalog for sole-trader and corporate supplier flows. Both reuse the `BusinessAddress` nested DTO, while each product declares its own fields and constraints.
