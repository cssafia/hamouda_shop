// src/components/admin/analytics/ChartTooltip.jsx
export default function ChartTooltip({ children }) {
  return (
    <div className="rounded-control border border-surface-border bg-white px-3 py-2 shadow-card text-xs">
      {children}
    </div>
  )
}