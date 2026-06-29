import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { salesApi } from '@/api/sales'
import { warrantyApi } from '@/api/warranty'
import { formatPrice } from '@/lib/format'
import { Button } from '@/components/ui/Button'

export function SalesHistoryPage() {
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [meta, setMeta] = useState(null)

  // Filtres
  const [search, setSearch] = useState('')
  const [reference, setReference] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [page, setPage] = useState(1)

  // Téléchargement PDF
  const [downloadingId, setDownloadingId] = useState(null)

  const fetchSales = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, per_page: 15 }
      if (search.trim()) params.search = search.trim()
      if (reference.trim()) params.reference = reference.trim()
      if (from) params.from = from
      if (to) params.to = to

      const { data } = await salesApi.list(params)
      setSales(data.data)
      setMeta(data.meta)
    } catch {
      toast.error('Impossible de charger les ventes')
    } finally {
      setLoading(false)
    }
  }, [search, reference, from, to, page])

  // Debounce de 300ms pour ne pas spammer l'API
  useEffect(() => {
    const t = setTimeout(fetchSales, 300)
    return () => clearTimeout(t)
  }, [fetchSales])

  const resetFilters = () => {
    setSearch('')
    setReference('')
    setFrom('')
    setTo('')
    setPage(1)
  }

  const hasActiveFilters = search || reference || from || to

  const downloadWarrantyPdf = async (warrantyNumber, saleId) => {
    setDownloadingId(saleId)
    try {
      const response = await warrantyApi.downloadPdf(warrantyNumber)
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `bon-garantie-${warrantyNumber}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Bon de garantie téléchargé')
    } catch {
      toast.error('Erreur de téléchargement')
    } finally {
      setDownloadingId(null)
    }
  }

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="flex items-end justify-between mb-7 gap-6 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight mb-1.5">
            Historique des <span className="text-accent">ventes</span>
          </h1>
          <p className="text-text-secondary text-sm">
            {meta
              ? `${meta.total} vente${meta.total > 1 ? 's' : ''} enregistrée${meta.total > 1 ? 's' : ''}`
              : 'Chargement...'}
          </p>
        </div>
        <Link to="/pos">
          <Button variant="primary" size="lg">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nouvelle vente
          </Button>
        </Link>
      </div>

      {/* Filtres */}
      <div className="bg-surface border border-border-subtle rounded-2xl p-5 mb-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <FilterField label="Client">
            <input
              type="text"
              placeholder="Nom, téléphone, email…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="w-full bg-elevated border border-border-subtle rounded-lg px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
            />
          </FilterField>

          <FilterField label="Référence">
            <input
              type="text"
              placeholder="V1234567 ou GAR-2026-XXX"
              value={reference}
              onChange={(e) => { setReference(e.target.value); setPage(1) }}
              className="w-full bg-elevated border border-border-subtle rounded-lg px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30 font-mono"
            />
          </FilterField>

          <FilterField label="Du">
            <input
              type="date"
              value={from}
              onChange={(e) => { setFrom(e.target.value); setPage(1) }}
              className="w-full bg-elevated border border-border-subtle rounded-lg px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30 font-mono"
            />
          </FilterField>

          <FilterField label="Au">
            <input
              type="date"
              value={to}
              onChange={(e) => { setTo(e.target.value); setPage(1) }}
              className="w-full bg-elevated border border-border-subtle rounded-lg px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30 font-mono"
            />
          </FilterField>
        </div>

        {hasActiveFilters && (
          <div className="mt-3 flex justify-end">
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              Réinitialiser les filtres
            </Button>
          </div>
        )}
      </div>

      {/* Tableau */}
      <div className="bg-surface border border-border-subtle rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 bg-elevated rounded animate-pulse" />
            ))}
          </div>
        ) : sales.length === 0 ? (
          <div className="text-center py-16 text-text-tertiary">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-3 opacity-40">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <h3 className="text-text-secondary mb-1.5">Aucune vente trouvée</h3>
            <p className="text-sm">
              {hasActiveFilters
                ? 'Ajustez vos filtres ou réinitialisez-les'
                : 'Créez une nouvelle vente pour démarrer'}
            </p>
          </div>
        ) : (
          <>
            {/* Header table */}
            <div className="hidden md:grid grid-cols-[130px_1fr_120px_90px_130px_120px] gap-3 px-5 py-3 bg-elevated text-[10px] uppercase tracking-[0.08em] font-semibold text-text-secondary border-b border-border-subtle">
              <div>Référence</div>
              <div>Client</div>
              <div>Date</div>
              <div className="text-center">Articles</div>
              <div className="text-right">Total</div>
              <div className="text-center">Actions</div>
            </div>

            {/* Lignes */}
            {sales.map((sale) => (
              <SaleRow
                key={sale.id}
                sale={sale}
                onDownload={downloadWarrantyPdf}
                downloading={downloadingId === sale.id}
              />
            ))}
          </>
        )}
      </div>

      {/* Pagination */}
      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-between mt-5 px-2 flex-wrap gap-3">
          <div className="text-sm text-text-tertiary">
            Page <span className="text-text-primary font-mono">{meta.current_page}</span> sur{' '}
            <span className="text-text-primary font-mono">{meta.last_page}</span>
            {' · '}
            <span className="text-text-primary font-mono">{meta.total}</span> ventes au total
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              ← Précédent
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
              disabled={page >= meta.last_page}
            >
              Suivant →
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function FilterField({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-medium text-text-secondary uppercase tracking-[0.06em]">
        {label}
      </label>
      {children}
    </div>
  )
}

function SaleRow({ sale, onDownload, downloading }) {
  const date = parseISO(sale.created_at)
  const customerName = sale.customer?.name || '—'
  const customerPhone = sale.customer?.phone || '—'

  return (
    <div className="grid grid-cols-1 md:grid-cols-[130px_1fr_120px_90px_130px_120px] gap-3 px-5 py-3.5 border-b border-border-subtle last:border-0 hover:bg-elevated/30 transition-colors items-center">
      {/* Référence */}
      <div className="font-mono text-xs">
        <div className="text-accent-bright font-semibold">{sale.reference}</div>
        {sale.warranty && (
          <div className="text-text-tertiary text-[10px] mt-0.5 truncate" title={sale.warranty.warranty_number}>
            {sale.warranty.warranty_number}
          </div>
        )}
      </div>

      {/* Client */}
      <div className="min-w-0">
        <div className="text-sm font-medium truncate">{customerName}</div>
        <div className="text-[11px] text-text-tertiary font-mono mt-0.5 truncate">
          {customerPhone}
        </div>
      </div>

      {/* Date */}
      <div className="text-xs">
        <div className="font-mono">{format(date, 'dd/MM/yyyy', { locale: fr })}</div>
        <div className="text-text-tertiary text-[10px] font-mono mt-0.5">
          {format(date, 'HH:mm', { locale: fr })}
        </div>
      </div>

      {/* Articles */}
      <div className="text-center text-sm font-mono">
        {sale.items?.length || 0}×
      </div>

      {/* Total */}
      <div className="text-right">
        <div className="font-mono font-semibold text-accent-bright">
          {formatPrice(parseFloat(sale.total))}
        </div>
        {parseFloat(sale.tax) > 0 && (
          <div className="text-[10px] text-text-tertiary font-mono mt-0.5">
            TVA {parseFloat(sale.tax_rate).toFixed(0)}%
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-1.5 justify-center">
        {sale.warranty && (
          <>
            <Link to={`/warranty/${sale.warranty.warranty_number}`}>
              <Button variant="secondary" size="sm" title="Voir le bon de garantie">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </Button>
            </Link>
            <Button
              variant="primary"
              size="sm"
              onClick={() => onDownload(sale.warranty.warranty_number, sale.id)}
              loading={downloading}
              title="Télécharger le PDF"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </Button>
          </>
        )}
      </div>
    </div>
  )
}