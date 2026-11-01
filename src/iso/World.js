import { TW, TH, iso, fromIso, poly, roundRect, findPath } from './iso.js'
import { drawAvatar } from './avatar.js'
import { rooms } from './rooms.js'
import { shade } from '../art/portrait.js'

const SPEED = 3.4 // tuiles / seconde
const TALK_RANGE = 1.6

/**
 * Le monde façon Habbo : une pièce isométrique, ton avatar, les PNJ qui se baladent.
 * handlers : onNPC(npc), onDoor(roomId), onFurni(furni), onMoveAway(), onHover(text)
 */
export class World {
  constructor(canvas, handlers) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.h = handlers
    this.entities = []
    this.player = null
    this.room = null
    this.roomId = null
    this.frozen = false // true pendant les scènes ink
    this.talkingTo = null
    this.hoverTile = null
    this.hoverEntity = null
    this.hoverFurni = null
    this.marker = null
    this.view = { scale: 1, ox: 0, oy: 0 }
    this.rightInset = 0 // fraction de l'écran cachée à droite (panneau de chat)
    this.bottomInset = 0 // idem en bas (chat sur téléphone en portrait)
    this.fs = 1 // agrandissement des textes quand le zoom est petit
    this.stars = Array.from({ length: 80 }, () => [Math.random(), Math.random() * 0.6, Math.random() * 1.5 + 0.5])

