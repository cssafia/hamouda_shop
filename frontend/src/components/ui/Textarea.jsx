// src/components/ui/Textarea.jsx
export default function Textarea({ className = '', rows = 4, ...rest }) {
  return (
    <textarea
      rows={rows}
      className={`input min-h-[100px] resize-y ${className}`}
      {...rest}
    />
  )
}