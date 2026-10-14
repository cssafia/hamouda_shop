// src/pages/admin/Dashboard/Dashboard.jsx
import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  LuCircleAlert, LuPackage, LuBox, LuInbox,
  LuShoppingCart, LuCircleCheck, LuTruck, LuTriangleAlert, LuBell,
  LuBanknote, LuTrendingUp, LuReceipt,
} from 'react-icons/lu'

import { useAuthStore } from '../../../features/auth/useAuthStore'
import {
  useDashboardPriority,
  useDashboardToday,
  useDashboardRevenue,
} from '../../../features/dashboard/useDashboard'
import { useAdminNotifications } from '../../../features/notifications/useAdminNotifications'

import Skeleton from '../../../components/ui/Skeleton'
import PriorityCard from '../../../components/admin/analytics/PriorityCard'
import MetricCard from '../../../components/admin/analytics/MetricCard'
import DashboardChart from '../../../components/admin/analytics/DashboardChart'

/* ---------- helpers ---------- */

function greeting(hour) {
  return hour < 18 ? 'Bonjour' : 'Bonsoir'
}

function summarize(priority) {
  if (!priority) return null
  const { pending_orders, confirmed_orders, stock_issues } = priority
  if (pending_orders > 0) {
    return `${pending_orders} commande${pending_orders > 1 ? 's' : ''} t'attend${pending_orders > 1 ? 'ent' : ''}.`
  }
  if (confirmed_orders > 0) {
    return `${confirmed_orders} commande${confirmed_orders > 1 ? 's' : ''} à expédier.`
  }
  if (stock_issues > 0) {
    return `${stock_issues} produit${stock_issues > 1 ? 's' : ''} en rupture.`
  }
  return 'Tout est à jour.'
}

function deltaPair(current, previous) {
  if (current == null || previous == null) return null
  if (previous === 0) {
    return current === 0
      ? null
      : { current, previous: 0, pct: null, direction: 'up' }
  }
  const diff = current - previous
  const pct = (diff / previous) * 100
  return {
    current,
    previous,
    pct,
    direction: diff > 0 ? 'up' : diff < 0 ? 'down' : 'flat',
  }
}

const PRIORITY_CONFIG = [
  {
    key: 'pending_orders',
    label: 'À confirmer',
    icon: LuCircleAlert,
    tone: 'warning',
    to: '/admin/orders?status=pending',
  },
  {
    key: 'confirmed_orders',
    label: 'À expédier',
    icon: LuPackage,
    tone: 'brand',
    to: '/admin/orders?status=confirmed',
  },
  {
    key: 'stock_issues',
    label: 'Ruptures',
    icon: LuBox,
    tone: 'danger',
    to: '/admin/stock?stock_status=out',
  },
  {
    key: 'new_requests',
    label: 'Demandes',
    icon: LuInbox,
    tone: 'dark',
    to: '/admin/requests',
  },
]

/* ---------- page ---------- */

