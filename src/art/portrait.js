// ============================================================
//  Générateur de portraits SVG style anime / otome.
//  Chaque perso est décrit par un objet `look` (voir src/characters.js).
//  Expressions : neutral, happy, sad, angry, surprised, blush, awkward
// ============================================================

let uidCounter = 0

export const EXPRESSIONS = ['neutral', 'happy', 'sad', 'angry', 'surprised', 'blush', 'awkward']

/** Éclaircit (p > 0) ou assombrit (p < 0) une couleur hex. */
export function shade(hex, p) {
  const n = parseInt(hex.slice(1), 16)
  const ch = [n >> 16, (n >> 8) & 255, n & 255].map((v) =>
    Math.max(0, Math.min(255, Math.round(v + (p < 0 ? v : 255 - v) * p))),
  )
  return '#' + ch.map((v) => v.toString(16).padStart(2, '0')).join('')
}

const DEFAULT_LOOK = {
  male: false,
  skin: '#f2d0b5',
  hair: '#4a3020',
  hairStyle: 'short',
  eyes: '#5a3d2b',
  top: '#3b6fd8',
  topStyle: 'tshirt',
  accent: '#ffffff',
  glasses: false,
  earrings: false,
  freckles: false,
  beanie: null,
  print: null,
}

/**
 * Renvoie le SVG (string) d'un portrait.
 * @param {string} id   identifiant unique (pour les defs SVG)
 * @param {object} look apparence
 * @param {string} expr expression
 * @param {object} opts { crop: true } pour un cadrage visage (avatars)
 */
export function portraitSVG(id, look, expr = 'neutral', opts = {}) {
  const L = { ...DEFAULT_LOOK, ...look }
  const uid = `${id}-${++uidCounter}`
  const outline = shade(L.skin, -0.5)
  const skinShade = shade(L.skin, -0.12)
  const viewBox = opts.crop ? '92 62 216 216' : '0 0 400 600'

  const parts = [
    hairBack(L),
    `<g transform="translate(200,0) scale(1.1,1) translate(-200,-36)">${body(L, uid)}</g>`,
    neck(L, skinShade),
    `<g transform="translate(200,0) scale(1.1,1) translate(-200,-36)">${collar(L)}</g>`,
    ears(L, outline),
    `<path d="M130,200 C128,118 272,118 270,200 C270,262 238,302 200,311 C162,302 130,262 130,200Z" fill="${L.skin}" stroke="${outline}" stroke-width="2.5"/>`,
    `<path d="M132,178 Q200,222 268,178 L268,165 L132,165Z" fill="${skinShade}" opacity="0.55"/>`,
    cheeks(L, expr),
    eyes(L, expr),
    brows(L, expr),
    `<path d="M200,238 Q195,251 202,253" fill="none" stroke="${outline}" stroke-width="2" stroke-linecap="round" opacity="0.7"/>`,
    mouth(expr),
    hairFront(L),
    accessories(L),
    extras(expr),
  ]

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" class="portrait-svg">${parts.join('')}</svg>`
}

// ---------------------------------------------------------------- corps
function body(L, uid) {
  const dark = shade(L.top, -0.3)
  let defs = ''
  let fill = L.top
  if (L.topStyle === 'flannel') {
    defs = `<defs><pattern id="fl-${uid}" width="44" height="44" patternUnits="userSpaceOnUse">
      <rect width="44" height="44" fill="${L.top}"/>
      <rect x="0" y="16" width="44" height="10" fill="${dark}" opacity="0.6"/>
      <rect x="16" y="0" width="10" height="44" fill="${dark}" opacity="0.6"/>
      <rect x="0" y="36" width="44" height="3" fill="#000" opacity="0.25"/>
      <rect x="36" y="0" width="3" height="44" fill="#000" opacity="0.25"/></pattern></defs>`
    fill = `url(#fl-${uid})`
  }
  let s = `${defs}<path d="M30,640 C38,452 104,384 200,377 C296,384 362,452 370,640Z" fill="${fill}" stroke="${dark}" stroke-width="3"/>`
  // plis
  s += `<path d="M110,520 Q120,580 112,640 M290,520 Q280,580 288,640" stroke="${dark}" stroke-width="3" fill="none" opacity="0.5"/>`
  if (L.topStyle === 'puffer') {
    for (const y of [450, 505, 560]) {
      s += `<path d="M${60 + (y - 450) * 0.1},${y} Q200,${y + 22} ${340 - (y - 450) * 0.1},${y}" stroke="${dark}" stroke-width="3" fill="none"/>`
    }
    s += `<line x1="200" y1="400" x2="200" y2="640" stroke="${dark}" stroke-width="4"/>`
  }
  if (L.print) {
    s += `<text x="200" y="500" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" font-size="34" letter-spacing="3" fill="${L.accent}">${L.print}</text>`
  }
  return s
}

