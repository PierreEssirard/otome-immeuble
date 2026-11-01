// ============================================================
//  Le monde : pièces de l'immeuble, étages, et qui est où chaque jour.
//  (Les plans isométriques des pièces sont dans src/iso/rooms.js)
// ============================================================

export const locations = {
  toit: { name: 'Toit-terrasse', icon: '🌃', bg: 'toit' },
  appart_gars: { name: 'Appart 3B', sub: 'Pierre & Pierre-Louis', icon: '🛋️', bg: 'appart_gars' },
  couloir: { name: 'Couloir du 3e', icon: '🚪', bg: 'couloir' },
  appart_filles: { name: 'Appart 3C', sub: 'Romane & Sofia', icon: '🌸', bg: 'appart_filles' },
  appart_3d: { name: 'Appart 3D', sub: 'Anna & Mathilde', icon: '🚲', bg: 'appart_3d' },
  hall: { name: "Hall d'entrée", icon: '📬', bg: 'hall' },
  buanderie: { name: 'Buanderie', icon: '🧺', bg: 'buanderie' },
}

/** Plan de l'immeuble (navigateur), du haut vers le bas. */
export const floors = [
  { name: 'Toit', rooms: ['toit'] },
  { name: '3e étage', rooms: ['appart_gars', 'couloir', 'appart_filles', 'appart_3d'] },
  { name: 'Rez-de-chaussée', rooms: ['hall'] },
  { name: 'Sous-sol', rooms: ['buanderie'] },
]

export const dayNames = { 1: 'Jeudi', 2: 'Vendredi', 3: 'Samedi' }

/**
 * Où se trouve chaque perso, jour par jour. Tout le monde vit dans l'immeuble !
 * `coloc` = l'autre Pierre (celui que tu n'incarnes pas).
 * Le premier échange de la journée lance la petite scène ink `talk_<clé>`,
 * ensuite tu peux discuter librement (IA).
 */
export const schedule = {
  1: { coloc: 'appart_gars', romane: 'couloir', anna: 'couloir', sofia: 'buanderie', mathilde: 'toit' },
  2: { coloc: 'buanderie', romane: 'appart_filles', mathilde: 'appart_filles', sofia: 'toit', anna: 'hall' },
  3: { coloc: 'appart_gars', romane: 'hall', sofia: 'appart_filles', anna: 'appart_filles', mathilde: 'toit' },
}
