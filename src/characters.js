// ============================================================
//  Fiche des personnages.
//  - `look` décrit l'apparence (voir src/art/portrait.js) : change les
//    couleurs/coiffures pour qu'ils ressemblent à tes vrais amis !
//    hairStyle : short | messy | long_wavy | long_straight | bob | ponytail | bun
//    topStyle  : tshirt | hoodie | sweater | shirt | flannel | puffer
//  - `playable: true` => apparaît à l'écran « Qui veux-tu incarner ? »
// ============================================================

export const characters = {
  pierre: {
    name: 'Pierre',
    color: '#3f6fd1',
    playable: true,
    tagline: "Ingé en échange · s'accroche un peu trop",
    bio: "En échange 4 mois à Montréal avec son meilleur pote. Romantique, têtu… parfois trop. Il n'a pas encore tourné la page Anna.",
    look: {
      male: true, skin: '#f1cdb0', hair: '#5a3a24', hairStyle: 'short',
      eyes: '#4b7a3a', top: '#2f4b7c', topStyle: 'hoodie', accent: '#e8e8e8',
    },
  },
  pl: {
    name: 'Pierre-Louis',
    color: '#c0473d',
    playable: true,
    tagline: 'Ingé en échange · le coloc',
    bio: "Coloc et ami de Pierre depuis l'école d'ingé. Drôle et sociable, mais Mathilde ne veut plus le voir… et ça le travaille.",
    look: {
      male: true, skin: '#f5d6bf', hair: '#c9a25a', hairStyle: 'messy',
      eyes: '#3e6fa8', top: '#a83a32', topStyle: 'flannel', glasses: true,
    },
  },
  romane: {
    name: 'Romane',
    color: '#e0405e',
    tagline: 'Voisine du 3C · McGill',
    bio: 'Étudiante en droit à McGill, reine des soirées étudiantes. Énergie illimitée.',
    look: {
      skin: '#f3d2bb', hair: '#7a4a2a', hairStyle: 'long_wavy', eyes: '#6b4a2b',
      top: '#b3263a', topStyle: 'sweater', print: 'McGILL', accent: '#ffffff', earrings: true,
    },
  },
  sofia: {
    name: 'Sofia',
    color: '#d99a1e',
    tagline: 'Voisine du 3C · McGill',
    bio: "Étudiante en architecture à McGill. Calme, ironique, et le toit de l'immeuble est son endroit secret.",
    look: {
      skin: '#d9a982', hair: '#211b1b', hairStyle: 'bun', eyes: '#3a2a1a',
      top: '#d8a33a', topStyle: 'sweater', accent: '#7a4a1a',
    },
  },
  anna: {
    name: 'Anna',
    color: '#4a90c8',
    tagline: 'Voisine du 3D',
    bio: "Pleine d'assurance et indépendante. Ce qui s'est passé avec Pierre, pour elle, c'était une fois… pour l'instant.",
    look: {
      skin: '#f7dcc8', hair: '#e6c46e', hairStyle: 'bob', eyes: '#4a90c8',
      top: '#7fb3d9', topStyle: 'tshirt', earrings: true,
    },
  },
  mathilde: {
    name: 'Mathilde',
    color: '#3d8a5f',
    tagline: 'Voisine du 3D',
    bio: 'Directe et sportive. Elle préfère garder ses distances avec Pierre-Louis… pour l\'instant.',
    look: {
      skin: '#f2cfb4', hair: '#a8452a', hairStyle: 'ponytail', eyes: '#4f7a4a',
      top: '#3d7a5a', topStyle: 'puffer', freckles: true, accent: '#f2c94c',
    },
  },
}

export const playable = Object.keys(characters).filter((id) => characters[id].playable)

/** L'autre coloc (celui qu'on n'incarne pas). */
export const colocOf = (player) => (player === 'pierre' ? 'pl' : 'pierre')

/** Persos dont on suit l'affinité (variable ink aff_<clé>), selon le perso joué. */
export function affinityKeys(player) {
  return [
    { key: 'coloc', id: colocOf(player) },
    { key: 'romane', id: 'romane' },
    { key: 'sofia', id: 'sofia' },
    { key: 'anna', id: 'anna' },
    { key: 'mathilde', id: 'mathilde' },
  ]
}
