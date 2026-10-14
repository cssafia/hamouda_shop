// src/pages/admin/Orders/OrderDetail.jsx
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import {
  LuArrowLeft, LuPackage, LuCopy, LuBan, LuPhone, LuMessageCircle, LuUser, LuBox,
} from 'react-icons/lu'

import {
  useAdminOrder,
  useUpdateOrderStatus,
} from '../../../features/orders/useAdminOrders'
import {
  STATUS_TRANSITIONS,
  getPrimaryAction,
  CANCELLATION_REASONS,
} from '../../../constants/orders'
import {
  formatCurrency,
  formatDate,
  formatPhoneForWhatsApp,
} from '../../../utils/format'
import { SHOP_NAME } from '../../../constants/config'
import { toast } from '../../../components/ui/Toast'

import EmptyState from '../../../components/ui/EmptyState'
import Skeleton from '../../../components/ui/Skeleton'
import Button from '../../../components/ui/Button'
import ConfirmDialog from '../../../components/ui/ConfirmDialog'
import SectionCard from '../../../components/ui/SectionCard'

import OrderStatusPill from '../../../components/admin/orders/OrderStatusPill'
import OrderTimeline from '../../../components/admin/orders/OrderTimeline'
import OrderShippingCard from '../../../components/admin/orders/OrderShippingCard'

