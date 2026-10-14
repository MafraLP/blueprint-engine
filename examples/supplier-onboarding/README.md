# Supplier Onboarding Demo

This second domain proves that Blueprint Engine is not a Cake Shop-specific form generator. It uses the same `@Field`, `@Nested`, `schemaFor`, and `parse` API as the Cake Shop, plus the same generic schema renderer.

Run it from the repository root:

```bash
npm install
npm run example:supplier
```

Open [http://localhost:3002](http://localhost:3002). The host application owns the catalog for sole-trader and corporate supplier flows. Both reuse the `BusinessAddress` nested DTO, while each product declares its own fields and constraints.

The running demo uses a hardcoded server-side `supplier-demo` context that may access both flows. Tests also start the server with a `starter-organization` context to prove that it cannot read or submit the corporate flow. A real application must replace that fixed context with its authenticated host context.
