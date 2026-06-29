import clsx from 'clsx'

export function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-elevated text-text-secondary border-border-subtle',
    success: 'bg-success/15 text-success border-success/25',
    warning: 'bg-warning/15 text-warning border-warning/25',
    danger: 'bg-danger/15 text-danger border-danger/25',
    accent: 'bg-accent-soft text-accent-bright border-accent/30',
  }

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 px-2 py-1 text-[10px] font-mono font-semibold uppercase tracking-[0.04em] border rounded',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}