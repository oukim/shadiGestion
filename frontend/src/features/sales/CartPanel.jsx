import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useCartStore } from '@/stores/cartStore'
import { salesApi } from '@/api/sales'
import { Button } from '@/components/ui/Button'
import { PhoneSVG } from '@/components/PhoneSVG'

const fmt = (n) =>
  n.toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).replace(/\u202F/g, ' ')

export function CartPanel() {
  const navigate = useNavigate()
  const items = useCartStore((s) => s.items)
  const customer = useCartStore((s) => s.customer)
  const applyTax = useCartStore((s) => s.applyTax)
  const taxRate = useCartStore((s) => s.taxRate)
  const changeQty = useCartStore((s) => s.changeQty)
  const setCustomer = useCartStore((s) => s.setCustomer)
  const setApplyTax = useCartStore((s) => s.setApplyTax)
  const setTaxRate = useCartStore((s) => s.setTaxRate)
  const clear = useCartStore((s) => s.clear)
  const subtotal = useCartStore((s) => s.subtotal())
  const tax = useCartStore((s) => s.tax())
  const total = useCartStore((s) => s.total())
  const itemCount = useCartStore((s) => s.itemCount())
const setImei = useCartStore((s) => s.setImei)
const setCustomPrice = useCartStore((s) => s.setCustomPrice) 
const [submitting, setSubmitting] = useState(false)

  const handleQty = (productId, delta) => {
    const result = changeQty(productId, delta)
    if (result?.ok === false) toast.error(result.reason)
  }

const handleComplete = async () => {
  if (items.length === 0) {
    toast.error('Le panier est vide')
    return
  }
  if (!customer.name.trim()) {
    toast.error('Le nom du client est requis')
    return
  }
 if (total > 5000 && !window.confirm(
    `Confirmer cette vente de ${fmt(total)} DH ?\n\nClient : ${customer.name.trim()}\nArticles : ${itemCount}`
  )) {
    return
  }
  // Validation des IMEI
 for (const item of items) {
    for (let i = 0; i < item.imeis.length; i++) {
      const imei = item.imeis[i]
      if (!imei || imei.length !== 15) {
        toast.error(`IMEI #${i + 1} manquant ou invalide pour ${item.product.name}`)
        return
      }
    }
  }

  // Unicité locale
  const allImeis = items.flatMap((i) => i.imeis)
  const uniqueImeis = new Set(allImeis)
  if (uniqueImeis.size !== allImeis.length) {
    toast.error('Deux IMEI sont identiques. Vérifiez vos saisies.')
    return
  }

 setSubmitting(true)
  try {
    const payload = {
      customer: {
        name: customer.name.trim(),
        phone: customer.phone.trim() || null,
        email: customer.email.trim() || null,
      },
      items: items.map((i) => ({
        product_id: i.product.id,
        quantity: i.quantity,
        imeis: i.imeis, // 🎯 Tableau des IMEI saisis
        unit_price: i.customPrice,
      })),
      apply_tax: applyTax,
      tax_rate: applyTax ? taxRate : 0,
    }

      const { data } = await salesApi.create(payload)
    const warrantyNumber = data.data.warranty.warranty_number

    toast.success('Vente finalisée — Bon de garantie généré')
    clear()
    navigate(`/warranty/${warrantyNumber}`, { state: { fresh: true } })
  } catch (err) {
     // Gérer les erreurs détaillées du backend
    const errorData = err.response?.data
    if (errorData?.errors) {
      // Affiche chaque erreur reçue
      Object.values(errorData.errors).flat().forEach((msg) => toast.error(msg))
    } else {
      toast.error(errorData?.message || 'Erreur lors de la finalisation')
    }
  } finally {
    setSubmitting(false)
  }
}

  return (
    <aside className="bg-surface border border-border-subtle rounded-2xl p-6 sticky top-5 flex flex-col max-h-[calc(100vh-40px)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-semibold">Panier</h3>
        <span className="px-2 py-0.5 text-[11px] font-mono bg-accent-soft text-accent-bright rounded-full border border-accent/20">
          {itemCount} article{itemCount > 1 ? 's' : ''}
        </span>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto -mx-2 px-2 min-h-[100px]">
      {items.length === 0 ? (
  <div className="text-center py-10 text-text-tertiary">
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-3 opacity-40">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
    <p className="text-sm">Sélectionnez un produit pour commencer</p>
  </div>
) : (
  items.map(({ product, quantity, imeis, customPrice }) => (
    <div key={product.id} className="py-3 border-b border-border-subtle last:border-0">
      {/* Ligne produit principale */}
      <div className="grid grid-cols-[36px_1fr_auto] gap-2.5 items-center mb-2">
        <div className="w-9 h-9 rounded-lg bg-elevated grid place-items-center overflow-hidden">
          <div style={{ transform: 'scale(0.5)' }}>
            <PhoneSVG color={product.color} size="sm" />
          </div>
        </div>
        <div className="min-w-0">
          <div className="text-xs font-medium truncate" title={product.name}>
            {product.name}
          </div>
          <div className="text-[10px] font-mono text-text-tertiary mt-0.5">
            {product.storage} · Réf: {fmt(product.price)} DH
          </div>
        </div>
        <div className="flex items-center gap-1 bg-elevated border border-border-subtle rounded-md p-0.5">
          <button
            onClick={() => handleQty(product.id, -1)}
            className="w-5 h-5 rounded grid place-items-center text-text-secondary hover:bg-elevated-2 hover:text-text-primary"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
          <span className="min-w-[20px] text-center font-mono text-[11px] font-semibold">
            {quantity}
          </span>
          <button
            onClick={() => handleQty(product.id, 1)}
            className="w-5 h-5 rounded grid place-items-center text-text-secondary hover:bg-elevated-2 hover:text-text-primary"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>
      </div>
      {/* Prix de vente modifiable */}
      <div className="ml-11 mt-1.5 mb-1">
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-mono text-text-tertiary">Prix</span>
          <input
            type="number"
            min="0"
            step="100"
            value={customPrice}
            onChange={(e) => {
              const val = parseFloat(e.target.value) || 0
              setCustomPrice(product.id, val)
            }}
            className="w-28 bg-elevated border border-border-subtle rounded px-2 py-1 text-[11px] font-mono text-right outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
          />
          <span className="text-[9px] font-mono text-text-tertiary">DH</span>
          {customPrice !== product.price && (
            <span className="text-[9px] text-warning font-mono">
              (Réf: {fmt(product.price)})
            </span>
          )}
        </div>
      </div>
      {/* Champs IMEI - un par exemplaire */}
      <div className="ml-11 space-y-1.5">
        {imeis.map((imei, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className="text-[9px] font-mono text-text-tertiary w-6">
              #{idx + 1}
            </span>
            <input
              type="text"
              placeholder="IMEI (15 chiffres)"
              value={imei}
              maxLength={15}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '')
                setImei(product.id, idx, val)
              }}
              className={`flex-1 bg-elevated border rounded px-2 py-1 text-[11px] font-mono outline-none focus:border-accent focus:ring-2 focus:ring-accent/30 ${
                imei.length === 15
                  ? 'border-success/40'
                  : imei.length > 0
                  ? 'border-warning/40'
                  : 'border-border-subtle'
              }`}
            />
            {imei.length === 15 && (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </div>
        ))}
      </div>
    </div>
  ))
)}
      </div>

      {/* Customer form */}
      <div className="border-t border-border-subtle pt-4 mt-3">
        <h4 className="text-[11px] uppercase tracking-[0.06em] text-text-secondary mb-2.5 font-medium">
          Informations client
        </h4>
        <div className="flex flex-col gap-2">
          <input
            type="text"
            placeholder="Nom complet *"
            value={customer.name}
            onChange={(e) => setCustomer({ name: e.target.value })}
            className="w-full bg-elevated border border-border-subtle rounded-lg px-3 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Téléphone"
              value={customer.phone}
              onChange={(e) => setCustomer({ phone: e.target.value })}
              className="w-full bg-elevated border border-border-subtle rounded-lg px-3 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
            />
            <input
              type="email"
              placeholder="Email"
              value={customer.email}
              onChange={(e) => setCustomer({ email: e.target.value })}
              className="w-full bg-elevated border border-border-subtle rounded-lg px-3 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
            />
          </div>
        </div>
      </div>

      {/* TVA toggle */}
      <div className="border-t border-border-subtle pt-4 mt-4">
        <div className="flex items-center justify-between mb-2">
          <label className="flex items-center gap-2 cursor-pointer text-xs">
            <input
              type="checkbox"
              checked={applyTax}
              onChange={(e) => setApplyTax(e.target.checked)}
              className="w-4 h-4 accent-accent"
            />
            <span className="text-text-secondary">Appliquer la TVA</span>
          </label>
          {applyTax && (
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min="0"
                max="100"
                value={taxRate}
                onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                className="w-14 bg-elevated border border-border-subtle rounded px-2 py-1 text-xs font-mono text-right outline-none focus:border-accent"
              />
              <span className="text-text-tertiary text-xs">%</span>
            </div>
          )}
        </div>
      </div>

      {/* Totals */}
      <div className="border-t border-border-subtle pt-3.5 mt-3.5">
        <div className="flex justify-between text-xs text-text-secondary py-1">
          <span>Sous-total</span>
          <span className="font-mono text-text-primary">{fmt(subtotal)} DH</span>
        </div>
        {applyTax && (
          <div className="flex justify-between text-xs text-text-secondary py-1">
            <span>TVA ({taxRate}%)</span>
            <span className="font-mono text-text-primary">{fmt(tax)} DH</span>
          </div>
        )}
        <div className="flex justify-between pt-2.5 mt-1.5 border-t border-dashed border-border-subtle font-semibold">
          <span className="text-sm">Total {applyTax ? 'TTC' : 'HT'}</span>
          <span className="font-mono text-[22px] text-accent-bright">{fmt(total)} DH</span>
        </div>
      </div>

      <Button
        variant="primary"
        size="lg"
        className="w-full mt-3.5"
        onClick={handleComplete}
        loading={submitting}
        disabled={items.length === 0}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 11l3 3L22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
        Finaliser la vente
      </Button>
    </aside>
  )
}