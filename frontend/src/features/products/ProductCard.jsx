import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { PhoneSVG } from '@/components/PhoneSVG'

const stockLabels = {
  in_stock: { label: 'En stock', variant: 'success' },
  low_stock: { label: 'Stock faible', variant: 'warning' },
  out_of_stock: { label: 'Rupture', variant: 'danger' },
}

const stockDots = {
  in_stock: 'bg-success',
  low_stock: 'bg-warning',
  out_of_stock: 'bg-danger',
}

export function ProductCard({ product, onEdit, onDelete }) {
  const stock = stockLabels[product.stock_status] || stockLabels.in_stock
  const dotColor = stockDots[product.stock_status] || 'bg-success'
  const formattedPrice = product.price.toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).replace(/\u202F/g, ' ')

  return (
    <article className="bg-surface border border-border-subtle rounded-2xl overflow-hidden transition-all hover:border-accent/30 hover:-translate-y-0.5 hover:shadow-2xl group animate-fade-up">
      {/* Image avec phone SVG */}
      <div className="h-44 relative bg-gradient-to-b from-elevated to-surface grid place-items-center overflow-hidden">
        {/* Halo orange au hover */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_60%,rgba(243,146,0,0.08)_0%,transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Tags */}
        {product.is_new && (
          <span className="absolute top-3 left-3 px-2 py-1 text-[10px] font-mono font-semibold uppercase tracking-[0.04em] bg-accent text-white rounded shadow-glow-orange z-10">
            Nouveau
          </span>
        )}
        <Badge variant={stock.variant} className="absolute top-3 right-3 z-10 backdrop-blur-md">
          {stock.label}
        </Badge>

        {/* Phone */}
        <div className="z-[1] group-hover:-translate-y-1 group-hover:-rotate-3 transition-transform duration-500">
          <PhoneSVG color={product.color} name={product.name} />
        </div>
      </div>

      {/* Info */}
<div className="px-5 pt-4 pb-4">
  <div className="text-[15px] font-semibold mb-1.5">{product.name}</div>
  <div className="text-[11px] text-text-tertiary uppercase tracking-[0.08em] font-medium mb-3">
    {product.brand} · {product.storage} · {product.color}
  </div>
  <div className="flex items-center justify-between pt-3 border-t border-dashed border-border-subtle">
    <div className="font-mono text-base font-semibold text-success">
      {formattedPrice} <span className="text-xs opacity-70">DH</span>
    </div>
    <div className="flex items-center gap-1 font-mono text-[11px] text-text-secondary">
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      {product.stock} unité{product.stock > 1 ? 's' : ''}
    </div>
  </div>
</div>

      {/* Actions */}
      <div className="px-5 pb-4 flex gap-1.5">
        <Button variant="secondary" size="sm" className="flex-1" onClick={() => onEdit(product)}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          Modifier
        </Button>
        <Button variant="danger" size="sm" className="flex-1" onClick={() => onDelete(product)}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
          </svg>
          Supprimer
        </Button>
      </div>
    </article>
  )
}