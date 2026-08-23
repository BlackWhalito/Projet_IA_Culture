import type { PaintScene } from '../../components/watercolor/WatercolorScene'
import { dryStroke, highlight, polygon, stroke, wash } from '../../components/watercolor/engine'
import type { Point } from '../../components/watercolor/engine'
import { glint, gradedWash, houle, moon, ripples, waterGlow } from '../../components/watercolor/atmosphere'
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
const BRAISE = '#8a3220'
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
  // Agrandie par rapport au premier essai (34×15 → 50×23) : le propriétaire
  // l'a jugée trop petite pour qu'une entrée s'y lise. Reste nettement plus
  // petite que le rocher du premier plan (voir son appelant) — c'est cet
  // écart, pas la taille absolue, qui doit dire « loin ».
  const rockWidth = 50
  const rockHeight = 23
  const top = rocher(ctx, cx, cyBase, rockWidth, rockHeight, rng, LUEUR, {
    stone: VIOLET_PROFOND,
    shade: ENCRE_SOMBRE,
    accent: ENCRE_SOMBRE,
  })

  // L'entrée elle-même, agrandie dans les mêmes proportions (0.3 → 0.4 de
  // la largeur du rocher) pour rester une vraie ouverture visible, pas
  // seulement un point sombre.
  const archWidth = rockWidth * 0.4
  const archHeight = rockHeight * 0.88
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
 * Le feu du premier plan, à côté de la silhouette : celui qui porte
 * vraiment la Préhistoire dans le tableau (la grotte au loin ne fait que
 * la situer). Un lit de braises, trois flammes en deux tons — braise
 * sombre en corps, ocre par-dessus pour la langue intérieure — et un
 * cœur presque blanc, le seul vrai clair de toute la scène.
 */
function foyer(ctx: CanvasRenderingContext2D, cx: number, cyBase: number, rayon: number, rng: () => number): void {
  // La lueur ambiante au sol, tout autour du foyer : sans elle, le feu
  // n'est qu'une petite forme isolée, sans rien qui dise « il éclaire ce
  // qui l'entoure ».
  wash(ctx, polygon(cx, cyBase - rayon * 0.3, rayon * 1.7, rayon * 1.15, 10, 0, rng), rng, {
    color: OCRE,
    layers: 18,
    alpha: 0.24 / 18,
    spread: 0.2,
    jitter: 0.16,
  })

  // Le lit de braises, tassé au sol — pas un cercle, une masse basse.
  wash(ctx, polygon(cx, cyBase - rayon * 0.1, rayon * 0.9, rayon * 0.42, 9, 0, rng), rng, {
    color: BRAISE,
    layers: 16,
    alpha: 0.5 / 16,
    spread: 0.16,
    jitter: 0.14,
  })

  for (const [dx, flameH, flameW] of [
    [-rayon * 0.28, rayon * 1.5, rayon * 0.4],
    [rayon * 0.02, rayon * 1.95, rayon * 0.46],
    [rayon * 0.34, rayon * 1.3, rayon * 0.34],
  ] as const) {
    const baseX = cx + dx
    dryStroke(
      ctx,
      [
        [baseX - flameW / 2, cyBase],
        [baseX + (rng() - 0.5) * flameW * 0.6, cyBase - flameH * 0.55],
        [baseX, cyBase - flameH],
        [baseX + flameW / 2, cyBase],
      ],
      flameW,
      rng,
      { color: BRAISE, alpha: 0.64, layers: 3, jitter: 0.09 },
    )
    // La langue intérieure, plus haute en ton et plus courte : c'est ce
    // second passage, pas la teinte de fond, qui fait « flamme » plutôt
    // qu'une simple tache triangulaire sombre.
    dryStroke(
      ctx,
      [
        [baseX - flameW * 0.22, cyBase],
        [baseX, cyBase - flameH * 0.68],
        [baseX + flameW * 0.22, cyBase],
      ],
      flameW * 0.5,
      rng,
      { color: OCRE, alpha: 0.58, layers: 2, jitter: 0.08 },
    )
  }

  // Le cœur du feu : un blanc réservé net, à la base des flammes — le seul
  // vrai clair de la scène, celui qui rend tout le reste sombre par
  // contraste.
  highlight(ctx, polygon(cx, cyBase - rayon * 0.14, rayon * 0.24, rayon * 0.28, 7, 0, rng), rng, {
    color: PRESQUE_BLANC,
    alpha: 0.055,
  })
}

