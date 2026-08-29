/**
 * FICHIER D'ÉTUDE, TEMPORAIRE. Deux variantes de la lagune poussées plus loin,
 * pour arbitrage. À supprimer une fois la direction choisie.
 */
import type { PaintScene } from '../../components/watercolor/WatercolorScene'
import type { Point } from '../../components/watercolor/engine'
import { deform, dryStroke, granulation, hardEdge, polygon, wash } from '../../components/watercolor/engine'
import { gradedWash, reflection, ripples } from '../../components/watercolor/atmosphere'
import { dome, facade } from '../../components/watercolor/architecture'
import { childWatchingSea } from '../../components/watercolor/figure'
import type { LightPlan } from '../../components/watercolor/light'

const BLEU = '#5a7fa0'
const BLEU_CLAIR = '#8fb0c9'
const TURQUOISE = '#4f9a92'
const VIOLET = '#8d6aa8'
const VIOLET_BRUME = '#c3b0d4'
const VIOLET_PROFOND = '#5d4574'
const SABLE = '#d9a35f'
const ENCRE_SOMBRE = '#241d2b'
const PIERRE_CHAUDE = '#d8bd96'

const LUMIERE: LightPlan = { angleDeg: 200, warm: SABLE, cool: VIOLET_PROFOND, accent: ENCRE_SOMBRE }

/**
 * LA RÉSERVE — le blanc du papier, gardé intact.
 *
 * En aquarelle on ne peint pas le blanc : on le RÉSERVE, on laisse le papier
 * nu. Jusqu'ici on essayait de le simuler avec un lavis très pâle, ce qui ne
 * donne jamais qu'un gris clair — en `multiply`, poser une couleur ne peut
 * qu'assombrir.
 *
 * La vraie réponse est de ne rien poser : `destination-out` EFFACE le pigment
 * déjà déposé et redécouvre le fond de page, qui est précisément le papier.
 * C'est le seul moyen d'obtenir un blanc franc dans ce moteur.
 */
