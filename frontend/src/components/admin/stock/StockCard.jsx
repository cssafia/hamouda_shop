// src/components/admin/stock/StockCard.jsx
import { Link } from 'react-router-dom'
import { LuPencil, LuPackage } from 'react-icons/lu'

import StatusPill from '../../ui/StatusPill'
import StockConfigRow from './StockConfigRow'

const STATUS_TONE = { out: 'danger', low: 'warning' }
const STATUS_LABEL = { out: 'Rupture', low: 'Bas' }

function computeStatus(stock, threshold) {
  const n = Number(stock ?? 0)
  if (n === 0) return 'out'
  if (threshold != null && n <= threshold) return 'low'
  return null
}

export default function StockCard({ product, onAdjust, onEditThreshold }) {
  const isPerVariant = product.stock_mode === 'per_variant'
  const variantsCount = product.variants_count ?? 0
  const configCount = isPerVariant ? variantsCount + 1 : 1

  const totalStock = Number(product.total_stock ?? 0)
  const baseStock = isPerVariant
    ? Number(product.stock_quantity ?? 0)
    : totalStock
  const baseThreshold = product.low_stock_threshold
  const baseStatus = computeStatus(baseStock, baseThreshold)

  return (
    <article className="card overflow-hidden">
      {/* ---------- Header ---------- */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-control bg-surface-subtle border border-surface-border overflow-hidden shrink-0">
            {product.primary_image ? (
              <img
                src={product.primary_image}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-ink-400">
                <LuPackage size={20} />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <Link
              to={`/admin/products/${product.id}`}
              className="text-base font-semibold text-ink-900 hover:text-brand-600 truncate block"
            >
              {product.name}
            </Link>
            <p className="text-xs text-ink-600 mt-0.5 truncate">
              {product.category?.name || '—'}
              {product.brand?.name && <> · {product.brand.name}</>}
            </p>

            {/* ---------- Single / Shared: everything inline ---------- */}
            {!isPerVariant && (
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
                <span className="text-2xl font-semibold text-ink-900 tabular-nums">
                  {totalStock}
                </span>
                <span className="text-xs text-ink-600">unités</span>

                {product.stock_mode === 'shared' && variantsCount > 0 && (
                  <span className="text-xs text-ink-500">
                    · partagé entre {variantsCount} configuration{variantsCount > 1 ? 's' : ''}
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => onEditThreshold({ product, variant: null })}
                  className={`inline-flex items-center gap-1 text-xs transition-colors whitespace-nowrap ${
                    baseThreshold != null
                      ? 'text-ink-400 hover:text-brand-600'
                      : 'text-brand-600 hover:text-brand-700 font-medium'
                  }`}
                  title={baseThreshold != null ? 'Modifier le seuil' : 'Définir un seuil'}
                >
                  {baseThreshold != null ? `seuil ${baseThreshold}` : 'Définir le seuil'}
                  <LuPencil size={11} />
                </button>

                {baseStatus && (
                  <StatusPill tone={STATUS_TONE[baseStatus]}>
                    {STATUS_LABEL[baseStatus]}
                  </StatusPill>
                )}

                <button
                  type="button"
                  onClick={() => onAdjust({ product, variant: null })}
                  className="btn-secondary px-3 py-1.5 text-sm ml-auto"
                >
                  Ajuster
                </button>
              </div>
            )}

            {/* ---------- Per-variant: total in the header ---------- */}
            {isPerVariant && (
              <div className="mt-3 flex items-baseline gap-2 flex-wrap">
                <span className="text-2xl font-semibold text-ink-900 tabular-nums">
                  {totalStock}
                </span>
                <span className="text-xs text-ink-600">
                  unités · {configCount} configuration{configCount > 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ---------- Per-variant configs — always visible, no toggle ---------- */}
      {isPerVariant && (
        <div className="border-t border-surface-border bg-surface-subtle/30 p-2 space-y-1">
          {/* Base config = "variant 0" */}
          <StockConfigRow
            product={product}
            variant={null}
            stock={baseStock}
            threshold={baseThreshold}
            onAdjust={onAdjust}
            onEditThreshold={onEditThreshold}
          />

          {/* Variants */}
          {product.variants.map((v) => (
            <StockConfigRow
              key={v.id}
              product={product}
              variant={v}
              stock={v.stock_quantity}
              threshold={v.low_stock_threshold}
              onAdjust={onAdjust}
              onEditThreshold={onEditThreshold}
            />
          ))}
        </div>
      )}
    </article>
  )
}