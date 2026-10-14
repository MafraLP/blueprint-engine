const form = document.querySelector('#form')
const demoPicker = document.querySelector('#demo')
const profilePicker = document.querySelector('#demo-profile')
const productPicker = document.querySelector('#product')
const schemaOutput = document.querySelector('#schema')
const result = document.querySelector('#result')

let activeProduct
let activeSchema

function apiUrl(path, profile = profilePicker.value) {
  const query = new URLSearchParams({ demo: demoPicker.value })
  if (profile) query.set('profile', profile)
  return `${path}?${query}`
}

function fieldPath(prefix, key) {
  return prefix ? `${prefix}.${key}` : key
}

function errorNode(path) {
  const node = document.createElement('p')
  node.className = 'error'
  node.dataset.errorPath = path
  return node
}

function input(type, schema) {
  const control = document.createElement('input')
  control.type = type
  if (schema.minimum !== undefined) control.min = String(schema.minimum)
  if (schema.maximum !== undefined) control.max = String(schema.maximum)
  return control
}

const fieldRenderers = {
  text: (schema) => input('text', schema),
  number: (schema) => input('number', schema),
  boolean: (schema) => input('checkbox', schema),
  upload: (schema) => {
    const control = input('url', schema)
    control.placeholder = 'https://example.com/reference.png'
    return control
  },
  select: (schema) => {
    const control = document.createElement('select')
    control.append(new Option('Select an option', ''))
    for (const option of schema.enum ?? []) control.append(new Option(option, option))
    return control
  }
}

function renderProperties(properties, prefix = '', required = []) {
  const fragment = document.createDocumentFragment()

  for (const [key, schema] of Object.entries(properties)) {
    const path = fieldPath(prefix, key)
    if (schema.type === 'object') {
      const fieldset = document.createElement('fieldset')
      const legend = document.createElement('legend')
      legend.textContent = schema.title
      fieldset.append(legend, renderProperties(schema.properties, path, schema.required), errorNode(path))
      fragment.append(fieldset)
      continue
    }

    const wrapper = document.createElement('label')
    wrapper.className = 'field'
    wrapper.append(`${schema.title}`)

    const renderer = fieldRenderers[schema.type]
    if (!renderer) throw new Error(`Unsupported Blueprint component: ${schema.type}`)
    const control = renderer(schema)

    control.name = path
    control.required = required.includes(key)
    wrapper.append(control, errorNode(path))
    fragment.append(wrapper)
  }

  return fragment
}

function readProperties(properties, prefix = '') {
  const value = {}
  for (const [key, schema] of Object.entries(properties)) {
    const path = fieldPath(prefix, key)
    if (schema.type === 'object') {
      value[key] = readProperties(schema.properties, path)
      continue
    }

    const control = form.elements.namedItem(path)
    if (schema.type === 'boolean') value[key] = control.checked
    else if (schema.type === 'number') value[key] = control.value === '' ? '' : Number(control.value)
    else value[key] = control.value
  }
  return value
}

function clearErrors() {
  for (const node of document.querySelectorAll('[data-error-path]')) node.textContent = ''
}

function showErrors(errors) {
  for (const error of errors) {
    const node = [...document.querySelectorAll('[data-error-path]')].find((candidate) => candidate.dataset.errorPath === error.path)
    if (node) node.textContent = error.message
  }
}

function renderForm() {
  form.replaceChildren(renderProperties(activeSchema.properties, '', activeSchema.required))
  const submit = document.createElement('button')
  submit.type = 'submit'
  submit.textContent = `Submit ${activeProduct.label}`
  form.append(submit)
  schemaOutput.textContent = JSON.stringify(activeSchema, null, 2)
  result.textContent = 'Select values and submit to inspect the validated command.'
}

async function loadProduct(key) {
  const response = await fetch(apiUrl(`/api/products/${key}/schema`))
  const payload = await response.json()
  activeProduct = payload.product
  activeSchema = payload.schema
  renderForm()
}

async function loadProducts() {
  const response = await fetch(apiUrl('/api/products'))
  const { products } = await response.json()
  productPicker.replaceChildren()
  for (const product of products) productPicker.append(new Option(product.label, product.key))
  if (productPicker.value) await loadProduct(productPicker.value)
}

async function loadProfiles() {
  profilePicker.replaceChildren()
  const response = await fetch(apiUrl('/api/demo-profiles', ''))
  if (!response.ok) throw new Error('Unable to load demo profiles.')
  const { profiles } = await response.json()
  for (const profile of profiles) profilePicker.append(new Option(profile.label, profile.key))
  await loadProducts()
}

async function initialize() {
  const response = await fetch('/api/demos')
  const { demos } = await response.json()
  for (const demo of demos) demoPicker.append(new Option(demo.label, demo.key))
  demoPicker.closest('label').hidden = demos.length < 2
  await loadProfiles()
}

productPicker.addEventListener('change', () => loadProduct(productPicker.value))
profilePicker.addEventListener('change', loadProducts)
demoPicker.addEventListener('change', loadProfiles)

form.addEventListener('submit', async (event) => {
  event.preventDefault()
  clearErrors()
  result.textContent = 'Submitting…'

  const response = await fetch(apiUrl(`/api/products/${activeProduct.key}/submit`), {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(readProperties(activeSchema.properties))
  })
  const payload = await response.json()

  if (response.status === 422) {
    showErrors(payload.errors)
    result.textContent = 'The server rejected this configuration.'
    return
  }

  result.textContent = JSON.stringify(payload, null, 2)
})

initialize().catch((error) => {
  result.textContent = error instanceof Error ? error.message : 'Unable to load the demo.'
})
