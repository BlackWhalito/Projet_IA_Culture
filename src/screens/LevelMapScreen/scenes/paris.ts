import type { PaintScene } from '../../../components/watercolor/WatercolorScene'
import { dryStroke, wash } from '../../../components/watercolor/engine'
import type { Point } from '../../../components/watercolor/engine'
import { gradedWash, reflection, ripples, vignette } from '../../../components/watercolor/atmosphere'
import { arcade, cornice, facade, pitchedRoof } from '../../../components/watercolor/architecture'
import { arbre } from '../../../components/watercolor/terrain'
import {
  BLEU,
  ENCRE_SOMBRE,
  OCRE,
  PIERRE_CHAUDE,
  PIERRE_PALE,
  SABLE,
  VERT,
  VIOLET,
  VIOLET_BRUME,
  VIOLET_PROFOND,
} from '../../../components/watercolor/palette'
import { LUMIERE, OMBRE_FEUILLAGE } from './lumiere'

/**
 * La tour Eiffel.
 *
 * La silhouette la plus reconnaissable du monde, et donc celle qu'on rate
 * le plus facilement : tout le monde sait à quoi elle ressemble, donc la
 * moindre erreur de proportion se voit. Trois choses la font, et le
 * treillis n'en fait pas partie (à 100 px de haut, il ne serait qu'un
 * grisé) :
 *
 * 1. **La courbe des piliers.** Elle n'est pas droite : la largeur chute
 *    très vite dans le premier tiers, puis presque plus. Des jambages
 *    droits donnent un pylône électrique.
 * 2. **Les deux plateformes**, franches et DÉBORDANTES. Ce sont les seules
 *    horizontales de la figure ; sans elles il ne reste qu'un cône.
 * 3. **L'arche du rez-de-chaussée**, et le vide sous elle. Une tour pleine
 *    jusqu'au sol perd ce qui la rend légère.
 */
function tourEiffel(
  ctx: CanvasRenderingContext2D,
  x: number,
  yBase: number,
  hauteur: number,
  largeur: number,
  rng: () => number,
  options: { iron: string; shade: string; accent: string },
): void {
  const { iron, shade, accent } = options
  // Demi-largeur en fonction de la hauteur relative. Les quatre points de
  // contrôle reproduisent la vraie courbe : chute brutale, puis plateau.
  const demi = (t: number): number => {
    const controle: Array<[number, number]> = [[0, 0.5], [0.29, 0.2], [0.57, 0.105], [1, 0.028]]
    for (let i = 0; i < controle.length - 1; i += 1) {
      const [t0, v0] = controle[i]
      const [t1, v1] = controle[i + 1]
      if (t <= t1) {
        const k = (t - t0) / (t1 - t0)
        return largeur * (v0 + (v1 - v0) * k ** 0.72)
      }
    }
    return largeur * 0.028
  }
  const yA = (t: number) => yBase - hauteur * t

  // Les deux piliers, séparés par le vide de l'arche. Peints à part et
  // non comme une masse trouée : en `multiply`, un « trou » repeint
  // par-dessus resterait visible.
  for (const cote of [-1, 1]) {
    const pilier: Point[] = []
    for (let i = 0; i <= 8; i += 1) {
      const t = (i / 8) * 0.29
      pilier.push([x + cote * demi(t), yA(t)])
    }
    for (let i = 8; i >= 0; i -= 1) {
      const t = (i / 8) * 0.29
      // Le bord intérieur : il remonte vers l'axe, ce qui creuse l'arche.
      pilier.push([x + cote * demi(t) * (0.42 - t * 0.5), yA(t)])
    }
    wash(ctx, pilier, rng, {
      color: iron,
      layers: 22,
      alpha: 0.72 / 22,
      spread: 0.03,
      jitter: 0.07,
    })
  }
  // L'arc décoratif entre les piliers : la courbe qui referme l'arche par
  // le haut, et l'un des repères les plus sûrs de la tour.
  const arc: Point[] = []
  for (let i = 0; i <= 10; i += 1) {
    const k = i / 10
    arc.push([x - demi(0.05) * 0.9 + demi(0.05) * 1.8 * k, yA(0.29) - Math.sin(k * Math.PI) * hauteur * 0.075])
  }
  dryStroke(ctx, arc, hauteur * 0.022, rng, { color: iron, alpha: 0.6, layers: 2, jitter: 0.06 })

  // Le fût, du premier étage à la pointe, d'un seul tenant.
  const fut: Point[] = []
  for (let i = 0; i <= 10; i += 1) {
    const t = 0.29 + (i / 10) * 0.71
    fut.push([x - demi(t), yA(t)])
  }
  for (let i = 10; i >= 0; i -= 1) {
    const t = 0.29 + (i / 10) * 0.71
    fut.push([x + demi(t), yA(t)])
  }
  wash(ctx, fut, rng, { color: iron, layers: 22, alpha: 1.2 / 22, spread: 0.03, jitter: 0.07 })

  // Le côté à l'ombre, repris DANS le contour du fût.
  const ombre: Point[] = []
  for (let i = 0; i <= 10; i += 1) {
    const t = 0.29 + (i / 10) * 0.71
    ombre.push([x + demi(t) * 0.1, yA(t)])
  }
  for (let i = 10; i >= 0; i -= 1) {
    const t = 0.29 + (i / 10) * 0.71
    ombre.push([x + demi(t), yA(t)])
  }
  wash(ctx, ombre, rng, { color: shade, layers: 12, alpha: 0.3 / 12, spread: 0.04, jitter: 0.09 })

  // Les deux plateformes : franches, débordantes, et c'est tout ce qu'il
  // faut d'horizontal.
  for (const t of [0.29, 0.57]) {
    const d = demi(t) * 1.5
    wash(ctx, [
      [x - d, yA(t)],
      [x + d, yA(t)],
      [x + d, yA(t) + hauteur * 0.022],
      [x - d, yA(t) + hauteur * 0.022],
    ], rng, { color: iron, layers: 14, alpha: 1.1 / 14, spread: 0.04, jitter: 0.08 })
    dryStroke(ctx, [[x - d, yA(t)], [x + d, yA(t)]], hauteur * 0.014, rng, {
      color: accent,
      alpha: 0.5,
      layers: 2,
    })
  }
  // Le campanile et la pointe.
  dryStroke(ctx, [[x, yA(0.94)], [x, yA(1.04)]], hauteur * 0.012, rng, {
    color: accent,
    alpha: 0.6,
    layers: 2,
  })
}

