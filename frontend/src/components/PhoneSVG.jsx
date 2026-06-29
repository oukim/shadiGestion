// Mapping nom de couleur (français) → code hex pour le rendu visuel
const COLOR_MAP = {
  'noir': '#1A1A1A',
  'blanc': '#F5F5F5',
  'gris': '#6B7280',
  'gris sidéral': '#3F3F46',
  'argent': '#C0C0C0',
  'or': '#D4AF37',
  'or rose': '#F4C2C2',
  'bleu': '#1E3A8A',
  'bleu nuit': '#1E1B4B',
  'bleu ciel': '#3B82F6',
  'bleu pacifique': '#0EA5E9',
  'rouge': '#DC2626',
  'rose': '#EC4899',
  'vert': '#10B981',
  'vert menthe': '#34D399',
  'violet': '#7C3AED',
  'mauve': '#A78BFA',
  'jaune': '#F59E0B',
  'orange': '#F97316',
  'lavande': '#C4B5FD',
  'graphite': '#374151',
  'titane': '#71717A',
  'pourpre': '#7E22CE',
}

function resolveColor(colorName) {
  if (!colorName) return '#1E3A8A'
  // Si c'est déjà du hex (compat ascendant), on garde
  if (typeof colorName === 'string' && colorName.startsWith('#')) {
    return colorName
  }
  const key = colorName.toString().toLowerCase().trim()
  return COLOR_MAP[key] || '#1E3A8A' // fallback bleu si couleur inconnue
}

export function PhoneSVG({ color = '#1E3A8A', name = '', size = 'md' }) {
  const sizes = {
    sm: { w: 50, h: 100 },
    md: { w: 70, h: 140 },
    lg: { w: 90, h: 180 },
  }
  const { w, h } = sizes[size] || sizes.md
  const firstWord = (name.split(' ')[0] || '').toUpperCase()
  const renderColor = resolveColor(color)

  return (
    <svg
      viewBox="0 0 100 200"
      style={{ width: w, height: h }}
      className="transition-transform duration-500"
    >
      <rect x="8" y="4" width="84" height="192" rx="14" fill={renderColor} stroke="#F39200" strokeWidth="0.5" opacity="0.95" />
      <rect x="13" y="9" width="74" height="182" rx="10" fill="#0A0F1F" />
      <rect x="38" y="13" width="24" height="5" rx="2.5" fill="#000" />
      <circle cx="58" cy="15.5" r="1" fill={renderColor} />
      <rect x="20" y="170" width="60" height="2" rx="1" fill="#F39200" opacity="0.4" />
      <path d="M22 178 Q50 184 78 176" stroke="#4FB04F" strokeWidth="0.8" fill="none" opacity="0.6" />
      {firstWord && (
        <text x="50" y="105" textAnchor="middle" fill="#F39200" fontSize="9" fontFamily="JetBrains Mono" opacity="0.5">
          {firstWord}
        </text>
      )}
    </svg>
  )
}