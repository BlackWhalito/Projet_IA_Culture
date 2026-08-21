import type { PaintScene } from '../../components/watercolor/WatercolorScene'
import { dryStroke, flecks, hatch, highlight, polygon, stroke, wash } from '../../components/watercolor/engine'
import type { Point } from '../../components/watercolor/engine'
import { arcade, cornice, dome, facade, pitchedRoof, stoneTexture } from '../../components/watercolor/architecture'
import type { LightPlan } from '../../components/watercolor/light'

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
const ENCRE_SOMBRE = '#241d2b'
const PIERRE_CHAUDE = '#d8bd96'
const PIERRE_PALE = '#e6d9c4'

/**
 * La lumière unique des deux tableaux : elle vient de la gauche, chaude, et
 * toutes les ombres tombent donc à droite de chaque volume. C'est cette
 * décision prise une seule fois qui fait que les éléments se répondent —
 * l'harmonie qui manquait quand chaque objet calculait son ombre seul.
 */
const LUMIERE: LightPlan = {
  angleDeg: 200,
  warm: SABLE,
  cool: VIOLET_PROFOND,
  accent: ENCRE_SOMBRE,
}

/** Chemin ondulant d'un bord à l'autre, à hauteur `y`. */
function houle(y: number, amplitude: number, w: number, rng: () => number): Point[] {
  const points: Point[] = []
  for (let i = 0; i <= 12; i += 1) {
    points.push([(i / 12) * w, y + Math.sin(i * 1.3 + amplitude) * amplitude + (rng() - 0.5) * amplitude * 0.6])
  }
  return points
}

/**
 * Une voile : un triangle penché, sa coque, son mât. Minuscule — c'est ce
 * qui donne l'échelle à la lagune. Sans un objet de taille connue, une
 * étendue d'eau n'a aucune profondeur lisible.
 */
function voile(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  taille: number,
  rng: () => number,
  distance: number,
): void {
  const alpha = 0.5 * (1 - distance * 0.7)
  wash(ctx, [
    [x, y - taille * 2.1],
    [x + taille * 0.85, y - taille * 0.1],
    [x - taille * 0.15, y - taille * 0.1],
  ], rng, { color: PIERRE_PALE, layers: 12, alpha: alpha / 12, spread: 0.05, jitter: 0.06 })
  dryStroke(ctx, [[x, y - taille * 2.2], [x, y]], taille * 0.1, rng, {
    color: ENCRE_SOMBRE,
    alpha: alpha * 0.8,
    layers: 2,
  })
  dryStroke(ctx, [[x - taille * 0.9, y], [x + taille * 0.9, y]], taille * 0.22, rng, {
    color: ENCRE_SOMBRE,
    alpha: alpha * 0.9,
    layers: 2,
  })
}

/**
 * Gauche — la lagune. Un vrai lieu plutôt qu'une abstraction : une rive
 * lointaine et pâle à l'horizon, des voiles qui donnent l'échelle, une
 * étendue d'eau qui occupe les deux tiers bas. Même lumière que la cité
 * engloutie (`LUMIERE`), pour que les deux tableaux se répondent.
 *
 * Une étendue d'eau seule, sans horizon ni objet de taille connue, se lit
 * comme des bandes de couleur empilées — c'est le sujet qui fait la
 * profondeur, pas la matière.
 */
