// src/features/products/validation.js

/**
 * Validation rules — aligned with backend `assertStockRules`:
 *
 *   Physical products ALWAYS require a base stock_quantity.
 *     • single        → that's the only stock
 *     • shared        → that's the shared pool
 *     • per_variant   → that's the default configuration's stock
 *                       (each variant also carries its own stock)
 */
export function validateProduct(form) {
  const e = {}

  if (!form.name?.trim()) e.name = 'Name is required'
  else if (form.name.length > 200) e.name = 'Name is too long'

  if (!form.category_id) e.category_id = 'Choose a category'

  if (form.price === '' || Number(form.price) < 0)
    e.price = 'Price is required'

  if (
    form.promotional_price !== '' &&
    Number(form.promotional_price) >= Number(form.price)
  ) {
    e.promotional_price = 'Promo must be less than price'
  }

  if (form.profit !== '' && Number(form.profit) < 0)
    e.profit = 'Profit must be ≥ 0'

  // ── Base stock — always required for physical products.
  if (form.stock_quantity === '' || Number(form.stock_quantity) < 0)
    e.stock_quantity = 'Stock is required'

  // ── Variant-specific rules
  if (form.hasVariants) {
    if (!form.stock_mode) e.stock_mode = 'Choose how stock is tracked'
    if (!form.variants.length) e.variants = 'Add at least one variant'

    form.variants.forEach((v, i) => {
      if (!v.name?.trim()) e[`variants.${i}.name`] = 'Variant name required'
      if (v.price === '' || Number(v.price) < 0)
        e[`variants.${i}.price`] = 'Price required'
      if (
        v.promotional_price !== '' &&
        Number(v.promotional_price) >= Number(v.price)
      )
        e[`variants.${i}.promotional_price`] = 'Promo must be less than price'

      // Per-variant mode: each variant needs its own stock.
      if (form.stock_mode === 'per_variant') {
        if (v.stock_quantity === '' || Number(v.stock_quantity) < 0)
          e[`variants.${i}.stock_quantity`] = 'Stock required'
      }
    })
  }

  return e
}

export function cleanSpecs(specs = []) {
  return specs
    .filter((s) => s.name?.trim() && s.value?.trim())
    .map((s, i) => ({
      name: s.name.trim(),
      value: s.value.trim(),
      display_order: i,
    }))
}