import { NavLink } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Logo } from '@/components/Logo'
import { useAuthStore } from '@/stores/authStore'
import { authApi } from '@/api/auth'

const navItems = [
  {
    to: '/',
    label: 'Tableau de bord',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    to: '/products',
    label: 'Produits',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="2" />
        <line x1="12" y1="18" x2="12.01" y2="18" />
      </svg>
    ),
  },
  {
    to: '/pos',
    label: 'Point de vente',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
    ),
  },
  {
    to: '/sales',
    label: 'Historique des ventes',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <line x1="8" y1="9" x2="16" y2="9" />
        <line x1="8" y1="13" x2="14" y2="13" />
      </svg>
    ),
  },
  {
    to: '/analytics',
    label: 'Analyses',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
]

export function Sidebar() {
  const user = useAuthStore((s) => s.user)
  const clearAuth = useAuthStore((s) => s.clearAuth)

  const initials = user?.name
    ?.split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U'

  const handleLogout = async () => {
    try {
      // Révoque le token côté serveur (sécurité)
      await authApi.logout()
    } catch {
      // Si l'API plante, on déconnecte quand même localement
    } finally {
      clearAuth()
      toast.success('Déconnecté avec succès')
      window.location.href = '/login'
    }
  }

  return (
    <aside className="w-[72px] border-r border-border-subtle bg-surface/60 backdrop-blur-md flex flex-col items-center py-6 sticky top-0 h-screen z-10">
      {/* Logo */}
      <div className="mb-8">
        <Logo size={40} />
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1.5 flex-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `relative w-11 h-11 rounded-[10px] grid place-items-center transition-all group ${
                isActive
                  ? 'text-accent-bright bg-accent-soft'
                  : 'text-text-tertiary hover:text-text-primary hover:bg-elevated'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className="w-5 h-5">{item.icon}</span>
                {isActive && (
                  <span className="absolute -left-4 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-accent rounded-r shadow-glow-orange" />
                )}
                {/* Tooltip */}
                <span className="absolute left-14 top-1/2 -translate-y-1/2 bg-elevated-2 border border-border-strong text-text-primary px-2.5 py-1.5 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Avatar + logout */}
      <div className="flex flex-col gap-2 items-center">
        <button
          onClick={handleLogout}
          title="Déconnexion"
          className="w-11 h-11 rounded-[10px] grid place-items-center text-text-tertiary hover:text-danger hover:bg-elevated transition-all"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
        <div
          className="w-9 h-9 rounded-full grid place-items-center text-white font-semibold text-xs cursor-pointer border-2 border-base ring-1 ring-border-strong"
          style={{ background: 'linear-gradient(135deg, #F39200, #4FB04F)' }}
          title={user?.name}
        >
          {initials}
        </div>
      </div>
    </aside>
  )
}