/**
 * « La veille du feu » — le temps fort du Niveau 1 (la Préhistoire, tenir
 * un feu). Nocturne au bord de l'eau, sur le modèle des deux tableaux de
 * l'accueil (`HomeScreen/scenes.ts`) : une silhouette au premier plan, un
 * feu à ses côtés, qui regarde vers une grotte lointaine de l'autre côté
 * d'une étendue d'eau calme. Le feu porte la Préhistoire au premier plan,
 * bien présent ; la grotte au loin la situe sans jamais rivaliser avec lui.
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

  // La lune : bien plus grande et plus haute que le premier essai (rayon
  // ×3), qui la rendait presque invisible à la taille d'affichage réelle
  // de la vignette. Placée à l'écart du rocher du premier plan ET de la
  // grotte lointaine (ni l'un ni l'autre ne doit la recouvrir), pour
  // qu'elle s'impose vraiment dans le ciel plutôt que de s'y perdre.
  moon(ctx, w * 0.58, h * 0.15, w * 0.08, PRESQUE_BLANC)

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

  // Le reflet de sa lueur : une auréole posée sur l'eau (`waterGlow()`),
  // pas les traits verticaux nets de `reflection()` — ceux-là conviennent
  // à un objet dressé (mât, tour), mais une lumière lointaine se reflète
  // en une nappe large et basse, jamais en un fil qui descend tout seul.
  // Deux passes (large et pâle, puis petite et plus chaude au centre) pour
  // le même dégradé de température qu'un vrai reflet de lumière : le plus
  // chaud tout contre la source, qui se refroidit en s'élargissant.
  waterGlow(ctx, w * 0.36, horizon + h * 0.08, w * 0.11, h * 0.045, OCRE)
  waterGlow(ctx, w * 0.36, horizon + h * 0.08, w * 0.045, h * 0.02, SABLE)

  // Le chemin de lumière, tiré vers le premier plan à partir de cette
  // auréole : des touches de plus en plus petites, pâles et écartées à
  // mesure qu'elles s'éloignent de la source — jamais une ligne continue,
  // c'est cette dégradation qui fait « loin » plutôt qu'un fil collé.
  glint(ctx, w * 0.365, h * 0.5, w * 0.05, h * 0.01, rng, 0.32, SABLE)
  glint(ctx, w * 0.35, h * 0.62, w * 0.07, h * 0.012, rng, 0.24, SABLE)
  glint(ctx, w * 0.33, h * 0.76, w * 0.09, h * 0.014, rng, 0.16, SABLE)

  // Les rides, en perspective : serrées et fines près de l'horizon, plus
  // rares et plus marquées au premier plan.
  ripples(ctx, 0, w, horizon + h * 0.04, h * 1.0, 26, rng, {
    color: BLEU,
    accent: VIOLET_PROFOND,
  })
  stroke(ctx, houle(h * 0.58, 2.5, w * 0.8, rng), 1.6, rng, { color: VIOLET_BRUME, alpha: 0.05, layers: 8 })

  // Le rocher du premier plan : même principe que le rocher de la lagune
  // de l'accueil (`rocher()`, déjà jugé beau en production), une masse
  // nettement plus grande et plus sombre que la grotte lointaine — c'est
  // cet écart d'échelle et de contraste, pas seulement leur position, qui
  // sépare le tout près du tout loin.
  const rockCx = w * 0.86
  const rockWidth = w * 0.32
  rocher(ctx, rockCx, h * 1.02, rockWidth, h * 0.3, rng, LUEUR, {
    stone: VIOLET_PROFOND,
    shade: ENCRE_SOMBRE,
    accent: ENCRE_SOMBRE,
  })

  // Le feu, au sol devant le rocher plutôt que dans le lointain : c'est
  // lui qui porte vraiment la Préhistoire au premier plan, bien présent —
  // la lueur de la grotte au loin restait trop discrète pour incarner
  // « tenir un feu » à elle seule.
  const foyerX = rockCx - rockWidth * 0.62
  const cyBase = h * 1.02
  foyer(ctx, foyerX, cyBase, h * 0.16, rng)

  // La silhouette, assise au sol tout contre le feu, le rocher juste
  // derrière elle — au sol plutôt que perchée en haut du rocher : sa tête
  // et celle du feu doivent rester à la même hauteur pour se lire comme
  // « assise à côté », pas comme deux éléments à des étages différents.
  // `childWatchingSea` telle quelle : sa posture (genoux repliés, vue de
  // dos) porte à elle seule « quelqu'un qui regarde au loin ». Peau et
  // vêtement chauds pour se détacher nettement du rocher, comme sur la
  // lagune. Échelle relevée (0.2h → 0.24h) : à la taille d'affichage
  // réelle de la vignette, elle se perdait complètement contre la masse
  // du rocher.
  childWatchingSea(ctx, foyerX + h * 0.19, cyBase, h * 0.24, rng, LUEUR, {
    skin: PIERRE_CHAUDE,
    hair: ENCRE_SOMBRE,
    clothes: OCRE,
    accent: ENCRE_SOMBRE,
  })
}
