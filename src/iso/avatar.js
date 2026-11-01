import { shade } from '../art/portrait.js'
import { roundRect } from './iso.js'

/**
 * Dessine un petit avatar "chibi" façon Habbo, pieds en (0,0).
 * Réutilise le `look` des persos (peau, cheveux, haut, coiffure…).
 */
export function drawAvatar(ctx, look, { dir = 1, phase = 0, moving = false, glow = null } = {}) {
  const skin = look.skin || '#f2d0b5'
  const hair = look.hair || '#4a3020'
  const top = look.top || '#3b6fd8'
  const pants = look.pants || (look.male ? '#3b3f5c' : '#4a4060')
  const outline = shade(skin, -0.5)
  const swing = moving ? Math.sin(phase) : 0
  const bob = moving ? Math.abs(Math.sin(phase)) * 2.5 : 0
  const style = look.hairStyle || 'short'

  ctx.save()
  // ombre
  ctx.fillStyle = 'rgba(0,0,0,0.22)'
  ctx.beginPath()
  ctx.ellipse(0, 0, 16, 6, 0, 0, Math.PI * 2)
  ctx.fill()

  if (glow) {
    ctx.shadowColor = glow
    ctx.shadowBlur = 16
  }
  ctx.translate(0, -bob)
  ctx.scale(dir, 1)
  ctx.lineWidth = 1.5

  // cheveux longs (derrière)
  ctx.fillStyle = hair
  ctx.strokeStyle = shade(hair, -0.3)
  if (style === 'long_wavy' || style === 'long_straight') {
    roundRect(ctx, -16, -72, 30, 44, 10)
    ctx.fill()
    ctx.stroke()
  } else if (style === 'bob') {
    roundRect(ctx, -17, -72, 32, 26, 11)
    ctx.fill()
    ctx.stroke()
  } else if (style === 'ponytail') {
    ctx.beginPath()
    ctx.ellipse(-17, -58 + swing, 6, 13, 0.3, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
  }

  // jambes
  ctx.fillStyle = pants
  ctx.strokeStyle = shade(pants, -0.3)
  roundRect(ctx, -8 + swing * 3, -20, 7, 19, 3)
  ctx.fill()
  ctx.stroke()
  roundRect(ctx, 1 - swing * 3, -20, 7, 19, 3)
  ctx.fill()
  ctx.stroke()
  ctx.fillStyle = '#2a2230'
  roundRect(ctx, -9 + swing * 3, -4, 9, 5, 2)
  ctx.fill()
  roundRect(ctx, 0 - swing * 3, -4, 9, 5, 2)
  ctx.fill()

  // bras arrière
  ctx.fillStyle = shade(top, -0.15)
  roundRect(ctx, -15 - swing * 2, -42, 7, 20, 3)
  ctx.fill()

  // corps
  ctx.fillStyle = top
  ctx.strokeStyle = shade(top, -0.35)
  roundRect(ctx, -12, -45, 24, 28, 8)
  ctx.fill()
  ctx.stroke()
  if (look.topStyle === 'puffer') {
    ctx.strokeStyle = shade(top, -0.3)
    ctx.beginPath()
    ctx.moveTo(-11, -35); ctx.lineTo(11, -35)
    ctx.moveTo(-11, -26); ctx.lineTo(11, -26)
    ctx.stroke()
  }
  if (look.print) {
    ctx.fillStyle = look.accent || '#fff'
    roundRect(ctx, -6, -36, 12, 4, 2)
    ctx.fill()
  }

  // bras avant
  ctx.fillStyle = top
  roundRect(ctx, 8 + swing * 2, -42, 7, 20, 3)
  ctx.fill()
  ctx.fillStyle = skin
  ctx.beginPath()
  ctx.arc(11.5 + swing * 2, -21, 3.5, 0, Math.PI * 2)
  ctx.fill()

  // tête
  ctx.fillStyle = skin
  ctx.strokeStyle = outline
  ctx.beginPath()
  ctx.arc(0, -59, 14, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()

  // yeux (regardent vers l'avant)
  ctx.fillStyle = '#20140f'
  ctx.beginPath()
  ctx.ellipse(3, -58, 1.8, 2.6, 0, 0, Math.PI * 2)
  ctx.ellipse(10, -58, 1.8, 2.6, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = 'rgba(255,110,130,0.35)'
  ctx.beginPath()
  ctx.ellipse(10, -52, 3.5, 2, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#7a2a35'
  ctx.beginPath()
  ctx.arc(7, -52, 2.5, 0.2, Math.PI - 0.2)
  ctx.stroke()

  if (look.glasses) {
    ctx.strokeStyle = '#222'
    ctx.lineWidth = 1.3
    roundRect(ctx, 0, -62, 6, 6, 2)
    ctx.stroke()
    roundRect(ctx, 7.5, -62, 6, 6, 2)
    ctx.stroke()
  }
  if (look.freckles) {
    ctx.fillStyle = shade(skin, -0.3)
    for (const [x, y] of [[7, -54], [11, -55], [13, -53]]) ctx.fillRect(x, y, 1.2, 1.2)
  }

  // cheveux (dessus)
  ctx.fillStyle = hair
  ctx.strokeStyle = shade(hair, -0.3)
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.arc(0, -61, 15.5, Math.PI * 0.92, Math.PI * 2.08)
  ctx.quadraticCurveTo(6, -64, 2, -66)
  ctx.quadraticCurveTo(-8, -60, -15, -56)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()
  if (style === 'messy') {
    ctx.beginPath()
    ctx.moveTo(-10, -72); ctx.lineTo(-7, -82); ctx.lineTo(-2, -74); ctx.lineTo(2, -84); ctx.lineTo(6, -74); ctx.lineTo(12, -80); ctx.lineTo(11, -70)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
  }
  if (style === 'short' || style === 'messy') {
    ctx.beginPath()
    ctx.ellipse(-9, -57, 6, 9, 0, 0, Math.PI * 2)
    ctx.fill()
  }
  if (style === 'bun') {
    ctx.beginPath()
    ctx.arc(-4, -77, 7.5, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
  }
  if (style === 'long_wavy' || style === 'long_straight' || style === 'bob') {
    ctx.beginPath()
    ctx.ellipse(-11, -55, 6, 11, 0, 0, Math.PI * 2)
    ctx.fill()
  }
  if (look.earrings) {
    ctx.fillStyle = '#f2c94c'
    ctx.beginPath()
    ctx.arc(-3, -50, 1.8, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
}
