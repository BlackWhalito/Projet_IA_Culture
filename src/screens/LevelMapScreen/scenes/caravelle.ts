import type { PaintScene } from '../../../components/watercolor/WatercolorScene'
import { contour, dryStroke, polygon, wash } from '../../../components/watercolor/engine'
import type { Point } from '../../../components/watercolor/engine'
import { gradedWash, ripples, vignette } from '../../../components/watercolor/atmosphere'
import {
  BLEU,
  BLEU_CLAIR,
  ENCRE_SOMBRE,
  OCRE,
  PIERRE_PALE,
  SABLE,
  TURQUOISE,
  VIOLET,
  VIOLET_BRUME,
  VIOLET_PROFOND,
} from '../../../components/watercolor/palette'

/**
 * Une rose des vents, comme sur une carte marine ancienne.
 *
 * Huit branches, dont quatre longues : c'est l'alternance long/court qui
 * fait la rose. Huit branches égales donnent une étoile, et une étoile ne
 * dit rien des directions. Chaque branche est peinte en deux moitiés de
 * valeurs différentes — c'est ce qui donne le relief gravé des vraies
 * roses, et ça survit à la réduction bien mieux qu'un contour.
 */
function roseDesVents(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rayon: number,
  rng: () => number,
  options: { light: string; dark: string; alpha?: number },
): void {
  const { light, dark, alpha = 1 } = options
  for (let i = 0; i < 8; i += 1) {
    const a = (i / 8) * Math.PI * 2 - Math.PI / 2
    const longue = i % 2 === 0
    const r = longue ? rayon : rayon * 0.52
    const larg = rayon * (longue ? 0.17 : 0.13)
    const pointe: Point = [x + Math.cos(a) * r, y + Math.sin(a) * r]
    const gauche: Point = [x + Math.cos(a - Math.PI / 2) * larg, y + Math.sin(a - Math.PI / 2) * larg]
    const droite: Point = [x + Math.cos(a + Math.PI / 2) * larg, y + Math.sin(a + Math.PI / 2) * larg]
    wash(ctx, [[x, y], gauche, pointe], rng, {
      color: light,
      layers: 10,
      alpha: (0.34 * alpha) / 10,
      spread: 0.05,
      jitter: 0.09,
    })
    wash(ctx, [[x, y], pointe, droite], rng, {
      color: dark,
      layers: 10,
      alpha: (0.5 * alpha) / 10,
      spread: 0.05,
      jitter: 0.09,
    })
  }
  // Le cercle inscrit, tracé et non rempli : il tient les branches
  // ensemble et achève de faire « instrument » plutôt que « décor ».
  const cercle: Point[] = []
  for (let i = 0; i <= 18; i += 1) {
    const a = (i / 18) * Math.PI * 2
    cercle.push([x + Math.cos(a) * rayon * 0.62, y + Math.sin(a) * rayon * 0.62])
  }
  dryStroke(ctx, cercle, rayon * 0.05, rng, { color: dark, alpha: 0.34 * alpha, layers: 1, jitter: 0.08 })
}

/**
 * Une caravelle, de trois quarts arrière.
 *
 * Ce qui la date, ce n'est pas la coque — toutes les coques se
 * ressemblent à cette taille — mais **le gréement** : trois mâts, des
 * voiles CARRÉES sur les deux premiers, un château arrière surélevé. Une
 * seule voile triangulaire suffirait à en faire un dériveur moderne.
 *
 * Les voiles sont la plus grande masse CLAIRE du tableau et la coque sa
 * plus petite masse sombre : c'est cet écart, dans un si petit objet, qui
 * le fait exister sur une étendue d'eau vide.
 */
