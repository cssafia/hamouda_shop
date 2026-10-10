// src/components/product/ImageDropzone.jsx
import { useRef, useState, useEffect } from 'react'
import { Upload, Star, X, ChevronLeft, ChevronRight } from 'lucide-react'

const MAX = 10

export default function ImageDropzone({
  files = [],
  existingUrls = [],
  primaryIndex = 0,
  onFilesChange,
  onExistingUrlsChange,
  onPrimaryIndexChange,
}) {
  const inputRef = useRef(null)
  const [previews, setPreviews] = useState([])
  const [dragging, setDragging] = useState(false)

  /* Build preview URLs for new files */
  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f))
    setPreviews(urls)
    return () => urls.forEach((u) => URL.revokeObjectURL(u))
  }, [files])

  /* Combined list: existing first, then new (matches API contract) */
  const combined = [
    ...existingUrls.map((url, i) => ({
      kind: 'existing',
      url,
      index: i,
      key: `ex-${url}`,
    })),
    ...previews.map((url, i) => ({
      kind: 'new',
      url,
      index: i,
      key: `new-${files[i].name}-${files[i].size}-${i}`,
      file: files[i],
    })),
  ]

  const total = combined.length

  const pick = (newFiles) => {
    const list = Array.from(newFiles).slice(0, MAX - total)
    if (!list.length) return
    onFilesChange([...files, ...list])
  }

  const onDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files?.length) pick(e.dataTransfer.files)
  }

  const removeAt = (i) => {
    const item = combined[i]
    if (item.kind === 'existing') {
      const next = existingUrls.filter((_, idx) => idx !== item.index)
      onExistingUrlsChange(next)
    } else {
      const next = files.filter((_, idx) => idx !== item.index)
      onFilesChange(next)
    }
    if (primaryIndex >= total - 1) onPrimaryIndexChange(Math.max(0, total - 2))
  }

  const move = (i, dir) => {
    const j = i + dir
    if (j < 0 || j >= total) return

    // Reordering across existing/new is tricky; keep it simple: reorder within each kind
    const a = combined[i]
    const b = combined[j]
    if (a.kind !== b.kind) return

    const list = a.kind === 'existing' ? [...existingUrls] : [...files]
    ;[list[a.index], list[b.index]] = [list[b.index], list[a.index]]
    if (a.kind === 'existing') onExistingUrlsChange(list)
    else onFilesChange(list)

    if (primaryIndex === i) onPrimaryIndexChange(j)
    else if (primaryIndex === j) onPrimaryIndexChange(i)
  }

  return (
    <div className="space-y-3">
      {/* Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer rounded-card border-2 border-dashed p-5 text-center transition-colors ${
          dragging
            ? 'border-brand-500 bg-brand-50'
            : 'border-surface-border bg-surface-subtle hover:border-brand-500'
        } ${total >= MAX ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <Upload size={20} className="mx-auto text-ink-400 mb-2" />
        <p className="text-sm font-medium text-ink-900">
          Drop images here or click to browse
        </p>
        <p className="text-xs text-ink-600 mt-0.5">
          {total}/{MAX} · JPG, PNG · max 5 MB each
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            pick(e.target.files)
            e.target.value = ''
          }}
        />
      </div>

      {/* Preview grid */}
      {total > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {combined.map((item, i) => (
            <div
              key={item.key}
              className={`relative aspect-square rounded-control overflow-hidden border-2 ${
                primaryIndex === i
                  ? 'border-brand-500'
                  : 'border-surface-border'
              }`}
            >
              <img src={item.url} alt="" className="w-full h-full object-cover" />

              {/* Primary star */}
              <button
                type="button"
                onClick={() => onPrimaryIndexChange(i)}
                className={`absolute top-1 left-1 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                  primaryIndex === i
                    ? 'bg-brand-500 text-white'
                    : 'bg-white/90 text-ink-600 hover:text-brand-600'
                }`}
                title="Set as primary"
              >
                <Star size={12} fill={primaryIndex === i ? 'currentColor' : 'none'} />
              </button>

              {/* Remove */}
              <button
                type="button"
                onClick={() => removeAt(i)}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-white/90 text-ink-600 hover:text-danger flex items-center justify-center"
                title="Remove"
              >
                <X size={12} />
              </button>

              {/* Reorder */}
              <div className="absolute bottom-1 left-1 right-1 flex justify-between">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  className="w-6 h-6 rounded-full bg-white/90 text-ink-600 disabled:opacity-30 flex items-center justify-center"
                  aria-label="Move left"
                >
                  <ChevronLeft size={12} />
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === total - 1}
                  className="w-6 h-6 rounded-full bg-white/90 text-ink-600 disabled:opacity-30 flex items-center justify-center"
                  aria-label="Move right"
                >
                  <ChevronRight size={12} />
                </button>
              </div>

              {item.kind === 'new' && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[9px] font-semibold bg-ink-900/70 text-white px-1.5 py-0.5 rounded">
                  NEW
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}