function neck(L, skinShade) {
  if (L.topStyle === 'shirt' || L.topStyle === 'flannel') {
    return `<path d="M170,280 L170,336 L200,374 L230,336 L230,280Z" fill="${L.skin}"/>
      <path d="M170,290 Q200,325 230,290 L230,282 L170,282Z" fill="${skinShade}"/>`
  }
  return `<path d="M170,280 L170,332 Q200,362 230,332 L230,280Z" fill="${L.skin}"/>
    <path d="M170,290 Q200,325 230,290 L230,282 L170,282Z" fill="${skinShade}"/>`
}

function collar(L) {
  const dark = shade(L.top, -0.25)
  switch (L.topStyle) {
    case 'hoodie':
      return `<path d="M128,398 Q140,365 170,368 Q200,402 230,368 Q260,365 272,398 Q240,440 200,442 Q160,440 128,398Z" fill="${shade(L.top, -0.12)}" stroke="${dark}" stroke-width="3"/>
        <path d="M168,370 Q200,405 232,370" fill="none" stroke="${dark}" stroke-width="4"/>
        <path d="M186,420 L182,490 M214,420 L218,490" stroke="${L.accent}" stroke-width="4" stroke-linecap="round"/>
        <circle cx="182" cy="494" r="5" fill="${L.accent}"/><circle cx="218" cy="494" r="5" fill="${L.accent}"/>`
    case 'sweater':
      return `<path d="M162,366 Q200,412 238,366" fill="none" stroke="${dark}" stroke-width="13" stroke-linecap="round"/>`
    case 'shirt':
    case 'flannel': {
      const c = L.topStyle === 'flannel' ? shade(L.top, -0.15) : L.accent
      return `<path d="M168,366 L200,412 L178,428 L150,388Z" fill="${c}" stroke="${dark}" stroke-width="2.5"/>
        <path d="M232,366 L200,412 L222,428 L250,388Z" fill="${c}" stroke="${dark}" stroke-width="2.5"/>
        <circle cx="200" cy="450" r="4" fill="${dark}"/><circle cx="200" cy="500" r="4" fill="${dark}"/><circle cx="200" cy="550" r="4" fill="${dark}"/>`
    }
    case 'puffer':
      return `<path d="M150,385 Q150,350 170,345 L170,372 Q200,400 230,372 L230,345 Q250,350 250,385 Q200,420 150,385Z" fill="${shade(L.top, 0.08)}" stroke="${dark}" stroke-width="3"/>`
    default: // tshirt
      return `<path d="M164,366 Q200,408 236,366" fill="none" stroke="${dark}" stroke-width="6" stroke-linecap="round"/>`
  }
}

function ears(L, outline) {
  return `<ellipse cx="132" cy="222" rx="11" ry="17" fill="${L.skin}" stroke="${outline}" stroke-width="2"/>
    <ellipse cx="268" cy="222" rx="11" ry="17" fill="${L.skin}" stroke="${outline}" stroke-width="2"/>`
}

// ---------------------------------------------------------------- visage
function eyes(L, expr) {
  return eye(165, 218, L, expr, -1) + eye(235, 218, L, expr, 1)
}

