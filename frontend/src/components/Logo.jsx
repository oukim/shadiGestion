export function Logo({ size = 40, className = '' }) {
  return (
    <div
      className={`rounded-xl bg-gradient-to-br from-accent-bright to-accent grid place-items-center shadow-glow-orange ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        strokeWidth="2"
        style={{ width: size * 0.55, height: size * 0.55 }}
      >
        <rect x="7.5" y="3" width="9" height="14" rx="2" stroke="white" />
        <line x1="10.5" y1="14.5" x2="13.5" y2="14.5" stroke="white" strokeWidth="1.5" />
        <path d="M3 17 Q12 22 21 15" stroke="#4FB04F" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  )
}

export function BrandText({ size = 'md' }) {
  const sizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
  }
  return (
    <h1 className={`font-bold tracking-tight ${sizes[size]}`}>
      <span className="text-accent italic">Shadi</span>
      <span className="text-text-primary">Phone</span>
    </h1>
  )
}