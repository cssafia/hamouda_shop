// src/pages/admin/Reports/Reports.jsx
import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  LuBanknote, LuTrendingUp, LuShoppingCart, LuReceipt, LuSparkles,
} from 'react-icons/lu'

import {
  useReportSummary,
  useReportRevenue,
  useReportOrders,
  useReportTopProducts,
  useReportTopCategories,
  useReportTopWilayas,
} from '../../../features/reports/useReports'
import { rangeFromPreset } from '../../../utils/analytics'

import PageHeader from '../../../components/ui/PageHeader'
import RangePicker from '../../../components/admin/analytics/RangePicker'
import MetricCard from '../../../components/admin/analytics/MetricCard'
import InsightBanner from '../../../components/admin/analytics/InsightBanner'
import RevenueProfitChart from '../../../components/admin/analytics/RevenueProfitChart'
import CancelRateCard from '../../../components/admin/analytics/CancelRateCard'
import TopBarChart from '../../../components/admin/analytics/TopBarChart'
import DonutChart from '../../../components/admin/analytics/DonutChart'

const ORDER_STATUS_COLORS = {
  pending:   '#d97706',   // amber
  confirmed: '#2563eb',   // brand-500
  shipped:   '#1d4ed8',   // brand-700
  completed: '#16a34a',   // success
  cancelled: '#94a3b8',   // ink-400
  returned:  '#64748b',   // ink-600
}

export default function Reports() {
  const [params, setParams] = useSearchParams()

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
  const { data: summary,    isLoading: sumLoading }  = useReportSummary(range)
  const { data: revenue,    isLoading: revLoading }  = useReportRevenue(range)
  const { data: orders,     isLoading: ordLoading }  = useReportOrders(range)
  const { data: products,   isLoading: prodLoading } = useReportTopProducts({ ...range, limit: 10 })
  const { data: categories, isLoading: catLoading }  = useReportTopCategories({ ...range, limit: 10 })
  const { data: wilayas,    isLoading: wilLoading }  = useReportTopWilayas({ ...range, limit: 10 })

  const s = summary?.summary

  /* ---------- Orders donut data ---------- */
  const ordersDonut = useMemo(() => {
    const b = orders?.breakdown
    if (!b) return []
    return [
      { name: 'En attente', value: b.pending   ?? 0, color: ORDER_STATUS_COLORS.pending },
      { name: 'Confirmées', value: b.confirmed ?? 0, color: ORDER_STATUS_COLORS.confirmed },
      { name: 'Expédiées',  value: b.shipped   ?? 0, color: ORDER_STATUS_COLORS.shipped },
      { name: 'Livrées',    value: b.completed ?? 0, color: ORDER_STATUS_COLORS.completed },
      { name: 'Annulées',   value: b.cancelled ?? 0, color: ORDER_STATUS_COLORS.cancelled },
      { name: 'Retournées', value: b.returned  ?? 0, color: ORDER_STATUS_COLORS.returned },
    ].filter((s) => s.value > 0)
  }, [orders])

  return (
    <>
      <PageHeader
        title="Rapports"
        description="Analyse de ton activité sur une période."
      />

      <div className="space-y-5">
        {/* Range picker */}
        <RangePicker value={range} onChange={updateRange} />

        {/* Insight banner (frontend-computed) */}
        <InsightBanner summary={s} orders={orders} />

        {/* Summary grid — 5 metric cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <MetricCard
            icon={LuBanknote}
            tone="brand"
            variant="compact"
            label="CA total"
            value={s?.revenue?.value}
            delta={s?.revenue?.delta}
            format="currency"
            deltaSuffix="vs préc."
          />
          <MetricCard
            icon={LuTrendingUp}
            tone="success"
            variant="compact"
            label="Marge"
            value={s?.profit?.value}
            delta={s?.profit?.delta}
            format="currency"
            deltaSuffix="vs préc."
          />
          <MetricCard
            icon={LuShoppingCart}
            tone="violet"
            variant="compact"
            label="Commandes"
            value={s?.orders_count?.value}
            delta={s?.orders_count?.delta}
            format="number"
            deltaSuffix="vs préc."
          />
          <MetricCard
            icon={LuReceipt}
            tone="warning"
            variant="compact"
            label="Panier moyen"
            value={s?.average_order_value?.value}
            delta={s?.average_order_value?.delta}
            format="currency"
            deltaSuffix="vs préc."
          />
          <MetricCard
            icon={LuSparkles}
            tone="teal"
            variant="compact"
            label="Services terminés"
            value={s?.services_completed?.value}
            delta={s?.services_completed?.delta}
            format="number"
            deltaSuffix="vs préc."
          />
        </div>

        {/* Revenue + profit chart */}
        <RevenueProfitChart data={revenue} isLoading={revLoading} />

        {/* Orders donut + cancel rate */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <DonutChart
              title="Répartition des commandes"
              items={ordersDonut}
              nameKey="name"
              valueKey="value"
              total={orders?.total ?? 0}
              colors="auto"
              valueFormat="count"
              isLoading={ordLoading}
              emptyLabel="Pas de commandes sur cette période."
            />
          </div>
          <CancelRateCard data={orders} isLoading={ordLoading} />
        </div>

        {/* Top products — horizontal bars */}
        <TopBarChart
          title="Top produits"
          subtitle="Par nombre de commandes"
          items={products?.items ?? []}
          dataKey="orders_count"
          labelKey="name"
          tone="brand"
          isLoading={prodLoading}
        />

        {/* Two donuts side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <DonutChart
            title="Ventes par catégorie"
            items={categories?.items ?? []}
            nameKey="name"
            valueKey="revenue"
            total={categories?.total ?? 0}
            tone="brand"
            isLoading={catLoading}
          />
          <DonutChart
            title="Ventes par wilaya"
            items={wilayas?.items ?? []}
            nameKey="wilaya"
            valueKey="revenue"
            total={wilayas?.total ?? 0}
            tone="violet"
            isLoading={wilLoading}
          />
        </div>
      </div>
    </>
  )
}