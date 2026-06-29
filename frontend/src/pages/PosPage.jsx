import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useCartStore } from '@/stores/cartStore'
import { productsApi } from '@/api/products'
import { PosProductCard } from '@/features/sales/PosProductCard'
import { CartPanel } from '@/features/sales/CartPanel'

const CATEGORIES = [
  { key: 'all', label: 'Tous' },
  { key: 'premium', label: 'Premium' },
  { key: 'midrange', label: 'Milieu de gamme' },
  { key: 'entry', label: 'Entrée de gamme' },
]

export function PosPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const addItem = useCartStore((s) => s.addItem)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    const params = filter !== 'all' ? { category: filter, per_page: 50 } : { per_page: 50 }

    productsApi
      .list(params)
      .then(({ data }) => {
        if (!cancelled) setProducts(data.data)
      })
      .catch(() => {
        if (!cancelled) toast.error('Impossible de charger les produits')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [filter])

  const handleAddToCart = (product) => {
    const result = addItem(product)
    if (result?.ok === false) {
      toast.error(result.reason)
    } else {
      toast.success(`${product.name} ajouté au panier`)
    }
  }

  return (
    <div className="animate-fade-up">
      <div className="mb-7">
        <h1 className="text-3xl font-semibold tracking-tight mb-1.5">
          Point de <span className="text-accent">vente</span>
        </h1>
        <p className="text-text-secondary text-sm">
          Sélectionnez les produits pour commencer une transaction
        </p>
      </div>

      {/* Layout 2 colonnes */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-5 items-start">
        {/* Colonne produits */}
        <div>
          {/* Filtres */}
          <div className="flex gap-2 flex-wrap mb-5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setFilter(cat.key)}
                className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
                  filter === cat.key
                    ? 'bg-accent-soft border-accent/30 text-accent-bright'
                    : 'bg-surface border-border-subtle text-text-secondary hover:text-text-primary hover:border-border-strong'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Grille */}
          {loading ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-surface border border-border-subtle rounded-xl h-[230px] animate-pulse" />
              ))}
            </div>
         ) : products.length === 0 ? (
  <div className="text-center py-20 text-text-tertiary">
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="mx-auto mb-4 opacity-40">
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
    <h3 className="text-text-secondary mb-1.5">Aucun produit disponible</h3>
    <p className="text-sm">
      {filter !== 'all'
        ? 'Aucun produit dans cette catégorie'
        : 'Ajoutez des produits dans le catalogue pour commencer à vendre'}
    </p>
  </div>
) : (
  <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3">
    {products.map((p) => (
      <PosProductCard key={p.id} product={p} onClick={() => handleAddToCart(p)} />
    ))}
  </div>
)}
        </div>

        {/* Panier */}
        <CartPanel />
      </div>
    </div>
  )
}