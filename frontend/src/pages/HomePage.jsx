import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/stores/authStore'
import { analyticsApi } from '@/api/analytics'
import { formatPrice } from '@/lib/format'
import { Button } from '@/components/ui/Button'
import { StatCard } from '@/features/dashboard/StatCard'
import { SalesChart } from '@/features/dashboard/SalesChart'
import { TopProducts } from '@/features/dashboard/TopProducts'
import { RecentSales } from '@/features/dashboard/RecentSales'

export function HomePage() {
  const user = useAuthStore((s) => s.user)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    analyticsApi
      .overview({ months: 12 })
      .then(({ data }) => {
        if (!cancelled) setData(data)
      })
      .catch(() => {
        if (!cancelled) toast.error('Impossible de charger les statistiques')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const summary = data?.summary
  const change = summary?.revenue_change_percent ?? 0
  const trendDir = change >= 0 ? 'up' : 'down'

  return (
    <div>
      {/* En-tête */}
      <div className="flex items-end justify-between mb-7 gap-6 flex-wrap animate-fade-up">
        <div>
          <h1 className="text-[32px] font-semibold tracking-tight mb-1.5">
            Bonjour, <span className="text-accent">{user?.name?.split(' ')[0]}</span>
          </h1>
          <p className="text-text-secondary text-sm flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
           {loading
  ? 'Chargement des statistiques...'
  : !summary?.current_month.orders
  ? 'Commencez à enregistrer vos ventes pour voir vos statistiques ici'
  : change !== 0
  ? `Vos ventes sont ${change > 0 ? 'en hausse' : 'en baisse'} de ${Math.abs(change)}% ce mois-ci`
  : 'Aperçu en temps réel de votre boutique'}
          </p>
        </div>
        <Link to="/pos">
          <Button variant="primary" size="lg">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nouvelle vente
          </Button>
        </Link>
      </div>

      {/* 4 Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-7">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="bg-surface border border-border-subtle rounded-2xl h-[140px] animate-pulse" />
          ))
        ) : (
          <>
            <StatCard
              featured
              label="Revenu du mois"
              value={formatPrice(summary?.current_month.revenue ?? 0)}
              trend={`${change > 0 ? '+' : ''}${change}%`}
              trendDirection={trendDir}
              subtitle="vs mois dernier"
              animationDelay={50}
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              }
            />
            <StatCard
              label="Commandes"
              value={(summary?.current_month.orders ?? 0).toLocaleString('fr-FR')}
              subtitle={`Année : ${summary?.current_year.orders ?? 0}`}
              animationDelay={100}
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
              }
            />
            <StatCard
              label="Panier moyen"
              value={formatPrice(summary?.average_order_value ?? 0)}
              subtitle="ce mois-ci"
              animationDelay={150}
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M9 9l3 3 3-3" />
                </svg>
              }
            />
            <StatCard
              label="Revenu annuel"
              value={formatPrice(summary?.current_year.revenue ?? 0)}
              subtitle={summary?.current_year.label}
              animationDelay={200}
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                </svg>
              }
            />
          </>
        )}
      </div>

      {/* Graphique + Top produits */}
      <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-4 mb-7">
        <div
          className="bg-surface border border-border-subtle rounded-2xl p-6 animate-fade-up"
          style={{ animationDelay: '250ms' }}
        >
          <div className="mb-5">
            <h3 className="text-[15px] font-semibold mb-0.5">Évolution des ventes</h3>
            <p className="text-xs text-text-tertiary">12 derniers mois</p>
          </div>
          {loading ? (
            <div className="h-64 bg-elevated rounded animate-pulse" />
          ) : (
            <SalesChart data={data?.monthly_revenue ?? []} />
          )}
        </div>

        <div
          className="bg-surface border border-border-subtle rounded-2xl p-6 animate-fade-up"
          style={{ animationDelay: '300ms' }}
        >
          <div className="mb-5">
            <h3 className="text-[15px] font-semibold mb-0.5">Top produits</h3>
            <p className="text-xs text-text-tertiary">Ce mois-ci</p>
          </div>
          {loading ? (
            <div className="flex flex-col gap-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-elevated rounded animate-pulse" />
              ))}
            </div>
          ) : (
            <TopProducts products={data?.top_products ?? []} />
          )}
        </div>
      </div>

      {/* Activité récente */}
      <div
        className="bg-surface border border-border-subtle rounded-2xl p-6 animate-fade-up"
        style={{ animationDelay: '350ms' }}
      >
        <div className="mb-5">
          <h3 className="text-[15px] font-semibold mb-0.5">Activité récente</h3>
          <p className="text-xs text-text-tertiary">Dernières transactions</p>
        </div>
        <RecentSales />
      </div>
    </div>
  )
}