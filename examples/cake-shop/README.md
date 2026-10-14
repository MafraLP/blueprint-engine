# Cake Shop Demo

This is a deliberately small host application. It owns its product catalog and HTTP routes; Blueprint Engine only declares fields, generates schemas, and validates submitted data.

Run it from the repository root:

```bash
npm install
npm run example
```

Open [http://localhost:3000](http://localhost:3000). Switch between Birthday Cake and Naked Cake to see the server publish a different blueprint schema. Submit an empty required field or zero tiers to see that the server returns validation errors even when the browser is manipulated.

`upload` is represented as a URL in this demo. File storage, authorization, and persistence are application concerns and intentionally do not belong to the core package.

Use the **Demo profile** selector to switch between all products, Nanda's Birthday Cake, and Thiago's Naked Cake. This selector is intentionally dummy and is not authentication. A real application must resolve its own authenticated context before selecting a blueprint.
