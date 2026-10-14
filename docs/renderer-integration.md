# Renderer Integration

Blueprint Engine does not ship a front-end renderer. Its output is a stable, JSON-friendly schema that your application turns into UI using its own framework, components, design tokens, and CSS.

This is intentional: a team can render the same contract in React, Vue, Angular, a server-rendered page, a native mobile application, or a small vanilla JavaScript form without pulling a UI framework into the core package.

## 1. Declare a field in the backend

Each DTO property becomes a field in the generated schema. Use the supplied component constants for autocomplete and typo safety; string values remain valid.

```ts
import { Field, FieldComponent, Nested, schemaFor } from '@blueprint-engine/core'

class ContactDetails {
  @Field({ component: FieldComponent.Text, label: 'Contact name', required: true })
  declare name: string
}

class ServiceRequest {
  @Field({ component: FieldComponent.Select, label: 'Priority', required: true, options: ['low', 'normal', 'high'] })
  declare priority: string

  @Nested({ dto: ContactDetails, label: 'Contact details', required: true })
  declare contact: ContactDetails
}

const schema = schemaFor(ServiceRequest)
```

The schema is the backend-to-client contract. When input returns to the server, validate it with the same DTO:

```ts
const result = parse(ServiceRequest, request.body)
if (!result.success) return result.errors
```

## 2. Render the schema in the front-end

A renderer maps the schema's `type` to an application-owned UI component. The core supports `text`, `number`, `boolean`, `select`, `upload`, and nested `object` schemas.

The smallest renderer can be a switch statement:

```ts
function renderField(field: { type: string; title: string; enum?: readonly string[] }) {
  switch (field.type) {
    case 'text': return TextInput({ label: field.title })
    case 'number': return NumberInput({ label: field.title })
    case 'boolean': return Checkbox({ label: field.title })
    case 'select': return Select({ label: field.title, options: field.enum ?? [] })
    case 'upload': return UploadReferenceInput({ label: field.title })
    default: throw new Error(`Unsupported Blueprint component: ${field.type}`)
  }
}
```

For a production application, a renderer map is often easier to extend and test:

```ts
const renderers = {
  text: TextInput,
  number: NumberInput,
  boolean: Checkbox,
  select: Select,
  upload: UploadReferenceInput
} as const
```

Nested schemas have `type: 'object'`, a `properties` object, and their own `required` array. Render them recursively as a fieldset, card, accordion, or any other application-owned layout.

## 3. Own the styling

The schema describes semantics and validation hints; it does not prescribe visual design. Add stable classes or data attributes in your renderer, then apply your own CSS, utility classes, design system components, dark mode, accessibility styles, and responsive layout.

```html
<div class="blueprint-field blueprint-field--select" data-field="priority">
  <!-- application-owned Select component -->
</div>
```

```css
.blueprint-field {
  display: grid;
  gap: 0.5rem;
}

.blueprint-field--select select {
  border-radius: 0.5rem;
  border: 1px solid var(--color-border);
}
```

The [shared demo renderer](../examples/shared/web/app.js) is a small framework-free reference implementation. It is deliberately not a package dependency or a prescribed design system.

## New DTO fields versus new component types

These are different operations:

- **New field in your product:** supported now. Add another `@Field` or `@Nested` property to your DTO, select one of the supported components, and update only your renderer if its layout needs to change.
- **New component type** such as `currency`, `date-range`, or `address-autocomplete`: not yet part of the public extension API. It needs a contract definition, server-side validation behavior, schema documentation, renderer support, and tests. Do not cast arbitrary strings to bypass the component union.

Until two independent domains need the same custom component, keep the behavior in the host application or model it with the existing components. If a reusable new type is needed, open an issue with its schema shape, validation rules, renderer behavior, and examples from two domains.
