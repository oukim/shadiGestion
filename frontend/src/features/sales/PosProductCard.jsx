import { PhoneSVG } from '@/components/PhoneSVG'
import { Badge } from '@/components/ui/Badge'

const stockLabels = {
  in_stock: { label: 'En stock', variant: 'success' },
  low_stock: { label: 'Stock faible', variant: 'warning' },
  out_of_stock: { label: 'Rupture', variant: 'danger' },
}

export function PosProductCard({ product, onClick }) {
  const stock = stockLabels[product.stock_status] || stockLabels.in_stock
  const disabled = product.stock === 0

  const formattedPrice = product.price.toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).replace(/\u202F/g, ' ')

  return (
    <article
      onClick={disabled ? undefined : onClick}
      className={`bg-surface border border-border-subtle rounded-xl overflow-hidden text-center transition-all group ${
        disabled
          ? 'opacity-40 cursor-not-allowed'
          : 'cursor-pointer hover:border-accent/40 hover:-translate-y-0.5'
      }`}
    >
      <div className="h-32 relative bg-gradient-to-b from-elevated to-surface grid place-items-center overflow-hidden">
        <Badge variant={stock.variant} className="absolute top-2 right-2 z-10 backdrop-blur-md text-[9px]">
          {stock.label}
        </Badge>
        <div className="group-hover:-translate-y-1 transition-transform duration-300">
          <PhoneSVG color={product.color} name={product.name} size="sm" />
        </div>
      </div>
      <div className="px-3 py-3">
       <div className="text-[13px] font-semibold mb-1 truncate" title={product.name}>
          {product.name}
        </div>
        {product.storage && (
          <div className="text-[11px] text-text-secondary font-mono mb-1.5">
            {product.storage}
          </div>
        )}
        <div className="font-mono text-sm font-semibold text-accent-bright">
          {formattedPrice} DH
        </div>
      </div>
    </article>
  )
}