/**
 * Paris au crépuscule, depuis la Seine.
 *
 * La tour est traitée en silhouette sombre sur un ciel qui s'embrase :
 * c'est l'heure où elle est le plus reconnaissable, et surtout la seule
 * façon de faire tenir une structure aussi ajourée à cette taille. Peinte
 * en clair sur ciel clair, elle disparaîtrait.
 *
 * Le fleuve occupe le quart bas et porte le reflet. Il n'est pas
 * décoratif : sans lui, la tour serait posée sur une ligne de sol et le
 * tableau n'aurait ni profondeur ni sujet au premier plan.
 */
export const parisScene: PaintScene = (ctx, w, h, rng) => {
  const yQuai = h * 0.72

  gradedWash(ctx, -w * 0.05, 0, w * 1.05, yQuai + h * 0.01, [
    { at: 0, color: VIOLET_PROFOND, alpha: 0.44 },
    { at: 0.28, color: VIOLET, alpha: 0.3 },
    { at: 0.56, color: VIOLET_BRUME, alpha: 0.18 },
    { at: 0.8, color: OCRE, alpha: 0.14 },
    { at: 1, color: SABLE, alpha: 0.05 },
  ])

  // Le crépuscule se concentre derrière la rive gauche : le ciel se
  // referme dans les angles, et la tour se découpe sur la seule partie
  // claire. Un dégradé vertical seul lui aurait donné un fond uniforme.
  vignette(ctx, -w * 0.05, 0, w * 1.05, yQuai + h * 0.01, {
    cx: w * 0.34,
    cy: yQuai * 0.86,
    color: VIOLET_PROFOND,
    alpha: 0.36,
    creux: 0.2,
  })

  // La rive : un front d'immeubles haussmanniens, bas et régulier. Il
  // donne l'échelle de la tour — sans bâti autour, elle pourrait mesurer
  // dix mètres comme trois cents.
  // Un FRONT continu, pas quatre maisons : c'est l'alignement bord à bord,
  // et les hauteurs qui varient de peu, qui font une rue plutôt qu'un
  // village. Chaque corps se joint au suivant sans le chevaucher — en
  // `multiply`, un recouvrement ressortirait en boîte translucide.
  const immeubles: Array<[number, number, number]> = [
    [-0.04, 0.2, 0.54],
    [0.14, 0.16, 0.51],
    [0.29, 0.15, 0.55],
    [0.42, 0.12, 0.52],
    [0.9, 0.24, 0.53],
  ]
  for (const [x0, larg, haut] of immeubles) {
    const cx = w * (x0 + larg / 2)
    facade(ctx, cx, h * haut, yQuai, w * larg, rng, LUMIERE, {
      stone: PIERRE_PALE,
      shade: PIERRE_CHAUDE,
      distance: 0.42,
      floors: 3,
      bays: 4,
      spread: 0.035,
      jitter: 0.08,
    })
    // Le toit mansardé : la deuxième signature de Paris après la tour, et
    // elle tient en une pente basse et une teinte SOMBRE. Un toit clair ou
    // franchement bleu donne un chalet ; le zinc parisien est presque noir
    // à contre-jour.
    pitchedRoof(ctx, cx, h * haut, w * larg, h * 0.035, rng, LUMIERE, {
      color: VIOLET_PROFOND,
      distance: 0.3,
      lean: 0.04,
    })
    cornice(ctx, cx, h * haut, w * larg * 0.5, rng, LUMIERE, 0.45)
  }

  // Les arbres du quai, entre les immeubles et l'eau.
  for (const [tx, taille] of [[0.14, 0.13], [0.33, 0.11], [0.94, 0.12]] as Array<[number, number]>) {
    arbre(ctx, w * tx, yQuai + h * 0.012, h * taille, rng, LUMIERE, {
      canopy: VERT,
      wood: VIOLET_PROFOND,
      shade: OMBRE_FEUILLAGE,
      distance: 0.35,
      weight: 1.1,
    })
  }

  // Le pont : trois arches qui referment la rive gauche et posent une
  // horizontale contre la verticale de la tour.
  const yTablier = yQuai - h * 0.055
  arcade(ctx, -w * 0.05, w * 0.36, yTablier + h * 0.005, yQuai + h * 0.01, 3, rng, LUMIERE, 0.3)
  wash(ctx, [
    [-w * 0.05, yTablier],
    [w * 0.36, yTablier],
    [w * 0.36, yTablier + h * 0.032],
    [-w * 0.05, yTablier + h * 0.032],
  ], rng, { color: PIERRE_CHAUDE, layers: 16, alpha: 0.9 / 16, spread: 0.025, jitter: 0.06 })
  dryStroke(ctx, [[-w * 0.05, yTablier], [w * 0.36, yTablier]], h * 0.008, rng, {
    color: ENCRE_SOMBRE,
    alpha: 0.4,
    layers: 2,
  })

  const yPied = yQuai + h * 0.005
  tourEiffel(ctx, w * 0.62, yPied, h * 0.68, w * 0.23, rng, {
    iron: VIOLET_PROFOND,
    shade: ENCRE_SOMBRE,
    accent: ENCRE_SOMBRE,
  })

  // La Seine. Confinée sous la ligne de quai : en `multiply`, une bande
  // d'eau qui remonte trop haut traverse visiblement les façades.
  gradedWash(ctx, -w * 0.05, yQuai, w * 1.05, h * 1.02, [
    { at: 0, color: VIOLET_BRUME, alpha: 0.22 },
    { at: 0.4, color: BLEU, alpha: 0.46 },
    { at: 1, color: VIOLET_PROFOND, alpha: 0.66 },
  ])
  // Le reflet de la tour, tiré vers le bas puis cassé par les rides. Il ne
  // peut être que sombre : en `multiply`, un fer déjà noir ne se reflète
  // pas en clair, et c'est heureux — un reflet plus clair que son objet
  // serait immédiatement faux.
  reflection(ctx, w * 0.62, w * 0.18, yQuai, h * 0.26, VIOLET_PROFOND, rng, 7)
  reflection(ctx, w * 0.2, w * 0.36, yQuai, h * 0.12, VIOLET, rng, 6)
  ripples(ctx, 0, w, yQuai + h * 0.01, h * 1.0, 24, rng, { color: BLEU, accent: VIOLET_PROFOND })

  // Une péniche minuscule : l'objet de taille connue qui achève de coucher
  // le fleuve, comme les voiles de la lagune de l'accueil.
  const bx = w * 0.3
  const by = h * 0.88
  wash(ctx, [
    [bx - w * 0.07, by],
    [bx + w * 0.07, by],
    [bx + w * 0.055, by + h * 0.03],
    [bx - w * 0.055, by + h * 0.03],
  ], rng, { color: ENCRE_SOMBRE, layers: 16, alpha: 0.5 / 16, spread: 0.05, jitter: 0.1 })
  dryStroke(ctx, [[bx - w * 0.02, by], [bx - w * 0.02, by - h * 0.03]], w * 0.012, rng, {
    color: ENCRE_SOMBRE,
    alpha: 0.5,
    layers: 2,
  })
}
