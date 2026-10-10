import {
  LuCircleCheck,
  LuCircleX,
  LuTriangleAlert,
  LuInfo,
  LuX,
} from 'react-icons/lu';

const VARIANTS = {
  success: {
    wrap: 'border-success/20 bg-success/5 text-success',
    Icon: LuCircleCheck,
    role: 'status',
  },
  error: {
    wrap: 'border-danger/20 bg-danger/5 text-danger',
    Icon: LuCircleX,
    role: 'alert',
  },
  warning: {
    wrap: 'border-warning/20 bg-warning/5 text-warning',
    Icon: LuTriangleAlert,
    role: 'alert',
  },
  info: {
    wrap: 'border-brand-500/20 bg-brand-50 text-brand-700',
    Icon: LuInfo,
    role: 'status',
  },
};

export default function Alert({
  variant = 'info',
  title,
  children,
  onDismiss,
  className = '',
}) {
  const { wrap, Icon, role } = VARIANTS[variant] ?? VARIANTS.info;

  return (
    <div
      role={role}
      className={`flex items-start gap-3 rounded-control border px-3.5 py-2.5 text-sm ${wrap} ${className}`}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <div className="flex-1 min-w-0">
        {title && <p className="font-medium">{title}</p>}
        {children && (
          <div className={title ? 'mt-0.5 opacity-90' : ''}>{children}</div>
        )}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Fermer"
          className="opacity-60 hover:opacity-100 transition-opacity"
        >
          <LuX className="h-4 w-4" aria-hidden />
        </button>
      )}
    </div>
  );
}