export default function OrderDetail() {
  const { id } = useParams()
  const qc = useQueryClient()
  const { data: order, isLoading, isError, error } = useAdminOrder(id)
  const updateStatus = useUpdateOrderStatus()

  const [cancelOpen, setCancelOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelNote, setCancelNote] = useState('')
  const [cancelError, setCancelError] = useState('')

  // Force-refresh every query touching orders after any mutation.
  const refreshOrder = () => {
    qc.invalidateQueries({ queryKey: ['orders'] })
  }

  if (isLoading) return <DetailSkeleton />

  if (isError || !order) {
    return (
      <EmptyState
        icon={LuPackage}
        title="Commande introuvable"
        description={error?.message || "Cette commande n'existe pas."}
        action={
          <Link to="/admin/orders" className="btn-secondary">
            <LuArrowLeft size={16} /> Retour aux commandes
          </Link>
        }
      />
    )
  }

  const transitions = STATUS_TRANSITIONS[order.order_type]?.[order.status] ?? []
  const canCancel = transitions.includes('cancelled')
  const primary = getPrimaryAction(order.status, order.order_type)

  const openWhatsApp = () => {
    const phone = formatPhoneForWhatsApp(order.customer.phone)
    const text = encodeURIComponent(
      `Bonjour ${order.customer.name}, c'est ${SHOP_NAME}.\n` +
        `Je vous contacte au sujet de votre commande #${order.id}.`
    )
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank', 'noopener')
  }

  const callCustomer = () => {
    const phone = formatPhoneForWhatsApp(order.customer.phone)
    window.location.href = `tel:+${phone}`
  }

  const copyOrderNumber = async () => {
    try {
      await navigator.clipboard.writeText(`#${order.id}`)
      toast.success('Numéro copié')
    } catch {
      toast.error('Impossible de copier')
    }
  }

  const runPrimary = () => {
    if (!primary) return
    updateStatus.mutate(
      { id: order.id, payload: { status: primary.next } },
      {
        onSuccess: () => {
          refreshOrder()
          toast.success('Commande mise à jour')
        },
        onError: (err) => toast.error('Échec', { message: err.message }),
      }
    )
  }

  const openCancel = () => {
    setCancelReason('')
    setCancelNote('')
    setCancelError('')
    setCancelOpen(true)
  }

  const confirmCancel = () => {
    if (!cancelReason) {
      setCancelError('Choisis une raison')
      return
    }
    updateStatus.mutate(
      {
        id: order.id,
        payload: {
          status: 'cancelled',
          rejection_reason: cancelReason,
          rejection_note: cancelNote.trim() || null,
        },
      },
      {
        onSuccess: () => {
          refreshOrder()
          toast.success('Commande annulée')
          setCancelOpen(false)
        },
        onError: (err) => toast.error('Échec', { message: err.message }),
      }
    )
  }

  return (
    <>
      <Link
        to="/admin/orders"
        className="inline-flex items-center gap-1.5 text-sm text-ink-600 hover:text-ink-900 mb-4"
      >
        <LuArrowLeft size={16} /> Commandes
      </Link>

      {/* ============ HEADER ============ */}
      <div className="card p-5 mb-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl lg:text-2xl font-semibold text-ink-900 font-mono">
                #{order.id}
              </h1>
              <OrderStatusPill status={order.status} />
            </div>
            <p className="text-sm text-ink-600 mt-1.5">
              {order.customer.name}
              <span className="text-ink-400 mx-1.5">·</span>
              {formatDate(order.created_at, { withTime: true })}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={callCustomer}
              className="inline-flex items-center justify-center w-10 h-10 rounded-control border border-surface-border bg-white text-ink-600 hover:border-brand-500 hover:text-brand-600 transition-colors"
              aria-label="Appeler le client"
              title="Appeler le client"
            >
              <LuPhone size={16} />
            </button>

            <button
              type="button"
              onClick={openWhatsApp}
              className="inline-flex items-center justify-center w-10 h-10 rounded-control border border-surface-border bg-white text-[#25D366] hover:border-[#25D366]/50 transition-colors"
              aria-label="Contacter sur WhatsApp"
              title="Contacter sur WhatsApp"
            >
              <LuMessageCircle size={16} />
            </button>

            {primary && (
              <Button onClick={runPrimary} loading={updateStatus.isPending}>
                {primary.label}
              </Button>
            )}

            {canCancel && (
              <button
                type="button"
                onClick={openCancel}
                className="inline-flex items-center justify-center w-10 h-10 rounded-control border border-surface-border bg-white text-ink-600 hover:border-danger/40 hover:text-danger transition-colors"
                aria-label="Annuler la commande"
                title="Annuler la commande"
              >
                <LuBan size={16} />
              </button>
            )}

            <button
              type="button"
              onClick={copyOrderNumber}
              className="inline-flex items-center justify-center w-10 h-10 rounded-control border border-surface-border bg-white text-ink-600 hover:text-ink-900 transition-colors"
              aria-label="Copier le numéro"
              title="Copier le numéro"
            >
              <LuCopy size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ============ BODY ============ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <CustomerCard order={order} />
          <ItemsCard order={order} />
          <TotalsCard order={order} />
        </div>

        <aside className="space-y-5">
          <OrderTimeline order={order} />
          <OrderShippingCard order={order} />
          {order.note && <NoteCard note={order.note} />}
        </aside>
      </div>

      {/* Cancel dialog */}
      <ConfirmDialog
        open={cancelOpen}
        onClose={() => !updateStatus.isPending && setCancelOpen(false)}
        onConfirm={confirmCancel}
        title={`Annuler la commande #${order.id} ?`}
        description={
          order.order_type === 'physical'
            ? 'Cette action est définitive. Le stock sera restauré.'
            : 'Cette action est définitive.'
        }
        confirmLabel="Annuler la commande"
        cancelLabel="Retour"
        variant="danger"
        loading={updateStatus.isPending}
      >
        <div>
          <p className="label">Raison</p>
          <div className="space-y-1.5">
            {CANCELLATION_REASONS.map((r) => (
              <label
                key={r.value}
                className={`flex items-center gap-2.5 rounded-control border px-3 py-2.5 cursor-pointer transition-colors ${
                  cancelReason === r.value
                    ? 'border-brand-500 bg-brand-50'
                    : 'border-surface-border hover:border-brand-500'
                }`}
              >
                <input
                  type="radio"
                  name="rejection-reason"
                  value={r.value}
                  checked={cancelReason === r.value}
                  onChange={(e) => {
                    setCancelReason(e.target.value)
                    setCancelError('')
                  }}
                  className="w-4 h-4 accent-brand-500"
                />
                <span className="text-sm text-ink-900">{r.label}</span>
              </label>
            ))}
          </div>
          {cancelError && <p className="form-error mt-2">{cancelError}</p>}
        </div>

        <div className="mt-4">
          <label htmlFor="rejection-note" className="label">
            Note (optionnel)
          </label>
          <textarea
            id="rejection-note"
            rows={3}
            className="input resize-y"
            placeholder="Ex : Appelé 3 fois, pas de réponse."
            value={cancelNote}
            onChange={(e) => setCancelNote(e.target.value)}
          />
        </div>
      </ConfirmDialog>
    </>
  )
}

