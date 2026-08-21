import type { PaintScene } from '../../components/watercolor/WatercolorScene'
import { flecks, polygon, stroke, wash } from '../../components/watercolor/engine'
import type { Point } from '../../components/watercolor/engine'

/**
 * Les deux tableaux qui encadrent l'accueil. Pensés comme des aquarelles
 * abstraites, pas comme des illustrations : on lit une atmosphère avant de
 * lire un sujet. La palette reste celle de la skill `aquarelle`, dominée par
 * le bleu ardoise et portée par les violets qui font les ombres.
 */

const BLEU = '#5a7fa0'
const BLEU_CLAIR = '#8fb0c9'
const TURQUOISE = '#4f9a92'
const VIOLET = '#8d6aa8'
const VIOLET_BRUME = '#c3b0d4'
const VIOLET_PROFOND = '#5d4574'
const OCRE = '#c1663f'
const SABLE = '#d9a35f'
const VERT = '#7a9455'
const PAPIER = '#f7f2e7'

/** Chemin ondulant d'un bord à l'autre, à hauteur `y`. */
function houle(y: number, amplitude: number, w: number, rng: () => number): Point[] {
  const points: Point[] = []
  for (let i = 0; i <= 12; i += 1) {
    points.push([(i / 12) * w, y + Math.sin(i * 1.3 + amplitude) * amplitude + (rng() - 0.5) * amplitude * 0.6])
  }
  return points
}

/**
 * Gauche — l'océan. Des masses de couleur largement superposées, du plus
 * clair et chaud en surface au plus profond en bas, avec des éclats de
 * pigment pour la granulation et quelques fils de lumière — jamais des
 * traits continus, qui lisent comme un contour plutôt qu'un reflet.
 */
export const oceanScene: PaintScene = (ctx, w, h, rng) => {
  // Ciel bas, chaud, qui se noie vite dans l'eau.
  wash(ctx, polygon(w * 0.5, h * 0.08, w * 0.85, h * 0.14, 12, 0, rng), rng, {
    color: SABLE,
    layers: 20,
    alpha: 0.02,
    spread: 0.22,
  })
  wash(ctx, polygon(w * 0.4, h * 0.04, w * 0.55, h * 0.09, 10, 0, rng), rng, {
    color: OCRE,
    layers: 14,
    alpha: 0.014,
    spread: 0.26,
  })

  // Les masses d'eau : grandes, très superposées (ry proche de l'écart entre
  // centres) pour que les teintes se fondent au lieu de se juxtaposer.
  const bandes: Array<[number, number, string, number, number]> = [
    [0.22, 0.19, BLEU_CLAIR, 0.022, 12],
    [0.34, 0.2, TURQUOISE, 0.02, 13],
    [0.47, 0.21, BLEU, 0.024, 12],
    [0.6, 0.2, VIOLET, 0.02, 14],
    [0.74, 0.22, BLEU, 0.026, 13],
    [0.88, 0.24, VIOLET_PROFOND, 0.026, 12],
  ]
  for (const [cy, ry, color, alpha, sides] of bandes) {
    wash(ctx, polygon(w * 0.5, h * cy, w * 0.8, h * ry, sides, rng() * 6, rng), rng, {
      color,
      layers: 26,
      alpha,
      spread: 0.15,
      jitter: 0.11,
    })
  }

  // Granulation : la texture qui manque à un aplat, dispersée dans toute la
  // colonne d'eau plutôt que localisée, pour ne pas dessiner de motif.
  flecks(ctx, w * 0.5, h * 0.55, w * 0.42, h * 0.42, 26, rng, { color: VIOLET_PROFOND, alpha: 0.022 })
  flecks(ctx, w * 0.5, h * 0.4, w * 0.4, h * 0.3, 14, rng, { color: BLEU_CLAIR, alpha: 0.03 })

  // Fils de lumière sur les crêtes : fins, pâles, discontinus. Trois suffit —
  // un de plus et ça redevient des rayures.
  stroke(ctx, houle(h * 0.3, 4, w * 0.7, rng), 2.2, rng, { color: PAPIER, alpha: 0.05, layers: 10 })
  stroke(ctx, houle(h * 0.58, 5, w * 0.8, rng), 2, rng, { color: BLEU_CLAIR, alpha: 0.035, layers: 10 })
  stroke(ctx, houle(h * 0.79, 4.5, w * 0.75, rng), 1.8, rng, { color: VIOLET_BRUME, alpha: 0.035, layers: 9 })

  // Une profondeur lointaine qui referme le bas du tableau.
  wash(ctx, polygon(w * 0.5, h * 1.04, w * 0.85, h * 0.16, 11, 0, rng), rng, {
    color: VIOLET_PROFOND,
    layers: 22,
    alpha: 0.03,
    spread: 0.16,
  })
}

