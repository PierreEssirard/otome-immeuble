// ============================================================
//  Plans des pièces en vue isométrique (façon Habbo).
//  w × h = taille en tuiles. x va vers le bas-droite, y vers le bas-gauche.
//  - doors : tuile sur le bord du fond (y = 0 -> mur de droite, x = 0 -> mur de gauche)
//            `to` = pièce de destination.
//  - furni : meubles (bloquent le passage). kind = décoration spéciale.
//            action = knot ink lancé quand on clique dessus.
//  - rugs  : tapis (décoratifs, on peut marcher dessus).
// ============================================================

export const rooms = {
  appart_gars: {
    w: 9, h: 7, wallH: 110,
    floor: ['#b48a5c', '#a87e52'], wall: '#cfdae6', bgColor: '#1d2433',
    doors: [{ x: 4, y: 0, to: 'couloir', label: 'Couloir' }],
    furni: [
      { x: 0, y: 0, w: 2, d: 3, h: 16, color: '#3f6fd1', top: '#eef0f8', kind: 'bed', action: 'day_end', label: '🌙 Dormir (finir la journée)' },
      { x: 6, y: 0, w: 3, d: 1, h: 26, color: '#6b4a35', kind: 'desk' },
      { x: 0, y: 5, w: 1, d: 2, h: 20, color: '#47614f' },
      { x: 1, y: 6, w: 3, d: 1, h: 20, color: '#4d6b5c', kind: 'sofa' },
      { x: 3, y: 3, w: 2, d: 1, h: 12, color: '#7a5236', kind: 'pizza' },
      { x: 8, y: 6, w: 1, d: 1, h: 18, color: '#c9784a', kind: 'plant' },
      { x: 8, y: 3, w: 1, d: 1, h: 60, color: '#d9d9d9', kind: 'fridge' },
    ],
    rugs: [{ x: 2, y: 2, w: 4, d: 3, color: '#c75b4a' }],
    spawn: { x: 4, y: 2 },
  },
  couloir: {
    w: 12, h: 3, wallH: 120,
    floor: ['#9b2f3a', '#8d2a34'], wall: '#4a4566', bgColor: '#141022',
    doors: [
      { x: 2, y: 0, to: 'appart_gars', label: '3B' },
      { x: 6, y: 0, to: 'appart_filles', label: '3C' },
      { x: 10, y: 0, to: 'appart_3d', label: '3D' },
      { x: 0, y: 0, to: 'toit', label: '↑ Toit' },
      { x: 0, y: 2, to: 'hall', label: '↓ Hall' },
    ],
    furni: [
      { x: 4, y: 0, w: 1, d: 1, h: 22, color: '#cfcfcf', kind: 'radiator' },
      { x: 11, y: 2, w: 1, d: 1, h: 18, color: '#c9784a', kind: 'plant' },
    ],
    rugs: [],
    spawn: { x: 3, y: 1 },
  },
  appart_filles: {
    w: 8, h: 7, wallH: 110,
    floor: ['#d4ad85', '#c8a07a'], wall: '#f3dcd6', bgColor: '#2a1626',
    doors: [{ x: 2, y: 0, to: 'couloir', label: 'Couloir' }],
    furni: [
      { x: 5, y: 0, w: 3, d: 1, h: 70, color: '#8a5a3c', kind: 'shelf' },
      { x: 0, y: 3, w: 1, d: 3, h: 20, color: '#b86b8c', kind: 'sofa' },
      { x: 2, y: 3, w: 2, d: 2, h: 13, color: '#6b4630', kind: 'games' },
      { x: 7, y: 6, w: 1, d: 1, h: 18, color: '#c9784a', kind: 'plant' },
      { x: 0, y: 0, w: 1, d: 1, h: 18, color: '#c9784a', kind: 'plant' },
    ],
    rugs: [{ x: 1, y: 2, w: 4, d: 4, color: '#f2a7bd' }],
    spawn: { x: 2, y: 1 },
  },
  appart_3d: {
    w: 8, h: 7, wallH: 110,
    floor: ['#c2c8cf', '#b5bcc4'], wall: '#d6ece6', bgColor: '#13242a',
    doors: [{ x: 2, y: 0, to: 'couloir', label: 'Couloir' }],
    furni: [
      { x: 5, y: 0, w: 2, d: 1, h: 26, color: '#5b6b7a', kind: 'desk' },
      { x: 0, y: 4, w: 1, d: 3, h: 20, color: '#4a90c8', kind: 'sofa' },
      { x: 7, y: 2, w: 1, d: 2, h: 30, color: '#3d8a5f', kind: 'bike' },
      { x: 7, y: 6, w: 1, d: 1, h: 18, color: '#c9784a', kind: 'plant' },
    ],
    rugs: [{ x: 2, y: 3, w: 3, d: 2, color: '#7fd1b9' }],
    spawn: { x: 2, y: 1 },
  },
  hall: {
    w: 8, h: 7, wallH: 130,
    floor: ['#efe6da', '#3a3a3a'], wall: '#f0d9c0', bgColor: '#1a1410',
    doors: [
      { x: 0, y: 1, to: 'couloir', label: '↑ 3e étage' },
      { x: 6, y: 0, to: 'buanderie', label: '↓ Sous-sol' },
    ],
    furni: [
      { x: 1, y: 0, w: 3, d: 1, h: 50, color: '#b8956a', kind: 'mailbox' },
      { x: 7, y: 6, w: 1, d: 1, h: 18, color: '#c9784a', kind: 'plant' },
      { x: 4, y: 5, w: 2, d: 1, h: 14, color: '#5b3a29' },
    ],
    rugs: [{ x: 2, y: 2, w: 3, d: 2, color: '#7a2a35' }],
    spawn: { x: 3, y: 3 },
  },
  buanderie: {
    w: 8, h: 6, wallH: 110,
    floor: ['#7d8287', '#73787d'], wall: '#a3a8ad', bgColor: '#111417',
    doors: [{ x: 1, y: 0, to: 'hall', label: '↑ Hall' }],
    furni: [
      { x: 3, y: 0, w: 1, d: 1, h: 34, color: '#f2f2f2', kind: 'washer' },
      { x: 4, y: 0, w: 1, d: 1, h: 34, color: '#f2f2f2', kind: 'washer' },
      { x: 5, y: 0, w: 1, d: 1, h: 34, color: '#f2f2f2', kind: 'washer' },
      { x: 6, y: 0, w: 1, d: 1, h: 34, color: '#f2f2f2', kind: 'washer' },
      { x: 7, y: 4, w: 1, d: 1, h: 14, color: '#c9a36a', kind: 'basket' },
      { x: 0, y: 4, w: 1, d: 2, h: 26, color: '#8a8f94' },
    ],
    rugs: [],
    spawn: { x: 2, y: 2 },
  },
  toit: {
    w: 10, h: 8, wallH: 22, night: true,
    floor: ['#5a463d', '#4f3d35'], wall: '#55505e', bgColor: '#0b1030',
    doors: [{ x: 0, y: 1, to: 'couloir', label: '↓ Escalier' }],
    furni: [
      { x: 2, y: 2, w: 1, d: 1, h: 20, color: '#3d8a5f', kind: 'chair' },
      { x: 7, y: 5, w: 1, d: 1, h: 20, color: '#c0473d', kind: 'chair' },
      { x: 5, y: 3, w: 1, d: 1, h: 16, color: '#4a90c8', kind: 'cooler' },
      { x: 9, y: 0, w: 1, d: 1, h: 18, color: '#c9784a', kind: 'plant' },
    ],
    rugs: [],
    spawn: { x: 1, y: 2 },
  },
}
