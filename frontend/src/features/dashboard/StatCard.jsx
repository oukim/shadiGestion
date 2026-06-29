import clsx from 'clsx'

function TrendArrow({ direction }) {
  return direction === 'up' ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="w-2.5 h-2.5">
      <polyline points="18 15 12 9 6 15" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="w-2.5 h-2.5">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

export function StatCard({
  label,
  value,
  trend,
  trendDirection = 'up',
  subtitle,
  icon,
  featured = false,
  animationDelay = 0,
}) {
  return (
    <div
      className={clsx(
        'relative overflow-hidden rounded-2xl p-5 border transition-all hover:-translate-y-0.5 animate-fade-up',
        featured
          ? 'border-accent/25 bg-gradient-to-b from-accent-soft via-surface to-surface'
          : 'border-border-subtle bg-surface hover:border-border-strong'
      )}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      {/* Halo orange pour la card featured */}
      {featured && (
        <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none opacity-40">
          <div className="w-full h-full bg-[radial-gradient(circle,rgba(243,146,0,0.45)_0%,transparent_70%)]" />
        </div>
      )}

      <div className="relative z-10">
        {/* Header : label + icône */}
        <div className="flex items-center justify-between mb-3.5">
          <span className="text-[11px] text-text-secondary uppercase tracking-[0.06em] font-medium">
            {label}
          </span>
          <div
            className={clsx(
              'w-8 h-8 rounded-lg grid place-items-center',
              featured
                ? 'bg-accent text-white shadow-glow-orange'
                : 'bg-elevated text-accent-bright'
            )}
          >
            {icon}
          </div>
        </div>

        {/* Valeur principale */}
        <div className="font-mono text-[26px] font-semibold leading-none mb-2 tracking-tight">
          {value}
        </div>

        {/* Trend + subtitle */}
        {(trend || subtitle) && (
          <div className="flex items-center gap-2 text-[11px]">
            {trend && (
              <span
                className={clsx(
                  'inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-mono font-medium',
                  trendDirection === 'up'
                    ? 'bg-success/12 text-success'
                    : 'bg-danger/12 text-danger'
                )}
              >
                <TrendArrow direction={trendDirection} />
                {trend}
              </span>
            )}
            {subtitle && <span className="text-text-tertiary">{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  )
}