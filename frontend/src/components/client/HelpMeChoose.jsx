// src/components/client/HelpMeChoose.jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  LuGamepad2, LuBookOpen, LuBriefcase, LuZap, LuArrowLeft,
} from 'react-icons/lu'

const USAGE_OPTIONS = [
  { key: 'gaming',       label: 'Gaming',  Icon: LuGamepad2 },
  { key: 'studies',      label: 'دراس',    Icon: LuBookOpen },
  { key: 'professional', label: 'خدمة',    Icon: LuBriefcase },
  { key: 'daily',        label: 'يومي',    Icon: LuZap },
]

const BUDGET_OPTIONS = [
  { key: 'low',     label: 'أقل من 50 000',    price_min: null,   price_max: 50000 },
  { key: 'mid',     label: '50 000 – 100 000', price_min: 50000,  price_max: 100000 },
  { key: 'high',    label: '100 000 – 200 000', price_min: 100000, price_max: 200000 },
  { key: 'premium', label: 'أكثر من 200 000',  price_min: 200000, price_max: null },
]

function buildQuery(usageKey, budgetKey) {
  const params = new URLSearchParams()
  if (usageKey) params.set('usage', usageKey)
  const b = BUDGET_OPTIONS.find((x) => x.key === budgetKey)
  if (b?.price_min) params.set('price_min', b.price_min)
  if (b?.price_max) params.set('price_max', b.price_max)
  return params.toString()
}

function buildCtaLabel(usageKey, budgetKey) {
  const u = USAGE_OPTIONS.find((x) => x.key === usageKey)
  const b = BUDGET_OPTIONS.find((x) => x.key === budgetKey)
  if (!u && !b) return 'شوف لي PC مناسب'
  if (u && !b) return `شوف PC للـ ${u.label}`
  if (!u && b) return `شوف PC بـ ${b.label}`
  return `شوف PC للـ ${u.label} · ${b.label}`
}

const CHIP_BASE =
  'inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40'
const CHIP_OFF =
  'bg-white border-surface-border text-ink-700 hover:border-brand-500 hover:text-brand-600'
const CHIP_ON =
  'bg-brand-500 border-brand-500 text-white'

export default function HelpMeChoose() {
  const [usage, setUsage] = useState(null)
  const [budget, setBudget] = useState(null)
  const qs = buildQuery(usage, budget)

  return (
    <section aria-labelledby="choose-heading" className="py-16 lg:py-24 + brand-50 bg">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2
            id="choose-heading"
            dir="rtl"
            className="text-2xl lg:text-3xl font-semibold text-ink-900"
          >
            ماعرفتش واش يناسبك؟
          </h2>
          <p dir="rtl" className="text-ink-600 mt-3">
            جاوب على 2 أسئلة، نوريك الاختيار المناسب.
          </p>
        </div>

        {/* Question 1 — Usage */}
        <div className="mb-6">
          <p
            dir="rtl"
            className="text-sm font-medium text-ink-700 mb-3 text-right"
          >
            باش تستعملو؟
          </p>
          <div className="flex flex-wrap gap-2" dir="rtl">
            {USAGE_OPTIONS.map((u) => {
              const on = usage === u.key
              const { Icon } = u
              return (
                <button
                  key={u.key}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setUsage(on ? null : u.key)}
                  className={`${CHIP_BASE} ${on ? CHIP_ON : CHIP_OFF}`}
                >
                  <Icon size={14} aria-hidden="true" />
                  {u.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Question 2 — Budget */}
        <div className="mb-8">
          <p
            dir="rtl"
            className="text-sm font-medium text-ink-700 mb-3 text-right"
          >
            شحال ميزانيتك؟
          </p>
          <div className="flex flex-wrap gap-2" dir="rtl">
            {BUDGET_OPTIONS.map((b) => {
              const on = budget === b.key
              return (
                <button
                  key={b.key}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setBudget(on ? null : b.key)}
                  className={`${CHIP_BASE} ${on ? CHIP_ON : CHIP_OFF}`}
                >
                  {b.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* CTA — centered, standalone */}
        <div className="text-center">
          <Link
            to={qs ? `/products?${qs}` : '/products'}
            dir="rtl"
            className="btn-primary inline-flex items-center gap-2 px-8 py-3 text-base"
          >
            {buildCtaLabel(usage, budget)}
            <LuArrowLeft size={16} />
          </Link>
        </div>
      </div>
    </section>
  )
}