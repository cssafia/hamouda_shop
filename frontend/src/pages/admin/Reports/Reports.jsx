// src/pages/admin/Reports/Reports.jsx
import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  LuBanknote, LuTrendingUp, LuShoppingCart, LuReceipt,
} from 'react-icons/lu'

import {
  useReportSummary,
  useReportRevenue,
  useReportOrders,
  useReportTopProducts,
  useReportTopCategories,
  useReportTopWilayas,
} from '../../../features/reports/useReports'
import { useWilayas } from '../../../features/shipping/useShipping'
import { rangeFromPreset } from '../../../utils/analytics'

import PageHeader from '../../../components/ui/PageHeader'
import RangePicker from '../../../components/admin/analytics/RangePicker'
import MetricCard from '../../../components/admin/analytics/MetricCard'
import RevenueProfitChart from '../../../components/admin/analytics/RevenueProfitChart'
import OrdersStatusChart from '../../../components/admin/analytics/OrdersStatusChart'
import TopBarChart from '../../../components/admin/analytics/TopBarChart'

export default function Reports() {
  const [params, setParams] = useSearchParams()

  /* Initial range: URL wins, otherwise 30d */
  const initialRange = useMemo(() => {
    const from = params.get('from')
    const to = params.get('to')
    if (from && to) return { from, to }
    return rangeFromPreset('30d')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [range, setRange] = useState(initialRange)

  const updateRange = (next) => {
    setRange(next)
    const p = new URLSearchParams(params)
    p.set('from', next.from)
    p.set('to', next.to)
    setParams(p, { replace: true })
  }

  /* ---------- Data ---------- */
  const { data: summary,  isLoading: sumLoading  } = useReportSummary(range)
  const { data: revenue,  isLoading: revLoading  } = useReportRevenue(range)
  const { data: orders,   isLoading: ordLoading  } = useReportOrders(range)
  const { data: products, isLoading: prodLoading } = useReportTopProducts({ ...range, limit: 10 })
  const { data: cats,     isLoading: catLoading  } = useReportTopCategories({ ...range, limit: 10 })
  const { data: wilayas,  isLoading: wilLoading  } = useReportTopWilayas({ ...range, limit: 10 })

  /* ---------- Wilaya code → name ---------- */
  const { data: wilayaList } = useWilayas()
  const wilayaNames = useMemo(() => {
    const map = {}
    ;(wilayaList ?? []).forEach((w) => { map[w.code] = w.name })
    return map
  }, [wilayaList])

  const s = summary?.summary

  return (
    <>
      <PageHeader
        title="Rapports"
        description="Analyse détaillée de ton activité."
      />

      <div className="mb-5">
        <RangePicker value={range} onChange={updateRange} />
      </div>

      {/* ---------- Summary ---------- */}
      <section className="mb-6">
        <h2 className="text-sm font-medium text-ink-600 mb-3">
          Résumé de la période
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard
            icon={LuBanknote}
            tone="brand"
            variant="compact"
            label="Ventes totales"
            value={s?.revenue?.value}
            delta={s?.revenue?.delta}
            format="currency"
            deltaSuffix="vs période préc."
          />
          <MetricCard
            icon={LuTrendingUp}
            tone="success"
            variant="compact"
            label="Marge totale"
            value={s?.profit?.value}
            delta={s?.profit?.delta}
            format="currency"
            deltaSuffix="vs période préc."
          />
          <MetricCard
            icon={LuShoppingCart}
            tone="violet"
            variant="compact"
            label="Commandes"
            value={s?.orders_count?.value}
            delta={s?.orders_count?.delta}
            format="number"
            deltaSuffix="vs période préc."
          />
          <MetricCard
            icon={LuReceipt}
            tone="warning"
            variant="compact"
            label="Panier moyen"
            value={s?.average_order_value?.value}
            delta={s?.average_order_value?.delta}
            format="currency"
            deltaSuffix="vs période préc."
          />
        </div>
      </section>

      {/* ---------- Revenue + Profit ---------- */}
      <div className="mb-6">
        <RevenueProfitChart data={revenue} isLoading={revLoading} />
      </div>

      {/* ---------- Orders + cancel rate ---------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        <div className="lg:col-span-2">
          <OrdersStatusChart data={orders} isLoading={ordLoading} />
        </div>
        <CancelRateCard totals={orders?.totals} isLoading={ordLoading} />
      </div>

      {/* ---------- Top lists ---------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        <TopBarChart
          title="Top produits"
          subtitle="Par nombre de commandes"
          items={products?.items ?? []}
          dataKey="orders_count"
          labelKey="name"
          tone="brand"
          isLoading={prodLoading}
        />
        <TopBarChart
          title="Top catégories"
          subtitle="Par nombre de commandes"
          items={cats?.items ?? []}
          dataKey="orders_count"
          labelKey="name"
          tone="violet"
          isLoading={catLoading}
        />
      </div>

      {/* ---------- Top wilayas ---------- */}
      <TopBarChart
        title="Top wilayas"
        subtitle="Par nombre de commandes"
        items={wilayas?.items ?? []}
        dataKey="orders_count"
        labelKey="wilaya"
        tone="teal"
        isLoading={wilLoading}
        wilayaNames={wilayaNames}
      />
    </>
  )
}

/* ---------- Cancel rate card ---------- */

function CancelRateCard({ totals, isLoading }) {
  const rate = totals?.cancel_rate

  return (
    <section className="card p-5 flex flex-col">
      <h2 className="font-medium text-ink-900">Taux d'annulation</h2>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center text-sm text-ink-400">
          Chargement…
        </div>
      ) : rate == null ? (
        <div className="flex-1 flex items-center justify-center text-sm text-ink-400">
          Pas de données.
        </div>
      ) : (
        <>
          <div className="mt-4 flex items-baseline gap-2">
            <span
              className={`text-4xl font-semibold tabular-nums ${
                rate > 10 ? 'text-danger' : rate > 5 ? 'text-warning' : 'text-ink-900'
              }`}
            >
              {rate}%
            </span>
          </div>
          <p className="text-xs text-ink-600 mt-2">
            {totals.cancelled} annulée{totals.cancelled > 1 ? 's' : ''} sur {totals.total}
          </p>
        </>
      )}
    </section>
  )
}