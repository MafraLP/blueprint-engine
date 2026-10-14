# Blueprint Gallery

The Gallery is the primary demonstration of the front-end value proposition: one schema renderer serves multiple unrelated backend domains without domain-specific form components.

```bash
npm install
npm run example:gallery
```

Open [http://localhost:3004](http://localhost:3004). Switch the **Domain**, **Demo profile**, and **Product** selectors. The form, generated schema panel, and server result all update through the same front-end engine.

The Gallery currently contains Cake Shop and Supplier Onboarding. Add a domain by supplying a `DemoDefinition` with its own catalog, profiles, and DTOs to `createDemoServer`; the renderer itself does not change.

The profile selector is intentionally dummy and exists only to demonstrate a host-owned context policy. It is not authentication or authorization.
