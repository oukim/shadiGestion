import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { analyticsApi } from '@/api/analytics'
import { formatPrice } from '@/lib/format'

const PERIODS = [
  { key: 'this_month', label: 'Ce mois', getRange: () => {
      const now = new Date()
      const from = new Date(now.getFullYear(), now.getMonth(), 1)
      return { from: from.toISOString().slice(0, 10), to: null }
    }
  },
  { key: 'last_month', label: 'Mois dernier', getRange: () => {
      const now = new Date()
      const from = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const to = new Date(now.getFullYear(), now.getMonth(), 0)
      return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) }
    }
  },
  { key: 'this_year', label: 'Cette année', getRange: () => {
      const now = new Date()
      const from = new Date(now.getFullYear(), 0, 1)
      return { from: from.toISOString().slice(0, 10), to: null }
    }
  },
  { key: 'all', label: 'Toutes périodes', getRange: () => ({ from: null, to: null }) },
]

export function TopProductsAnalytics() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('this_month')

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    const selectedPeriod = PERIODS.find((p) => p.key === period)
    const range = selectedPeriod.getRange()
    const params = { limit: 10 }
    if (range.from) params.from = range.from
    if (range.to) params.to = range.to

    analyticsApi
      .topProducts(params)
      .then(({ data }) => {
        if (!cancelled) setProducts(data.data || [])
      })
      .catch(() => {
        if (!cancelled) toast.error('Erreur de chargement')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [period])

  const maxRevenue = products.length > 0 ? Math.max(...products.map((p) => p.revenue)) : 1

  return (
    <div className="bg-surface border border-border-subtle rounded-2xl p-6">
      {/* Header avec filtres */}
      <div className="flex items-start justify-between mb-5 gap-4 flex-wrap">
        <div>
          <h3 className="text-[15px] font-semibold mb-0.5">Top produits</h3>
          <p className="text-xs text-text-tertiary">Classés par revenu généré</p>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
                period === p.key
                  ? 'bg-accent-soft border-accent/30 text-accent-bright'
                  : 'bg-surface border-border-subtle text-text-secondary hover:text-text-primary hover:border-border-strong'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Liste */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 bg-elevated rounded-lg animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-10 text-text-tertiary text-sm">
          Aucune vente sur cette période
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((p, idx) => {
            const percent = (p.revenue / maxRevenue) * 100
            return (
              <div
                key={p.product_id}
                className="grid grid-cols-[36px_1fr_auto] gap-3 items-center"
              >
                <div
                  className={`w-9 h-9 rounded-lg grid place-items-center font-mono text-xs font-semibold border ${
                    idx === 0
                      ? 'bg-accent-soft text-accent-bright border-accent/20'
                      : idx < 3
                      ? 'bg-elevated text-text-primary border-border-subtle'
                      : 'bg-elevated text-text-secondary border-border-subtle'
                  }`}
                >
                  {String(idx + 1).padStart(2, '0')}
                </div>
                <div className="min-w-0">
                  <div className="text-[13px] font-medium mb-1.5 truncate">
                    {p.name}
                  </div>
                  <div className="h-1 bg-elevated rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-accent to-accent-bright rounded-full transition-all"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <div className="text-[10px] font-mono text-text-tertiary mt-1">
                    {p.units_sold} unité{p.units_sold > 1 ? 's' : ''} vendue{p.units_sold > 1 ? 's' : ''}
                  </div>
                </div>
                <div className="font-mono text-[13px] font-semibold whitespace-nowrap">
                  {formatPrice(p.revenue)}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}