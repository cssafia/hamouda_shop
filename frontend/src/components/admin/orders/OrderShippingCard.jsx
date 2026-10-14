// src/components/admin/orders/OrderShippingCard.jsx
import { useState } from 'react'
import { LuTruck, LuPencil, LuX, LuCheck } from 'react-icons/lu'

import { useUpdateOrderShipping } from '../../../features/orders/useAdminOrders'
import { COURIERS, SHIPPING_STATUSES } from '../../../constants/orders'
import { toast } from '../../ui/Toast'
import Field from '../../ui/Field'
import Select from '../../ui/Select'
import Input from '../../ui/Input'
import Button from '../../ui/Button'

export default function OrderShippingCard({ order }) {
  const shipping = order.shipping
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    courier: shipping?.courier ?? '',
    tracking_number: shipping?.tracking_number ?? '',
    status: shipping?.status ?? '',
  })
  const updateShipping = useUpdateOrderShipping(order.id)

  if (!shipping) return null

  const startEdit = () => {
    setForm({
      courier: shipping.courier ?? '',
      tracking_number: shipping.tracking_number ?? '',
      status: shipping.status ?? '',
    })
    setEditing(true)
  }

  const save = () => {
    updateShipping.mutate(form, {
      onSuccess: () => {
        toast.success('Expédition mise à jour')
        setEditing(false)
      },
      onError: (err) => toast.error('Échec', { message: err.message }),
    })
  }

  const cancel = () => {
    setEditing(false)
  }

  return (
    <section className="card overflow-hidden">
      <header className="flex items-center gap-2 px-5 py-3.5 border-b border-surface-border">
        <LuTruck size={16} className="text-ink-400" />
        <h2 className="font-medium text-ink-900">Livraison</h2>
        {!editing && (
          <button
            type="button"
            onClick={startEdit}
            className="ml-auto inline-flex items-center gap-1 text-sm text-brand-600 hover:underline"
          >
            <LuPencil size={14} /> Modifier
          </button>
        )}
      </header>

      <div className="p-5 space-y-3">
        {/* Address block — read-only */}
        <div className="text-sm">
          <p className="text-ink-900">
            {shipping.delivery_type === 'home' ? 'À domicile' : 'Stop desk'}
            <span className="text-ink-400 mx-1.5">·</span>
            <span>{shipping.wilaya}</span>
            {shipping.commune && (
              <>
                <span className="text-ink-400 mx-1.5">·</span>
                <span>{shipping.commune}</span>
              </>
            )}
          </p>

          {shipping.delivery_type === 'home' && shipping.address && (
            <p className="text-ink-600 mt-1">{shipping.address}</p>
          )}
          {shipping.delivery_type === 'stop_desk' && shipping.stop_desk_name && (
            <p className="text-ink-600 mt-1">Bureau : {shipping.stop_desk_name}</p>
          )}
        </div>

        {/* Courier info — read or edit */}
        {!editing ? (
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm pt-3 border-t border-surface-border">
            <div>
              <dt className="text-ink-600 text-xs">Transporteur</dt>
              <dd className="text-ink-900 mt-0.5">{shipping.courier || '—'}</dd>
            </div>
            <div>
              <dt className="text-ink-600 text-xs">N° de suivi</dt>
              <dd className="text-ink-900 mt-0.5 font-mono text-xs">
                {shipping.tracking_number || '—'}
              </dd>
            </div>
            <div className="col-span-2">
              <dt className="text-ink-600 text-xs">Statut expédition</dt>
              <dd className="text-ink-900 mt-0.5">
                {SHIPPING_STATUSES.find((s) => s.value === shipping.status)?.label
                  || shipping.status
                  || '—'}
              </dd>
            </div>
          </dl>
        ) : (
          <div className="space-y-4 pt-3 border-t border-surface-border">
            <Field label="Transporteur">
              <Select
                value={form.courier}
                onChange={(e) => setForm({ ...form, courier: e.target.value })}
              >
                <option value="">—</option>
                {COURIERS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Select>
            </Field>

            <Field label="Numéro de suivi">
              <Input
                value={form.tracking_number}
                onChange={(e) => setForm({ ...form, tracking_number: e.target.value })}
                placeholder="YAL-987654"
              />
            </Field>

            <Field label="Statut expédition">
              <Select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="">—</option>
                {SHIPPING_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </Select>
            </Field>

            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={cancel} type="button">
                <LuX size={14} /> Annuler
              </Button>
              <Button onClick={save} loading={updateShipping.isPending} type="button">
                <LuCheck size={14} /> Enregistrer
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}