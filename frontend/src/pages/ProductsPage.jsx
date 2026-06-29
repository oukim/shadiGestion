import { useEffect, useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/Button'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { ProductCard } from '@/features/products/ProductCard'
import { ProductFormModal } from '@/features/products/ProductFormModal'
import { productsApi } from '@/api/products'

const CATEGORIES = [
  { key: 'all', label: 'Tous' },
  { key: 'premium', label: 'Premium' },
  { key: 'midrange', label: 'Milieu de gamme' },
  { key: 'entry', label: 'Entrée de gamme' },
]

export function ProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const [editingProduct, setEditingProduct] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (filter !== 'all') params.category = filter
      if (search.trim()) params.search = search.trim()
      const { data } = await productsApi.list(params)
      setProducts(data.data)
    } catch {
      toast.error('Impossible de charger les produits')
    } finally {
      setLoading(false)
    }
  }, [filter, search])

  // Debounce de la recherche
  useEffect(() => {
    const t = setTimeout(fetchProducts, 300)
    return () => clearTimeout(t)
  }, [fetchProducts])

  const handleAdd = () => {
    setEditingProduct(null)
    setFormOpen(true)
  }
  const handleEdit = (product) => {
    setEditingProduct(product)
    setFormOpen(true)
  }
  const handleDelete = (product) => setDeleteTarget(product)

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await productsApi.delete(deleteTarget.id)
      toast.success('Produit supprimé')
      setDeleteTarget(null)
      fetchProducts()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur de suppression')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="flex items-end justify-between mb-7 gap-6 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight mb-1.5">
            Catalogue <span className="text-accent">produits</span>
          </h1>
          <p className="text-text-secondary text-sm">
            Gérez votre inventaire de téléphones
          </p>
        </div>
        <Button variant="primary" size="lg" onClick={handleAdd}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Ajouter un produit
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
        <div className="flex gap-2 flex-wrap">
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
        <input
          type="text"
          placeholder="Rechercher un produit…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64 bg-surface border border-border-subtle rounded-lg px-4 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-surface border border-border-subtle rounded-2xl h-[360px] animate-pulse" />
          ))}
        </div>
     ) : products.length === 0 ? (
  <div className="text-center py-20 text-text-tertiary">
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="mx-auto mb-4 opacity-40">
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
    {filter === 'all' && !search ? (
      <>
        <h3 className="text-text-secondary mb-1.5">Votre catalogue est vide</h3>
        <p className="text-sm mb-5">Ajoutez votre premier téléphone pour commencer</p>
        <Button variant="primary" size="md" onClick={handleAdd}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Ajouter un produit
        </Button>
      </>
    ) : (
      <>
        <h3 className="text-text-secondary mb-1.5">Aucun produit trouvé</h3>
        <p className="text-sm">Ajustez vos filtres ou changez votre recherche</p>
      </>
    )}
  </div>
) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} onEdit={handleEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Modales */}
      <ProductFormModal
        open={formOpen}
        product={editingProduct}
        onClose={() => setFormOpen(false)}
        onSaved={fetchProducts}
      />
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        title="Supprimer ce produit ?"
        message={
          deleteTarget
            ? `Vous êtes sur le point de supprimer « ${deleteTarget.name} ». Cette action est irréversible.`
            : ''
        }
        confirmLabel="Supprimer définitivement"
      />
    </div>
  )
}