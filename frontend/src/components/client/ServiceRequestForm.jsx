// src/components/client/ServiceRequestForm.jsx
import { useState } from 'react'
import { LuArrowLeft } from 'react-icons/lu'

import Field from '../ui/Field'
import Textarea from '../ui/Textarea'
import Button from '../ui/Button'

const SUGGESTIONS = [
  'Transfert d\'argent',
  'Assistance en ligne',
  'Installation PC',
  'Déverrouillage',
  'Autres demandes',
]

const EMPTY = {
  customer_name: '',
  customer_phone: '',
  service_name: '',
  description: '',
}

export default function ServiceRequestForm({ onSubmit, isPending }) {
  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState({})

  const set = (k, v) => {
    setValues((prev) => ({ ...prev, [k]: v }))
    if (errors[k]) setErrors((prev) => ({ ...prev, [k]: undefined }))
  }

  const validate = () => {
    const e = {}
    if (!values.customer_name.trim() || values.customer_name.trim().length < 2)
      e.customer_name = 'الاسم مطلوب'
    const phone = values.customer_phone.replace(/\s/g, '')
    if (!phone || phone.length < 8) e.customer_phone = 'رقم الهاتف مطلوب'
    if (!values.service_name.trim() || values.service_name.trim().length < 2)
      e.service_name = 'نوع الخدمة مطلوب'
    if (values.description.length > 5000) e.description = 'الوصف طويل جداً'
    return e
  }

  const submit = (ev) => {
    ev.preventDefault()
    const v = validate()
    if (Object.keys(v).length) {
      setErrors(v)
      return
    }
    setErrors({})
    onSubmit?.({
      customer_name: values.customer_name.trim(),
      customer_phone: values.customer_phone.trim(),
      service_name: values.service_name.trim(),
      description: values.description.trim(),
    })
  }

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <Field
        label="الاسم الكامل"
        htmlFor="srf-name"
        required
        error={errors.customer_name}
      >
        <input
          id="srf-name"
          className="input"
          value={values.customer_name}
          onChange={(e) => set('customer_name', e.target.value)}
          placeholder="Ahmed Benali"
          autoComplete="name"
          disabled={isPending}
        />
      </Field>

      <Field
        label="رقم الهاتف"
        htmlFor="srf-phone"
        required
        error={errors.customer_phone}
      >
        <input
          id="srf-phone"
          className="input font-mono"
          inputMode="tel"
          value={values.customer_phone}
          onChange={(e) => set('customer_phone', e.target.value)}
          placeholder="0555 12 34 56"
          autoComplete="tel"
          disabled={isPending}
        />
      </Field>

      <Field
        label="نوع الخدمة"
        htmlFor="srf-service"
        required
        error={errors.service_name}
      >
        <input
          id="srf-service"
          className="input"
          value={values.service_name}
          onChange={(e) => set('service_name', e.target.value)}
          placeholder="Transfert d'argent, installation PC…"
          disabled={isPending}
        />
      </Field>

      {!values.service_name && (
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => set('service_name', s)}
              disabled={isPending}
              className="rounded-full border border-surface-border bg-white px-3 py-1.5 text-xs text-ink-600 hover:border-brand-500 hover:text-brand-600 transition-colors disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <Field
        label="الوصف (اختياري)"
        htmlFor="srf-desc"
        error={errors.description}
        hint="اشرح بالتفصيل واش تحتاج بالضبط."
      >
        <Textarea
          id="srf-desc"
          rows={4}
          value={values.description}
          onChange={(e) => set('description', e.target.value)}
          placeholder="مثال : نحتاج نستقبل 500 EUR من فرنسا."
          disabled={isPending}
        />
      </Field>

      <Button
        type="submit"
        loading={isPending}
        className="w-full py-3 text-base"
      >
        ابعث الطلب
        <LuArrowLeft size={16} />
      </Button>
    </form>
  )
}