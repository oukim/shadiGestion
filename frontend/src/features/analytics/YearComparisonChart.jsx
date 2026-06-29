import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatPrice } from '@/lib/format'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null

  return (
    <div className="bg-elevated-2 border border-border-strong rounded-lg px-3 py-2.5 text-xs shadow-2xl">
      <div className="font-mono text-text-tertiary text-[10px] uppercase tracking-wider mb-2">
        {label}
      </div>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center justify-between gap-4 py-0.5">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-sm" style={{ background: entry.color }} />
            <span className="text-text-secondary">{entry.name}</span>
          </span>
          <span className="font-mono font-semibold text-text-primary">
            {formatPrice(entry.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

export function YearComparisonChart({ data }) {
  if (!data || !data.months) {
    return (
      <div className="h-72 grid place-items-center text-text-tertiary text-sm">
        Aucune donnée à afficher
      </div>
    )
  }

  // On capitalise les labels de mois pour le rendu
  const formatted = data.months.map((m) => ({
    ...m,
    label: m.label.toUpperCase(),
  }))

  return (
    <div className="h-72 w-full -ml-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={formatted} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#20242E" strokeDasharray="2 4" vertical={false} />
          <XAxis
            dataKey="label"
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
            tickFormatter={(v) => `${(v / 1000).toFixed(0)}k DH`}
            width={50}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(243, 146, 0, 0.06)' }} />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: '11px', paddingTop: '12px', fontFamily: 'Sora' }}
          />
          <Bar
            dataKey="previous_year"
            name={data.previous_year.toString()}
            fill="#565E70"
            radius={[4, 4, 0, 0]}
            maxBarSize={20}
          />
          <Bar
            dataKey="current_year"
            name={data.current_year.toString()}
            fill="#F39200"
            radius={[4, 4, 0, 0]}
            maxBarSize={20}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}