export const oceanScene: PaintScene = (ctx, w, h, rng) => {
  const horizon = h * 0.34

  // Ciel : un dégradé simple et calme, du chaud en haut vers le pâle sur
  // l'horizon. Confiné au-dessus de l'horizon (voir la note `multiply` de
  // la scène de droite).
  wash(ctx, polygon(w * 0.5, h * 0.06, w * 0.9, h * 0.12, 12, 0, rng), rng, {
    color: SABLE,
    layers: 18,
    alpha: 0.02,
    spread: 0.2,
  })
  wash(ctx, polygon(w * 0.35, h * 0.16, w * 0.6, h * 0.1, 11, 0, rng), rng, {
    color: VIOLET_BRUME,
    layers: 16,
    alpha: 0.016,
    spread: 0.22,
  })
  wash(ctx, polygon(w * 0.75, h * 0.1, w * 0.4, h * 0.08, 10, 0, rng), rng, {
    color: OCRE,
    layers: 12,
    alpha: 0.012,
    spread: 0.24,
  })

  // La rive lointaine : des silhouettes très pâles, à peine posées, avec un
  // campanile qui dépasse — assez pour que l'horizon soit un lieu.
  facade(ctx, w * 0.24, horizon - h * 0.045, horizon, w * 0.3, rng, LUMIERE, {
    stone: VIOLET_BRUME,
    shade: VIOLET,
    distance: 0.92,
    floors: 0,
    bays: 0,
  })
  facade(ctx, w * 0.62, horizon - h * 0.03, horizon, w * 0.34, rng, LUMIERE, {
    stone: VIOLET_BRUME,
    shade: VIOLET,
    distance: 0.94,
    floors: 0,
    bays: 0,
  })
  // Le campanile de la rive : il doit rester dans la même valeur pâle que
  // le reste de l'horizon. Plus saturé que ce qui l'entoure, il se détache
  // comme une barre posée devant plutôt qu'un bâtiment dans la brume.
  facade(ctx, w * 0.44, horizon - h * 0.075, horizon, w * 0.035, rng, LUMIERE, {
    stone: VIOLET_BRUME,
    shade: VIOLET,
    distance: 0.9,
    floors: 0,
    bays: 0,
  })
  dome(ctx, w * 0.78, horizon - h * 0.025, w * 0.05, rng, LUMIERE, {
    stone: VIOLET_BRUME,
    shade: VIOLET,
    distance: 0.9,
  })

  // L'eau : des masses larges et superposées, de plus en plus sombres et
  // franches en descendant — c'est la perspective, l'eau lointaine est
  // toujours plus pâle que celle qui est à nos pieds.
  // Chaque masse déborde largement sur ses voisines (`ry` vaut près du
  // double de l'écart entre deux centres) : sans ce recouvrement, les
  // teintes se juxtaposent et l'eau se lit comme un empilement de bandes
  // au lieu d'une seule étendue qui change de couleur.
  const bandes: Array<[number, number, string, number, number]> = [
    [0.42, 0.2, BLEU_CLAIR, 0.017, 12],
    [0.55, 0.22, TURQUOISE, 0.016, 13],
    [0.68, 0.23, BLEU, 0.019, 12],
    [0.81, 0.24, VIOLET, 0.017, 14],
    [0.94, 0.26, VIOLET_PROFOND, 0.021, 12],
  ]
  for (const [cy, ry, color, alpha, sides] of bandes) {
    wash(ctx, polygon(w * 0.5, h * cy, w * 0.85, h * ry, sides, rng() * 6, rng), rng, {
      color,
      layers: 24,
      alpha,
      spread: 0.14,
      jitter: 0.11,
    })
  }

  // Les reflets de la rive, tirés verticalement juste sous l'horizon.
  for (let i = 0; i < 7; i += 1) {
    const rx = w * (0.1 + rng() * 0.8)
    dryStroke(ctx, [[rx, horizon], [rx + (rng() - 0.5) * w * 0.04, horizon + h * (0.02 + rng() * 0.05)]], w * 0.05, rng, {
      color: VIOLET_BRUME,
      alpha: 0.1 + rng() * 0.08,
      layers: 2,
      jitter: 0.14,
    })
  }

  // Granulation, dispersée pour ne pas dessiner de motif.
  flecks(ctx, w * 0.5, h * 0.68, w * 0.42, h * 0.3, 22, rng, { color: VIOLET_PROFOND, alpha: 0.02 })
  flecks(ctx, w * 0.5, h * 0.5, w * 0.4, h * 0.14, 12, rng, { color: BLEU_CLAIR, alpha: 0.028 })

  // Les rides : très longues et très fines. Une touche courte et épaisse se
  // lit comme un débris flottant ; c'est l'allongement extrême (plus de
  // 60:1) qui la fait basculer en reflet posé à la surface.
  hatch(ctx, w * 0.5, h * 0.47, w * 0.44, h * 0.06, 1, 8, rng, {
    color: BLEU,
    alpha: 0.07,
    layers: 1,
    length: w * 0.62,
    width: h * 0.0022,
  })
  hatch(ctx, w * 0.5, h * 0.73, w * 0.44, h * 0.15, 2, 11, rng, {
    color: VIOLET_PROFOND,
    alpha: 0.1,
    layers: 1,
    length: w * 0.56,
    width: h * 0.0026,
  })
  hatch(ctx, w * 0.5, h * 0.94, w * 0.42, h * 0.08, -2, 7, rng, {
    color: ENCRE_SOMBRE,
    alpha: 0.1,
    layers: 1,
    length: w * 0.5,
    width: h * 0.003,
  })

  // Les voiles : deux au loin, minuscules, une plus près et plus franche.
  voile(ctx, w * 0.3, horizon + h * 0.035, w * 0.035, rng, 0.75)
  voile(ctx, w * 0.68, horizon + h * 0.05, w * 0.045, rng, 0.6)
  voile(ctx, w * 0.44, h * 0.62, w * 0.075, rng, 0.15)

  // Éclats de lumière réservée sur les crêtes.
  stroke(ctx, houle(h * 0.55, 4, w * 0.8, rng), 2, rng, { color: PAPIER, alpha: 0.045, layers: 10 })
  highlight(ctx, polygon(w * 0.66, h * 0.49, w * 0.07, h * 0.008, 7, rng() * 6, rng), rng, {
    color: PAPIER,
    alpha: 0.09,
  })
  highlight(ctx, polygon(w * 0.26, h * 0.76, w * 0.06, h * 0.009, 7, rng() * 6, rng), rng, {
    color: PAPIER,
    alpha: 0.08,
  })

  // Une profondeur qui referme le bas du tableau.
  wash(ctx, polygon(w * 0.5, h * 1.06, w * 0.9, h * 0.14, 11, 0, rng), rng, {
    color: VIOLET_PROFOND,
    layers: 20,
    alpha: 0.028,
    spread: 0.16,
  })
}