/**
 * Droite — la cité engloutie. Une barque minuscule s'avance vers des tours
 * qui sortent à peine de l'eau, dans une brume ocre. L'échelle fait tout le
 * sujet : la barque doit rester petite pour que la ville paraisse immense.
 */
export const citeEngloutieScene: PaintScene = (ctx, w, h, rng) => {
  // Brume de fond, chaude en haut, froide en bas.
  wash(ctx, polygon(w * 0.5, h * 0.18, w * 0.8, h * 0.26, 11, 0, rng), rng, {
    color: OCRE,
    layers: 20,
    alpha: 0.018,
    spread: 0.22,
  })
  wash(ctx, polygon(w * 0.5, h * 0.34, w * 0.78, h * 0.22, 11, 0, rng), rng, {
    color: VIOLET_BRUME,
    layers: 22,
    alpha: 0.024,
    spread: 0.2,
  })

  // La ville : des tours de hauteurs très inégales, les plus lointaines
  // pâles et violettes, les plus proches franches et sombres.
  const tours: Array<[number, number, number, string, number]> = [
    [0.2, 0.3, 0.1, VIOLET_BRUME, 0.03],
    [0.34, 0.42, 0.09, VIOLET, 0.028],
    [0.46, 0.24, 0.07, VIOLET_BRUME, 0.026],
    [0.58, 0.46, 0.11, VIOLET_PROFOND, 0.03],
    [0.72, 0.34, 0.08, VIOLET, 0.03],
    [0.84, 0.4, 0.06, VIOLET_PROFOND, 0.026],
  ]
  for (const [cx, top, largeur, color, alpha] of tours) {
    const x = w * cx
    const bw = w * largeur
    const y0 = h * top
    const y1 = h * 0.66
    wash(ctx, [
      [x - bw / 2, y1],
      [x - bw / 2, y0],
      [x, y0 - h * 0.03],
      [x + bw / 2, y0],
      [x + bw / 2, y1],
    ], rng, { color, layers: 26, alpha, spread: 0.05, jitter: 0.05 })
  }

  // Les reflets des tours, retournés et délavés dans l'eau.
  for (const [cx, top, largeur, color] of tours) {
    const x = w * cx
    const bw = w * largeur
    wash(ctx, [
      [x - bw / 2, h * 0.66],
      [x + bw / 2, h * 0.66],
      [x + bw / 2, h * (0.66 + (0.66 - top) * 0.4)],
      [x - bw / 2, h * (0.66 + (0.66 - top) * 0.4)],
    ], rng, { color, layers: 14, alpha: 0.016, spread: 0.14, jitter: 0.16 })
  }

  // L'eau qui monte sur la ville, largement superposée elle aussi.
  for (const [cy, ry, color, alpha] of [
    [0.7, 0.15, BLEU_CLAIR, 0.024],
    [0.82, 0.16, BLEU, 0.028],
    [0.95, 0.17, VIOLET_PROFOND, 0.026],
  ] as Array<[number, number, string, number]>) {
    wash(ctx, polygon(w * 0.5, h * cy, w * 0.78, h * ry, 11, rng() * 6, rng), rng, {
      color,
      layers: 24,
      alpha,
      spread: 0.13,
      jitter: 0.1,
    })
  }
  flecks(ctx, w * 0.5, h * 0.85, w * 0.38, h * 0.14, 12, rng, { color: VIOLET_PROFOND, alpha: 0.02 })
  stroke(ctx, houle(h * 0.7, 3, w * 0.8, rng), 2, rng, { color: PAPIER, alpha: 0.04, layers: 9 })
  stroke(ctx, houle(h * 0.86, 3.5, w * 0.75, rng), 1.8, rng, { color: BLEU_CLAIR, alpha: 0.03, layers: 8 })

  // La barque : petite, décalée, avec sa voile et son sillage.
  const bx = w * 0.32
  const by = h * 0.75
  const s = w * 0.055
  wash(ctx, [
    [bx - s, by],
    [bx + s, by],
    [bx + s * 0.6, by + s * 0.5],
    [bx - s * 0.6, by + s * 0.5],
  ], rng, { color: VIOLET_PROFOND, layers: 22, alpha: 0.05, spread: 0.06, jitter: 0.07 })
  wash(ctx, [
    [bx, by - s * 1.9],
    [bx + s * 0.85, by - s * 0.1],
    [bx - s * 0.2, by - s * 0.1],
  ], rng, { color: OCRE, layers: 24, alpha: 0.04, spread: 0.06, jitter: 0.06 })
  stroke(ctx, [[bx, by - s * 2], [bx, by]], 2, rng, { color: VIOLET_PROFOND, alpha: 0.05, layers: 12 })
  stroke(ctx, [[bx - s * 1.6, by + s * 0.7], [bx + s * 2.4, by + s * 0.55]], 2.4, rng, {
    color: PAPIER,
    alpha: 0.045,
    layers: 10,
  })

  // Un dernier voile vert-de-gris sur l'eau basse, pour le côté submergé.
  wash(ctx, polygon(w * 0.5, h * 0.9, w * 0.7, h * 0.1, 10, 0, rng), rng, {
    color: VERT,
    layers: 14,
    alpha: 0.016,
    spread: 0.2,
  })
}

