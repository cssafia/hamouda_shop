
const num = (v) => (v === '' || v == null ? null : Number(v))

export function buildSubscriptionPayload({
  form, isEdit, keepUrls, images, primaryIndex,
}) {
  const hasVariants = Boolean(form.hasVariants)

  const fallbackPrice = hasVariants
    ? Math.min(...form.variants.map((v) => Number(v.price) || 0))
    : num(form.price)

  const data = {
    category_id: Number(form.category_id),
    brand_id: form.brand_id ? Number(form.brand_id) : null,
    name: form.name.trim(),
    description: form.description?.trim() || null,
    duration: hasVariants ? null : form.duration || null,
    price: fallbackPrice,
    promotional_price: hasVariants ? null : num(form.promotional_price),
    profit: hasVariants ? null : num(form.profit),
    is_active: form.is_active ?? true,

    primary_image_index: primaryIndex ?? 0,
    image_order: Array.from(
      { length: (keepUrls?.length ?? 0) + (images?.length ?? 0) },
      (_, i) => i
    ),

    variants: hasVariants
      ? form.variants.map((v) => ({
          duration: v.duration,
          price: num(v.price),
          promotional_price: num(v.promotional_price),
          profit: num(v.profit),
        }))
      : [],
  }

  if (isEdit) data.keep_image_urls = keepUrls ?? []

  const fd = new FormData()
  fd.append('data', JSON.stringify(data))
  ;(images ?? []).forEach((file) => fd.append('images', file))
  return fd
}