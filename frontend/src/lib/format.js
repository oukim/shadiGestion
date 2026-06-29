import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'

/**
 * Formate un montant en euros à la française.
 * Ex: 1249.5 → "1 249,50 €"
 */
export function formatPrice(value) {
  return (
    value.toLocaleString('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).replace(/\u202F/g, ' ') + ' DH'
  )
}

/**
 * Formate une date en français.
 * Ex: "2026-05-10" → "10 mai 2026"
 */
export function formatDate(dateStr, pattern = 'd MMMM yyyy') {
  if (!dateStr) return '—'
  try {
    const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr
    return format(date, pattern, { locale: fr })
  } catch {
    return dateStr
  }
}

/**
 * Extrait les initiales d'un nom complet.
 * Ex: "Shadi Khalid" → "SK"
 */
export function getInitials(name) {
  if (!name) return '?'
  return name
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .join('')
    .toUpperCase()
    .slice(0, 3)
}