import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { analyticsApi } from '@/api/analytics'
import { formatPrice } from '@/lib/format'
import { YearComparisonChart } from '@/features/analytics/YearComparisonChart'
import { MonthlyTrendChart } from '@/features/analytics/MonthlyTrendChart'
import { MonthDetailModal } from '@/features/analytics/MonthDetailModal'
import { TopProductsAnalytics } from '@/features/analytics/TopProductsAnalytics'

const PERIODS = [
  { key: 12, label: '12 mois' },
  { key: 18, label: '18 mois' },
  { key: 24, label: '24 mois' },
]

export function AnalyticsPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState(12)
  const [selectedMonth, setSelectedMonth] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    analyticsApi
      .overview({ months: period })
      .then(({ data }) => {
        if (!cancelled) setData(data)
      })
      .catch(() => {
        if (!cancelled) toast.error('Erreur de chargement')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [period])

  const handleMonthClick = (year, month) => {
    setSelectedMonth({ year, month })
  }

  // Calcul de l'évolution annuelle
  const yearComp = data?.year_comparison
  let yearGrowth = 0
  if (yearComp) {
    const currentTotal = yearComp.months.reduce((s, m) => s + m.current_year, 0)
    const previousTotal = yearComp.months.reduce((s, m) => s + m.previous_year, 0)
    if (previousTotal > 0) {
      yearGrowth = ((currentTotal - previousTotal) / previousTotal) * 100
    } else if (currentTotal > 0) {
      yearGrowth = 100
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-end justify-between mb-7 gap-6 flex-wrap animate-fade-up">
        <div>
          <h1 className="text-[32px] font-semibold tracking-tight mb-1.5">
            Analyses <span className="text-accent">approfondies</span>
          </h1>
          <p className="text-text-secondary text-sm flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-accent-bright">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
            Explorez vos données de vente sur le temps long
          </p>
        </div>
        <div className="flex gap-1.5">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`px-3 py-2 text-xs rounded-full border transition-all ${
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

      {/* Comparaison annuelle */}
      <div
        className="bg-surface border border-border-subtle rounded-2xl p-6 mb-5 animate-fade-up"
        style={{ animationDelay: '50ms' }}
      >
        <div className="flex items-start justify-between mb-5 gap-4 flex-wrap">
          <div>
            <h3 className="text-[15px] font-semibold mb-0.5">
              Comparaison annuelle
            </h3>
            <p className="text-xs text-text-tertiary">
              {yearComp ? `${yearComp.current_year} vs ${yearComp.previous_year}` : 'Chargement...'}
            </p>
          </div>
          {!loading && yearComp && yearGrowth !== 0 && (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
              yearGrowth > 0
                ? 'bg-success/10 border-success/25 text-success'
                : 'bg-danger/10 border-danger/25 text-danger'
            }`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                {yearGrowth > 0 ? (
                  <polyline points="18 15 12 9 6 15" />
                ) : (
                  <polyline points="6 9 12 15 18 9" />
                )}
              </svg>
              <span className="font-mono font-semibold text-sm">
                {yearGrowth > 0 ? '+' : ''}{yearGrowth.toFixed(1)}%
              </span>
              <span className="text-xs">d'évolution</span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="h-72 bg-elevated rounded animate-pulse" />
        ) : (
          <YearComparisonChart data={yearComp} />
        )}
      </div>

      {/* Évolution mensuelle (interactive) */}
      <div
        className="bg-surface border border-border-subtle rounded-2xl p-6 mb-5 animate-fade-up"
        style={{ animationDelay: '100ms' }}
      >
        <div className="mb-5">
          <h3 className="text-[15px] font-semibold mb-0.5">
            Évolution mensuelle
          </h3>
          <p className="text-xs text-text-tertiary">
            {period} derniers mois · Cliquez sur un point pour voir le détail journalier
          </p>
        </div>

        {loading ? (
          <div className="h-72 bg-elevated rounded animate-pulse" />
        ) : (
          <MonthlyTrendChart data={data?.monthly_revenue ?? []} onMonthClick={handleMonthClick} />
        )}

        {/* Récap période */}
        {!loading && data?.monthly_revenue?.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-border-subtle">
            <PeriodKpi
              label="Total période"
              value={formatPrice(data.monthly_revenue.reduce((s, m) => s + m.revenue, 0))}
              accent
            />
            <PeriodKpi
              label="Moyenne mensuelle"
              value={formatPrice(
                data.monthly_revenue.reduce((s, m) => s + m.revenue, 0) / data.monthly_revenue.length
              )}
            />
            <PeriodKpi
              label="Total commandes"
              value={data.monthly_revenue.reduce((s, m) => s + m.orders, 0).toLocaleString('fr-FR')}
            />
          </div>
        )}
      </div>

      {/* Top produits par période */}
      <div className="animate-fade-up" style={{ animationDelay: '150ms' }}>
        <TopProductsAnalytics />
      </div>

      {/* Modale drill-down */}
      <MonthDetailModal
        open={!!selectedMonth}
        onClose={() => setSelectedMonth(null)}
        year={selectedMonth?.year}
        month={selectedMonth?.month}
      />
    </div>
  )
}

function PeriodKpi({ label, value, accent = false }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.06em] text-text-secondary font-medium mb-1.5">
        {label}
      </div>
      <div className={`font-mono text-lg font-semibold ${accent ? 'text-accent-bright' : 'text-text-primary'}`}>
        {value}
      </div>
    </div>
  )
}