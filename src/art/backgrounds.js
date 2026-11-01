// ============================================================
//  Décors générés en SVG (1600x900).
//  Pour utiliser une vraie image à la place : mets un fichier dans
//  public/assets/bg/<id>.png et ajoute l'id dans IMAGE_OVERRIDES.
// ============================================================

const IMAGE_OVERRIDES = {
  // appart_gars: 'assets/bg/appart_gars.png',
}

const W = 1600
const H = 900

let seed = 7
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647

const svg = (body, defs = '') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice"><defs>${defs}</defs>${body}</svg>`
const R = (x, y, w, h, fill, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" ${extra}/>`
const grad = (id, stops, x2 = 0, y2 = 1) =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">${stops
    .map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`)
    .join('')}</linearGradient>`
const glow = `<filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8"/></filter>`

/** Guirlande lumineuse entre (x1,y) et (x2,y) avec un creux `sag`. */
function stringLights(x1, x2, y, sag, n, colors) {
  let s = `<path d="M${x1},${y} Q${(x1 + x2) / 2},${y + sag * 2} ${x2},${y}" stroke="#222" stroke-width="2.5" fill="none"/>`
  for (let i = 1; i < n; i++) {
    const t = i / n
    const x = x1 + (x2 - x1) * t
    const yy = y + sag * 4 * t * (1 - t)
    const c = colors[i % colors.length]
    s += `<circle cx="${x}" cy="${yy + 10}" r="14" fill="${c}" opacity="0.45" filter="url(#glow)"/><circle cx="${x}" cy="${yy + 10}" r="6" fill="${c}"/>`
  }
  return s
}

function planks(y, color, h = H - y) {
  let s = R(0, y, W, h, color)
  for (let yy = y + 40; yy < H; yy += 42) s += `<line x1="0" y1="${yy}" x2="${W}" y2="${yy}" stroke="#000" stroke-opacity="0.12" stroke-width="3"/>`
  return s
}

function brickWall(x, y, w, h, color) {
  let s = R(x, y, w, h, color)
  for (let yy = y; yy < y + h; yy += 18) {
    s += `<line x1="${x}" y1="${yy}" x2="${x + w}" y2="${yy}" stroke="#000" stroke-opacity="0.15" stroke-width="2"/>`
  }
  return s
}

// ------------------------------------------------------------ appart 3B
function appartGars() {
  const defs = grad('wall', [[0, '#d5dfe8'], [1, '#b6c4d2']]) + grad('sky', [[0, '#8ec8ee'], [1, '#e3f2fb']]) + glow
  let b = R(0, 0, W, H, 'url(#wall)')
  // fenêtre : vue sur un immeuble en briques et son escalier en colimaçon
  b += R(930, 130, 500, 380, '#6b4a35') + R(950, 150, 460, 340, 'url(#sky)')
  b += brickWall(950, 290, 460, 200, '#a5523b')
  for (let x = 975; x < 1390; x += 80) b += R(x, 315, 40, 55, '#3b4a5a') + R(x, 400, 40, 55, '#3b4a5a')
  b += `<g stroke="#1d1d1d" stroke-width="5" fill="none"><path d="M1330,490 C1270,470 1390,445 1330,425 C1270,405 1390,380 1330,360 C1270,340 1390,315 1330,300"/><line x1="1300" y1="300" x2="1300" y2="490"/><line x1="1360" y1="300" x2="1360" y2="490"/></g>`
  b += R(950, 472, 460, 18, '#ffffff') + R(1176, 150, 9, 340, '#6b4a35') + R(950, 312, 460, 9, '#6b4a35')
  b += R(915, 505, 530, 20, '#f2f2f2', 'rx="4"')
  for (let i = 0; i < 22; i++) b += `<circle cx="${960 + rnd() * 440}" cy="${160 + rnd() * 120}" r="${2 + rnd() * 3}" fill="#fff"/>`
  // posters
  b += R(190, 140, 190, 250, '#1f2a44', 'rx="6"') + `<path d="M285,190 L310,260 L285,300 L260,260Z" fill="#e8e8e8"/><path d="M262,300 L285,290 L308,300 L296,330 L274,330Z" fill="#ff8a3d"/>` +
    `<text x="285" y="370" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="26" fill="#ffd27a">ESPACE</text>`
  b += R(420, 180, 170, 120, '#f2c14e', 'rx="6"') + `<text x="505" y="255" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="48" fill="#b3263a">MTL</text>`
  // sol + tapis
  b += planks(640, '#9a7350')
  b += `<ellipse cx="560" cy="770" rx="420" ry="80" fill="#c75b4a" opacity="0.85"/><ellipse cx="560" cy="770" rx="370" ry="60" fill="none" stroke="#f2d0a0" stroke-width="5" opacity="0.6"/>`
  // canapé
  b += R(110, 470, 580, 150, '#4d6b5c', 'rx="34"') + R(90, 565, 620, 95, '#5a7d6b', 'rx="20"')
  b += R(70, 510, 70, 160, '#47614f', 'rx="24"') + R(660, 510, 70, 160, '#47614f', 'rx="24"')
  b += R(160, 500, 150, 80, '#e8c35a', 'rx="18"') + R(480, 505, 140, 75, '#d9675a', 'rx="18"')
  b += R(110, 655, 18, 30, '#3a2a20') + R(670, 655, 18, 30, '#3a2a20')
  // bureau et laptops
  b += R(950, 570, 500, 22, '#5b3e2b') + R(970, 592, 18, 140, '#5b3e2b') + R(1410, 592, 18, 140, '#5b3e2b')
  for (const x of [1000, 1230]) {
    b += R(x, 470, 160, 100, '#222', 'rx="6"') + R(x + 8, 478, 144, 84, '#6ec1ff') + `<polygon points="${x - 15},570 ${x + 175},570 ${x + 160},580 ${x},580" fill="#888"/>`
    b += R(x + 18, 492, 90, 6, '#fff', 'opacity="0.7"') + R(x + 18, 506, 60, 6, '#fff', 'opacity="0.5"') + R(x + 18, 520, 100, 6, '#fff', 'opacity="0.5"')
  }
  b += R(1180, 540, 26, 32, '#e05a4a', 'rx="4"')
  // boîte à pizza
  b += `<polygon points="760,700 940,700 960,730 740,730" fill="#e2b77a"/><text x="850" y="723" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="18" fill="#a0522d">PIZZA</text>`
  // lampe
  b += R(810, 380, 8, 270, '#333') + `<polygon points="770,380 858,380 840,330 788,330" fill="#f2d07a"/><ellipse cx="814" cy="400" rx="70" ry="25" fill="#ffe9a8" opacity="0.4" filter="url(#glow)"/>`
  return svg(b, defs)
}

// ------------------------------------------------------------ appart 3C
function appartFilles() {
  const defs = grad('wall2', [[0, '#f6e1db'], [1, '#e9c9c0']]) + grad('sky2', [[0, '#ffc9a8'], [1, '#ffe8d0']]) + glow
  let b = R(0, 0, W, H, 'url(#wall2)')
  // grande fenêtre
  b += R(560, 110, 480, 400, '#fff', 'rx="8"') + R(578, 128, 444, 364, 'url(#sky2)')
  b += `<path d="M578,400 L640,330 L700,360 L780,300 L860,350 L940,310 L1022,370 L1022,492 L578,492Z" fill="#c98b8b" opacity="0.6"/>`
  b += R(796, 128, 8, 364, '#fff') + R(578, 306, 444, 8, '#fff')
  b += stringLights(540, 1060, 110, 40, 14, ['#ffd27a', '#ff9ec0', '#a8e6ff'])
  // rideaux
  b += `<path d="M520,100 Q560,300 530,520 L580,520 Q600,300 590,100Z" fill="#d97a9a" opacity="0.85"/><path d="M1080,100 Q1040,300 1070,520 L1020,520 Q1000,300 1010,100Z" fill="#d97a9a" opacity="0.85"/>`
  // fanion
  b += `<polygon points="150,150 400,190 150,230" fill="#b3263a"/><text x="168" y="198" font-family="Georgia, serif" font-weight="bold" font-size="30" fill="#fff">McGILL</text>`
  // bibliothèque
  b += R(1180, 150, 300, 500, '#8a5a3c', 'rx="6"')
  const bookColors = ['#3f6fd1', '#e0405e', '#3d8a5f', '#d99a1e', '#7a4a9a', '#e8e8e8']
  for (const y of [180, 300, 420, 540]) {
    b += R(1195, y + 95, 270, 12, '#6b4630')
    let x = 1205
    while (x < 1450) {
      const w = 14 + rnd() * 16
      const h = 60 + rnd() * 30
      b += R(x, y + 95 - h, w, h, bookColors[Math.floor(rnd() * bookColors.length)], 'rx="2"')
      x += w + 3
    }
  }
  // plantes
  const plant = (x, y, s) =>
    `<g transform="translate(${x},${y}) scale(${s})"><path d="M-40,0 L40,0 L30,70 L-30,70Z" fill="#c9784a"/>` +
    [[-30, -80, -25], [0, -110, 0], [30, -85, 25], [-15, -60, -50], [18, -60, 50]]
      .map(([dx, dy, r]) => `<ellipse cx="${dx}" cy="${dy / 1.6}" rx="18" ry="48" fill="#4f9a5a" transform="rotate(${r} ${dx} ${dy / 1.6})"/>`)
      .join('') + '</g>'
  b += plant(470, 560, 1.1) + plant(1110, 590, 0.9)
  // sol + tapis
  b += planks(650, '#c8a07a')
  b += `<ellipse cx="760" cy="780" rx="380" ry="70" fill="#f2a7bd" opacity="0.8"/>`
  // canapé rose
  b += R(560, 520, 520, 140, '#b86b8c', 'rx="34"') + R(540, 600, 560, 90, '#c97c9c', 'rx="20"')
  b += R(520, 560, 64, 140, '#a85d7d', 'rx="24"') + R(1060, 560, 64, 140, '#a85d7d', 'rx="24"')
  b += R(610, 560, 120, 70, '#fff0d0', 'rx="18"') + R(900, 560, 120, 70, '#9ed0c0', 'rx="18"')
  // table basse avec jeux
  b += R(640, 760, 360, 22, '#6b4630', 'rx="6"') + R(700, 728, 120, 32, '#3f6fd1', 'rx="4"') + R(840, 736, 90, 24, '#e0405e', 'rx="4"')
  b += `<circle cx="960" cy="748" r="14" fill="#fff"/><circle cx="960" cy="748" r="9" fill="#a0522d"/>`
  return svg(b, defs)
}


// ------------------------------------------------------------ appart 3D (Anna & Mathilde)
function appart3d() {
  const defs = grad('wall3', [[0, '#dcefe9'], [1, '#bfdcd3']]) + grad('sky3', [[0, '#9fd0f0'], [1, '#e8f6ff']]) + glow
  let b = R(0, 0, W, H, 'url(#wall3)')
  b += R(980, 130, 440, 360, '#ffffff', 'rx="8"') + R(998, 148, 404, 324, 'url(#sky3)')
  b += `<path d="M998,380 C1100,330 1200,300 1402,340 L1402,472 L998,472Z" fill="#7aa38a" opacity="0.7"/>`
  b += R(1195, 148, 8, 324, '#fff') + R(998, 306, 404, 8, '#fff')
  // affiches : course + photo
  b += R(180, 150, 200, 260, '#3d8a5f', 'rx="6"') + `<text x="280" y="250" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="40" fill="#fff">RUN</text><text x="280" y="300" text-anchor="middle" font-family="sans-serif" font-weight="700" font-size="22" fill="#f2c94c">MONT-ROYAL</text><text x="280" y="340" text-anchor="middle" font-family="sans-serif" font-size="20" fill="#fff">6:00</text>`
  b += R(430, 200, 220, 150, '#fff', 'rx="4"') + R(445, 215, 190, 120, '#4a90c8') + `<circle cx="540" cy="275" r="34" fill="#f2c94c"/>`
  // guirlande photos
  b += `<path d="M700,160 Q820,200 940,160" stroke="#333" stroke-width="2" fill="none"/>`
  for (const [x, y] of [[730, 172], [790, 184], [850, 184], [910, 172]]) b += R(x - 18, y, 36, 44, '#fff') + R(x - 14, y + 4, 28, 28, ['#e0405e', '#d99a1e', '#4a90c8', '#3d8a5f'][(x / 60) % 4 | 0])
  b += planks(650, '#b5bcc4')
  b += `<ellipse cx="700" cy="780" rx="380" ry="70" fill="#7fd1b9" opacity="0.8"/>`
  // canapé bleu
  b += R(200, 520, 560, 140, '#3f78a8', 'rx="34"') + R(180, 600, 600, 90, '#4a90c8', 'rx="20"')
  b += R(160, 560, 64, 140, '#356a96', 'rx="24"') + R(740, 560, 64, 140, '#356a96', 'rx="24"')
  b += R(250, 560, 120, 70, '#f2c94c', 'rx="18"') + R(580, 560, 120, 70, '#fff0d0', 'rx="18"')
  // vélo
  b += `<g stroke="#222" stroke-width="8" fill="none"><circle cx="1080" cy="700" r="70"/><circle cx="1320" cy="700" r="70"/><path d="M1080,700 L1170,600 L1300,600 L1320,700 M1170,600 L1210,700 L1300,600 M1160,580 L1190,580 M1300,600 L1290,560 L1330,560"/></g>`
  b += `<g stroke="#3d8a5f" stroke-width="10" fill="none"><path d="M1170,600 L1300,600 L1210,700Z"/></g>`
  // tapis de yoga + plante
  b += `<polygon points="820,800 1000,770 1040,800 860,832" fill="#e0405e" opacity="0.85"/>`
  b += R(1480, 560, 70, 100, '#c9784a', 'rx="8"') + `<circle cx="1515" cy="520" r="60" fill="#4f9a5a"/>`
  return svg(b, defs)
}

// ------------------------------------------------------------ couloir
function couloir() {
  const defs = glow
  let b = R(0, 0, W, H, '#2c2a3e')
  b += `<polygon points="0,0 600,280 600,600 0,900" fill="#4a4566"/><polygon points="1600,0 1000,280 1000,600 1600,900" fill="#4a4566"/>`
  b += `<polygon points="0,0 1600,0 1000,280 600,280" fill="#3a3652"/>`
  b += `<polygon points="0,900 600,600 1000,600 1600,900" fill="#6b5442"/><polygon points="500,900 720,600 880,600 1100,900" fill="#9b2f3a"/>`
  b += R(600, 280, 400, 320, '#1e1c2b') + R(740, 420, 120, 180, '#6a4e3a') + `<text x="800" y="470" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="30" fill="#e6c46e">3D</text>`
  // portes 3B / 3C
  b += `<polygon points="140,190 360,290 360,700 140,800" fill="#6a4e3a" stroke="#4a3426" stroke-width="5"/><circle cx="330" cy="500" r="9" fill="#e6c46e"/>`
  b += `<polygon points="1460,190 1240,290 1240,700 1460,800" fill="#6a4e3a" stroke="#4a3426" stroke-width="5"/><circle cx="1270" cy="500" r="9" fill="#e6c46e"/>`
  b += `<text x="250" y="330" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="42" fill="#e6c46e" transform="skewY(24) translate(0,-110)">3B</text>`
  b += `<text x="1350" y="330" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="42" fill="#e6c46e" transform="skewY(-24) translate(0,560)">3C</text>`
  // couronne d'Halloween / déco sur la porte 3C
  b += `<circle cx="1350" cy="430" r="40" fill="none" stroke="#3d8a5f" stroke-width="14"/><circle cx="1350" cy="392" r="8" fill="#e0405e"/>`
  // lampes plafond
  for (const [x, y, r] of [[800, 300, 14], [520, 160, 20], [1080, 160, 20], [300, 50, 26], [1300, 50, 26]]) {
    b += `<circle cx="${x}" cy="${y}" r="${r * 3}" fill="#ffd27a" opacity="0.35" filter="url(#glow)"/><circle cx="${x}" cy="${y}" r="${r}" fill="#ffe9b0"/>`
  }
  // radiateur
  b += `<g fill="#cfcfcf" stroke="#999" stroke-width="2">${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="${430 + i * 22}" y="${560 + i * 4}" width="16" height="${110 - i * 6}" rx="6"/>`).join('')}</g>`
  return svg(b, defs)
}

// ------------------------------------------------------------ hall
function hall() {
  const defs =
    grad('hwall', [[0, '#f4dfc8'], [1, '#e0c09e']]) +
    `<pattern id="tiles" width="80" height="80" patternUnits="userSpaceOnUse"><rect width="80" height="80" fill="#efe6da"/><rect width="40" height="40" fill="#3a3a3a"/><rect x="40" y="40" width="40" height="40" fill="#3a3a3a"/></pattern>` +
    grad('snow', [[0, '#dbe9f5'], [1, '#ffffff']])
  let b = R(0, 0, W, H, 'url(#hwall)')
  b += R(0, 660, W, 240, 'url(#tiles)', 'opacity="0.9"')
  // porte d'entrée vitrée avec neige
  b += R(620, 180, 360, 480, '#5b3a29') + R(645, 205, 145, 455, 'url(#snow)') + R(810, 205, 145, 455, 'url(#snow)')
  for (let i = 0; i < 40; i++) {
    const x = 650 + rnd() * 300
    if (x > 788 && x < 812) continue
    b += `<circle cx="${x}" cy="${215 + rnd() * 430}" r="${2 + rnd() * 3}" fill="#9fb8cf"/>`
  }
  b += R(645, 600, 310, 60, '#fff')
  b += `<text x="800" y="160" text-anchor="middle" font-family="Georgia, serif" font-size="38" fill="#5b3a29">Immeuble Les Érables</text>`
  // boîtes aux lettres
  b += R(110, 250, 330, 230, '#b8956a', 'rx="8"')
  for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) {
    b += R(128 + c * 77, 268 + r * 68, 65, 54, '#8a6a45', 'rx="4"') + R(140 + c * 77, 280 + r * 68, 40, 6, '#3a2a1a')
    b += `<text x="${160 + c * 77}" y="${313 + r * 68}" text-anchor="middle" font-family="sans-serif" font-size="13" fill="#f4dfc8">${3 - r}${'ABCD'[c]}</text>`
  }
  // escalier à droite
  for (let i = 0; i < 8; i++) {
    b += R(1150 + i * 50, 640 - i * 55, 450, 20, '#7a4e36') + R(1150 + i * 50, 660 - i * 55, 450, 35, '#9a6a4c')
  }
  b += `<line x1="1140" y1="560" x2="1560" y2="140" stroke="#5b3a29" stroke-width="10"/>`
  // plante
  b += R(510, 560, 70, 100, '#c9784a', 'rx="8"') + `<circle cx="545" cy="520" r="60" fill="#4f9a5a"/><circle cx="510" cy="480" r="40" fill="#5aab66"/><circle cx="585" cy="490" r="42" fill="#468a50"/>`
  return svg(b, defs)
}

// ------------------------------------------------------------ buanderie
function buanderie() {
  const defs = grad('conc', [[0, '#a3a8ad'], [1, '#868b91']]) + glow
  let b = R(0, 0, W, H, 'url(#conc)')
  b += R(0, 0, W, 90, '#6f7479')
  for (const y of [40, 70]) b += R(0, y, W, 16, '#b0703a', 'rx="8"')
  b += R(500, 110, 600, 18, '#f4f9ff', 'rx="9"') + `<rect x="420" y="100" width="760" height="120" fill="#f4f9ff" opacity="0.25" filter="url(#glow)"/>`
  b += R(0, 680, W, 220, '#6b7075')
  b += `<text x="200" y="230" font-family="sans-serif" font-weight="bold" font-size="44" fill="#4a4f55">BUANDERIE</text>`
  b += `<text x="200" y="275" font-family="sans-serif" font-size="22" fill="#4a4f55">Merci de vider la sécheuse ! — Le concierge</text>`
  // machines
  for (let i = 0; i < 4; i++) {
    const x = 180 + i * 320
    b += R(x, 380, 260, 320, '#f2f2f2', 'rx="14"') + R(x, 380, 260, 60, '#e2e2e2', 'rx="14"')
    b += `<circle cx="${x + 30}" cy="410" r="10" fill="#4a90c8"/><rect x="${x + 150}" y="400" width="80" height="20" rx="4" fill="#2a2a2a"/><text x="${x + 190}" y="415" text-anchor="middle" font-family="monospace" font-size="14" fill="#6cf06c">${['0:42', '0:00', '1:13', '--'][i]}</text>`
    b += `<circle cx="${x + 130}" cy="560" r="85" fill="#cfd5db" stroke="#9aa0a6" stroke-width="8"/><circle cx="${x + 130}" cy="560" r="62" fill="${i === 3 ? '#3a3f45' : '#7fb3d9'}" opacity="0.85"/>`
    if (i !== 3) b += `<path d="M${x + 85},575 Q${x + 130},540 ${x + 175},575" fill="${['#e0405e', '#d99a1e', '#3d8a5f'][i]}" opacity="0.8"/>`
  }
  // panier
  b += `<path d="M1320,740 L1500,740 L1480,860 L1340,860Z" fill="#c9a36a"/><path d="M1340,740 Q1370,700 1410,735 Q1440,690 1480,740Z" fill="#7fb3d9"/>`
  return svg(b, defs)
}

// ------------------------------------------------------------ toit (nuit)
function skyline(night = true) {
  let b = ''
  // mont Royal + croix
  b += `<path d="M0,580 C160,430 380,400 560,470 C620,500 660,540 720,580Z" fill="#141a33"/>`
  b += `<g filter="url(#glow)" opacity="0.9"><rect x="322" y="300" width="12" height="120" fill="#fff3c4"/><rect x="296" y="335" width="64" height="12" fill="#fff3c4"/></g>`
  b += `<rect x="324" y="302" width="8" height="116" fill="#fffbe8"/><rect x="298" y="337" width="60" height="8" fill="#fffbe8"/>`
  let x = 560
  while (x < W) {
    const w = 60 + rnd() * 110
    const h = 140 + rnd() * 280
    b += R(x, 640 - h, w, h, '#1b2142')
    for (let wy = 640 - h + 18; wy < 620; wy += 26) {
      for (let wx = x + 10; wx < x + w - 14; wx += 22) {
        if (rnd() < 0.35) b += R(wx, wy, 10, 14, night ? '#ffd27a' : '#9fc7e8', 'opacity="0.85"')
      }
    }
    x += w + 6
  }
  return b
}

function toit() {
  seed = 11
  const defs = grad('night', [[0, '#0b1030'], [0.6, '#2d2a60'], [1, '#7a4a7a']]) + glow
  let b = R(0, 0, W, H, 'url(#night)')
  for (let i = 0; i < 90; i++) b += `<circle cx="${rnd() * W}" cy="${rnd() * 380}" r="${0.8 + rnd() * 1.8}" fill="#fff" opacity="${0.4 + rnd() * 0.6}"/>`
  b += `<circle cx="1380" cy="120" r="46" fill="#fff6d8"/><circle cx="1398" cy="108" r="44" fill="#1a1a45" opacity="0.9"/>`
  b += skyline(true)
  b += R(0, 630, W, 40, '#3a3340') + R(0, 625, W, 8, '#55505e')
  b += planks(670, '#4a3a33')
  b += stringLights(-20, 820, 70, 60, 14, ['#ffd27a', '#ff9ec0', '#a8e6ff', '#c8ffb0'])
  b += stringLights(780, 1620, 90, 55, 14, ['#ffd27a', '#ff9ec0', '#a8e6ff', '#c8ffb0'])
  // chaises Adirondack
  const chair = (cx, color) =>
    `<g fill="${color}" stroke="#2a1a14" stroke-width="3"><polygon points="${cx - 70},640 ${cx + 70},640 ${cx + 60},780 ${cx - 60},780"/>` +
    `<rect x="${cx - 95}" y="760" width="190" height="24" rx="6"/><rect x="${cx - 110}" y="730" width="40" height="110"/><rect x="${cx + 70}" y="730" width="40" height="110"/></g>`
  b += chair(260, '#3d8a5f') + chair(1340, '#c0473d')
  // glacière
  b += R(720, 760, 160, 90, '#4a90c8', 'rx="10"') + R(720, 760, 160, 25, '#f2f2f2', 'rx="10"')
  return svg(b, defs)
}

// ------------------------------------------------------------ soirée McGill
function soireeMcgill() {
  seed = 23
  const defs = grad('club', [[0, '#1c0f33'], [1, '#0d0718']]) + glow
  let b = R(0, 0, W, H, 'url(#club)')
  const beams = [[200, '#ff5fa2'], [600, '#4ad9ff'], [1000, '#ffd24a'], [1400, '#9a6bff']]
  for (const [x, c] of beams) {
    b += `<polygon points="${x - 10},0 ${x + 10},0 ${x + 260 - rnd() * 520},900 ${x - 140 + rnd() * 100},900" fill="${c}" opacity="0.18"/>`
  }
  // boule disco
  b += `<line x1="800" y1="0" x2="800" y2="70" stroke="#aaa" stroke-width="3"/><circle cx="800" cy="120" r="54" fill="#cfd5e0"/>`
  for (let i = 0; i < 6; i++) b += `<line x1="${750 + i * 20}" y1="72" x2="${750 + i * 20}" y2="168" stroke="#8890a0" stroke-width="2"/><line x1="748" y1="${76 + i * 18}" x2="852" y2="${76 + i * 18}" stroke="#8890a0" stroke-width="2"/>`
  b += `<circle cx="800" cy="120" r="90" fill="#fff" opacity="0.2" filter="url(#glow)"/>`
  // banderole
  b += R(330, 210, 940, 90, '#b3263a', 'rx="12"') + `<text x="800" y="272" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="52" fill="#fff" letter-spacing="4">SOIRÉE ÉTUDIANTE ✦ McGILL</text>`
  // foule
  for (let row = 0; row < 3; row++) {
    for (let x = -40; x < W + 40; x += 70 + rnd() * 40) {
      const y = 660 + row * 80 + rnd() * 30
      const s = 0.9 + row * 0.25
      const c = ['#0b0614', '#140b24', '#1d1030'][2 - row]
      b += `<g transform="translate(${x},${y}) scale(${s})" fill="${c}"><circle cx="0" cy="-70" r="34"/><rect x="-55" y="-35" width="110" height="200" rx="45"/></g>`
      if (rnd() < 0.25) b += `<rect x="${x + 20 * s}" y="${y - 150 * s}" width="${16 * s}" height="${90 * s}" rx="8" fill="${c}" transform="rotate(${-20 + rnd() * 40} ${x} ${y})"/>`
    }
  }
  // confettis
  const conf = ['#ff5fa2', '#4ad9ff', '#ffd24a', '#9a6bff', '#7dff9a']
  for (let i = 0; i < 70; i++) b += `<rect x="${rnd() * W}" y="${rnd() * 650}" width="10" height="5" fill="${conf[i % 5]}" transform="rotate(${rnd() * 180} ${rnd() * W} ${rnd() * 650})"/>`
  return svg(b, defs)
}

// ------------------------------------------------------------ écran titre
function titre() {
  seed = 5
  const defs = grad('tsky', [[0, '#1a0f3a'], [0.55, '#5a2a6a'], [1, '#ff7a9a']]) + glow
  let b = R(0, 0, W, H, 'url(#tsky)')
  for (let i = 0; i < 120; i++) b += `<circle cx="${rnd() * W}" cy="${rnd() * 450}" r="${0.8 + rnd() * 1.8}" fill="#fff" opacity="${0.3 + rnd() * 0.7}"/>`
  for (let i = 0; i < 80; i++) b += `<circle cx="${rnd() * W}" cy="${rnd() * H}" r="${2 + rnd() * 3}" fill="#fff" opacity="${0.3 + rnd() * 0.5}"/>`
  b += skyline(true)
  b += R(0, 640, W, 260, '#120a24')
  return svg(b, defs)
}

const BUILDERS = {
  appart_gars: appartGars,
  appart_filles: appartFilles,
  appart_3d: appart3d,
  couloir,
  hall,
  buanderie,
  toit,
  soiree_mcgill: soireeMcgill,
  titre,
}

const cache = {}

/** Renvoie une valeur CSS `url(...)` pour le décor demandé. */
export function backgroundURL(id) {
  if (IMAGE_OVERRIDES[id]) return `url(${import.meta.env?.BASE_URL ?? './'}${IMAGE_OVERRIDES[id]})`
  if (!cache[id]) {
    const build = BUILDERS[id]
    if (!build) {
      console.warn('Décor inconnu :', id)
      return 'none'
    }
    seed = 7
    cache[id] = `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(build())}")`
  }
  return cache[id]
}

export const BACKGROUND_IDS = Object.keys(BUILDERS)
