// Maths isométriques : une tuile fait TW x TH pixels (losange 2:1).
export const TW = 64
export const TH = 32

/** Coin "haut" de la tuile (x, y) en coordonnées écran (avant zoom/décalage). */
export const iso = (x, y) => ({ x: ((x - y) * TW) / 2, y: ((x + y) * TH) / 2 })

/** Inverse : position écran -> coordonnées tuile (flottantes). */
export const fromIso = (sx, sy) => ({
  x: (sx / (TW / 2) + sy / (TH / 2)) / 2,
  y: (sy / (TH / 2) - sx / (TW / 2)) / 2,
})

export function poly(ctx, pts, fill, stroke, lw = 1) {
  ctx.beginPath()
  pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)))
  ctx.closePath()
  if (fill) {
    ctx.fillStyle = fill
    ctx.fill()
  }
  if (stroke) {
    ctx.strokeStyle = stroke
    ctx.lineWidth = lw
    ctx.stroke()
  }
}

export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

/** Plus court chemin (BFS 8 directions, sans couper les coins). */
export function findPath(from, goals, isFree, w, h) {
  const key = (x, y) => y * w + x
  const goalSet = new Set(goals.map((g) => key(g.x, g.y)))
  if (goalSet.has(key(from.x, from.y))) return []
  const prev = new Map([[key(from.x, from.y), null]])
  const queue = [from]
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]
  while (queue.length) {
    const cur = queue.shift()
    for (const [dx, dy] of dirs) {
      const nx = cur.x + dx
      const ny = cur.y + dy
      if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue
      if (!isFree(nx, ny)) continue
      if (dx && dy && (!isFree(cur.x + dx, cur.y) || !isFree(cur.x, cur.y + dy))) continue
      const k = key(nx, ny)
      if (prev.has(k)) continue
      prev.set(k, cur)
      const node = { x: nx, y: ny }
      if (goalSet.has(k)) {
        const path = [node]
        let p = cur
        while (p && !(p.x === from.x && p.y === from.y)) {
          path.unshift(p)
          p = prev.get(key(p.x, p.y))
        }
        return path
      }
      queue.push(node)
    }
  }
  return null
}
