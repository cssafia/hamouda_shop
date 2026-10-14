// src/pages/admin/Requests/RequestDetail.jsx
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  LuArrowLeft, LuInbox, LuMessageCircle, LuCircleCheck, LuBan,
  LuTriangleAlert, LuX, LuPhone, LuUser, LuClock,
} from 'react-icons/lu'

import {
  useAdminServiceRequest,
  useCompleteServiceRequest,
  useCancelServiceRequest,
} from '../../../features/services/useAdminServiceRequests'
import {
  SERVICE_REQUEST_STATUS_LABELS,
  SERVICE_REQUEST_STATUS_TONES,
} from '../../../constants/serviceRequests'
import {
  formatCurrency,
  formatDate,
  formatRelative,
  formatPhoneForWhatsApp,
} from '../../../utils/format'
import { toast } from '../../../components/ui/Toast'

import EmptyState from '../../../components/ui/EmptyState'
import Skeleton from '../../../components/ui/Skeleton'
import SectionCard from '../../../components/ui/SectionCard'
import StatusPill from '../../../components/ui/StatusPill'
import ConfirmDialog from '../../../components/ui/ConfirmDialog'
import CompleteRequestDialog from '../../../components/admin/requests/CompleteRequestDialog'

export default function RequestDetail() {
  const { id } = useParams()
  const { data: request, isLoading, isError, error } = useAdminServiceRequest(id)

  const completeMutation = useCompleteServiceRequest(id)
  const cancelMutation = useCancelServiceRequest(id)

  const [completeOpen, setCompleteOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [showNotifyBanner, setShowNotifyBanner] = useState(true)

  if (isLoading) return <DetailSkeleton />

  if (isError || !request) {
    return (
      <EmptyState
        icon={LuInbox}
        title="Demande introuvable"
        description={error?.message || "Cette demande n'existe pas."}
        action={
          <Link to="/admin/requests" className="btn-secondary">
            <LuArrowLeft size={16} /> Retour aux demandes
          </Link>
        }
      />
    )
  }

  const isPending = request.status === 'pending'
  const isCancelled = request.status === 'cancelled'
  const tone = SERVICE_REQUEST_STATUS_TONES[request.status] ?? 'neutral'
  const statusLabel =
    SERVICE_REQUEST_STATUS_LABELS[request.status] ?? request.status

  const openWhatsApp = () => {
    const phone = formatPhoneForWhatsApp(request.customer_phone)
    const msg = isCancelled
      ? `السلام عليكم ${request.customer_name}، للأسف ما قدرناش نديرو طلبك. نعتذر على الإزعاج.`
      : `السلام عليكم ${request.customer_name}، وصلنا طلبك بخصوص "${request.service_name}". راح نتواصلو معاك للتأكيد.`
    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`,
      '_blank',
      'noopener'
    )
  }

  const callCustomer = () => {
    const phone = formatPhoneForWhatsApp(request.customer_phone)
    window.location.href = `tel:+${phone}`
  }

  const handleComplete = ({ profit }) => {
    completeMutation.mutate(
      { profit },
      {
        onSuccess: () => {
          toast.success(
            `Demande terminée · ${formatCurrency(profit)} de bénéfice`
          )
          setCompleteOpen(false)
        },
        onError: (err) => toast.error('Échec', { message: err.message }),
      }
    )
  }

  const handleCancel = () => {
    cancelMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success('Demande annulée')
        setCancelOpen(false)
        setShowNotifyBanner(true)
      },
      onError: (err) => {
        toast.error('Échec', { message: err.message })
        setCancelOpen(false)
      },
    })
  }

  return (
    <>
      <Link
        to="/admin/requests"
        className="inline-flex items-center gap-1.5 text-sm text-ink-600 hover:text-ink-900 mb-4"
      >
        <LuArrowLeft size={16} /> Demandes
      </Link>

      {/* Post-cancel nudge */}
      {isCancelled && showNotifyBanner && (
        <div className="card border-warning/30 bg-warning/5 p-4 mb-5">
          <div className="flex items-start gap-3">
            <LuTriangleAlert size={16} className="text-warning shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink-900">Demande annulée</p>
              <p className="text-sm text-ink-600 mt-1">
                Préviens {request.customer_name} sur WhatsApp pour l'informer.
              </p>
              <button
                type="button"
                onClick={openWhatsApp}
                className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-[#25D366] hover:underline"
              >
                <LuMessageCircle size={14} /> Envoyer un message
              </button>
            </div>
            <button
              type="button"
              onClick={() => setShowNotifyBanner(false)}
              aria-label="Fermer"
              className="-mr-1 -mt-1 shrink-0 rounded-full p-1.5 text-ink-400 hover:text-ink-700"
            >
              <LuX size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ============================================================
          HEADER CARD — the ticket
          ============================================================ */}
      <div className="card p-5 sm:p-6 mb-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-ink-600 uppercase tracking-wide">
              Service demandé
            </p>
            <h1 className="text-xl lg:text-2xl font-semibold text-ink-900 mt-1.5 truncate">
              {request.service_name}
            </h1>
          </div>
          <StatusPill tone={tone}>{statusLabel}</StatusPill>
        </div>

        <div className="border-t border-surface-border my-5" />

        {/* Customer meta */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            <span className="inline-flex items-center gap-2">
              <LuUser size={14} className="text-ink-400 shrink-0" />
              <span className="font-medium text-ink-900">
                {request.customer_name}
              </span>
            </span>
            <a
              href={`tel:+${formatPhoneForWhatsApp(request.customer_phone)}`}
              className="inline-flex items-center gap-2 font-mono text-ink-600 hover:text-brand-600 transition-colors"
            >
              <LuPhone size={14} className="text-ink-400 shrink-0" />
              {request.customer_phone}
            </a>
            <span className="inline-flex items-center gap-2 text-ink-600">
              <LuClock size={14} className="text-ink-400 shrink-0" />
              Reçue {formatRelative(request.created_at)}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button
              type="button"
              onClick={openWhatsApp}
              className="inline-flex items-center gap-2 rounded-control border border-surface-border bg-white px-4 py-2.5 text-sm font-medium text-[#25D366] hover:border-[#25D366]/50 transition-colors"
            >
              <LuMessageCircle size={16} />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            {isPending && (
              <>
                <button
                  type="button"
                  onClick={() => setCompleteOpen(true)}
                  className="btn-primary"
                >
                  <LuCircleCheck size={16} />
                  <span className="hidden sm:inline">Terminer</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCancelOpen(true)}
                  className="inline-flex items-center justify-center w-10 h-10 rounded-control border border-surface-border bg-white text-ink-600 hover:border-danger/40 hover:text-danger transition-colors"
                  aria-label="Annuler la demande"
                  title="Annuler la demande"
                >
                  <LuBan size={16} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================
          BODY GRID
          ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main — description */}
        <div className="lg:col-span-2 space-y-5">
          <SectionCard title="Description">
            {request.description ? (
              <p className="text-sm text-ink-700 whitespace-pre-line leading-relaxed">
                {request.description}
              </p>
            ) : (
              <p className="text-sm text-ink-400 italic">
                Aucune description fournie par le client.
              </p>
            )}
          </SectionCard>
        </div>

        {/* Sidebar — summary */}
        <aside className="space-y-5">
          <SectionCard title="Résumé">
            <dl className="divide-y divide-surface-border -my-2">
              <Row label="Statut">
                <StatusPill tone={tone}>{statusLabel}</StatusPill>
              </Row>
              <Row label="Reçue le">
                {formatDate(request.created_at, { withTime: true })}
              </Row>
              {request.updated_at !== request.created_at && (
                <Row label="Mise à jour">
                  {formatDate(request.updated_at, { withTime: true })}
                </Row>
              )}
              {request.status === 'completed' && request.profit != null && (
                <Row label="Bénéfice">
                  <span className="font-medium text-ink-900">
                    {formatCurrency(request.profit)}
                  </span>
                </Row>
              )}
            </dl>
          </SectionCard>
        </aside>
      </div>

      {/* Dialogs */}
      <CompleteRequestDialog
        open={completeOpen}
        onClose={() => !completeMutation.isPending && setCompleteOpen(false)}
        onConfirm={handleComplete}
        loading={completeMutation.isPending}
        request={request}
      />

      <ConfirmDialog
        open={cancelOpen}
        onClose={() => !cancelMutation.isPending && setCancelOpen(false)}
        onConfirm={handleCancel}
        title="Annuler cette demande ?"
        description={`${request.customer_name} sera à prévenir sur WhatsApp. Cette action est définitive.`}
        confirmLabel="Annuler la demande"
        cancelLabel="Retour"
        variant="danger"
        loading={cancelMutation.isPending}
      />
    </>
  )
}

/* ---------- Row helper ---------- */

function Row({ label, children }) {
  return (
    <div className="grid grid-cols-2 gap-4 py-2.5 text-sm">
      <dt className="text-ink-600">{label}</dt>
      <dd className="text-ink-900">{children}</dd>
    </div>
  )
}

/* ---------- Skeleton ---------- */

function DetailSkeleton() {
  return (
    <>
      <Skeleton className="h-4 w-24 mb-4" />
      <div className="card p-6 mb-5">
        <Skeleton className="h-3 w-24 mb-3" />
        <Skeleton className="h-7 w-48 mb-6" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <Skeleton className="h-40 w-full" />
        </div>
        <div>
          <Skeleton className="h-56 w-full" />
        </div>
      </div>
    </>
  )
}