export default function Dashboard() {
  const admin = useAuthStore((s) => s.admin)

  const { data: priority } = useDashboardPriority()
  const { data: today } = useDashboardToday()

  const [period, setPeriod] = useState('7d')
  const [metric, setMetric] = useState('revenue')
  const { data: revenue } = useDashboardRevenue({ period, metric })

  const { data: notificationsData } = useAdminNotifications({ limit: 8 })

  const hour = new Date().getHours()

  const visiblePriorities = useMemo(() => {
    if (!priority) return []
    return PRIORITY_CONFIG
      .filter((c) => priority[c.key] > 0)
      .map((c) => ({ ...c, count: priority[c.key] }))
  }, [priority])

  const everythingClear = priority && visiblePriorities.length === 0

  return (
    <>
      {/* ---------- Greeting ---------- */}
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-semibold text-ink-900">
          {greeting(hour)}
          {admin?.name ? `, ${admin.name.split(' ')[0]}` : ''} 👋
        </h1>
        {priority ? (
          <p
            className={`text-sm mt-1.5 ${
              everythingClear ? 'text-success' : 'text-ink-600'
            }`}
          >
            {summarize(priority)}
          </p>
        ) : (
          <Skeleton className="h-4 w-56 mt-2" />
        )}
      </div>

      {/* ---------- Priority ---------- */}
      {priority && (
        <>
          {everythingClear ? (
            <div className="card p-4 border-l-[3px] border-l-success mb-6">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-control bg-success/10 text-success flex items-center justify-center">
                  <LuCircleCheck size={20} />
                </span>
                <div>
                  <p className="text-sm font-medium text-ink-900">
                    Tout est à jour
                  </p>
                  <p className="text-xs text-ink-600 mt-0.5">
                    Profite de ta journée.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              {visiblePriorities.map((c) => (
                <PriorityCard
                  key={c.key}
                  icon={c.icon}
                  count={c.count}
                  label={c.label}
                  tone={c.tone}
                  to={c.to}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* ---------- Today ---------- */}
      <div className="mb-6">
        <h2 className="text-sm font-medium text-ink-600 mb-3">Aujourd'hui</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard
            icon={LuBanknote}
            tone="brand"
            label="Ventes"
            value={today?.today?.revenue}
            delta={deltaPair(
              today?.today?.revenue,
              today?.yesterday?.revenue
            )}
            format="currency"
          />
          <MetricCard
            icon={LuShoppingCart}
            tone="violet"
            label="Commandes"
            value={today?.today?.orders_count}
            delta={deltaPair(
              today?.today?.orders_count,
              today?.yesterday?.orders_count
            )}
            format="number"
          />
          <MetricCard
            icon={LuTrendingUp}
            tone="success"
            label="Marge"
            value={today?.today?.profit}
            delta={deltaPair(today?.today?.profit, today?.yesterday?.profit)}
            format="currency"
          />
          <MetricCard
            icon={LuReceipt}
            tone="warning"
            label="Panier moyen"
            value={today?.today?.average_order_value}
            delta={deltaPair(
              today?.today?.average_order_value,
              today?.yesterday?.average_order_value
            )}
            format="currency"
          />
        </div>
      </div>

      {/* ---------- Chart ---------- */}
      <div className="mb-6">
        <DashboardChart
          data={revenue}
          period={period}
          metric={metric}
          onPeriodChange={setPeriod}
          onMetricChange={setMetric}
        />
        <Link
          to={`/admin/reports?period=${period}&metric=${metric}`}
          className="inline-flex items-center gap-1.5 text-sm text-brand-600 hover:underline mt-3"
        >
          Voir le rapport complet →
        </Link>
      </div>

      {/* ---------- Activity ---------- */}
      <ActivityFeed items={notificationsData?.items ?? []} />
    </>
  )
}

/* ---------- Activity feed ---------- */

const ACTIVITY_ICONS = {
  new_order:       { Icon: LuShoppingCart,  tone: 'text-brand-600 bg-brand-50' },
  order_confirmed: { Icon: LuCircleCheck,   tone: 'text-success bg-success/10' },
  order_shipped:   { Icon: LuTruck,         tone: 'text-brand-700 bg-brand-50' },
  order_cancelled: { Icon: LuCircleAlert,   tone: 'text-danger bg-danger/10' },
  low_stock:       { Icon: LuTriangleAlert, tone: 'text-warning bg-warning/10' },
  new_request:     { Icon: LuBell,          tone: 'text-violet-600 bg-violet-50' },
}

function ActivityFeed({ items }) {
  return (
    <section className="card p-5">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="font-medium text-ink-900">Activité récente</h2>
        <Link
          to="/admin/notifications"
          className="text-xs text-brand-600 hover:underline"
        >
          Voir tout →
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-ink-400 italic py-4">
          Aucune activité récente.
        </p>
      ) : (
        <ul className="divide-y divide-surface-border -my-2">
          {items.slice(0, 6).map((n) => {
            const cfg = ACTIVITY_ICONS[n.type] ?? ACTIVITY_ICONS.new_order
            const { Icon } = cfg
            return (
              <li key={n.id} className="py-3 flex items-start gap-3">
                <span
                  className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${cfg.tone}`}
                >
                  <Icon size={14} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-ink-900 truncate">{n.title}</p>
                  {n.message && (
                    <p className="text-xs text-ink-600 truncate mt-0.5">
                      {n.message}
                    </p>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}