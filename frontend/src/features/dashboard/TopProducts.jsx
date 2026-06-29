import { formatPrice } from '@/lib/format'

export function TopProducts({ products = [] }) {
  if (products.length === 0) {
    return (
      <div className="text-center py-8 text-text-tertiary text-sm">
        Aucune vente ce mois-ci
      </div>
    )
  }

  const maxRevenue = Math.max(...products.map((p) => p.revenue))

  return (
    <div className="flex flex-col gap-3.5">
      {products.map((product, idx) => {
        const percent = maxRevenue > 0 ? (product.revenue / maxRevenue) * 100 : 0
        const isFirst = idx === 0

        return (
          <div
            key={product.product_id}
            className="grid grid-cols-[36px_1fr_auto] gap-3 items-center"
          >
            {/* Rang */}
            <div
              className={`w-9 h-9 rounded-lg grid place-items-center font-mono text-xs font-semibold border ${
                isFirst
                  ? 'bg-accent-soft text-accent-bright border-accent/20'
                  : 'bg-elevated text-text-secondary border-border-subtle'
              }`}
            >
              {String(idx + 1).padStart(2, '0')}
            </div>

            {/* Nom + barre */}
            <div className="min-w-0">
              <div className="text-[13px] font-medium mb-1.5 truncate">
                {product.name}
              </div>
              <div className="h-1 bg-elevated rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-accent to-accent-bright rounded-full transition-all"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <div className="text-[10px] font-mono text-text-tertiary mt-1">
                {product.units_sold} unité{product.units_sold > 1 ? 's' : ''}
              </div>
            </div>

            {/* Revenu */}
            <div className="font-mono text-[13px] font-semibold whitespace-nowrap">
              {formatPrice(product.revenue)}
            </div>
          </div>
        )
      })}
    </div>
  )
}