import { useEffect } from 'react'

export function Modal({ open, onClose, title, subtitle, children, footer, size = 'md' }) {
  useEffect(() => {
    if (!open) return
    const handleEsc = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', handleEsc)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-3xl',
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-black/60 backdrop-blur-md animate-fade-up"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-surface border border-border-strong rounded-2xl w-full ${sizes[size]} max-h-[90vh] overflow-hidden flex flex-col shadow-2xl`}
      >
        {(title || subtitle) && (
          <header className="px-7 pt-6 pb-4 border-b border-border-subtle flex justify-between items-start">
            <div>
              {title && <h3 className="text-lg font-semibold tracking-tight">{title}</h3>}
              {subtitle && <p className="text-text-tertiary text-xs mt-1">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="text-text-tertiary hover:text-text-primary p-1 rounded hover:bg-elevated transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </header>
        )}

        <div className="px-7 py-6 overflow-y-auto flex-1">{children}</div>

        {footer && (
          <footer className="px-7 py-4 border-t border-border-subtle flex gap-2 justify-end">
            {footer}
          </footer>
        )}
      </div>
    </div>
  )
}