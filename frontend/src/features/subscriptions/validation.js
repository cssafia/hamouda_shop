// src/features/products/subscriptionValidation.js

export function validateSubscription(form) {
  const e = {}

  /* ---------- shared ---------- */
  if (!form.name?.trim()) e.name = 'Name is required'
  else if (form.name.length > 200) e.name = 'Name is too long'

  if (!form.category_id) e.category_id = 'Choose a category'

  /* ---------- base plan ---------- */
  if (!form.duration) e.duration = 'Duration is required'

  if (form.price === '' || Number(form.price) < 0)
    e.price = 'Price is required'

  if (form.profit === '' || Number(form.profit) < 0)
    e.profit = 'Profit is required'

  if (
    form.promotional_price !== '' &&
    Number(form.promotional_price) >= Number(form.price)
  ) {
    e.promotional_price = 'Promo must be less than price'
  }

  /* ---------- extra plans ---------- */
  form.variants.forEach((v, i) => {
    if (!v.duration) e[`variants.${i}.duration`] = 'Duration required'

    if (v.price === '' || Number(v.price) < 0)
      e[`variants.${i}.price`] = 'Price required'

    if (
      v.promotional_price !== '' &&
      Number(v.promotional_price) >= Number(v.price)
    ) {
      e[`variants.${i}.promotional_price`] = 'Promo must be less than price'
    }
  })

  return e
}