    canvas.addEventListener('mousemove', (e) => this.onMouseMove(e))
    canvas.addEventListener('click', (e) => this.onClick(e))
    canvas.addEventListener('mouseleave', () => (this.hoverTile = this.hoverEntity = this.hoverFurni = null))
    this.last = performance.now()
    const loop = (t) => {
      const dt = Math.min(0.05, (t - this.last) / 1000)
      this.last = t
      this.update(dt)
      this.render()
      requestAnimationFrame(loop)
    }
    requestAnimationFrame(loop)
  }

  // ------------------------------------------------------------------ pièces
  loadRoom(roomId, { fromRoom = null, player, npcs = [] }) {
    const room = rooms[roomId]
    this.room = room
    this.roomId = roomId
    this.talkingTo = null
    this.marker = null
    this.blocked = new Set()
    for (const f of room.furni) for (let x = f.x; x < f.x + f.w; x++) for (let y = f.y; y < f.y + f.d; y++) this.blocked.add(`${x},${y}`)

    let start = room.spawn
    const door = fromRoom && room.doors.find((d) => d.to === fromRoom)
    if (door) start = door.y === 0 ? { x: door.x, y: 1 } : { x: 1, y: door.y }

    this.player = this.makeEntity({ ...player, isPlayer: true }, start)
    const taken = new Set([`${start.x},${start.y}`])
    this.entities = [this.player]
    for (const n of npcs) {
      const t = this.randomFreeTile(taken)
      taken.add(`${t.x},${t.y}`)
      const e = this.makeEntity(n, t)
      e.nextWander = performance.now() + 1000 + Math.random() * 4000
      this.entities.push(e)
    }
  }

  makeEntity(info, tile) {
    return { ...info, x: tile.x, y: tile.y, path: [], dir: Math.random() < 0.5 ? 1 : -1, phase: 0, bubble: null }
  }

  isDoor(x, y) {
    return this.room.doors.find((d) => d.x === x && d.y === y)
  }

  isFree(x, y) {
    return x >= 0 && y >= 0 && x < this.room.w && y < this.room.h && !this.blocked.has(`${x},${y}`)
  }

  randomFreeTile(taken = new Set(), near = null, radius = 3) {
    for (let i = 0; i < 200; i++) {
      const x = near ? near.x + Math.round((Math.random() * 2 - 1) * radius) : Math.floor(Math.random() * this.room.w)
      const y = near ? near.y + Math.round((Math.random() * 2 - 1) * radius) : Math.floor(Math.random() * this.room.h)
      if (this.isFree(x, y) && !this.isDoor(x, y) && !taken.has(`${x},${y}`)) return { x, y }
    }
    return { ...this.room.spawn }
  }

  tileOf(e) {
    return { x: Math.round(e.x), y: Math.round(e.y) }
  }

  walkTo(e, goals, onArrive) {
    const from = this.tileOf(e)
    const path = findPath(from, goals, (x, y) => this.isFree(x, y), this.room.w, this.room.h)
    if (path === null) return false
    e.path = path
    e.onArrive = onArrive
    if (!path.length) {
      e.onArrive = null
      onArrive?.()
    }
    return true
  }

  // ------------------------------------------------------------------ boucle
  update(dt) {
    if (!this.room) return
    const now = performance.now()
    for (const e of this.entities) {
      if (e.path.length) {
        const n = e.path[0]
        const dx = n.x - e.x
        const dy = n.y - e.y
        const d = Math.hypot(dx, dy)
        const step = SPEED * dt
        const sdx = dx - dy
        if (Math.abs(sdx) > 0.01) e.dir = sdx > 0 ? 1 : -1
        e.phase += dt * 12
        if (step >= d) {
          e.x = n.x
          e.y = n.y
          e.path.shift()
          if (!e.path.length) {
            const cb = e.onArrive
            e.onArrive = null
            cb?.()
          }
        } else {
          e.x += (dx / d) * step
          e.y += (dy / d) * step
        }
      } else {
        e.phase = 0
        if (!e.isPlayer && !this.frozen && e !== this.talkingTo && now > (e.nextWander || 0)) {
          e.nextWander = now + 3000 + Math.random() * 6000
          const t = this.randomFreeTile(new Set([`${Math.round(this.player.x)},${Math.round(this.player.y)}`]), this.tileOf(e), 3)
          this.walkTo(e, [t])
        }
      }
      if (e.bubble && now > e.bubble.until) e.bubble = null
    }
    // si on s'éloigne de la personne à qui on parle
    if (this.talkingTo && this.dist(this.player, this.talkingTo) > 3.5) {
      this.endTalk()
      this.h.onMoveAway?.()
    }
  }

  dist(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y)
  }

  face(a, b) {
    const sdx = b.x - a.x - (b.y - a.y)
    if (Math.abs(sdx) > 0.01) a.dir = sdx > 0 ? 1 : -1
  }

  startTalk(npc) {
    this.talkingTo = npc
    npc.path = []
    this.face(npc, this.player)
    this.face(this.player, npc)
  }

  endTalk() {
    if (this.talkingTo) this.talkingTo.nextWander = performance.now() + 2500
    this.talkingTo = null
  }

  say(id, text, { typing = false, ms } = {}) {
    const e = this.entities.find((x) => x.id === id)
    if (!e) return
    e.bubble = { text, typing, since: performance.now(), until: performance.now() + (ms ?? 4500 + text.length * 45) }
  }

  // ------------------------------------------------------------------ entrées
  toWorld(ev) {
    const r = this.canvas.getBoundingClientRect()
    const sx = (ev.clientX - r.left - this.view.ox) / this.view.scale
    const sy = (ev.clientY - r.top - this.view.oy) / this.view.scale
    return { sx, sy }
  }

  pick(ev) {
    const { sx, sy } = this.toWorld(ev)
    // personnages (du plus proche au plus lointain)
    const npcs = this.entities.filter((e) => !e.isPlayer).sort((a, b) => b.x + b.y - (a.x + a.y))
    for (const e of npcs) {
      const p = iso(e.x + 0.5, e.y + 0.5)
      if (sx > p.x - 18 && sx < p.x + 18 && sy > p.y + TH / 2 - 88 && sy < p.y + TH / 2 + 6) return { entity: e }
    }
    const t = fromIso(sx, sy)
    const tile = { x: Math.floor(t.x), y: Math.floor(t.y) }
    // meubles cliquables : on teste aussi le volume du meuble
    for (const f of this.room.furni) {
      if (!f.action) continue
      const lift = fromIso(sx, sy + f.h)
      const inF = (q) => q.x >= f.x && q.x < f.x + f.w && q.y >= f.y && q.y < f.y + f.d
      if (inF(t) || inF(lift)) return { furni: f }
    }
    if (tile.x < 0 || tile.y < 0 || tile.x >= this.room.w || tile.y >= this.room.h) return {}
    return { tile }
  }

  onMouseMove(ev) {
    if (!this.room) return
    const hit = this.pick(ev)
    this.hoverEntity = hit.entity || null
    this.hoverFurni = hit.furni || null
    this.hoverTile = hit.tile || null
    const door = hit.tile && this.isDoor(hit.tile.x, hit.tile.y)
    this.canvas.style.cursor = hit.entity || hit.furni || door ? 'pointer' : hit.tile ? 'crosshair' : 'default'
  }

  onClick(ev) {
    if (!this.room || this.frozen) return
    this.hoverTile = null
    const hit = this.pick(ev)
    if (hit.entity) return this.approach(hit.entity)
    if (hit.furni) return this.useFurni(hit.furni)
    if (!hit.tile) return
    const { x, y } = hit.tile
    if (!this.isFree(x, y)) return
    if (this.talkingTo) {
      this.endTalk()
      this.h.onMoveAway?.()
    }
    const door = this.isDoor(x, y)
    this.marker = { x, y, t: performance.now() }
    this.walkTo(this.player, [{ x, y }], door ? () => this.h.onDoor?.(door.to) : null)
  }

  approach(npc) {
    if (this.dist(this.player, npc) <= TALK_RANGE) {
      this.startTalk(npc)
      return this.h.onNPC?.(npc)
    }
    const t = this.tileOf(npc)
    const goals = []
    for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) if ((dx || dy) && this.isFree(t.x + dx, t.y + dy)) goals.push({ x: t.x + dx, y: t.y + dy })
    npc.path = []
    npc.nextWander = performance.now() + 8000
    this.walkTo(this.player, goals, () => {
      this.startTalk(npc)
      this.h.onNPC?.(npc)
    })
  }

  useFurni(f) {
    const goals = []
    for (let x = f.x - 1; x <= f.x + f.w; x++) for (let y = f.y - 1; y <= f.y + f.d; y++) if (this.isFree(x, y)) goals.push({ x, y })
    this.walkTo(this.player, goals, () => this.h.onFurni?.(f))
  }

  // ------------------------------------------------------------------ rendu
  layout() {
    const c = this.canvas
    const dpr = window.devicePixelRatio || 1
    const cw = c.clientWidth
    const ch = c.clientHeight
    if (c.width !== Math.round(cw * dpr) || c.height !== Math.round(ch * dpr)) {
      c.width = Math.round(cw * dpr)
      c.height = Math.round(ch * dpr)
    }
    const r = this.room
    const minX = iso(0, r.h).x
    const maxX = iso(r.w, 0).x
    const minY = -r.wallH - 30
    const maxY = iso(r.w, r.h).y
    const aw = cw * (1 - this.rightInset)
    const ah = ch * (1 - this.bottomInset)
    const top = this.bottomInset ? ch * 0.08 : ch * 0.14 // place pour le HUD
    const scale = Math.min((aw * 0.94) / (maxX - minX), ((ah - top) * 0.92) / (maxY - minY), 1.9)
    const ox = aw / 2 - ((minX + maxX) / 2) * scale
    const oy = top + (ah - top) / 2 - ((minY + maxY) / 2) * scale
    this.view = { scale, ox, oy }
    this.fs = Math.min(1.8, Math.max(1, 0.85 / scale))
    return dpr
  }

  render() {
    const ctx = this.ctx
    if (!this.room || !this.canvas.clientWidth) return
    const dpr = this.layout()
    const r = this.room
    const { scale, ox, oy } = this.view

    // fond
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    const cw = this.canvas.clientWidth
    const ch = this.canvas.clientHeight
    const g = ctx.createLinearGradient(0, 0, 0, ch)
    g.addColorStop(0, r.bgColor)
    g.addColorStop(1, shade(r.bgColor, r.night ? 0.25 : -0.3))
    ctx.fillStyle = g
    ctx.fillRect(0, 0, cw, ch)
    if (r.night) {
      ctx.fillStyle = '#fff'
      for (const [x, y, s] of this.stars) ctx.fillRect(x * cw, y * ch, s, s)
    }

    ctx.setTransform(dpr * scale, 0, 0, dpr * scale, dpr * ox, dpr * oy)
    this.drawWalls()
    this.drawFloor()

    // meubles (par cellule) + persos, triés par profondeur
    const items = []
    for (const f of r.furni) {
      for (let x = f.x; x < f.x + f.w; x++) for (let y = f.y; y < f.y + f.d; y++) items.push({ depth: x + y, draw: () => this.drawFurniCell(f, x, y) })
      items.push({ depth: f.x + f.w - 1 + f.y + f.d - 1 + 0.05, draw: () => this.drawFurniDeco(f) })
    }
    for (const e of this.entities) items.push({ depth: e.x + e.y + 0.1, draw: () => this.drawEntity(e) })
    items.sort((a, b) => a.depth - b.depth).forEach((it) => it.draw())

    // étiquettes et bulles par-dessus (les bulles s'empilent sans se chevaucher)
    this.placedBubbles = []
    const order = [...this.entities].sort((a, b) => (a.bubble?.since || 0) - (b.bubble?.since || 0))
    for (const e of order) this.drawNameAndBubble(e)
    if (this.hoverFurni?.label) {
      const f = this.hoverFurni
      const p = iso(f.x + f.w / 2, f.y + f.d / 2)
      this.tag(p.x, p.y - f.h - 10, f.label, '#2b1838')
    }
  }

  drawWalls() {
    const ctx = this.ctx
    const r = this.room
    const H = r.wallH
    const wall = r.wall
    // mur de droite (le long de y = 0)
    for (let x = 0; x < r.w; x++) {
      const a = iso(x, 0)
      const b = iso(x + 1, 0)
      poly(ctx, [a, b, { x: b.x, y: b.y - H }, { x: a.x, y: a.y - H }], wall, shade(wall, -0.08), 1)
    }
    // mur de gauche (le long de x = 0)
    for (let y = 0; y < r.h; y++) {
      const a = iso(0, y)
      const b = iso(0, y + 1)
      poly(ctx, [a, b, { x: b.x, y: b.y - H }, { x: a.x, y: a.y - H }], shade(wall, -0.12), shade(wall, -0.2), 1)
    }
    // épaisseur en haut
    const top = shade(wall, 0.25)
    poly(ctx, [{ x: iso(0, r.h).x, y: iso(0, r.h).y - H }, { x: iso(0, 0).x, y: -H }, { x: iso(r.w, 0).x, y: iso(r.w, 0).y - H }, { x: iso(r.w, 0).x + 6, y: iso(r.w, 0).y - H - 3 }, { x: 0, y: -H - 7 }, { x: iso(0, r.h).x - 6, y: iso(0, r.h).y - H - 3 }], top)
    // plinthes
    ctx.strokeStyle = shade(wall, -0.35)
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.moveTo(iso(0, r.h).x, iso(0, r.h).y - 2)
    ctx.lineTo(0, -2)
    ctx.lineTo(iso(r.w, 0).x, iso(r.w, 0).y - 2)
    ctx.stroke()

    // fenêtres décoratives (sauf toit)
    if (!r.night && H > 80) {
      for (const x of [Math.floor(r.w * 0.3), Math.floor(r.w * 0.75)]) {
        if (r.doors.some((d) => d.y === 0 && Math.abs(d.x - x) < 1)) continue
        const a = iso(x + 0.15, 0)
        const b = iso(x + 0.85, 0)
        poly(ctx, [{ x: a.x, y: a.y - H * 0.35 }, { x: b.x, y: b.y - H * 0.35 }, { x: b.x, y: b.y - H * 0.85 }, { x: a.x, y: a.y - H * 0.85 }], '#bfe0f5', '#6b4a35', 3)
      }
    }
    // portes
    for (const d of r.doors) {
      const along = d.y === 0
      const a = along ? iso(d.x + 0.12, 0) : iso(0, d.y + 0.12)
      const b = along ? iso(d.x + 0.88, 0) : iso(0, d.y + 0.88)
      const dh = Math.min(H * 0.82, 86)
      const stairs = d.label.startsWith('↑') || d.label.startsWith('↓')
      poly(ctx, [a, b, { x: b.x, y: b.y - dh }, { x: a.x, y: a.y - dh }], stairs ? '#2a2233' : '#6a4e3a', '#3a2a20', 2)
      if (!stairs) {
        const k = along ? iso(d.x + 0.75, 0) : iso(0, d.y + 0.75)
        ctx.fillStyle = '#e6c46e'
        ctx.beginPath()
        ctx.arc(k.x, k.y - dh * 0.45, 2.5, 0, Math.PI * 2)
        ctx.fill()
      }
      const m = along ? iso(d.x + 0.5, 0) : iso(0, d.y + 0.5)
      this.tag(m.x, m.y - dh - 10, d.label, '#6a4e3a', 10)
    }
  }

  drawFloor() {
    const ctx = this.ctx
    const r = this.room
    for (let x = 0; x < r.w; x++) {
      for (let y = 0; y < r.h; y++) {
        const p = iso(x, y)
        const pts = [p, { x: p.x + TW / 2, y: p.y + TH / 2 }, { x: p.x, y: p.y + TH }, { x: p.x - TW / 2, y: p.y + TH / 2 }]
        const door = this.isDoor(x, y)
        poly(ctx, pts, door ? '#ffd27a' : r.floor[(x + y) % 2], 'rgba(0,0,0,0.08)', 1)
      }
    }
    for (const rug of r.rugs) {
      const pts = [iso(rug.x, rug.y), iso(rug.x + rug.w, rug.y), iso(rug.x + rug.w, rug.y + rug.d), iso(rug.x, rug.y + rug.d)]
      poly(ctx, pts, rug.color, shade(rug.color, -0.2), 2)
      const inset = [iso(rug.x + 0.3, rug.y + 0.3), iso(rug.x + rug.w - 0.3, rug.y + 0.3), iso(rug.x + rug.w - 0.3, rug.y + rug.d - 0.3), iso(rug.x + 0.3, rug.y + rug.d - 0.3)]
      poly(ctx, inset, null, 'rgba(255,255,255,0.35)', 2)
    }
    // survol + destination
    const tileOutline = (t, color) => {
      const p = iso(t.x, t.y)
      poly(ctx, [p, { x: p.x + TW / 2, y: p.y + TH / 2 }, { x: p.x, y: p.y + TH }, { x: p.x - TW / 2, y: p.y + TH / 2 }], null, color, 2.5)
    }
    if (this.hoverTile && this.isFree(this.hoverTile.x, this.hoverTile.y)) tileOutline(this.hoverTile, 'rgba(255,255,255,0.8)')
    if (this.marker && this.player.path.length) tileOutline(this.marker, '#ff6f91')
  }

  drawFurniCell(f, x, y) {
    const ctx = this.ctx
    const h = f.h
    const A = iso(x, y)
    const B = iso(x + 1, y)
    const C = iso(x + 1, y + 1)
    const D = iso(x, y + 1)
    const up = (p) => ({ x: p.x, y: p.y - h })
    const hl = this.hoverFurni === f
    const base = f.color
    if (y === f.y + f.d - 1) poly(ctx, [D, C, up(C), up(D)], shade(base, -0.25)) // face avant gauche
    if (x === f.x + f.w - 1) poly(ctx, [B, C, up(C), up(B)], shade(base, -0.1)) // face avant droite
    poly(ctx, [up(A), up(B), up(C), up(D)], f.top && f.kind === 'bed' ? f.top : shade(base, 0.12), hl ? '#ffd24a' : null, 2)
  }

  /** Petits détails dessinés au-dessus des meubles. */
  drawFurniDeco(f) {
    const ctx = this.ctx
    const c = iso(f.x + f.w / 2, f.y + f.d / 2)
    const topY = c.y + TH / 2 - f.h
    const cx = c.x
    switch (f.kind) {
      case 'bed': {
        const p = iso(f.x + 0.5, f.y + 0.45)
        ctx.fillStyle = '#fff'
        ctx.beginPath()
        ctx.ellipse(p.x, p.y + TH / 2 - f.h - 2, 16, 7, -0.45, 0, Math.PI * 2)
        ctx.fill()
        const q = [iso(f.x, f.y + 1), iso(f.x + f.w, f.y + 1), iso(f.x + f.w, f.y + f.d), iso(f.x, f.y + f.d)].map((p) => ({ x: p.x, y: p.y - f.h }))
        poly(ctx, q, f.color)
        break
      }
      case 'desk':
        for (let i = 0; i < f.w; i++) {
          const p = iso(f.x + i + 0.5, f.y + 0.5)
          const y = p.y + TH / 2 - f.h
          poly(ctx, [{ x: p.x - 10, y: y - 2 }, { x: p.x + 4, y: y - 9 }, { x: p.x + 4, y: y - 25 }, { x: p.x - 10, y: y - 18 }], '#222')
          poly(ctx, [{ x: p.x - 8, y: y - 4 }, { x: p.x + 2, y: y - 9 }, { x: p.x + 2, y: y - 23 }, { x: p.x - 8, y: y - 18 }], '#6ec1ff')
        }
        break
      case 'plant':
        ctx.fillStyle = '#4f9a5a'
        for (const [dx, dy, r] of [[0, -18, 11], [-8, -10, 8], [8, -11, 8], [0, -28, 8]]) {
          ctx.beginPath()
          ctx.arc(cx + dx, topY + dy, r, 0, Math.PI * 2)
          ctx.fill()
        }
        break
      case 'shelf':
        for (let i = 0; i < f.w; i++) {
          const a = iso(f.x + i, f.y + 1)
          for (let s = 0; s < 3; s++) {
            const y0 = a.y - 12 - s * 20
            const colors = ['#3f6fd1', '#e0405e', '#3d8a5f', '#d99a1e', '#7a4a9a']
            for (let k = 0; k < 4; k++) {
              const bx = a.x + 5 + k * 6
              poly(ctx, [{ x: bx, y: y0 + k * 3 }, { x: bx + 4, y: y0 + k * 3 + 2 }, { x: bx + 4, y: y0 + k * 3 - 12 }, { x: bx, y: y0 + k * 3 - 14 }], colors[(i + s + k) % 5])
            }
          }
        }
        break
      case 'washer': {
        const a = iso(f.x + 0.5, f.y + 1)
        ctx.fillStyle = '#9aa0a6'
        ctx.beginPath()
        ctx.ellipse(a.x - 8, a.y - 6 - f.h / 2, 8, 10, 0, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#7fb3d9'
        ctx.beginPath()
        ctx.ellipse(a.x - 8, a.y - 6 - f.h / 2, 5.5, 7, 0, 0, Math.PI * 2)
        ctx.fill()
        break
      }
      case 'mailbox':
        for (let i = 0; i < f.w; i++)
          for (let s = 0; s < 3; s++) {
            const a = iso(f.x + i + 0.2, f.y + 1)
            poly(ctx, [{ x: a.x, y: a.y - 8 - s * 14 }, { x: a.x + 18, y: a.y + 1 - s * 14 }, { x: a.x + 18, y: a.y - 9 - s * 14 }, { x: a.x, y: a.y - 18 - s * 14 }], '#8a6a45', '#5b3a29')
          }
        break
      case 'games':
        poly(ctx, [{ x: cx - 14, y: topY }, { x: cx, y: topY - 7 }, { x: cx + 14, y: topY }, { x: cx, y: topY + 7 }], '#3f6fd1')
        ctx.fillStyle = '#e0405e'
        ctx.fillRect(cx + 10, topY - 10, 6, 6)
        break
      case 'pizza':
        poly(ctx, [{ x: cx - 12, y: topY }, { x: cx, y: topY - 6 }, { x: cx + 12, y: topY }, { x: cx, y: topY + 6 }], '#e2b77a', '#a0522d')
        break
      case 'bike':
        ctx.strokeStyle = '#222'
        ctx.lineWidth = 2.5
        ctx.beginPath()
        ctx.arc(cx - 10, topY + 6, 9, 0, Math.PI * 2)
        ctx.arc(cx + 10, topY - 4, 9, 0, Math.PI * 2)
        ctx.stroke()
        break
      case 'cooler':
        poly(ctx, [{ x: cx - 16, y: topY }, { x: cx, y: topY - 8 }, { x: cx + 16, y: topY }, { x: cx, y: topY + 8 }], '#f2f2f2')
        break
      case 'fridge':
        ctx.fillStyle = '#999'
        ctx.fillRect(cx - 12, topY + 22, 3, 14)
        break
    }
  }

  drawEntity(e) {
    const p = iso(e.x + 0.5, e.y + 0.5)
    const ctx = this.ctx
    ctx.save()
    ctx.translate(p.x, p.y + TH / 2)
    const glow = this.hoverEntity === e ? e.color : e === this.talkingTo ? e.color : null
    drawAvatar(ctx, e.look, { dir: e.dir, phase: e.phase, moving: e.path.length > 0, glow })
    ctx.restore()
  }

  drawNameAndBubble(e) {
    const p = iso(e.x + 0.5, e.y + 0.5)
    const baseY = p.y + TH / 2
    const ctx = this.ctx
    const showName = e.isPlayer || this.hoverEntity === e || e === this.talkingTo || !e.bubble
    if (showName) this.tag(p.x, baseY + 14, e.isPlayer ? `${e.name} (toi)` : e.name, e.color, 10)
    if (e.fresh && !e.isPlayer && !e.bubble) {
      ctx.fillStyle = '#ffd24a'
      ctx.strokeStyle = '#2b1838'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(p.x + 14, baseY - 92, 8, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
      ctx.fillStyle = '#2b1838'
      ctx.font = 'bold 11px Nunito, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('!', p.x + 14, baseY - 88)
    }
    if (e.bubble) this.bubble(p.x, baseY - 92, e.bubble.typing ? '…' : e.bubble.text, e.color)
  }

  tag(x, y, text, color, size = 11) {
    const ctx = this.ctx
    size *= this.fs
    ctx.font = `800 ${size}px Nunito, sans-serif`
    const w = ctx.measureText(text).width + 12
    ctx.fillStyle = color
    roundRect(ctx, x - w / 2, y - size, w, size + 7, 7)
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,0.9)'
    ctx.lineWidth = 1.5
    ctx.stroke()
    ctx.fillStyle = '#fff'
    ctx.textAlign = 'center'
    ctx.fillText(text, x, y + 1)
  }

  bubble(x, y, text, color) {
    const ctx = this.ctx
    const fs = this.fs
    ctx.font = `600 ${11 * fs}px Nunito, sans-serif`
    const maxW = 170 * fs
    const words = text.split(' ')
    const lines = []
    let line = ''
    for (const w of words) {
      const test = line ? line + ' ' + w : w
      if (ctx.measureText(test).width > maxW && line) {
        lines.push(line)
        line = w
      } else line = test
    }
    if (line) lines.push(line)
    if (lines.length > 4) {
      lines.length = 4
      lines[3] += '…'
    }
    const w = Math.min(maxW, Math.max(...lines.map((l) => ctx.measureText(l).width))) + 16 * fs
    const h = lines.length * 14 * fs + 10 * fs
    const bx = x - w / 2
    let by = y - h
    // pousse la bulle vers le haut si elle chevauche une bulle déjà dessinée
    let moved = true
    while (moved) {
      moved = false
      for (const b of this.placedBubbles || []) {
        if (bx < b.x + b.w && bx + w > b.x && by < b.y + b.h + 4 && by + h + 4 > b.y) {
          by = b.y - h - 6
          moved = true
        }
      }
    }
    const tail = by + h === y - 0 || by === y - h
    this.placedBubbles?.push({ x: bx, y: by, w, h })
    ctx.fillStyle = 'rgba(255,255,255,0.97)'
    ctx.strokeStyle = color
    ctx.lineWidth = 2
    roundRect(ctx, bx, by, w, h, 9)
    ctx.fill()
    ctx.stroke()
    if (tail) {
      ctx.beginPath()
      ctx.moveTo(x - 5, y - 1)
      ctx.lineTo(x, y + 7)
      ctx.lineTo(x + 5, y - 1)
      ctx.fill()
    }
    ctx.fillStyle = '#2b1838'
    ctx.textAlign = 'center'
    lines.forEach((l, i) => ctx.fillText(l, x, by + (17 + i * 14) * fs))
  }
}
