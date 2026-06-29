import { buildWhatsAppLink, messageTemplates } from '@/lib/whatsapp'
import toast from 'react-hot-toast'

/**
 * Bloc d'actions client affiché après une vente fraîche.
 * Permet d'envoyer un message WhatsApp de remerciement au client en darija.
 */
export function CustomerActions({ warranty }) {
  const customer = warranty.sale?.customer
  const items = warranty.sale?.items || []

  // Si pas de téléphone client, on ne montre pas le bloc
  if (!customer?.phone) return null

  // Nom du premier produit (pour le message de remerciement)
  const firstProduct = items[0]?.product_name || 'téléphone'

  // Extrait le prénom pour un message plus personnel
  const firstName = customer.name.split(' ')[0]

  const sendMessage = () => {
    const message = messageTemplates.thanks(firstName, firstProduct)
    const link = buildWhatsAppLink(customer.phone, message)
    if (link) {
      window.open(link, '_blank', 'noopener,noreferrer')
      toast.success('WhatsApp ouvert — Envoyez le message au client')
    } else {
      toast.error('Numéro de téléphone invalide')
    }
  }

  return (
    <div className="no-print bg-surface border border-border-subtle rounded-2xl p-5 mb-5 animate-fade-up">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-[#25D366] grid place-items-center shadow-[0_0_16px_rgba(37,211,102,0.3)]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M17.498 14.382c-.301-.15-1.767-.867-2.04-.966-.273-.101-.473-.15-.673.15-.197.295-.771.964-.944 1.162-.175.195-.349.21-.646.075-.3-.15-1.263-.465-2.403-1.485-.888-.795-1.484-1.77-1.66-2.07-.174-.3-.019-.465.13-.615.136-.135.301-.345.451-.523.146-.181.194-.301.297-.496.1-.21.049-.375-.025-.524-.075-.15-.672-1.62-.922-2.206-.24-.584-.487-.51-.672-.51-.172-.015-.371-.015-.571-.015-.2 0-.523.074-.797.359-.273.3-1.045 1.02-1.045 2.475s1.07 2.865 1.219 3.075c.149.195 2.105 3.195 5.1 4.485.714.3 1.27.48 1.704.629.714.227 1.365.195 1.88.121.574-.091 1.767-.721 2.016-1.426.255-.705.255-1.29.18-1.425-.074-.135-.27-.21-.57-.345m-5.446 7.443h-.016c-1.77 0-3.524-.48-5.055-1.38l-.36-.214-3.75.975 1.005-3.645-.239-.375c-.99-1.576-1.516-3.391-1.516-5.26 0-5.445 4.455-9.885 9.942-9.885 2.654 0 5.145 1.035 7.021 2.91 1.875 1.859 2.909 4.35 2.909 6.99-.004 5.444-4.46 9.885-9.935 9.885M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.334.101 11.893c0 2.096.549 4.14 1.595 5.945L0 24l6.335-1.652c1.746.943 3.71 1.444 5.71 1.447h.006c6.585 0 11.946-5.336 11.949-11.896 0-3.176-1.24-6.165-3.495-8.411" />
          </svg>
        </div>
        <div>
          <h3 className="font-semibold text-[15px]">Contacter le client</h3>
          <p className="text-xs text-text-tertiary">
            Envoyer un message de remerciement à {firstName}
          </p>
        </div>
      </div>

      {/* Infos client */}
      <div className="bg-elevated rounded-lg px-3.5 py-2.5 mb-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-medium truncate">{customer.name}</div>
          <div className="text-[11px] font-mono text-text-tertiary mt-0.5">
            {customer.phone}
          </div>
        </div>
        <div className="text-[10px] uppercase tracking-wider font-mono text-[#25D366] flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse" />
          WhatsApp prêt
        </div>
      </div>

      {/* Bouton unique */}
      <button
        onClick={sendMessage}
        className="w-full group flex items-center gap-3 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-lg px-4 py-3 transition-colors shadow-[0_2px_8px_rgba(37,211,102,0.3)]"
      >
        <div className="w-9 h-9 rounded-lg bg-white/20 grid place-items-center flex-shrink-0">
          <span className="text-base">💝</span>
        </div>
        <div className="min-w-0 flex-1 text-left">
          <div className="text-[13px] font-semibold">Envoyer un message de remerciement</div>
          <div className="text-[10px] text-white/80 mt-0.5 leading-tight">
            Message en darija avec numéro de garantie
          </div>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </button>

      {/* Note */}
      <p className="text-[10px] text-text-tertiary mt-3 text-center italic">
        💡 Le message s'ouvre dans WhatsApp prêt à envoyer
      </p>
    </div>
  )
}