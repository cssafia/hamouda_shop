// src/components/admin/requests/CompleteRequestDialog.jsx
import { useEffect, useState } from 'react'
import ConfirmDialog from '../../ui/ConfirmDialog'
import Field from '../../ui/Field'

export default function CompleteRequestDialog({
  open,
  onClose,
  onConfirm,
  loading,
  request,
}) {
  const [profit, setProfit] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setProfit('')
      setError('')
    }
  }, [open])

  const submit = () => {
    const n = Number(profit)
    if (profit === '' || Number.isNaN(n) || n < 0) {
      setError('Entrez un montant valide')
      return
    }
    onConfirm({ profit: n })
  }

  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      onConfirm={submit}
      title="Terminer la demande"
      description={
        request
          ? `${request.customer_name} · ${request.service_name}`
          : undefined
      }
      confirmLabel="Terminer"
      cancelLabel="Annuler"
      variant="info"
      loading={loading}
    >
      <Field
        label="Bénéfice (DA)"
        htmlFor="cr-profit"
        error={error}
        hint="Montant collecté sur cette demande."
      >
        <input
          id="cr-profit"
          type="number"
          min="0"
          className="input"
          value={profit}
          onChange={(e) => {
            setProfit(e.target.value)
            setError('')
          }}
          placeholder="1500"
          autoFocus
        />
      </Field>
    </ConfirmDialog>
  )
}