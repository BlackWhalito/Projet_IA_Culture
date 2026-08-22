import type { PaintScene } from '../../components/watercolor/WatercolorScene'
import { polygon, stroke, wash } from '../../components/watercolor/engine'
import type { Point } from '../../components/watercolor/engine'
import { glint, gradedWash, houle, moon, reflection, ripples } from '../../components/watercolor/atmosphere'
import { childWatchingSea } from '../../components/watercolor/figure'
import { rocher } from '../../components/watercolor/terrain'
import type { LightPlan } from '../../components/watercolor/light'

/**
 * Tableaux peints par niveau de jeu (pas par niveau scolaire — voir
 * `gradeArt.tsx` pour ça). Purement décoratif, donc hors de `src/content/` :
 * un `LevelDef` ne porte aucun champ visuel, ce registre associe l'id du
 * niveau à sa scène.
 *
 * Un seul tableau existe pour l'instant (Niveau 1), en modèle avant d'en
 * peindre sept autres.
 */
export const LEVEL_ART: Record<string, PaintScene> = {
  'cp-level-1': veilleDuFeuScene,
}

// Palette resserrée façon nocturne : la famille bleu-violet domine presque
// seule, un unique accent chaud (la lueur de la grotte, sa main sur l'eau,
// le feu qu'elle veille) et un blanc cassé réservé à la lune et aux
// étoiles. C'est cette économie de couleurs — pas une palette plus riche —
// qui fait la parenté avec les nocturnes de Whistler : une atmosphère avant
// un sujet, un seul point chaud dans un champ presque monochrome.
const BLEU = '#5a7fa0'
const VIOLET_BRUME = '#c3b0d4'
const VIOLET_PROFOND = '#5d4574'
const VIOLET_NUIT = '#3d2f52'
const ENCRE_SOMBRE = '#241d2b'
const OCRE = '#c1663f'
const SABLE = '#d9a35f'
const PIERRE_CHAUDE = '#d8bd96'
const PRESQUE_BLANC = '#f3e6cf'

/**
 * La lumière de la scène : la lueur de la grotte au loin, sur la gauche.
 * La silhouette du premier plan, à droite, est donc éclairée de son côté
 * gauche — celui tourné vers cette lueur et vers l'horizon qu'elle regarde.
 */
const LUEUR: LightPlan = {
  angleDeg: 200,
  warm: SABLE,
  cool: VIOLET_PROFOND,
  accent: ENCRE_SOMBRE,
}

/**
 * La grotte lointaine : un rocher bas, presque à fleur d'eau, une arche
 * sombre creusée dans sa face, et tout au fond une lueur chaude et
 * discrète — jamais un feu franc avec ses flammes : à cette distance dans
 * le tableau, un point de lumière tenu suffit à dire « quelqu'un l'a
 * allumé là-bas », un brasier détaillé se lirait comme posé au premier
 * plan et casserait l'échelle de toute la scène.
 */
function grotteLointaine(ctx: CanvasRenderingContext2D, cx: number, cyBase: number, rng: () => number): Point {
  const rockWidth = 34
  const rockHeight = 15
  const top = rocher(ctx, cx, cyBase, rockWidth, rockHeight, rng, LUEUR, {
    stone: VIOLET_PROFOND,
    shade: ENCRE_SOMBRE,
    accent: ENCRE_SOMBRE,
  })

  const archWidth = rockWidth * 0.3
  const archHeight = rockHeight * 0.85
  const halfW = archWidth / 2
  const naissance = cyBase - archHeight * 0.2
  const gorge = cyBase - archHeight
  wash(
    ctx,
    [
      [cx - halfW, cyBase],
      [cx - halfW, naissance],
      [cx - halfW * 0.5, gorge + archHeight * 0.1],
      [cx, gorge],
      [cx + halfW * 0.5, gorge + archHeight * 0.1],
      [cx + halfW, naissance],
      [cx + halfW, cyBase],
    ],
    rng,
    { color: ENCRE_SOMBRE, layers: 22, alpha: 0.7 / 22, spread: 0.08, jitter: 0.08 },
  )

  // La lueur, tout au fond, tenue : petite, chaude, seule touche de
  // couleur qui ne soit pas bleu-violet dans toute la moitié lointaine du
  // tableau — c'est cet isolement qui la rend visible malgré sa taille.
  // Alpha relevé par rapport au premier essai : à peine visible, elle se
  // lisait comme une ombre plus qu'une lumière — vérifié en zoomant sur le
  // rendu réel, pas seulement au calcul.
  wash(ctx, polygon(cx, cyBase - archHeight * 0.42, halfW * 0.55, archHeight * 0.32, 8, 0, rng), rng, {
    color: OCRE,
    layers: 14,
    alpha: 0.5 / 14,
    spread: 0.12,
    jitter: 0.1,
  })
  wash(ctx, polygon(cx, cyBase - archHeight * 0.4, halfW * 0.28, archHeight * 0.16, 7, 0, rng), rng, {
    color: SABLE,
    layers: 10,
    alpha: 0.4 / 10,
    spread: 0.1,
    jitter: 0.1,
  })

  return top
}

