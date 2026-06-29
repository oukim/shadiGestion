import clsx from 'clsx'

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  className = '',
  disabled = false,
  loading = false,
  ...props
}) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0'

  const variants = {
    primary: 'bg-gradient-to-b from-accent-bright to-accent text-white shadow-glow-orange hover:shadow-glow-orange-lg hover:-translate-y-0.5',
    secondary: 'bg-surface border border-border-subtle text-text-secondary hover:text-text-primary hover:border-border-strong',
    danger: 'bg-danger/10 text-danger border border-danger/25 hover:bg-danger/20',
    ghost: 'bg-transparent text-text-secondary hover:text-text-primary hover:bg-elevated',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-5 py-3 text-sm',
  }

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={clsx(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {loading && (
        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
          <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      )}
      {children}
    </button>
  )
}