const form = document.querySelector('#form')
const productPicker = document.querySelector('#product')
const result = document.querySelector('#result')

let activeProduct
let activeSchema

function fieldPath(prefix, key) {
  return prefix ? `${prefix}.${key}` : key
}

function errorNode(path) {
  const node = document.createElement('p')
  node.className = 'error'
  node.dataset.errorPath = path
  return node
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

    let control
    if (schema.type === 'select') {
      control = document.createElement('select')
      control.append(new Option('Select an option', ''))
      for (const option of schema.enum) control.append(new Option(option, option))
    } else {
      control = document.createElement('input')
      control.type = schema.type === 'number' ? 'number' : schema.type === 'boolean' ? 'checkbox' : schema.type === 'upload' ? 'url' : 'text'
      if (schema.type === 'upload') control.placeholder = 'https://example.com/topper.png'
      if (schema.minimum !== undefined) control.min = String(schema.minimum)
      if (schema.maximum !== undefined) control.max = String(schema.maximum)
    }

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
  submit.textContent = `Create ${activeProduct.label}`
  form.append(submit)
  result.textContent = ''
}

async function loadProduct(key) {
  const response = await fetch(`/api/products/${key}/schema`)
  const payload = await response.json()
  activeProduct = payload.product
  activeSchema = payload.schema
  renderForm()
}

async function initialize() {
  const response = await fetch('/api/products')
  const { products } = await response.json()
  for (const product of products) productPicker.append(new Option(product.label, product.key))
  await loadProduct(productPicker.value)
}

productPicker.addEventListener('change', () => loadProduct(productPicker.value))

form.addEventListener('submit', async (event) => {
  event.preventDefault()
  clearErrors()
  result.textContent = 'Submitting…'

  const response = await fetch(`/api/products/${activeProduct.key}/submit`, {
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