/**
 * Le bandeau au-dessus du titre. Doit rester très léger : le titre se pose
 * dessus, donc aucun lavis ne dépasse une opacité faible (règle de
 * lisibilité de la skill `aquarelle`). Les couleurs sont espacées plutôt que
 * toutes superposées au centre — sous `multiply`, trois teintes qui se
 * recouvrent au même endroit tournent au brun sale.
 */
export const bandeauScene: PaintScene = (ctx, w, h, rng) => {
  wash(ctx, polygon(w * 0.16, h * 0.48, w * 0.22, h * 0.34, 11, 0, rng), rng, {
    color: VIOLET_BRUME,
    layers: 22,
    alpha: 0.02,
    spread: 0.22,
  })
  wash(ctx, polygon(w * 0.5, h * 0.42, w * 0.24, h * 0.32, 10, 0, rng), rng, {
    color: BLEU_CLAIR,
    layers: 20,
    alpha: 0.016,
    spread: 0.24,
  })
  wash(ctx, polygon(w * 0.84, h * 0.5, w * 0.2, h * 0.3, 10, 0, rng), rng, {
    color: SABLE,
    layers: 16,
    alpha: 0.014,
    spread: 0.26,
  })
  flecks(ctx, w * 0.5, h * 0.5, w * 0.46, h * 0.24, 10, rng, { color: VIOLET, alpha: 0.014 })
  stroke(ctx, houle(h * 0.74, 4, w * 0.96, rng), 2, rng, { color: VIOLET_PROFOND, alpha: 0.018, layers: 10 })
}
