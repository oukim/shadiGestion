import { create } from 'zustand'

const initialCustomer = { name: '', phone: '', email: '' }

export const useCartStore = create((set, get) => ({
  items: [],
  customer: { ...initialCustomer },
  applyTax: true,
  taxRate: 20,

  addItem: (product) => {
    const items = get().items
    const existing = items.find((i) => i.product.id === product.id)

    if (existing) {
      if (existing.quantity >= product.stock) {
        return { ok: false, reason: 'Stock maximum atteint' }
      }
      set({
        items: items.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + 1, imeis: [...i.imeis, ''] }
            : i
        ),
      })
    } else {
      if (product.stock === 0) {
        return { ok: false, reason: 'Produit en rupture' }
      }
      // customPrice = prix de référence du produit, modifiable par le vendeur
      set({ items: [...items, { product, quantity: 1, imeis: [''], customPrice: product.price }] })
    }
    return { ok: true }
  },

  changeQty: (productId, delta) => {
    const items = get().items
    const item = items.find((i) => i.product.id === productId)
    if (!item) return

    const newQty = item.quantity + delta

    if (newQty <= 0) {
      set({ items: items.filter((i) => i.product.id !== productId) })
      return { ok: true, removed: true }
    }

    if (newQty > item.product.stock) {
      return { ok: false, reason: 'Stock insuffisant' }
    }

    let newImeis = [...item.imeis]
    if (delta > 0) {
      newImeis.push('')
    } else {
      newImeis.pop()
    }

    set({
      items: items.map((i) =>
        i.product.id === productId ? { ...i, quantity: newQty, imeis: newImeis } : i
      ),
    })
    return { ok: true }
  },

  setImei: (productId, imeiIndex, value) => {
    const items = get().items
    set({
      items: items.map((i) =>
        i.product.id === productId
          ? { ...i, imeis: i.imeis.map((imei, idx) => (idx === imeiIndex ? value : imei)) }
          : i
      ),
    })
  },

  // Nouveau : modifier le prix de vente d'un article
  setCustomPrice: (productId, price) => {
    const items = get().items
    set({
      items: items.map((i) =>
        i.product.id === productId ? { ...i, customPrice: price } : i
      ),
    })
  },

  removeItem: (productId) =>
    set({ items: get().items.filter((i) => i.product.id !== productId) }),

  setCustomer: (patch) =>
    set({ customer: { ...get().customer, ...patch } }),

  setApplyTax: (value) => set({ applyTax: value }),
  setTaxRate: (value) => set({ taxRate: value }),

  clear: () =>
    set({
      items: [],
      customer: { ...initialCustomer },
      applyTax: true,
      taxRate: 20,
    }),

  // Utilise customPrice au lieu de product.price
  subtotal: () =>
    get().items.reduce((sum, i) => sum + i.customPrice * i.quantity, 0),

  tax: () => {
    const { items, applyTax, taxRate } = get()
    if (!applyTax) return 0
    const subtotal = items.reduce((s, i) => s + i.customPrice * i.quantity, 0)
    return Math.round(subtotal * (taxRate / 100) * 100) / 100
  },

  total: () => {
    const subtotal = get().subtotal()
    return subtotal + get().tax()
  },

  itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
}))