function caravelle(
  ctx: CanvasRenderingContext2D,
  x: number,
  yFlottaison: number,
  taille: number,
  rng: () => number,
  options: { hull: string; sail: string; shade: string; accent: string; pennon: string },
): void {
  const { hull, sail, shade, accent, pennon } = options
  const L = taille

  // La coque : un croissant, plus haute à l'arrière (le château) qu'à
  // l'avant. Une coque symétrique se lit comme une barque.
  wash(ctx, [
    [x - L * 0.52, yFlottaison - L * 0.24],
    [x - L * 0.46, yFlottaison - L * 0.4],
    [x - L * 0.28, yFlottaison - L * 0.36],
    [x - L * 0.24, yFlottaison - L * 0.2],
    [x + L * 0.5, yFlottaison - L * 0.16],
    [x + L * 0.44, yFlottaison - L * 0.02],
    [x + L * 0.24, yFlottaison + L * 0.08],
    [x - L * 0.12, yFlottaison + L * 0.09],
    [x - L * 0.34, yFlottaison + L * 0.02],
  ], rng, { color: hull, layers: 22, alpha: 1.35 / 22, spread: 0.035, jitter: 0.08 })
  dryStroke(ctx, [
    [x - L * 0.5, yFlottaison - L * 0.2],
    [x + L * 0.48, yFlottaison - L * 0.16],
  ], L * 0.045, rng, { color: accent, alpha: 0.62, layers: 2 })
  contour(ctx, [
    [x - L * 0.52, yFlottaison - L * 0.24],
    [x - L * 0.34, yFlottaison + L * 0.02],
    [x - L * 0.12, yFlottaison + L * 0.09],
    [x + L * 0.24, yFlottaison + L * 0.08],
    [x + L * 0.44, yFlottaison - L * 0.02],
    [x + L * 0.5, yFlottaison - L * 0.16],
  ], rng, { color: accent, width: L * 0.035, alpha: 0.42, layers: 2, coverage: 0.62, runs: 2 })

  // Les trois mâts, et les vergues qui portent les voiles carrées.
  const mats: Array<[number, number]> = [
    [-0.12, 1.05],
    [0.14, 0.86],
    [0.4, 0.5],
  ]
  for (const [dx, hauteur] of mats) {
    const mx = x + L * dx
    const sommet = yFlottaison - L * (0.2 + hauteur)
    dryStroke(ctx, [[mx, yFlottaison - L * 0.18], [mx, sommet]], L * 0.035, rng, {
      color: accent,
      alpha: 0.6,
      layers: 2,
    })
  }
  // Deux voiles carrées sur le grand mât, une sur le second : c'est le
  // gréement qui date le navire, plus que sa coque.
  const voiles: Array<[number, number, number, number]> = [
    [-0.12, 0.5, 0.46, 0.34],
    [-0.12, 0.92, 0.32, 0.24],
    [0.14, 0.5, 0.34, 0.26],
  ]
  for (const [dx, haut, larg, hautVoile] of voiles) {
    const mx = x + L * dx
    const yv = yFlottaison - L * (0.2 + haut)
    wash(ctx, [
      [mx - L * larg * 0.5, yv],
      [mx + L * larg * 0.5, yv],
      [mx + L * larg * 0.44, yv + L * hautVoile],
      [mx - L * larg * 0.44, yv + L * hautVoile],
    ], rng, { color: sail, layers: 18, alpha: 1.35 / 18, spread: 0.05, jitter: 0.12 })
    // Le creux de la voile, côté sous le vent : sans lui, une voile est un
    // rectangle de papier, pas une toile gonflée.
    wash(ctx, [
      [mx + L * larg * 0.16, yv],
      [mx + L * larg * 0.5, yv],
      [mx + L * larg * 0.44, yv + L * hautVoile],
      [mx + L * larg * 0.12, yv + L * hautVoile],
    ], rng, { color: shade, layers: 10, alpha: 0.4 / 10, spread: 0.07, jitter: 0.14 })
    dryStroke(ctx, [[mx - L * larg * 0.52, yv], [mx + L * larg * 0.52, yv]], L * 0.036, rng, {
      color: accent,
      alpha: 0.68,
      layers: 2,
    })
    // Le bord inférieur de la voile, tracé par tronçons : c'est lui qui
    // donne à la toile son poids, et à l'ensemble son air dessiné plutôt
    // que découpé.
    contour(ctx, [
      [mx - L * larg * 0.44, yv + L * hautVoile],
      [mx, yv + L * hautVoile * 1.1],
      [mx + L * larg * 0.44, yv + L * hautVoile],
    ], rng, { color: accent, width: L * 0.022, alpha: 0.34, layers: 1, coverage: 0.6, runs: 2 })
  }
  // La voile latine du mât d'artimon, triangulaire — la marque de la
  // caravelle, justement.
  wash(ctx, [
    [x + L * 0.4, yFlottaison - L * 0.68],
    [x + L * 0.62, yFlottaison - L * 0.2],
    [x + L * 0.3, yFlottaison - L * 0.24],
  ], rng, { color: sail, layers: 16, alpha: 1.3 / 16, spread: 0.05, jitter: 0.12 })

  // Le pavillon en tête de grand mât : la seule couleur vive du tableau.
  wash(ctx, [
    [x - L * 0.12, yFlottaison - L * 1.25],
    [x + L * 0.14, yFlottaison - L * 1.18],
    [x - L * 0.12, yFlottaison - L * 1.1],
  ], rng, { color: pennon, layers: 12, alpha: 0.62 / 12, spread: 0.09, jitter: 0.16 })
}