function eye(cx, cy, L, expr, side) {
  const rx = L.male ? 17 : 19
  let ry = L.male ? 11 : 15
  const lash = '#2a1a14'
  const lw = L.male ? 4.5 : 6

  if (expr === 'happy') {
    return `<path d="M${cx - rx},${cy + 4} Q${cx},${cy - ry - 2} ${cx + rx},${cy + 4}" fill="none" stroke="${lash}" stroke-width="${lw}" stroke-linecap="round"/>`
  }
  if (expr === 'surprised') ry += 3
  const irisR = expr === 'surprised' ? 9 : ry - 1
  const pupilR = expr === 'surprised' ? 3.5 : irisR * 0.45
  const iy = expr === 'sad' ? cy + 2 : cy + 1

  let s = `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#fff"/>`
  s += `<ellipse cx="${cx}" cy="${iy}" rx="${Math.min(irisR, rx - 4)}" ry="${irisR}" fill="${L.eyes}"/>`
  s += `<ellipse cx="${cx}" cy="${iy + 2}" rx="${Math.min(irisR, rx - 4) * 0.7}" ry="${irisR * 0.55}" fill="${shade(L.eyes, 0.35)}" opacity="0.6"/>`
  s += `<circle cx="${cx}" cy="${iy}" r="${pupilR}" fill="#120a08"/>`
  s += `<circle cx="${cx - 4}" cy="${iy - 5}" r="${L.male ? 3 : 4}" fill="#fff"/>`
  s += `<circle cx="${cx + 4}" cy="${iy + 4}" r="1.8" fill="#fff" opacity="0.8"/>`

  if (expr === 'angry') {
    const inner = side < 0 ? cx + rx + 4 : cx - rx - 4
    const outer = side < 0 ? cx - rx - 4 : cx + rx + 4
    s += `<polygon points="${outer},${cy - ry - 8} ${inner},${cy - ry - 8} ${inner},${cy - 1} ${outer},${cy - ry + 3}" fill="${L.skin}"/>`
    s += `<line x1="${outer}" y1="${cy - ry + 3}" x2="${inner}" y2="${cy - 1}" stroke="${lash}" stroke-width="${lw}" stroke-linecap="round"/>`
  } else if (expr === 'sad' || expr === 'awkward') {
    // paupière mi-close
    s += `<path d="M${cx - rx - 2},${cy - ry - 4} L${cx + rx + 2},${cy - ry - 4} L${cx + rx + 2},${cy - ry * 0.35} Q${cx},${cy - ry * 0.1} ${cx - rx - 2},${cy - ry * 0.35}Z" fill="${L.skin}"/>`
    s += `<path d="M${cx - rx - 2},${cy - ry * 0.35} Q${cx},${cy - ry * 0.1} ${cx + rx + 2},${cy - ry * 0.35}" fill="none" stroke="${lash}" stroke-width="${lw}" stroke-linecap="round"/>`
  } else {
    s += `<path d="M${cx - rx - 3},${cy + 1} Q${cx},${cy - ry - 7} ${cx + rx + 3},${cy - 1}" fill="none" stroke="${lash}" stroke-width="${lw}" stroke-linecap="round"/>`
    if (!L.male) {
      const ox = side < 0 ? cx - rx - 3 : cx + rx + 3
      s += `<path d="M${ox},${cy} l${side * 7},-6" stroke="${lash}" stroke-width="3" stroke-linecap="round"/>`
    }
  }
  return s
}

function brows(L, expr) {
  const color = shade(L.hair, -0.25)
  const w = L.male ? 6 : 4
  const by = L.male ? 194 : 190
  const one = (cx, side) => {
    const rx = 20
    const outerX = side < 0 ? cx - rx : cx + rx
    const innerX = side < 0 ? cx + rx - 4 : cx - rx + 4
    let oy = by + 2, iy = by
    if (expr === 'angry') { iy = by + 10; oy = by - 3 }
    if (expr === 'sad') { iy = by - 8; oy = by + 4 }
    if (expr === 'surprised') { iy = by - 9; oy = by - 7 }
    if (expr === 'happy' || expr === 'blush') { iy = by - 3; oy = by - 1 }
    if (expr === 'awkward') { iy = by - 5; oy = by + 3 }
    return `<path d="M${outerX},${oy} Q${cx},${Math.min(oy, iy) - 6} ${innerX},${iy}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round"/>`
  }
  return one(165, -1) + one(235, 1)
}

