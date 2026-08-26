import type { PaintScene } from '../../../components/watercolor/WatercolorScene'
import { dryStroke } from '../../../components/watercolor/engine'
import { gradedWash, vignette } from '../../../components/watercolor/atmosphere'
import { arbre, collines } from '../../../components/watercolor/terrain'
import {
  BLEU_CLAIR,
  OCRE,
  PIERRE_CHAUDE,
  SABLE,
  VERT,
  VIOLET,
  VIOLET_BRUME,
  VIOLET_PROFOND,
} from '../../../components/watercolor/palette'
import { LUMIERE, OMBRE_FEUILLAGE } from './lumiere'

/**
 * Une saison : un panneau complet, ciel, coteau, sol et arbre.
 *
 * Tout ce qui change d'une saison à l'autre passe par ces réglages, et
 * rien d'autre ne bouge : même horizon, même arbre, même place. C'est cette
 * immobilité de la composition qui fait lire « le temps qui passe » plutôt
 * que « quatre paysages ». Un cadrage différent par panneau, et le tableau
 * ne raconterait plus rien.
 */
interface Saison {
  cielHaut: string
  cielHautAlpha: number
  cielBas: string
  cielBasAlpha: number
  coteau: string
  sol: string
  solAlpha: number
  /** Feuillage. `null` pour l'arbre nu de l'hiver. */
  feuillage: string | null
  densite: number
}

const SAISONS: Saison[] = [
  // Printemps : ciel lavé, feuillage clair et CLAIRSEMÉ — les branches
  // doivent rester visibles au travers, c'est ce qui distingue une jeune
  // pousse d'un arbre en pleine feuille.
  {
    cielHaut: VIOLET_BRUME,
    cielHautAlpha: 0.3,
    cielBas: SABLE,
    cielBasAlpha: 0.08,
    coteau: VERT,
    sol: VERT,
    solAlpha: 0.2,
    feuillage: VERT,
    densite: 0.62,
  },
  // Été : ciel franc, feuillage lourd. Le panneau le plus dense des quatre.
  {
    cielHaut: BLEU_CLAIR,
    cielHautAlpha: 0.42,
    cielBas: SABLE,
    cielBasAlpha: 0.12,
    coteau: VERT,
    sol: VERT,
    solAlpha: 0.4,
    feuillage: VERT,
    densite: 1.25,
  },
  // Automne : tout bascule dans le chaud, ciel compris. Changer seulement
  // la couleur des feuilles ne suffit pas — c'est la lumière de la saison
  // qui change, donc le ciel et le sol avec.
  {
    cielHaut: VIOLET,
    cielHautAlpha: 0.36,
    cielBas: OCRE,
    cielBasAlpha: 0.18,
    coteau: PIERRE_CHAUDE,
    sol: OCRE,
    solAlpha: 0.34,
    feuillage: OCRE,
    densite: 1.1,
  },
  // Hiver : le sol reste du PAPIER NU. C'est la seule façon de peindre de
  // la neige en `multiply`, où rien ne peut éclaircir — on ne la peint pas,
  // on la réserve. Le panneau le plus clair des quatre finit ainsi juste à
  // côté du plus sombre, l'été : c'est cet écart qui fait le tableau.
  {
    cielHaut: VIOLET_PROFOND,
    cielHautAlpha: 0.44,
    cielBas: VIOLET_BRUME,
    cielBasAlpha: 0.16,
    coteau: VIOLET_BRUME,
    sol: VIOLET_BRUME,
    solAlpha: 0.05,
    feuillage: null,
    densite: 1,
  },
]

/**
 * Les quatre saisons, en polyptyque.
 *
 * Quatre panneaux séparés par une réserve de papier, et le MÊME arbre dans
 * chacun. C'est le seul tableau de la série qui ne représente pas un lieu
 * mais une durée, et il fallait pour ça une forme différente : une image
 * unique aurait montré une saison, ou un compromis mou entre les quatre.
 *
 * Le gouttière entre les panneaux n'est pas peinte. Une séparation tracée
 * au trait ferait une grille de tableur ; le papier nu, lui, se lit comme
 * la marge d'un livre d'images.
 */
export const saisonsScene: PaintScene = (ctx, w, h, rng) => {
  const gouttiere = w * 0.014
  const horizon = h * 0.6

  for (let i = 0; i < 4; i += 1) {
    const s = SAISONS[i]
    const x0 = (i * w) / 4 + gouttiere / 2
    const x1 = ((i + 1) * w) / 4 - gouttiere / 2
    const cx = (x0 + x1) / 2

    gradedWash(ctx, x0, 0, x1, horizon + h * 0.01, [
      { at: 0, color: s.cielHaut, alpha: s.cielHautAlpha },
      { at: 0.62, color: s.cielHaut, alpha: s.cielHautAlpha * 0.42 },
      { at: 1, color: s.cielBas, alpha: s.cielBasAlpha },
    ])

    // Un vignetage par panneau, tous centrés au même endroit : les
    // quatre ciels reçoivent alors la même lumière, ce qui aide à les
    // lire comme le même lieu à quatre moments.
    vignette(ctx, x0, 0, x1, horizon + h * 0.01, {
      cx: cx - (x1 - x0) * 0.2,
      cy: horizon * 0.82,
      color: VIOLET_PROFOND,
      alpha: 0.24,
      creux: 0.2,
    })

    collines(ctx, x0, x1, horizon - h * 0.05, horizon + h * 0.04, rng, {
      green: s.coteau,
      shade: VIOLET_PROFOND,
      distance: 0.55,
      bosses: 2,
    })

    gradedWash(ctx, x0, horizon, x1, h * 1.02, [
      { at: 0, color: s.sol, alpha: s.solAlpha * 0.5 },
      { at: 1, color: s.sol, alpha: s.solAlpha },
    ])

    // L'ombre portée de l'arbre : elle tombe du côté opposé à la lumière,
    // la même pour les quatre. C'est un des rares indices qui disent que
    // les quatre panneaux sont le même endroit.
    dryStroke(ctx, [
      [cx + w * 0.012, h * 0.9],
      [cx + w * 0.05, h * 0.93],
    ], h * 0.02, rng, { color: VIOLET_PROFOND, alpha: 0.16, layers: 1, jitter: 0.2 })

    arbre(ctx, cx, h * 0.9, h * 0.56, rng, LUMIERE, {
      canopy: s.feuillage ?? VERT,
      wood: VIOLET_PROFOND,
      shade: OMBRE_FEUILLAGE,
      weight: s.densite,
      bare: s.feuillage === null,
    })

    // L'automne perd ses feuilles : quelques touches qui tombent en
    // diagonale. Le seul mouvement de tout le tableau, et il suffit à
    // orienter la lecture de gauche à droite.
    if (i === 2) {
      for (let k = 0; k < 5; k += 1) {
        const fx = cx + (rng() - 0.5) * (x1 - x0) * 0.7
        const fy = h * (0.62 + rng() * 0.26)
        dryStroke(ctx, [
          [fx, fy],
          [fx + w * 0.012, fy + h * 0.02],
        ], h * 0.012, rng, { color: OCRE, alpha: 0.5, layers: 1, jitter: 0.2 })
      }
    }
  }
}
