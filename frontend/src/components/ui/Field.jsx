// src/components/ui/Field.jsx
export default function Field({ label, htmlFor, required, error, hint, children }) {
  return (
    <div>
      {label && (
        <label htmlFor={htmlFor} className="label">
          {label}
          {required && <span className="text-danger ml-0.5">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="form-error">{error}</p>
      ) : hint ? (
        <p className="text-xs text-ink-400 mt-1">{hint}</p>
      ) : null}
    </div>
  )
}