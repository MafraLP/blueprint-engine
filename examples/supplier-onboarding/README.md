# Supplier Onboarding Demo

This second domain proves that Blueprint Engine is not a Cake Shop-specific form generator. It uses the same `@Field`, `@Nested`, `schemaFor`, and `parse` API as the Cake Shop, plus the same generic schema renderer.

Run it from the repository root:

```bash
npm install
npm run example:supplier
```

Open [http://localhost:3002](http://localhost:3002). The host application owns the catalog for sole-trader and corporate supplier flows. Both reuse the `BusinessAddress` nested DTO, while each product declares its own fields and constraints.

Use the **Demo profile** selector to switch between all flows, a Starter Organization, and a Business Organization. This selector is intentionally dummy and is not authentication. A real application must resolve its own authenticated context before selecting a blueprint.
