// src/components/ui/Select.jsx
import { ChevronDown } from 'lucide-react'

export default function Select({ className = '', children, ...rest }) {
  return (
    <div className="relative">
      <select
        className={`input appearance-none pr-10 ${className}`}
        {...rest}
      >
        {children}
      </select>
      <ChevronDown
        size={16}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none"
      />
    </div>
  )
}