/**
 * Droite — la cité engloutie. Une barque minuscule s'avance vers des tours
 * qui sortent à peine de l'eau, dans une brume ocre. L'échelle fait tout le
 * sujet : la barque doit rester petite pour que la ville paraisse immense.
 */
export const citeEngloutieScene: PaintScene = (ctx, w, h, rng) => {
  // Brume de fond, confinée au ciel. En `multiply`, rien n'occulte rien :
  // un lavis qui déborde sur la ville reste visible À TRAVERS les façades
  // et se lit comme une écharpe qui traverse les bâtiments. Chaque masse
  // doit donc rester dans sa zone plutôt que compter sur l'ordre de dessin.
  wash(ctx, polygon(w * 0.5, h * 0.1, w * 0.85, h * 0.16, 11, 0, rng), rng, {
    color: OCRE,
    layers: 18,
    alpha: 0.014,
    spread: 0.22,
  })
  wash(ctx, polygon(w * 0.5, h * 0.22, w * 0.8, h * 0.13, 11, 0, rng), rng, {
    color: VIOLET_BRUME,
    layers: 18,
    alpha: 0.016,
    spread: 0.2,
  })

  // La ville. Chaque bâtiment est un vrai volume d'architecture — façade
  // avec ses fenêtres, corniche, toit en pente ou dôme — et non plus une
  // masse effilée. `distance` (0 = devant, 1 = horizon) gouverne à la fois
  // le contraste et la netteté du trait.
  const quai = h * 0.66

  // Fond lointain : deux silhouettes très pâles, sans détail, qui creusent
  // l'espace derrière la ville.
  facade(ctx, w * 0.16, h * 0.42, quai, w * 0.16, rng, LUMIERE, {
    stone: VIOLET_BRUME,
    shade: VIOLET,
    distance: 0.85,
    floors: 0,
    bays: 0,
  })
  facade(ctx, w * 0.88, h * 0.46, quai, w * 0.14, rng, LUMIERE, {
    stone: VIOLET_BRUME,
    shade: VIOLET,
    distance: 0.8,
    floors: 0,
    bays: 0,
  })

  // Plan intermédiaire : le campanile, qui donne la verticale dominante.
  facade(ctx, w * 0.3, h * 0.2, quai, w * 0.13, rng, LUMIERE, {
    stone: PIERRE_CHAUDE,
    shade: VIOLET_PROFOND,
    distance: 0.4,
    floors: 5,
    bays: 2,
  })
  cornice(ctx, w * 0.3, h * 0.24, w * 0.13, rng, LUMIERE, 0.4)
  pitchedRoof(ctx, w * 0.3, h * 0.2, w * 0.13, h * 0.07, rng, LUMIERE, {
    color: OCRE,
    distance: 0.4,
    lean: 0.05,
  })

  // Le dôme, contrepoint rond d'une skyline sinon toute en verticales.
  dome(ctx, w * 0.56, h * 0.4, w * 0.11, rng, LUMIERE, {
    stone: PIERRE_PALE,
    shade: VIOLET,
    distance: 0.5,
  })
  facade(ctx, w * 0.56, h * 0.4, quai, w * 0.17, rng, LUMIERE, {
    stone: PIERRE_PALE,
    shade: VIOLET_PROFOND,
    distance: 0.5,
    floors: 3,
    bays: 3,
  })

  // Premier plan à droite : la grande masse d'ombre, celle qui porte le
  // contraste du tableau. Son arcade donne le rythme répété qui manquait.
  facade(ctx, w * 0.82, h * 0.33, quai, w * 0.3, rng, LUMIERE, {
    stone: VIOLET,
    shade: VIOLET_PROFOND,
    distance: 0.08,
    floors: 4,
    bays: 3,
  })
  stoneTexture(ctx, w * 0.86, h * 0.5, w * 0.12, h * 0.14, rng, LUMIERE, 0.08)
  cornice(ctx, w * 0.82, h * 0.36, w * 0.3, rng, LUMIERE, 0.08)
  arcade(ctx, w * 0.68, w * 0.97, h * 0.55, quai, 4, rng, LUMIERE, 0.15)

  // Premier plan à gauche : une façade claire, presque du papier nu, pour
  // que la masse sombre de droite ait quelque chose à quoi s'opposer.
  facade(ctx, w * 0.08, h * 0.5, quai, w * 0.2, rng, LUMIERE, {
    stone: PIERRE_PALE,
    shade: VIOLET_BRUME,
    distance: 0.15,
    floors: 3,
    bays: 2,
  })
  pitchedRoof(ctx, w * 0.08, h * 0.5, w * 0.2, h * 0.05, rng, LUMIERE, {
    color: OCRE,
    distance: 0.15,
    lean: 0.2,
  })

  // Les reflets : tirés vers le bas en traits verticaux, puis cassés par des
  // rides horizontales. Un reflet qui ne serait qu'une copie délavée reste
  // une tache ; ce sont les cassures qui en font de l'eau.
  for (const [cx, largeur, color] of [
    [0.3, 0.13, PIERRE_CHAUDE],
    [0.56, 0.17, PIERRE_PALE],
    [0.82, 0.3, VIOLET_PROFOND],
    [0.08, 0.2, PIERRE_PALE],
  ] as Array<[number, number, string]>) {
    const x = w * cx
    const bw = w * largeur
    for (let s = 0; s < 5; s += 1) {
      const sx = x - bw / 2 + (bw * (s + 0.5)) / 5
      dryStroke(ctx, [[sx, quai], [sx + (rng() - 0.5) * bw * 0.1, quai + h * (0.05 + rng() * 0.09)]], bw * 0.14, rng, {
        color,
        alpha: 0.12 + rng() * 0.1,
        layers: 2,
        jitter: 0.12,
      })
    }
  }

  // L'eau, tenue sous la ligne de quai (0.66) pour la même raison que la
  // brume : en `multiply`, une bande d'eau qui remonte trop haut traverse
  // visiblement les façades.
  for (const [cy, ry, color, alpha] of [
    [0.75, 0.1, BLEU_CLAIR, 0.024],
    [0.85, 0.12, BLEU, 0.028],
    [0.96, 0.14, VIOLET_PROFOND, 0.026],
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
  // Ondulations : des hachures presque horizontales plutôt qu'un voile
  // uniforme — c'est le même geste que sur les tours, à l'échelle de l'eau.
  hatch(ctx, w * 0.5, h * 0.78, w * 0.4, h * 0.14, 4, 20, rng, {
    color: VIOLET_PROFOND,
    alpha: 0.22,
    layers: 2,
    length: w * 0.09,
    width: h * 0.006,
  })
  // Deux éclats de lumière francs sur l'eau — le papier qui perce net,
  // pas seulement un voile pâle.
  highlight(ctx, polygon(w * 0.68, h * 0.73, w * 0.06, h * 0.014, 7, rng() * 6, rng), rng, {
    color: PAPIER,
    alpha: 0.1,
  })
  highlight(ctx, polygon(w * 0.22, h * 0.88, w * 0.05, h * 0.012, 7, rng() * 6, rng), rng, {
    color: PAPIER,
    alpha: 0.08,
  })

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
  dryStroke(ctx, [[bx, by - s * 2], [bx, by]], 1.4, rng, { color: ENCRE_SOMBRE, alpha: 0.5, layers: 3 })
  dryStroke(ctx, [[bx - s, by], [bx + s * 0.6, by + s * 0.5]], 1.6, rng, {
    color: ENCRE_SOMBRE,
    alpha: 0.4,
    layers: 2,
  })
  stroke(ctx, [[bx - s * 1.6, by + s * 0.7], [bx + s * 2.4, by + s * 0.55]], 2.4, rng, {
    color: PAPIER,
    alpha: 0.045,
    layers: 10,
  })
  highlight(ctx, polygon(w * 0.6, h * 0.72, w * 0.05, h * 0.02, 7, rng() * 6, rng), rng, {
    color: PAPIER,
    alpha: 0.07,
  })
  highlight(ctx, polygon(w * 0.4, h * 0.9, w * 0.06, h * 0.018, 7, rng() * 6, rng), rng, {
    color: BLEU_CLAIR,
    alpha: 0.06,
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