function mouth(expr) {
  const c = '#7a2a35'
  switch (expr) {
    case 'happy':
      return `<path d="M181,263 Q200,292 219,263 Q200,271 181,263Z" fill="${c}"/>
        <path d="M186,266 Q200,271 214,266 L212,270 Q200,274 188,270Z" fill="#fff"/>`
    case 'sad':
      return `<path d="M188,277 Q200,266 212,277" fill="none" stroke="${c}" stroke-width="3.5" stroke-linecap="round"/>`
    case 'angry':
      return `<path d="M185,275 Q200,267 215,275" fill="none" stroke="${c}" stroke-width="4" stroke-linecap="round"/>`
    case 'surprised':
      return `<ellipse cx="200" cy="274" rx="7" ry="9" fill="${c}"/>`
    case 'blush':
      return `<path d="M191,270 Q200,277 209,270" fill="none" stroke="${c}" stroke-width="3" stroke-linecap="round"/>`
    case 'awkward':
      return `<path d="M185,273 Q190,267 195,273 T205,273 T215,273" fill="none" stroke="${c}" stroke-width="3" stroke-linecap="round"/>`
    default:
      return `<path d="M189,270 Q200,276 211,270" fill="none" stroke="${c}" stroke-width="3" stroke-linecap="round"/>`
  }
}

function cheeks(L, expr) {
  let s = ''
  const op = expr === 'blush' ? 0.55 : expr === 'happy' ? 0.3 : 0.15
  s += `<ellipse cx="156" cy="252" rx="17" ry="8" fill="#ff6f85" opacity="${op}"/>
        <ellipse cx="244" cy="252" rx="17" ry="8" fill="#ff6f85" opacity="${op}"/>`
  if (expr === 'blush') {
    s += `<path d="M146,250 l6,-7 M156,251 l6,-7 M166,252 l6,-7 M234,252 l6,-7 M244,251 l6,-7 M254,250 l6,-7" stroke="#e0485f" stroke-width="2" stroke-linecap="round"/>`
  }
  if (L.freckles) {
    const pts = [[150, 244], [158, 249], [146, 252], [162, 243], [250, 244], [242, 249], [254, 252], [238, 243]]
    s += pts.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.8" fill="${shade(L.skin, -0.35)}"/>`).join('')
  }
  return s
}

function extras(expr) {
  if (expr === 'awkward') {
    return `<path d="M280,160 Q294,184 280,193 Q266,184 280,160Z" fill="#a9ddff" stroke="#5aa9d8" stroke-width="2"/>`
  }
  if (expr === 'angry') {
    return `<g stroke="#e0485f" stroke-width="4" stroke-linecap="round" fill="none">
      <path d="M268,128 q8,8 0,16 M288,128 q-8,8 0,16 M270,124 q8,-8 16,0 M270,148 q8,8 16,0"/></g>`
  }
  if (expr === 'surprised') {
    return `<g stroke="#2a1a14" stroke-width="4" stroke-linecap="round"><path d="M282,140 l14,-14 M290,156 l18,-4 M274,126 l4,-18"/></g>`
  }
  return ''
}

// ---------------------------------------------------------------- cheveux
function hairBack(L) {
  const h = L.hair, d = shade(L.hair, -0.3)
  const st = `fill="${h}" stroke="${d}" stroke-width="3"`
  switch (L.hairStyle) {
    case 'long_wavy':
      return `<path d="M118,200 C96,104 304,104 282,200 C294,280 314,380 304,470 C288,492 262,470 250,484 C228,494 172,494 150,484 C138,470 112,492 96,470 C86,380 106,280 118,200Z" ${st}/>`
    case 'long_straight':
      return `<path d="M120,200 C104,104 296,104 280,200 L294,476 L106,476Z" ${st}/>`
    case 'bob':
      return `<path d="M116,200 C98,102 302,102 284,200 L292,300 C262,318 138,318 108,300Z" ${st}/>`
    case 'ponytail':
      return `<path d="M124,200 C108,106 292,106 276,200Z" ${st}/>
        <path d="M258,128 C336,140 338,300 300,410 C292,330 286,250 252,178Z" ${st}/>`
    case 'bun':
      return `<circle cx="200" cy="92" r="40" ${st}/>
        <path d="M124,205 C108,108 292,108 276,205Z" ${st}/>`
    default:
      return `<path d="M124,212 C110,118 160,80 205,82 C258,84 294,126 278,212Z" ${st}/>`
  }
}

