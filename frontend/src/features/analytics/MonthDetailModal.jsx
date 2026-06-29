import { useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import toast from 'react-hot-toast'
import { Modal } from '@/components/ui/Modal'
import { analyticsApi } from '@/api/analytics'
import { formatPrice, formatDate } from '@/lib/format'

function DayTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const data = payload[0].payload

  return (
    <div className="bg-elevated-2 border border-border-strong rounded-lg px-3 py-2 text-xs shadow-2xl">
      <div className="font-mono text-text-tertiary text-[10px] uppercase mb-1">
        {formatDate(data.date, 'EEEE d MMMM')}
      </div>
      <div className="font-mono font-semibold text-text-primary text-sm">
        {formatPrice(data.revenue)}
      </div>
      <div className="text-text-tertiary text-[10px] mt-0.5">
        {data.orders} commande{data.orders > 1 ? 's' : ''}
      </div>
    </div>
  )
}

export function MonthDetailModal({ open, onClose, year, month }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open || !year || !month) return

    setLoading(true)
    setData(null)

    analyticsApi
      .monthDetail(year, month)
      .then(({ data }) => setData(data.data))
      .catch(() => toast.error('Erreur de chargement du mois'))
      .finally(() => setLoading(false))
  }, [open, year, month])

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={data ? `Détail de ${data.label}` : 'Chargement...'}
      subtitle={data ? `${data.total_orders} commandes · ${formatPrice(data.total_revenue)}` : null}
    >
      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-elevated rounded-lg animate-pulse" />
            ))}
          </div>
          <div className="h-64 bg-elevated rounded-lg animate-pulse" />
        </div>
      ) : data ? (
        <div className="space-y-5">
          {/* KPIs du mois */}
          <div className="grid grid-cols-3 gap-3">
            <KpiBox
              label="Revenu total"
              value={formatPrice(data.total_revenue)}
              color="accent"
            />
            <KpiBox
              label="Commandes"
              value={data.total_orders.toLocaleString('fr-FR')}
            />
            <KpiBox
              label="Moyenne / jour"
              value={formatPrice(data.average_per_day)}
            />
          </div>

          {/* Meilleur jour */}
          {data.best_day && data.best_day.revenue > 0 && (
            <div className="bg-accent-soft border border-accent/20 rounded-lg p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent grid place-items-center shadow-glow-orange">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-[11px] uppercase tracking-wider text-text-secondary mb-0.5">
                  Meilleur jour
                </div>
                <div className="text-sm font-medium">
                  {formatDate(data.best_day.date, 'EEEE d MMMM')}
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-lg font-semibold text-accent-bright">
                  {formatPrice(data.best_day.revenue)}
                </div>
                <div className="text-[10px] text-text-tertiary font-mono">
                  {data.best_day.orders} commande{data.best_day.orders > 1 ? 's' : ''}
                </div>
              </div>
            </div>
          )}

          {/* Graphique jour par jour */}
          <div>
            <div className="mb-3">
              <h4 className="text-[13px] font-semibold mb-0.5">Revenus jour par jour</h4>
              <p className="text-[11px] text-text-tertiary">
                {data.days.length} jours · Survolez pour voir le détail
              </p>
            </div>
            <div className="h-64 -ml-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.days} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="#20242E" strokeDasharray="2 4" vertical={false} />
                  <XAxis
                    dataKey="day"
                    stroke="#565E70"
                    fontSize={10}
                    fontFamily="JetBrains Mono"
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#565E70"
                    fontSize={10}
                    fontFamily="JetBrains Mono"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`}
                    width={45}
                  />
                  <Tooltip
                    content={<DayTooltip />}
                    cursor={{ fill: 'rgba(243, 146, 0, 0.08)' }}
                  />
                  <Bar
                    dataKey="revenue"
                    fill="#F39200"
                    radius={[3, 3, 0, 0]}
                    maxBarSize={18}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top produits du mois */}
          {data.top_products && data.top_products.length > 0 && (
            <div>
              <h4 className="text-[13px] font-semibold mb-3">
                Top produits du mois
              </h4>
              <div className="space-y-2">
                {data.top_products.map((p, idx) => (
                  <div
                    key={p.product_id}
                    className="flex items-center justify-between py-2 px-3 bg-elevated rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-semibold text-text-tertiary w-6">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <div>
                        <div className="text-[13px] font-medium">{p.name}</div>
                        <div className="text-[10px] text-text-tertiary font-mono">
                          {p.units_sold} unité{p.units_sold > 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                    <div className="font-mono text-[13px] font-semibold text-accent-bright">
                      {formatPrice(p.revenue)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </Modal>
  )
}

function KpiBox({ label, value, color = 'default' }) {
  return (
    <div className="bg-elevated border border-border-subtle rounded-lg p-3.5">
      <div className="text-[10px] uppercase tracking-[0.06em] text-text-secondary font-medium mb-1.5">
        {label}
      </div>
      <div
        className={`font-mono text-lg font-semibold ${
          color === 'accent' ? 'text-accent-bright' : 'text-text-primary'
        }`}
      >
        {value}
      </div>
    </div>
  )
}