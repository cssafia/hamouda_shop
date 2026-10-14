// src/components/ui/CopyButton.jsx
import { useState } from 'react'
import { LuCopy, LuCheck } from 'react-icons/lu'

export default function CopyButton({ value, className = '' }) {
  const [copied, setCopied] = useState(false)

  const copy = async (e) => {
    e?.stopPropagation?.()
    try {
      await navigator.clipboard.writeText(String(value))
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {}
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label="Copier"
      title={copied ? 'Copié !' : 'Copier'}
      className={`inline-flex items-center justify-center w-6 h-6 rounded text-ink-400 hover:text-ink-900 transition-colors ${className}`}
    >
      {copied ? <LuCheck size={13} className="text-success" /> : <LuCopy size={13} />}
    </button>
  )
}