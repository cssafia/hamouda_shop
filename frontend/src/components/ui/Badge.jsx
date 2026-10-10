// src/components/ui/Badge.jsx
export default function Badge({ children }) {
  if (children == null || children === 0) return null
  return (
    <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[11px] font-semibold rounded-full bg-brand-500 text-white">
      {children}
    </span>
  )
}