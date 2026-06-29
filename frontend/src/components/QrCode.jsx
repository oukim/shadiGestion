function generateCells(text, size = 21) {
  let hash = 0
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i)
  }

  const cells = []
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // Marqueurs de position dans les 3 coins
      const inMarker = (px, py) =>
        x >= px && x < px + 7 && y >= py && y < py + 7
      const inMarkerInner = (px, py) =>
        x >= px + 2 && x < px + 5 && y >= py + 2 && y < py + 5

      if (inMarker(0, 0) || inMarker(14, 0) || inMarker(0, 14)) {
        const isInner =
          inMarkerInner(0, 0) || inMarkerInner(14, 0) || inMarkerInner(0, 14)
        const isEdge =
          x === 0 || x === 6 || y === 0 || y === 6 ||
          x === 14 || x === 20 ||
          (y === 14 && x <= 6) || (y === 20 && x <= 6)
        if (isInner || isEdge) cells.push([x, y])
      } else {
        const v = Math.abs(Math.sin(hash + x * 31 + y * 17)) * 1000
        if (v % 2 > 1) cells.push([x, y])
      }
    }
  }
  return cells
}

export function QrCode({ value, size = 110 }) {
  const cells = generateCells(value || 'shadi-phone', 21)
  const cellSize = 90 / 21

  return (
    <div
      className="bg-white rounded-lg border border-zinc-200 p-2"
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 90 90" style={{ width: '100%', height: '100%' }}>
        <rect width="90" height="90" fill="white" />
        {cells.map(([x, y], i) => (
          <rect
            key={i}
            x={x * cellSize}
            y={y * cellSize}
            width={cellSize}
            height={cellSize}
            fill="#0A0F1F"
          />
        ))}
      </svg>
    </div>
  )
}