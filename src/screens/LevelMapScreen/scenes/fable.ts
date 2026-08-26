import type { PaintScene } from '../../../components/watercolor/WatercolorScene'
import { dryStroke, flecks, polygon, wash } from '../../../components/watercolor/engine'
import type { Point } from '../../../components/watercolor/engine'
import { gradedWash, vignette } from '../../../components/watercolor/atmosphere'
import { oiseauPerche, renardAssis } from '../../../components/watercolor/animal'
import { arbre } from '../../../components/watercolor/terrain'
import {
  ENCRE_SOMBRE,
  OCRE,
  PIERRE_CHAUDE,
  SABLE,
  VERT,
  VIOLET,
  VIOLET_PROFOND,
} from '../../../components/watercolor/palette'
import { LUMIERE, OMBRE_FEUILLAGE } from './lumiere'

/**
 * Le Corbeau et le Renard, en sous-bois d'automne.
 *
 * Le seul tableau de la série qui raconte une histoire plutôt qu'un lieu,
 * et toute sa composition sert ce récit : le corbeau EN HAUT à gauche avec
 * son fromage, le renard EN BAS à droite, museau levé vers lui. La
 * diagonale qui va de l'un à l'autre est le sujet — c'est le regard du
 * renard qui fait la fable, pas les deux animaux pris séparément.
 *
 * L'automne n'est pas décoratif non plus : il donne au tableau une gamme
 * chaude que les sept autres n'ont pas, et il éclaircit le sous-bois assez
 * pour que deux silhouettes sombres s'y détachent. En pleine feuille d'été,
 * les deux animaux se seraient noyés dans le vert.
 */
