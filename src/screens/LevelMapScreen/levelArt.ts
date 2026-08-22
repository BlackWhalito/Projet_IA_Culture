import type { PaintScene } from '../../components/watercolor/WatercolorScene'
import { dryStroke, highlight, polygon, wash } from '../../components/watercolor/engine'
import { cloud, gradedWash } from '../../components/watercolor/atmosphere'
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

const OCRE = '#c1663f'
const SABLE = '#d9a35f'
const BRAISE = '#8a3220'
const VIOLET_BRUME = '#c3b0d4'
const VIOLET_PROFOND = '#5d4574'
const VIOLET_NUIT = '#3d2f52'
const ENCRE_SOMBRE = '#241d2b'
const PIERRE_CHAUDE = '#d8bd96'
const PRESQUE_BLANC = '#f3e6cf'

/**
 * La lumière de la scène : le feu lui-même. Placé à gauche de la
 * silhouette et du rocher — les deux sont donc éclairés de leur côté
 * gauche, exactement comme s'ils recevaient vraiment sa lueur.
 */
const LUEUR: LightPlan = {
  angleDeg: 180,
  warm: SABLE,
  cool: VIOLET_NUIT,
  accent: ENCRE_SOMBRE,
}

/**
 * Le foyer : un lit de braises, trois flammes en deux tons (braise sombre
 * puis ocre par-dessus) et un cœur presque blanc — le seul endroit clair de
 * tout le tableau. Ni encoche ni halo à contenir dans une géométrie de
 * grotte : les essais précédents de ce fichier avaient une bouche de
 * grotte sculptée dans le rocher, dont l'entretien (borner le halo du feu
 * exactement sur l'ouverture, sans jamais déborder sur des tirages
 * aléatoires différents) a coûté plusieurs itérations pour un résultat que
 * le propriétaire a jugé peu harmonieux — un rocher qui referme la scène
 * en silhouette, sans essayer de creuser une vraie caverne, s'est révélé
 * à la fois plus simple et plus joli.
 */
function foyer(ctx: CanvasRenderingContext2D, cx: number, cyBase: number, rayon: number, rng: () => number): void {
  // La lueur ambiante au sol, tout autour du foyer : sans elle, le feu
  // n'est qu'une petite forme isolée sur un fond nu, sans rien qui dise
  // « il éclaire ce qui l'entoure ».
  wash(ctx, polygon(cx, cyBase - rayon * 0.3, rayon * 1.6, rayon * 1.1, 10, 0, rng), rng, {
    color: OCRE,
    layers: 18,
    alpha: 0.22 / 18,
    spread: 0.2,
    jitter: 0.16,
  })

  // Le lit de braises, tassé au sol — pas un cercle, une masse basse.
  wash(ctx, polygon(cx, cyBase - rayon * 0.1, rayon * 0.9, rayon * 0.4, 9, 0, rng), rng, {
    color: BRAISE,
    layers: 16,
    alpha: 0.5 / 16,
    spread: 0.16,
    jitter: 0.14,
  })

  for (const [dx, flameH, flameW] of [
    [-rayon * 0.26, rayon * 1.4, rayon * 0.36],
    [rayon * 0.02, rayon * 1.8, rayon * 0.42],
    [rayon * 0.32, rayon * 1.2, rayon * 0.3],
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
      { color: BRAISE, alpha: 0.62, layers: 3, jitter: 0.09 },
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
      { color: OCRE, alpha: 0.55, layers: 2, jitter: 0.08 },
    )
  }

  // Le cœur du feu : un blanc réservé net, à la base des flammes — le seul
  // vrai clair de la scène, celui qui rend tout le reste sombre par
  // contraste. `highlight()` plutôt qu'un `wash()` de plus : c'est la
  // fonction faite pour un clair franc, pas pour un corps de couleur.
  highlight(ctx, polygon(cx, cyBase - rayon * 0.12, rayon * 0.22, rayon * 0.26, 7, 0, rng), rng, {
    color: PRESQUE_BLANC,
    alpha: 0.05,
  })
}

/**
 * « La veille du feu » — le temps fort du Niveau 1 (la Préhistoire, tenir
 * un feu) : un rocher en silhouette contre un ciel nocturne, un feu à son
 * pied, une silhouette qui le veille. Choisi pour rester lisible à très
 * petite taille : une masse sombre percée d'un point chaud survit à la
 * réduction là où un détail fin ne survivrait pas.
 */
