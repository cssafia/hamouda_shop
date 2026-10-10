// src/components/ui/Skeleton.jsx
export default function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-surface-border rounded-control ${className}`} />
}