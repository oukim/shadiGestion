import { Outlet } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { Sidebar } from './Sidebar'
import { ForcePasswordChangeModal } from '@/features/auth/ForcePasswordChangeModal'

export function DashboardLayout() {
  const user = useAuthStore((state) => state.user)
  const mustChangePassword = user?.must_change_password

  return (
    <div className="grid grid-cols-[72px_1fr] min-h-screen relative z-10">
      <Sidebar />
      <main className="px-9 py-7 pb-12 min-w-0">
        <Outlet />
      </main>

      {/* Modal forcée — bloque l'app tant que le mot de passe n'est pas changé */}
      {mustChangePassword && <ForcePasswordChangeModal />}
    </div>
  )
}