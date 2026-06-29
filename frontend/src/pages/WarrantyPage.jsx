import { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/Button'
import { WarrantyCertificate } from '@/features/warranty/WarrantyCertificate'
import { warrantyApi } from '@/api/warranty'
import { CustomerActions } from '@/features/warranty/CustomerActions'

export function WarrantyPage() {
  const { warrantyNumber } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const isFreshSale = location.state?.fresh === true

  const [warranty, setWarranty] = useState(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    warrantyApi
      .get(warrantyNumber)
      .then(({ data }) => {
        if (!cancelled) setWarranty(data.data)
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.response?.status === 404 ? 'Bon de garantie introuvable' : 'Erreur de chargement')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [warrantyNumber])

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadPdf = async () => {
    setDownloading(true)
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
      toast.error('Erreur lors du téléchargement')
    } finally {
      setDownloading(false)
    }
  }

  if (loading) {
    return (
      <div className="animate-fade-up">
        <div className="mb-7">
          <h1 className="text-3xl font-semibold tracking-tight mb-1.5">
            Bon de <span className="text-accent">garantie</span>
          </h1>
        </div>
        <div className="max-w-3xl mx-auto bg-surface border border-border-subtle rounded-2xl h-[800px] animate-pulse" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="animate-fade-up max-w-3xl mx-auto">
        <div className="bg-surface border border-border-subtle rounded-2xl p-12 text-center">
          <svg className="w-12 h-12 mx-auto mb-4 text-text-tertiary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <h3 className="text-lg font-semibold mb-2">{error}</h3>
          <p className="text-text-tertiary text-sm mb-6">Vérifiez le numéro de garantie ou créez une nouvelle vente.</p>
          <Button variant="primary" onClick={() => navigate('/pos')}>Aller au point de vente</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-up">
      {/* Header (caché à l'impression) */}
      <div className="no-print mb-7 flex items-end justify-between gap-6 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight mb-1.5">
            Bon de <span className="text-accent">garantie</span>
          </h1>
          <p className="text-text-secondary text-sm">
            <span className="inline-block w-1.5 h-1.5 bg-success rounded-full mr-2 animate-pulse" />
            Document généré automatiquement
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        {/* Banner de succès (vente fraîche) */}
        {isFreshSale && (
          <div className="no-print bg-gradient-to-br from-success/15 to-success/5 border border-success/30 rounded-2xl px-5 py-4 mb-5 flex items-center gap-4 animate-fade-up">
            <div className="w-10 h-10 rounded-xl bg-success grid place-items-center flex-shrink-0 shadow-[0_0_16px_rgba(16,185,129,0.4)]">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-0.5">Vente finalisée avec succès</h4>
              <p className="text-xs text-text-secondary">
                Le bon de garantie a été généré et est prêt à être imprimé ou téléchargé.
              </p>
            </div>
          </div>
        )}
        {/* Actions client WhatsApp (uniquement après une nouvelle vente) */}
        {isFreshSale && warranty && <CustomerActions warranty={warranty} />}

        {/* Actions */}
        <div className="no-print flex gap-2 mb-5 justify-end flex-wrap">
          <Button variant="secondary" onClick={() => navigate('/pos')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Nouvelle vente
          </Button>
          <Button variant="secondary" onClick={handlePrint}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            Imprimer
          </Button>
          <Button variant="primary" onClick={handleDownloadPdf} loading={downloading}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Télécharger PDF
          </Button>
        </div>

        {/* Certificat */}
        <WarrantyCertificate warranty={warranty} />
      </div>
    </div>
  )
}