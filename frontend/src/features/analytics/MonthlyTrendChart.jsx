import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatPrice } from '@/lib/format'

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const data = payload[0].payload

  return (
    <div className="bg-elevated-2 border border-border-strong rounded-lg px-3 py-2 text-xs shadow-2xl">
      <div className="font-mono text-text-tertiary text-[10px] uppercase tracking-wider mb-1">
        {data.label}
      </div>
      <div className="font-mono font-semibold text-text-primary text-sm">
        {formatPrice(data.revenue)}
      </div>
      <div className="text-text-tertiary text-[10px] mt-0.5">
        {data.orders} commande{data.orders > 1 ? 's' : ''}
      </div>
      <div className="text-accent-bright text-[10px] mt-1.5 font-medium">
        Cliquer pour voir le détail →
      </div>
    </div>
  )
}

export function MonthlyTrendChart({ data, onMonthClick }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-72 grid place-items-center text-text-tertiary text-sm">
        Aucune donnée à afficher
      </div>
    )
  }

  const handleClick = (chartEvent) => {
    if (chartEvent?.activePayload?.[0]?.payload) {
      const { year, month } = chartEvent.activePayload[0].payload
      onMonthClick?.(year, month)
    }
  }

  return (
    <div className="h-72 w-full -ml-2 cursor-pointer">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          onClick={handleClick}
        >
          <defs>
            <linearGradient id="monthlyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F39200" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#F39200" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#20242E" strokeDasharray="2 4" vertical={false} />
          <XAxis
            dataKey="short_label"
            stroke="#565E70"
            fontSize={10}
            fontFamily="JetBrains Mono"
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => v.toUpperCase()}
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
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: '#F39200', strokeWidth: 1, strokeDasharray: '3 3' }}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#F39200"
            strokeWidth={2.5}
            fill="url(#monthlyGrad)"
            activeDot={{
              r: 7,
              fill: '#F39200',
              stroke: '#0F1117',
              strokeWidth: 3,
              style: { cursor: 'pointer' },
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}