/**
 * La caravelle, au large, à l'aube.
 *
 * Deux notions du niveau dans une seule image : la traversée de Christophe
 * Colomb, et les points cardinaux — d'où la rose des vents posée dans le
 * ciel, comme sur une carte marine, plutôt que sur un cartouche.
 *
 * Une étendue d'eau vide se lit toujours comme des bandes de couleur
 * empilées : c'est le sujet qui crée la profondeur, jamais la matière. Ici,
 * ce sont le navire (objet de taille connue), les rides en perspective et
 * la vague sombre du premier plan qui couchent la mer.
 */
export const caravelleScene: PaintScene = (ctx, w, h, rng) => {
  const horizon = h * 0.46

  // Une aube : le ciel s'éclaire vers l'horizon, où le papier reste
  // presque nu. C'est cette bande claire qui portera la silhouette du
  // navire.
  gradedWash(ctx, -w * 0.05, 0, w * 1.05, horizon + h * 0.01, [
    { at: 0, color: VIOLET_PROFOND, alpha: 0.46 },
    { at: 0.3, color: VIOLET, alpha: 0.3 },
    { at: 0.62, color: VIOLET_BRUME, alpha: 0.16 },
    { at: 0.86, color: OCRE, alpha: 0.12 },
    { at: 1, color: SABLE, alpha: 0.04 },
  ])

  // L'aube se concentre au ras de l'horizon, à gauche : c'est le
  // vignetage qui la met là plutôt que de l'étaler sur toute la largeur.
  vignette(ctx, -w * 0.05, 0, w * 1.05, horizon + h * 0.01, {
    cx: w * 0.32,
    cy: horizon * 0.94,
    color: VIOLET_PROFOND,
    alpha: 0.34,
    creux: 0.2,
  })

  // La rose des vents, très pâle, comme imprimée sur le ciel. Elle doit
  // rester une indication, pas un objet : trop dense, elle se lirait comme
  // un cerf-volant.
  roseDesVents(ctx, w * 0.18, h * 0.15, h * 0.11, rng, {
    light: VIOLET_BRUME,
    dark: VIOLET,
    alpha: 0.62,
  })

  // La mer : un seul dégradé continu, du pâle de l'horizon au profond du
  // premier plan. Des bandes empilées se liraient toujours comme des
  // bandes, quel que soit leur recouvrement.
  gradedWash(ctx, -w * 0.05, horizon, w * 1.05, h * 1.02, [
    { at: 0, color: BLEU_CLAIR, alpha: 0.24 },
    { at: 0.28, color: TURQUOISE, alpha: 0.42 },
    { at: 0.6, color: BLEU, alpha: 0.56 },
    { at: 1, color: VIOLET_PROFOND, alpha: 0.72 },
  ])
  ripples(ctx, 0, w, horizon + h * 0.015, h * 1.0, 30, rng, {
    color: BLEU,
    accent: VIOLET_PROFOND,
  })

  caravelle(ctx, w * 0.56, h * 0.66, h * 0.3, rng, {
    hull: VIOLET_PROFOND,
    sail: PIERRE_PALE,
    shade: VIOLET,
    accent: ENCRE_SOMBRE,
    pennon: OCRE,
  })

  // Pas de sillage peint. Essayé en trait pâle, il ressortait comme une
  // planche flottante posée en travers de l'eau : sur une grande surface
  // en dégradé, toute touche isolée se voit, et un ton clair ne peut de
  // toute façon pas éclaircir en `multiply`. Les rides suffisent.

  // Trois oiseaux : deux traits chacun, et le ciel cesse d'être vide.
  for (const [bx, by, taille] of [[0.74, 0.2, 1], [0.82, 0.26, 0.7], [0.68, 0.3, 0.5]] as Array<[number, number, number]>) {
    const s = h * 0.03 * taille
    dryStroke(ctx, [
      [w * bx - s, h * by],
      [w * bx, h * by - s * 0.45],
      [w * bx + s, h * by],
    ], s * 0.16, rng, { color: VIOLET_PROFOND, alpha: 0.45, layers: 1, jitter: 0.12 })
  }

  // La vague du premier plan : la masse sombre qui ferme le bas du cadre
  // et fait reculer le navire. Sans premier plan franc, une marine reste
  // une carte postale plate.
  wash(ctx, polygon(w * 0.42, h * 1.1, w * 0.8, h * 0.16, 11, 0, rng), rng, {
    color: VIOLET_PROFOND,
    layers: 20,
    alpha: 0.5 / 20,
    spread: 0.14,
    jitter: 0.3,
  })
  wash(ctx, polygon(w * 0.95, h * 1.04, w * 0.4, h * 0.12, 10, 0, rng), rng, {
    color: ENCRE_SOMBRE,
    layers: 16,
    alpha: 0.4 / 16,
    spread: 0.16,
    jitter: 0.32,
  })
}
