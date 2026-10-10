export default function Button({
  variant = 'primary',
  loading = false,
  children,
  className = '',
  ...props
}) {
  const base = variant === 'primary' ? 'btn-primary' : 'btn-secondary';

  return (
    <button className={`${base} ${className}`} disabled={loading || props.disabled} {...props}>
      {loading ? 'Chargement...' : children}
    </button>
  );
}
