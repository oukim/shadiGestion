import { forwardRef } from 'react'
import clsx from 'clsx'

export const Input = forwardRef(function Input(
  { label, hint, error, prefix, className, type = 'text', ...props },
  ref
) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-[11px] font-medium text-text-secondary uppercase tracking-[0.06em] flex justify-between items-center">
          <span>{label}</span>
          {hint && <span className="text-text-tertiary normal-case tracking-normal">{hint}</span>}
        </label>
      )}
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary font-mono text-sm pointer-events-none">
            {prefix}
          </span>
        )}
        <input
          ref={ref}
          type={type}
          className={clsx(
            'w-full bg-elevated border border-border-subtle rounded-lg px-3 py-2.5 text-sm text-text-primary outline-none transition-all',
            'focus:border-accent focus:ring-2 focus:ring-accent/30 focus:bg-elevated-2',
            'placeholder:text-text-tertiary',
            prefix && 'pl-8 font-mono',
            error && 'border-danger',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-danger text-xs">{error}</p>}
    </div>
  )
})

export const Select = forwardRef(function Select(
  { label, error, children, className, ...props },
  ref
) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-[11px] font-medium text-text-secondary uppercase tracking-[0.06em]">
          {label}
        </label>
      )}
      <select
        ref={ref}
        className={clsx(
          'w-full bg-elevated border border-border-subtle rounded-lg px-3 py-2.5 pr-9 text-sm text-text-primary outline-none transition-all cursor-pointer appearance-none',
          'focus:border-accent focus:ring-2 focus:ring-accent/30 focus:bg-elevated-2',
          error && 'border-danger',
          className
        )}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238A93A6' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")",
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 13px center',
        }}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-danger text-xs">{error}</p>}
    </div>
  )
})

export const Textarea = forwardRef(function Textarea(
  { label, error, className, ...props },
  ref
) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-[11px] font-medium text-text-secondary uppercase tracking-[0.06em]">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        className={clsx(
          'w-full bg-elevated border border-border-subtle rounded-lg px-3 py-2.5 text-sm text-text-primary outline-none transition-all min-h-[70px] resize-y',
          'focus:border-accent focus:ring-2 focus:ring-accent/30 focus:bg-elevated-2',
          'placeholder:text-text-tertiary',
          error && 'border-danger',
          className
        )}
        {...props}
      />
      {error && <p className="text-danger text-xs">{error}</p>}
    </div>
  )
})