/* ================================================================
   Cards
   ================================================================ */

function CustomerCard({ order }) {
  return (
    <SectionCard icon={LuUser} title="Client">
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
        <div>
          <dt className="text-ink-600 text-xs">Nom</dt>
          <dd className="text-ink-900 mt-0.5 font-medium">{order.customer.name}</dd>
        </div>
        <div>
          <dt className="text-ink-600 text-xs">Téléphone</dt>
          <dd className="text-ink-900 mt-0.5 font-mono">
            <a
              href={`tel:+${formatPhoneForWhatsApp(order.customer.phone)}`}
              className="hover:text-brand-600"
            >
              {order.customer.phone}
            </a>
          </dd>
        </div>
      </dl>
    </SectionCard>
  )
}

function ItemsCard({ order }) {
  const items = order.items ?? []

  return (
    <SectionCard icon={LuBox} title={`Articles (${items.length})`} noPadding>
      <ul className="divide-y divide-surface-border">
        {items.map((item) => (
          <li key={item.id} className="px-4 sm:px-5 py-3 flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <Link
                to={`/admin/products/${item.product_id}`}
                className="text-sm font-medium text-ink-900 hover:text-brand-600"
              >
                {item.product_name}
              </Link>
              {item.variant_name && (
                <p className="text-xs text-ink-600 mt-0.5">{item.variant_name}</p>
              )}
              <p className="text-xs text-ink-600 mt-1">
                {item.quantity} × {formatCurrency(item.unit_price)}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-medium text-ink-900">
                {formatCurrency(item.line_total)}
              </p>
              {item.profit != null && (
                <p className="text-xs text-ink-400 mt-0.5">
                  +{formatCurrency(item.profit)}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </SectionCard>
  )
}

function TotalsCard({ order }) {
  const t = order.totals ?? {}

  return (
    <SectionCard title="Totaux">
      <dl className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-ink-600">Sous-total</dt>
          <dd className="text-ink-900">{formatCurrency(t.subtotal)}</dd>
        </div>

        {t.discount > 0 && (
          <div className="flex items-center justify-between">
            <dt className="text-ink-600">
              Remise
              {order.coupon_code && (
                <span className="ml-1.5 text-xs font-mono text-ink-400">
                  {order.coupon_code}
                </span>
              )}
            </dt>
            <dd className="text-success">−{formatCurrency(t.discount)}</dd>
          </div>
        )}

        {t.shipping != null && t.shipping > 0 && (
          <div className="flex items-center justify-between">
            <dt className="text-ink-600">Livraison</dt>
            <dd className="text-ink-900">{formatCurrency(t.shipping)}</dd>
          </div>
        )}

        <div className="pt-3 border-t border-surface-border flex items-center justify-between">
          <dt className="text-base font-semibold text-ink-900">Total</dt>
          <dd className="text-base font-semibold text-ink-900">
            {formatCurrency(t.total)}
          </dd>
        </div>

        {t.profit != null && (
          <div className="flex items-center justify-between pt-1">
            <dt className="text-xs text-ink-400">Marge (admin)</dt>
            <dd className="text-xs text-ink-400">{formatCurrency(t.profit)}</dd>
          </div>
        )}
      </dl>
    </SectionCard>
  )
}

function NoteCard({ note }) {
  return (
    <SectionCard title="Note du client">
      <p className="text-sm text-ink-700 whitespace-pre-line italic">
        « {note} »
      </p>
    </SectionCard>
  )
}

function DetailSkeleton() {
  return (
    <>
      <Skeleton className="h-4 w-24 mb-4" />
      <div className="card p-5 mb-5">
        <Skeleton className="h-7 w-32 mb-3" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-56 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
        <div className="space-y-5">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-56 w-full" />
        </div>
      </div>
    </>
  )
}