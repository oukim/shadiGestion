import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from '@/pages/LoginPage'
import { HomePage } from '@/pages/HomePage'
import { ProductsPage } from '@/pages/ProductsPage'
import { PosPage } from '@/pages/PosPage'
import { WarrantyPage } from '@/pages/WarrantyPage'
import { AnalyticsPage } from '@/pages/AnalyticsPage'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { ProtectedRoute } from '@/features/auth/ProtectedRoute'
import { Toaster } from '@/components/ui/Toaster'
import { SalesHistoryPage } from '@/pages/SalesHistoryPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/pos" element={<PosPage />} />
            <Route path="/sales" element={<SalesHistoryPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/warranty/:warrantyNumber" element={<WarrantyPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  )
}

export default App