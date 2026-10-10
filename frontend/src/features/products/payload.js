// src/features/products/payload.js
import { cleanSpecs } from './validation'

const num = (v) => (v === '' || v == null ? null : Number(v))

/**
 * Builds the POST/PATCH payload.
 *
 * Stock rules :
 *   • Base stock_quantity is ALWAYS sent for physical products.
 *       - single       → the only stock
 *       - shared       → the shared pool
 *       - per_variant  → the default configuration's stock
 *   • Variant stock_quantity is sent ONLY in per_variant mode.
 */
export function buildProductPayload({
  form, isEdit, keepUrls, images, primaryIndex,
}) {
  const hasVariants = Boolean(form.hasVariants)
  const stockMode = hasVariants ? form.stock_mode ?? 'per_variant' : null

  const data = {
    product_type: 'physical',
    name: form.name.trim(),
    description: form.description?.trim() || null,
    category_id: Number(form.category_id),
    brand_id: form.brand_id ? Number(form.brand_id) : null,
    price: num(form.price),
    promotional_price: num(form.promotional_price),
    profit: num(form.profit),
    specifications: cleanSpecs(form.specifications),
    is_active: form.is_active ?? true,

    primary_image_index: primaryIndex ?? 0,
    image_order: Array.from(
      { length: (keepUrls?.length ?? 0) + (images?.length ?? 0) },
      (_, i) => i
    ),

    // Always send base stock now.
    stock_mode: hasVariants ? stockMode : null,
    stock_quantity: num(form.stock_quantity),

    condition: form.condition || null,
    color: form.color?.trim() || null,
    included_accessories: form.included_accessories?.trim() || null,
    usages: form.usages ?? [],
  }

  if (isEdit) data.keep_image_urls = keepUrls ?? []

  data.variants = hasVariants
    ? form.variants.map((v) => {
        const base = {
          name: v.name.trim(),
          price: num(v.price),
          promotional_price: num(v.promotional_price),
          profit: num(v.profit),
        }
        // Variant stock only in per_variant mode.
        if (stockMode === 'per_variant') base.stock_quantity = num(v.stock_quantity)
        base.overrides = (v.overrides ?? [])
          .filter((o) => o.name && o.value?.trim())
          .map((o) => ({ name: o.name, value: o.value.trim() }))
        return base
      })
    : []

  const fd = new FormData()
  fd.append('data', JSON.stringify(data))
  ;(images ?? []).forEach((file) => fd.append('images', file))
  return fd
}