function veilleDuFeuScene(ctx: CanvasRenderingContext2D, w: number, h: number, rng: () => number): void {
  const horizon = h * 0.56

  // Le ciel nocturne : un vrai dégradé continu (même construction que les
  // deux tableaux de l'accueil, `HomeScreen/scenes.ts`) — violet profond en
  // haut, qui se réchauffe vers l'horizon comme si la lueur du feu portait
  // jusque-là.
  gradedWash(ctx, -w * 0.05, -h * 0.05, w * 1.05, horizon, [
    { at: 0, color: VIOLET_NUIT, alpha: 0.62 },
    { at: 0.5, color: VIOLET_NUIT, alpha: 0.46 },
    { at: 0.82, color: SABLE, alpha: 0.2 },
    { at: 1, color: SABLE, alpha: 0.12 },
  ])

  // La lune : un halo doux et irrégulier (le voile de brume autour), puis
  // un disque beaucoup plus net et rond par-dessus — même principe que le
  // cœur du feu plus bas, un clair franc plutôt qu'un dégradé mou. Les deux
  // dans la même teinte quasi blanche (une seule source de lumière dans le
  // ciel, pas deux tons qui se contredisent) : le halo en `VIOLET_BRUME`
  // d'un premier essai restait un voile grisâtre sans lien visible avec le
  // disque blanc posé dessus, deux objets plutôt qu'une lune et sa brume.
  wash(ctx, polygon(w * 0.2, h * 0.19, w * 0.12, w * 0.12, 10, 0, rng), rng, {
    color: PRESQUE_BLANC,
    layers: 16,
    alpha: 0.13 / 16,
    spread: 0.22,
    jitter: 0.16,
  })
  // Le disque : spread/jitter nettement réduits par rapport au halo — une
  // lune reste un cercle propre, pas une tache floue comme le halo qui
  // l'entoure.
  wash(ctx, polygon(w * 0.2, h * 0.19, w * 0.038, w * 0.038, 12, 0, rng), rng, {
    color: PRESQUE_BLANC,
    layers: 14,
    alpha: 0.32 / 14,
    spread: 0.04,
    jitter: 0.04,
  })

  // Un nuage nocturne fin, teinté violet plutôt que blanc — la même
  // fonction que les tableaux de l'accueil, mais accordée à la nuit :
  // sombre sur le ciel sombre, jamais la masse claire et gonflée d'un
  // nuage de plein jour.
  cloud(ctx, w * 0.6, h * 0.16, w * 0.62, h * 0.032, rng, LUEUR, {
    light: VIOLET_PROFOND,
    shade: VIOLET_NUIT,
    alpha: 0.14,
    highlight: VIOLET_BRUME,
  })

  // Deux étoiles, à peine posées.
  wash(ctx, polygon(w * 0.42, h * 0.1, w * 0.005, w * 0.005, 6, 0, rng), rng, {
    color: PRESQUE_BLANC,
    layers: 6,
    alpha: 0.28 / 6,
    spread: 0.1,
    jitter: 0.15,
  })
  wash(ctx, polygon(w * 0.92, h * 0.28, w * 0.005, w * 0.005, 6, 0, rng), rng, {
    color: PRESQUE_BLANC,
    layers: 6,
    alpha: 0.24 / 6,
    spread: 0.1,
    jitter: 0.15,
  })

  const cyBase = h * 1.02

  // Le sol, dans l'ombre de la nuit : un dégradé continu qui fonce en
  // descendant, du même principe que l'eau des tableaux de l'accueil.
  // Indispensable AVANT le rocher : `rocher()` n'assombrit jamais assez à
  // lui seul sur du papier nu (sa densité de pigment cumulée reste loin de
  // l'opacité de sa couleur nominale, voir `peinture-generative.md`) — dans
  // la lagune de l'accueil, il ne paraît sombre que parce qu'il est peint
  // sur une eau déjà profonde, jamais sur du papier vierge. Sans ce sol,
  // l'espace entre l'horizon et le rocher restait du papier presque nu, une
  // bande claire qui traversait tout le tableau — lue comme un chemin,
  // pas comme un terrain dans la nuit.
  gradedWash(ctx, -w * 0.05, horizon - h * 0.02, w * 1.05, h * 1.06, [
    { at: 0, color: SABLE, alpha: 0.16 },
    { at: 0.18, color: VIOLET_NUIT, alpha: 0.55 },
    { at: 1, color: ENCRE_SOMBRE, alpha: 0.72 },
  ])

  const foyerX = w * 0.32
  const foyerRayon = h * 0.16
  foyer(ctx, foyerX, cyBase, foyerRayon, rng)

  const figureX = foyerX + foyerRayon * 1.9

  // Le rocher : à l'échelle d'un vrai rocher contre lequel on s'adosse,
  // pas d'une falaise qui occupe la moitié du tableau — un premier essai,
  // bien plus grand, ne se laissait lire ni comme un rocher ni comme une
  // montagne, sans rôle clair dans la scène. Posé juste derrière et contre
  // la silhouette (son bord gauche touche presque `figureX`) : c'est ce
  // contact, pas sa seule présence dans le cadre, qui dit « elle est
  // assise contre lui », le rocher qui abrite le feu du vent plutôt qu'un
  // paysage sans rapport avec la scène.
  const rockWidth = w * 0.3
  rocher(ctx, figureX + rockWidth * 0.42, cyBase, rockWidth, h * 0.34, rng, LUEUR, {
    stone: VIOLET_PROFOND,
    shade: ENCRE_SOMBRE,
    accent: ENCRE_SOMBRE,
  })

  // La silhouette, assise entre le feu et le rocher, tout contre les deux
  // — assez près pour appartenir clairement à cette scène plutôt qu'à un
  // décor qui l'entoure sans lien. `childWatchingSea` réutilisée telle
  // quelle : sa posture (genoux repliés, vue de dos) dit déjà « quelqu'un
  // qui regarde », peu importe ce qui est regardé.
  //
  // Éclairée par le feu (peau et vêtement chauds), pas une silhouette tout
  // en noir : à cette échelle, une figure entièrement sombre sur un rocher
  // tout aussi sombre disparaît — seule une tête isolée s'y devinait. Le
  // rocher, lui, reste dans sa propre famille violette (`VIOLET_PROFOND`/
  // `ENCRE_SOMBRE`) : c'est l'écart de teinte ET de valeur entre les deux
  // qui les sépare, pas un simple contour.
  childWatchingSea(ctx, figureX, cyBase, h * 0.22, rng, LUEUR, {
    skin: PIERRE_CHAUDE,
    hair: ENCRE_SOMBRE,
    clothes: OCRE,
    accent: ENCRE_SOMBRE,
  })
}