export const fableScene: PaintScene = (ctx, w, h, rng) => {
  const ySol = h * 0.78

  // Le fond de sous-bois : chaud et lumineux entre les troncs. Il tient
  // lieu de ciel — on ne voit pas le ciel dans un bois, on voit la clarté
  // qui passe au travers.
  gradedWash(ctx, -w * 0.05, 0, w * 1.05, ySol + h * 0.02, [
    { at: 0, color: VERT, alpha: 0.34 },
    { at: 0.34, color: OCRE, alpha: 0.22 },
    { at: 0.7, color: SABLE, alpha: 0.14 },
    { at: 1, color: PIERRE_CHAUDE, alpha: 0.1 },
  ])

  // La clarté qui perce entre les fûts se concentre à gauche : dans un
  // bois, la lumière arrive toujours par une trouée, jamais par tout le
  // fond à la fois.
  vignette(ctx, -w * 0.05, 0, w * 1.05, ySol + h * 0.02, {
    cx: w * 0.24,
    cy: h * 0.44,
    color: VIOLET_PROFOND,
    alpha: 0.34,
    creux: 0.16,
  })

  // Les fûts du fond, pâles et verticaux : ils font la profondeur du bois
  // sans rien coûter. Espacés irrégulièrement — à intervalle égal, ils
  // deviendraient une palissade.
  for (const [fx, larg, dist] of [
    [0.08, 0.022, 0.72],
    [0.2, 0.016, 0.78],
    [0.46, 0.026, 0.66],
    [0.58, 0.014, 0.8],
    [0.9, 0.02, 0.7],
  ] as Array<[number, number, number]>) {
    // En lavis et non au trait : `dryStroke` effile ses deux bouts, donc
    // un fût tracé avec lui sort en cigare qui flotte entre ciel et sol.
    // Un tronc touche le sol, et son pied est plus large que sa cime.
    wash(ctx, [
      [w * (fx - larg * 0.6), ySol],
      [w * (fx - larg * 0.36), -h * 0.04],
      [w * (fx + larg * 0.36), -h * 0.04],
      [w * (fx + larg * 0.6), ySol],
    ], rng, {
      color: VIOLET,
      layers: 14,
      alpha: (0.42 * (1 - dist * 0.55)) / 14,
      spread: 0.05,
      jitter: 0.12,
    })
  }

  // Le sol du sous-bois, jonché de feuilles.
  gradedWash(ctx, -w * 0.05, ySol, w * 1.05, h * 1.02, [
    { at: 0, color: OCRE, alpha: 0.32 },
    { at: 0.5, color: OCRE, alpha: 0.5 },
    { at: 1, color: VIOLET_PROFOND, alpha: 0.7 },
  ])
  flecks(ctx, w * 0.5, h * 0.9, w * 0.56, h * 0.1, 16, rng, {
    color: PIERRE_CHAUDE,
    layers: 5,
    alpha: 0.06,
    spread: 0.3,
    jitter: 0.3,
  })

  // Le grand chêne, à droite, dont part la branche. Son tronc mord le bord
  // du cadre : c'est le repoussoir, et la masse la plus sombre du tableau.
  arbre(ctx, w * 0.94, h * 1.02, h * 0.86, rng, LUMIERE, {
    canopy: OCRE,
    wood: ENCRE_SOMBRE,
    shade: OMBRE_FEUILLAGE,
    weight: 1.35,
  })

  // La branche : elle traverse le tiers haut du tableau de droite à
  // gauche, en s'affinant. C'est la seule horizontale de l'image, et elle
  // porte le corbeau — donc elle doit être franche.
  const yBranche = h * 0.36
  const branche: Point[] = [
    [w * 0.98, yBranche + h * 0.08],
    [w * 0.7, yBranche + h * 0.01],
    [w * 0.44, yBranche - h * 0.01],
    [w * 0.22, yBranche + h * 0.02],
  ]
  dryStroke(ctx, branche, w * 0.013, rng, { color: ENCRE_SOMBRE, alpha: 0.5, layers: 2, jitter: 0.12 })
  // Deux ramilles qui montent de la branche : sans elles, c'est une barre.
  for (const [rx, ry] of [[0.56, 0.02], [0.34, 0.04]] as Array<[number, number]>) {
    dryStroke(ctx, [
      [w * rx, yBranche + h * ry],
      [w * (rx - 0.04), yBranche - h * 0.06],
      [w * (rx - 0.05), yBranche - h * 0.13],
    ], w * 0.008, rng, { color: ENCRE_SOMBRE, alpha: 0.45, layers: 2, jitter: 0.16 })
  }
  // Quelques feuilles d'automne accrochées à la branche, pour qu'elle
  // appartienne à l'arbre plutôt que d'y être posée.
  for (let i = 0; i < 9; i += 1) {
    const t = rng()
    const lx = w * (0.24 + t * 0.7)
    const ly = yBranche + h * (0.01 + rng() * 0.03)
    wash(ctx, polygon(lx, ly, w * 0.011, h * 0.01, 8, rng() * 6, rng), rng, {
      color: VIOLET_PROFOND,
      layers: 10,
      alpha: 0.5 / 10,
      spread: 0.18,
      jitter: 0.24,
    })
  }

  // Le corbeau, perché, tourné vers le renard. Noir plein : c'est le seul
  // endroit du tableau où l'on pose l'encre pure, et c'est ce qui en fait
  // le point de départ du regard.
  const corbeauX = w * 0.34
  oiseauPerche(ctx, corbeauX, yBranche + h * 0.015, h * 0.19, rng, LUMIERE, {
    coat: ENCRE_SOMBRE,
    shade: VIOLET_PROFOND,
    accent: ENCRE_SOMBRE,
    beak: VIOLET_PROFOND,
    facing: 1,
  })
  // Le fromage, dans le bec : minuscule, mais c'est lui qui transforme
  // « un oiseau sur une branche » en « la fable ». Un coin clair posé sur
  // fond clair a besoin de son propre contour, sinon il disparaît.
  const fx0 = corbeauX + h * 0.19 * 0.58
  const fy0 = yBranche + h * 0.015 - h * 0.19 * 0.56
  const fromage: Point[] = [
    [fx0, fy0],
    [fx0 + w * 0.045, fy0 - h * 0.012],
    [fx0 + w * 0.042, fy0 + h * 0.026],
    [fx0 - w * 0.004, fy0 + h * 0.022],
  ]
  wash(ctx, fromage, rng, { color: SABLE, layers: 14, alpha: 0.6 / 14, spread: 0.05, jitter: 0.1 })
  dryStroke(ctx, [...fromage, fromage[0]], w * 0.005, rng, {
    color: VIOLET_PROFOND,
    alpha: 0.5,
    layers: 1,
  })

  // Le renard, assis au pied de l'arbre, museau levé vers le corbeau.
  renardAssis(ctx, w * 0.6, h * 0.97, h * 0.34, rng, LUMIERE, {
    coat: OCRE,
    shade: VIOLET_PROFOND,
    accent: ENCRE_SOMBRE,
    tip: PIERRE_CHAUDE,
    facing: -1,
    weight: 1.5,
  })

  // Une touffe de fougères au premier plan gauche, pour équilibrer le
  // tronc de droite et fermer le bas du cadre.
  for (let i = 0; i < 9; i += 1) {
    const gx = w * (rng() * 0.26)
    const gh = h * (0.1 + rng() * 0.14)
    dryStroke(ctx, [
      [gx, h * 1.04],
      [gx + (rng() - 0.5) * gh * 0.5, h * 1.04 - gh * 0.6],
      [gx + (rng() - 0.5) * gh, h * 1.04 - gh],
    ], gh * 0.1, rng, {
      color: rng() > 0.5 ? VIOLET_PROFOND : VERT,
      alpha: 0.42,
      layers: 1,
      jitter: 0.14,
    })
  }

  // Un dernier voile sombre au coin bas droit : il enfonce le pied de
  // l'arbre dans l'ombre et empêche le regard de sortir par là.
  wash(ctx, polygon(w * 0.96, h * 1.06, w * 0.3, h * 0.16, 10, 0, rng), rng, {
    color: VIOLET_PROFOND,
    layers: 14,
    alpha: 0.3 / 14,
    spread: 0.2,
    jitter: 0.3,
  })
}