function hairFront(L) {
  const h = L.hair, d = shade(L.hair, -0.3), hl = shade(L.hair, 0.3)
  const st = `fill="${h}" stroke="${d}" stroke-width="3" stroke-linejoin="round"`
  const shine = (x, y) => `<path d="M${x},${y} q20,-12 40,-4" stroke="${hl}" stroke-width="6" fill="none" stroke-linecap="round" opacity="0.7"/>`
  switch (L.hairStyle) {
    case 'short':
      return `<path d="M127,202 C120,126 170,94 208,96 C254,98 284,140 273,202 C268,180 262,166 255,158 L247,184 L236,150 L222,178 L210,146 L196,176 L182,148 L170,180 L158,156 L148,186 C140,182 132,190 127,202Z" ${st}/>${shine(175, 120)}`
    case 'messy':
      return `<path d="M127,204 C118,126 168,92 208,94 C256,96 286,140 273,204 L262,170 L254,192 L240,152 L228,184 L214,146 L198,180 L186,148 L172,186 L160,154 L150,190 L140,170Z" ${st}/>
        <path d="M168,104 L156,70 L186,94 L200,60 L214,94 L246,70 L236,108Z" ${st}/>${shine(170, 118)}`
    case 'long_wavy':
      return `<path d="M125,215 C113,113 287,113 275,215 C268,176 250,150 215,140 C200,166 164,182 140,186 C132,196 128,206 125,215Z" ${st}/>
        <path d="M128,196 C110,262 118,332 138,390 C152,352 142,302 146,228Z" ${st}/>
        <path d="M272,196 C290,262 282,332 262,390 C248,352 258,302 254,228Z" ${st}/>${shine(200, 128)}`
    case 'long_straight':
      return `<path d="M126,202 C118,110 282,110 274,202 L268,180 L250,174 L232,182 L214,172 L196,182 L178,172 L160,182 L142,174 L132,184Z" ${st}/>
        <path d="M129,190 L120,402 L144,402 L148,206Z" ${st}/><path d="M271,190 L280,402 L256,402 L252,206Z" ${st}/>${shine(178, 126)}`
    case 'bob':
      return `<path d="M124,212 C112,110 288,110 276,212 C270,180 254,160 230,150 C200,172 160,176 134,182 C128,192 126,202 124,212Z" ${st}/>
        <path d="M127,192 C116,240 113,282 116,304 L150,304 C140,262 140,230 143,202Z" ${st}/>
        <path d="M273,192 C284,240 287,282 284,304 L250,304 C260,262 260,230 257,202Z" ${st}/>${shine(190, 128)}`
    case 'ponytail':
      return `<path d="M126,206 C116,112 284,112 274,206 C266,174 246,152 214,146 C196,168 160,180 138,184 C132,192 128,198 126,206Z" ${st}/>
        <circle cx="262" cy="138" r="9" fill="${L.accent}"/>${shine(190, 128)}`
    case 'bun':
      return `<path d="M126,206 C118,116 282,116 274,206 C265,172 236,150 200,148 C164,150 135,172 126,206Z" ${st}/>
        <path d="M132,196 C126,230 130,256 136,270 M268,196 C274,230 270,256 264,270" stroke="${h}" stroke-width="7" fill="none" stroke-linecap="round"/>
        <circle cx="200" cy="96" r="6" fill="${L.accent}"/>${shine(186, 128)}`
    default:
      return ''
  }
}

function accessories(L) {
  let s = ''
  if (L.earrings) {
    s += `<circle cx="132" cy="244" r="5" fill="#f2c94c" stroke="#b8902a" stroke-width="1.5"/>
      <circle cx="268" cy="244" r="5" fill="#f2c94c" stroke="#b8902a" stroke-width="1.5"/>`
  }
  if (L.glasses) {
    s += `<g fill="#bfe3ff" fill-opacity="0.18" stroke="#2a2a2a" stroke-width="4">
      <rect x="141" y="200" width="50" height="36" rx="11"/><rect x="209" y="200" width="50" height="36" rx="11"/></g>
      <path d="M191,214 Q200,207 209,214 M141,212 L131,208 M259,212 L269,208" stroke="#2a2a2a" stroke-width="4" fill="none"/>`
  }
  if (L.beanie) {
    const b = L.beanie
    s += `<path d="M122,176 C116,86 284,86 278,176Z" fill="${b}" stroke="${shade(b, -0.3)}" stroke-width="3"/>
      <rect x="116" y="156" width="168" height="32" rx="14" fill="${shade(b, -0.15)}" stroke="${shade(b, -0.3)}" stroke-width="3"/>
      <circle cx="200" cy="84" r="20" fill="#fff" stroke="#ddd" stroke-width="2"/>`
  }
  return s
}
