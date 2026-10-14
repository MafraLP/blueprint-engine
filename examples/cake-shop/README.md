# Cake Shop Demo

This is a deliberately small host application. It owns its product catalog and HTTP routes; Blueprint Engine only declares fields, generates schemas, and validates submitted data.

Run it from the repository root:

```bash
npm install
npm run example
```

Open [http://localhost:3000](http://localhost:3000). Switch between Birthday Cake and Naked Cake to see the server publish a different blueprint schema. Submit an empty required field or zero tiers to see that the server returns validation errors even when the browser is manipulated.

`upload` is represented as a URL in this demo. File storage, authorization, and persistence are application concerns and intentionally do not belong to the core package.
