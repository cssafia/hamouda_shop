// src/pages/client/ServiceRequestPage.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LuCircleCheck, LuArrowLeft } from 'react-icons/lu'

import { useCreateServiceRequest } from '../../../features/services/useServiceRequests'
import { toast } from '../../../components/ui/Toast'
import ServiceRequestForm from '../../../components/client/ServiceRequestForm'

const DOTS = {
  backgroundImage: 'radial-gradient(rgb(148 163 184 / 0.28) 1px, transparent 1px)',
  backgroundSize: '24px 24px',
  WebkitMaskImage: 'radial-gradient(ellipse at center, #000 25%, transparent 70%)',
  maskImage: 'radial-gradient(ellipse at center, #000 25%, transparent 70%)',
}

export default function ServiceRequestPage() {
  const [submitted, setSubmitted] = useState(null)
  const navigate = useNavigate()
  const create = useCreateServiceRequest()

  const handleSubmit = (values) => {
    create.mutate(values, {
      onSuccess: (data) => setSubmitted(data),
      onError: (err) =>
        toast.error('ما قدرناش نرسلو الطلب', { message: err.message }),
    })
  }

  return (
    <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24">
      {/* Glow + dot backdrop */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-72 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 55% 60% at 50% 0%, rgb(37 99 235 / 0.10), transparent 70%)',
        }}
      />
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none" style={DOTS} />

      <div className="relative max-w-lg mx-auto px-4 sm:px-6">
        {!submitted ? (
          <>
            <header className="text-center mb-8">
              <h1 dir="rtl" className="text-3xl lg:text-4xl font-semibold text-ink-900">
                طلب خدمة
              </h1>
              <p dir="rtl" className="text-ink-600 mt-3">
                عندك حاجة؟ ابعثنا واش تحتاج، نتواصلو معاك.
              </p>
            </header>

            <div className="card p-6 sm:p-8">
              <ServiceRequestForm
                onSubmit={handleSubmit}
                isPending={create.isPending}
              />
            </div>

            <p
              dir="rtl"
              className="text-center text-xs text-ink-600 mt-5 flex items-center justify-center gap-1.5"
            >
              <LuCircleCheck size={14} className="text-success" />
              نتواصلو معاك في أقرب وقت على WhatsApp
            </p>
          </>
        ) : (
          <SuccessView onHome={() => navigate('/')} />
        )}
      </div>
    </section>
  )
}

/* ---------- Success state ---------- */

function SuccessView({ onHome }) {
  
  

  return (
    <div className="text-center">
      <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/10 text-success mb-5">
        <LuCircleCheck size={32} />
      </span>

      <h1 dir="rtl" className="text-2xl lg:text-3xl font-semibold text-ink-900">
        وصلنا طلبك ✓
      </h1>
      <p dir="rtl" className="text-ink-600 mt-3 max-w-sm mx-auto">
        راح نتواصلو معاك في أقرب وقت للتأكيد.
      </p>

      

      <div className="mt-8">
        <button
          type="button"
          onClick={onHome}
          className="btn-secondary inline-flex items-center gap-2"
        >
          رجع للصفحة الرئيسية
          <LuArrowLeft size={16} />
        </button>
      </div>
    </div>
  )
}