/**
 * « La veille du feu » — le temps fort du Niveau 1 (la Préhistoire, tenir
 * un feu). Retravaillée en nocturne au bord de l'eau, sur le modèle des
 * deux tableaux de l'accueil (`HomeScreen/scenes.ts`) : une silhouette au
 * premier plan qui regarde vers un point de lumière lointain, de l'autre
 * côté d'une étendue d'eau calme. La grotte et sa lueur portent la Préhis-
 * toire ; l'eau et la nuit portent l'atmosphère contemplative du reste du
 * jeu.
 */
function veilleDuFeuScene(ctx: CanvasRenderingContext2D, w: number, h: number, rng: () => number): void {
  const horizon = h * 0.4

  // Le ciel nocturne : un vrai dégradé continu, comme les deux tableaux de
  // l'accueil — profond en haut, qui se vide vers l'horizon où le papier
  // reste presque nu. C'est cette bande claire juste au-dessus de l'eau
  // qui donne la lumière du tableau, la nuit venue.
  gradedWash(ctx, -w * 0.05, -h * 0.05, w * 1.05, horizon, [
    { at: 0, color: VIOLET_NUIT, alpha: 0.68 },
    { at: 0.5, color: VIOLET_PROFOND, alpha: 0.4 },
    { at: 0.82, color: VIOLET_BRUME, alpha: 0.16 },
    { at: 1, color: VIOLET_BRUME, alpha: 0.05 },
  ])

  // La lune, haute et froide, à l'opposé de la grotte — sa lumière reste
  // secondaire, seule la lueur chaude au loin doit accrocher l'œil en
  // premier.
  moon(ctx, w * 0.78, h * 0.14, w * 0.026, PRESQUE_BLANC)

  // Quelques étoiles, à peine posées.
  for (const [fx, fy, a] of [
    [0.12, 0.12, 0.3],
    [0.32, 0.08, 0.24],
    [0.55, 0.16, 0.2],
    [0.92, 0.32, 0.22],
  ] as const) {
    wash(ctx, polygon(w * fx, h * fy, w * 0.005, w * 0.005, 6, 0, rng), rng, {
      color: PRESQUE_BLANC,
      layers: 6,
      alpha: a / 6,
      spread: 0.1,
      jitter: 0.15,
    })
  }

  // L'eau : un seul dégradé continu du pâle (horizon) au profond (premier
  // plan), même technique que la lagune de l'accueil — des masses
  // empilées se liraient toujours comme des bandes, l'œil trouve la
  // frontière quel que soit le recouvrement.
  gradedWash(ctx, -w * 0.05, horizon, w * 1.05, h * 1.02, [
    { at: 0, color: VIOLET_BRUME, alpha: 0.18 },
    { at: 0.3, color: BLEU, alpha: 0.4 },
    { at: 0.62, color: VIOLET_PROFOND, alpha: 0.56 },
    { at: 1, color: VIOLET_NUIT, alpha: 0.74 },
  ])

  // La grotte, loin de l'autre côté de l'eau, posée presque sur la ligne
  // d'horizon — c'est son éloignement, pas sa taille, qui doit se lire.
  grotteLointaine(ctx, w * 0.36, horizon + h * 0.05, rng)

  // Le reflet de sa lueur, tiré vers le premier plan : un fil chaud sur
  // une eau autrement froide, le chemin de lumière classique d'une source
  // qui brille de l'autre côté d'une eau calme.
  reflection(ctx, w * 0.36, w * 0.05, horizon + h * 0.07, h * 0.5, OCRE, rng, 4)
  glint(ctx, w * 0.36, h * 0.62, w * 0.1, h * 0.012, rng, 0.4, SABLE)
  glint(ctx, w * 0.34, h * 0.78, w * 0.14, h * 0.014, rng, 0.3, SABLE)

  // Les rides, en perspective : serrées et fines près de l'horizon, plus
  // rares et plus marquées au premier plan.
  ripples(ctx, 0, w, horizon + h * 0.04, h * 1.0, 26, rng, {
    color: BLEU,
    accent: VIOLET_PROFOND,
  })
  stroke(ctx, houle(h * 0.58, 2.5, w * 0.8, rng), 1.6, rng, { color: VIOLET_BRUME, alpha: 0.05, layers: 8 })

  // Le rocher du premier plan et la silhouette : le même principe que le
  // rocher de la lagune de l'accueil (`rocher()`, déjà jugé beau en
  // production), une masse nettement plus grande et plus sombre que la
  // grotte lointaine — c'est cet écart d'échelle et de contraste, pas
  // seulement leur position, qui sépare le tout près du tout loin.
  const rockTop = rocher(ctx, w * 0.78, h * 1.02, w * 0.42, h * 0.28, rng, LUEUR, {
    stone: VIOLET_PROFOND,
    shade: ENCRE_SOMBRE,
    accent: ENCRE_SOMBRE,
  })

  // La silhouette, assise sur le rocher, tournée vers l'horizon et la
  // lueur lointaine — `childWatchingSea` telle quelle : sa posture (genoux
  // repliés, vue de dos) porte à elle seule « quelqu'un qui regarde au
  // loin », le motif au cœur de la demande. Peau et vêtement chauds pour
  // se détacher nettement du rocher, comme sur la lagune.
  childWatchingSea(ctx, rockTop[0], rockTop[1] + h * 0.01, h * 0.2, rng, LUEUR, {
    skin: PIERRE_CHAUDE,
    hair: ENCRE_SOMBRE,
    clothes: OCRE,
    accent: ENCRE_SOMBRE,
  })
}