function reserve(ctx: CanvasRenderingContext2D, base: Point[], rng: () => number, force = 1): void {
  ctx.save()
  ctx.globalCompositeOperation = 'destination-out'
  const contour = deform(base, 3, 0.16, rng)
  ctx.globalAlpha = force
  ctx.beginPath()
  ctx.moveTo(contour[0][0], contour[0][1])
  for (const [x, y] of contour.slice(1)) ctx.lineTo(x, y)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

/** Une voile : sa toile est du papier réservé, sa coque un vrai noir. */
function voileReservee(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  taille: number,
  rng: () => number,
): void {
  reserve(ctx, [
    [x, y - taille * 2.2],
    [x + taille * 0.9, y - taille * 0.1],
    [x - taille * 0.18, y - taille * 0.1],
  ], rng, 0.92)
  dryStroke(ctx, [[x, y - taille * 2.2], [x, y - taille * 0.05]], taille * 0.09, rng, {
    color: ENCRE_SOMBRE,
    alpha: 0.5,
    layers: 2,
  })
  wash(ctx, [
    [x - taille * 1.05, y - taille * 0.08],
    [x + taille * 1.05, y - taille * 0.08],
    [x + taille * 0.6, y + taille * 0.3],
    [x - taille * 0.6, y + taille * 0.3],
  ], rng, { color: ENCRE_SOMBRE, layers: 10, alpha: 0.55 / 10, spread: 0.05, jitter: 0.06 })
}

/**
 * VARIANTE A — LES BLANCS RÉSERVÉS.
 *
 * Le parti : le tableau se construit sur l'écart entre le papier nu et les
 * sombres, pas sur des demi-teintes. Une bande de papier intacte court sous
 * l'horizon, les voiles sont du papier, et l'eau du premier plan descend
 * jusqu'à l'encre. C'est la leçon des aquarellistes : sans vrai blanc, pas de
 * vraie lumière — et un blanc n'est franc que s'il est RÉSERVÉ, jamais peint.
 */
export const laguneReserves: PaintScene = (ctx, w, h, rng) => {
  const horizon = h * 0.36

  gradedWash(ctx, -w * 0.05, 0, w * 1.05, horizon * 0.94, [
    { at: 0, color: VIOLET, alpha: 0.44 },
    { at: 0.5, color: VIOLET_BRUME, alpha: 0.26 },
    { at: 1, color: SABLE, alpha: 0.05 },
  ])

  // La rive : des masses simples, plus SOMBRES que le papier qu'elles
  // surplombent. C'est ce contraste, et non le détail, qui pose l'horizon.
  facade(ctx, w * 0.2, horizon - h * 0.055, horizon, w * 0.34, rng, LUMIERE, {
    stone: VIOLET, shade: VIOLET_PROFOND, distance: 0.72, floors: 0, bays: 0,
  })
  facade(ctx, w * 0.6, horizon - h * 0.038, horizon, w * 0.3, rng, LUMIERE, {
    stone: VIOLET, shade: VIOLET_PROFOND, distance: 0.76, floors: 0, bays: 0,
  })
  dome(ctx, w * 0.78, horizon - h * 0.03, w * 0.07, rng, LUMIERE, {
    stone: VIOLET, shade: VIOLET_PROFOND, distance: 0.7,
  })

  gradedWash(ctx, -w * 0.05, horizon, w * 1.05, h * 1.02, [
    { at: 0, color: BLEU_CLAIR, alpha: 0.2 },
    { at: 0.3, color: TURQUOISE, alpha: 0.38 },
    { at: 0.62, color: BLEU, alpha: 0.6 },
    { at: 0.86, color: VIOLET_PROFOND, alpha: 0.74 },
    { at: 1, color: ENCRE_SOMBRE, alpha: 0.6 },
  ])

  // LA RÉSERVE MAÎTRESSE : la bande de lumière sous l'horizon. Le papier
  // reparaît, franc, et c'est elle qui fait respirer tout le tableau.
  reserve(ctx, [
    [-w * 0.05, horizon + h * 0.004],
    [w * 0.36, horizon - h * 0.002],
    [w * 0.74, horizon + h * 0.006],
    [w * 1.05, horizon + h * 0.002],
    [w * 1.05, horizon + h * 0.036],
    [w * 0.6, horizon + h * 0.045],
    [w * 0.2, horizon + h * 0.032],
    [-w * 0.05, horizon + h * 0.04],
  ], rng, 0.85)
  // Deux éclats plus bas, plus étroits : la lumière se fragmente en
  // s'éloignant de sa source.
  reserve(ctx, [
    [w * 0.36, h * 0.548], [w * 0.9, h * 0.542],
    [w * 0.9, h * 0.556], [w * 0.36, h * 0.562],
  ], rng, 0.62)
  reserve(ctx, [
    [w * 0.06, h * 0.716], [w * 0.5, h * 0.711],
    [w * 0.5, h * 0.723], [w * 0.06, h * 0.729],
  ], rng, 0.55)

  hardEdge(ctx, [
    [w * 0.04, horizon + h * 0.001],
    [w * 0.3, horizon - h * 0.002],
    [w * 0.52, horizon + h * 0.001],
  ], 1.6, rng, { color: VIOLET_PROFOND, alpha: 0.3 })

  reflection(ctx, w * 0.2, w * 0.34, horizon + h * 0.04, h * 0.05, VIOLET, rng, 5)
  reflection(ctx, w * 0.6, w * 0.3, horizon + h * 0.04, h * 0.045, VIOLET, rng, 5)
  ripples(ctx, 0, w, horizon + h * 0.07, h * 0.95, 26, rng, { color: BLEU, accent: VIOLET_PROFOND })
  granulation(ctx, 0, horizon + h * 0.12, w, h * 0.8, 460, rng, { color: VIOLET_PROFOND, alpha: 0.22 })

  voileReservee(ctx, w * 0.34, h * 0.5, w * 0.075, rng)
  voileReservee(ctx, w * 0.72, h * 0.43, w * 0.045, rng)

  // Le premier plan : une masse presque noire, et la figure contre elle.
  wash(ctx, [
    [-w * 0.1, h * 1.05],
    [w * 0.16, h * 0.9],
    [w * 0.62, h * 0.86],
    [w * 1.1, h * 0.95],
    [w * 1.1, h * 1.05],
  ], rng, { color: ENCRE_SOMBRE, layers: 22, alpha: 0.62 / 22, spread: 0.05, jitter: 0.06 })
  childWatchingSea(ctx, w * 0.6, h * 0.885, h * 0.075, rng, LUMIERE, {
    skin: PIERRE_CHAUDE, hair: ENCRE_SOMBRE, clothes: VIOLET_PROFOND, accent: ENCRE_SOMBRE,
  })
}

/**
 * VARIANTE B — L'ÉCONOMIE.
 *
 * Le parti inverse : très peu de formes, très grandes, très décidées. Trois
 * valeurs et rien entre elles — ciel pâle, eau moyenne, premier plan sombre.
 * Aucune rive détaillée, une seule voile, un seul accent noir.
 *
 * C'est la discipline que partagent tous les aquarellistes qu'on admire :
 * suggérer avec trois taches justes plutôt que décrire avec vingt.
 */
export const laguneEconomie: PaintScene = (ctx, w, h, rng) => {
  const horizon = h * 0.42

  gradedWash(ctx, -w * 0.05, 0, w * 1.05, horizon, [
    { at: 0, color: VIOLET, alpha: 0.34 },
    { at: 0.62, color: VIOLET_BRUME, alpha: 0.18 },
    { at: 1, color: SABLE, alpha: 0.04 },
  ])

  // Un seul nuage, large et bas, posé d'un geste.
  wash(ctx, polygon(w * 0.38, h * 0.13, w * 0.46, h * 0.035, 11, 0, rng), rng, {
    color: VIOLET_BRUME, layers: 16, alpha: 0.3 / 16, spread: 0.16, jitter: 0.14,
  })

  // La rive : DEUX taches, sans une fenêtre ni un toit. À cette distance, un
  // bâtiment n'est qu'une valeur ; le détail qu'on y met ne se voit pas, il
  // salit.
  wash(ctx, [
    [w * 0.06, horizon], [w * 0.06, horizon - h * 0.03],
    [w * 0.38, horizon - h * 0.038], [w * 0.38, horizon],
  ], rng, { color: VIOLET, layers: 14, alpha: 0.34 / 14, spread: 0.05, jitter: 0.06 })
  wash(ctx, [
    [w * 0.56, horizon], [w * 0.56, horizon - h * 0.022],
    [w * 0.92, horizon - h * 0.03], [w * 0.92, horizon],
  ], rng, { color: VIOLET, layers: 12, alpha: 0.28 / 12, spread: 0.05, jitter: 0.06 })

  hardEdge(ctx, [[w * 0.06, horizon], [w * 0.22, horizon + h * 0.001], [w * 0.38, horizon]], 1.4, rng, {
    color: VIOLET_PROFOND, alpha: 0.3,
  })
  hardEdge(ctx, [[w * 0.56, horizon], [w * 0.74, horizon + h * 0.001], [w * 0.92, horizon]], 1.4, rng, {
    color: VIOLET_PROFOND, alpha: 0.26,
  })

  gradedWash(ctx, -w * 0.05, horizon, w * 1.05, h * 1.02, [
    { at: 0, color: BLEU_CLAIR, alpha: 0.24 },
    { at: 0.5, color: BLEU, alpha: 0.5 },
    { at: 1, color: VIOLET_PROFOND, alpha: 0.72 },
  ])

  reserve(ctx, [
    [-w * 0.05, horizon + h * 0.006],
    [w * 0.5, horizon],
    [w * 1.05, horizon + h * 0.008],
    [w * 1.05, horizon + h * 0.03],
    [-w * 0.05, horizon + h * 0.034],
  ], rng, 0.8)

  hardEdge(ctx, [
    [w * 0.1, horizon], [w * 0.46, horizon - h * 0.002], [w * 0.8, horizon + h * 0.002],
  ], 1.8, rng, { color: VIOLET_PROFOND, alpha: 0.32 })

  ripples(ctx, 0, w, horizon + h * 0.09, h * 0.9, 16, rng, { color: BLEU, accent: VIOLET_PROFOND })
  granulation(ctx, 0, horizon + h * 0.2, w, h * 0.7, 340, rng, { color: VIOLET_PROFOND, alpha: 0.2 })

  // Une seule voile, plus grande, franchement décentrée.
  voileReservee(ctx, w * 0.3, h * 0.62, w * 0.1, rng)

  // Le premier plan : une seule masse noire, montante, et la figure dessus.
  wash(ctx, [
    [w * 0.18, h * 1.06],
    [w * 0.46, h * 0.83],
    [w * 0.86, h * 0.79],
    [w * 1.12, h * 0.92],
    [w * 1.12, h * 1.06],
  ], rng, { color: ENCRE_SOMBRE, layers: 24, alpha: 0.7 / 24, spread: 0.04, jitter: 0.05 })
  childWatchingSea(ctx, w * 0.66, h * 0.815, h * 0.085, rng, LUMIERE, {
    skin: PIERRE_CHAUDE, hair: ENCRE_SOMBRE, clothes: VIOLET_PROFOND, accent: ENCRE_SOMBRE,
  })
}
