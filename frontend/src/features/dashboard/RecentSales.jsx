import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { formatPrice } from '@/lib/format'
import { salesApi } from '@/api/sales'

export function RecentSales() {
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    salesApi
      .list({ per_page: 5 })
      .then(({ data }) => {
        if (!cancelled) setSales(data.data)
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-12 bg-elevated rounded animate-pulse" />
        ))}
      </div>
    )
  }

  if (sales.length === 0) {
    return (
      <div className="text-center py-8 text-text-tertiary text-sm">
        Aucune vente récente
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {sales.map((sale) => (
        <Link
          key={sale.id}
          to={sale.warranty ? `/warranty/${sale.warranty.warranty_number}` : '#'}
          className="flex gap-3 py-2.5 border-b border-border-subtle last:border-0 hover:bg-elevated/30 -mx-2 px-2 rounded transition-colors"
        >
          <div className="w-2 h-2 rounded-full bg-success mt-1.5 flex-shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-medium truncate">
              {sale.customer?.name || 'Client'}
            </div>
            <div className="text-[10px] text-text-tertiary mt-0.5 font-mono">
              {formatDistanceToNow(parseISO(sale.created_at), { locale: fr, addSuffix: true })}
              {' · '}
              {sale.items?.length || 0} article{(sale.items?.length || 0) > 1 ? 's' : ''}
            </div>
          </div>
          <div className="font-mono text-[13px] font-semibold text-accent-bright whitespace-nowrap">
            {formatPrice(parseFloat(sale.total))}
          </div>
        </Link>
      ))}
    </div>
  )
}