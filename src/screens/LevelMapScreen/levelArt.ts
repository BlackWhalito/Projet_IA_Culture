import type { PaintScene } from '../../components/watercolor/WatercolorScene'
import { dryStroke, highlight, polygon, wash } from '../../components/watercolor/engine'
import type { Point } from '../../components/watercolor/engine'
import { cloud, gradedWash, moon } from '../../components/watercolor/atmosphere'
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
 * tout le tableau. `flameCap` borne la hauteur des flammes (voir l'appelant,
 * `veilleDuFeuScene`) : ce feu brûle à l'entrée d'une grotte peinte par
 * `boucheDeGrotte()`, ses flammes ne doivent jamais dépasser la profondeur
 * de l'arche au-dessus de lui.
 */
function foyer(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cyBase: number,
  rayon: number,
  flameCap: number,
  rng: () => number,
): void {
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

  // Les hauteurs de flamme sont plafonnées par `flameCap`, pas par une
  // proportion fixe de `rayon` : quand le feu brûle à l'entrée d'une
  // grotte, ses flammes ne doivent jamais dépasser la profondeur de
  // l'arche au-dessus de lui, sous peine de paraître traverser la roche.
  for (const [dx, flameH, flameW] of [
    [-rayon * 0.26, flameCap * 0.78, rayon * 0.36],
    [rayon * 0.02, flameCap, rayon * 0.42],
    [rayon * 0.32, flameCap * 0.67, rayon * 0.3],
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
 * La bouche de la grotte : une arche sombre peinte SUR la face du rocher,
 * jamais une encoche creusée dans son propre contour comme les tentatives
 * précédentes de ce fichier. Cette différence est ce qui a réglé leurs
 * bugs : une encoche dans le contour dépend de la silhouette aléatoire de
 * `rocher()` (ses pics tombent parfois plus bas que prévu, débordement déjà
 * vu deux fois) ; une arche peinte par-dessus, une fois la face du rocher
 * posée, n'a besoin que de rester nettement à l'intérieur de sa masse —
 * bien plus facile à garantir qu'un alignement pixel près sur un tirage
 * aléatoire.
 *
 * Deux passes donnent la profondeur demandée (« qu'on voie bien le fond ») :
 * un fond presque noir sur toute l'arche, puis un second passage plus petit
 * et plus sombre encore tout au fond (en haut de l'arche) — l'ouverture
 * reste la plus claire, la profondeur la plus sombre, comme un regard qui
 * porte de moins en moins loin dans le noir.
 */
function boucheDeGrotte(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cyBase: number,
  width: number,
  height: number,
  rng: () => number,
): void {
  const halfW = width / 2
  const naissance = cyBase - height * 0.22
  const gorge = cyBase - height

  const arche: Point[] = [
    [cx - halfW, cyBase],
    [cx - halfW, naissance],
    [cx - halfW * 0.5, gorge + height * 0.08],
    [cx, gorge],
    [cx + halfW * 0.5, gorge + height * 0.08],
    [cx + halfW, naissance],
    [cx + halfW, cyBase],
  ]

  wash(ctx, arche, rng, {
    color: ENCRE_SOMBRE,
    layers: 30,
    alpha: 0.78 / 30,
    spread: 0.06,
    jitter: 0.05,
  })
  // Le fond de la grotte : une masse plus petite, tout en haut de l'arche,
  // encore plus sombre — c'est ce dégradé de profondeur, clair à l'entrée
  // et noir au fond, qui donne à l'ouverture un vrai intérieur plutôt
  // qu'un aplat uniforme.
  wash(
    ctx,
    polygon(cx, gorge + height * 0.18, halfW * 0.55, height * 0.22, 8, 0, rng),
    rng,
    { color: ENCRE_SOMBRE, layers: 20, alpha: 0.5 / 20, spread: 0.1, jitter: 0.08 },
  )
}

/**
 * « La veille du feu » — le temps fort du Niveau 1 (la Préhistoire, tenir
 * un feu) : un rocher en silhouette contre un ciel nocturne, une grotte à
 * son pied où brûle un feu, une silhouette qui le veille. Choisi pour
 * rester lisible à très petite taille : une masse sombre percée d'un point
 * chaud survit à la réduction là où un détail fin ne survivrait pas.
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

  // La lune : `moon()` (`components/watercolor/atmosphere.ts`), un dégradé
  // radial natif plutôt que la technique `wash()` du reste du moteur — un
  // disque et son halo veulent un bord lisse, jamais le bruit fractal pensé
  // pour un contour de pigment organique (rocher, nuage, feu). Deux essais
  // en `wash()` avaient donné soit un halo et un disque de deux teintes qui
  // ne se répondaient pas, soit un disque toujours un peu bancal.
  moon(ctx, w * 0.2, h * 0.19, w * 0.05, PRESQUE_BLANC)

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

  // Le rocher : assez large pour porter une vraie grotte sur sa face, sans
  // pour autant occuper le tableau entier — le compromis trouvé après deux
  // essais ratés (une falaise qui occupait la moitié du cadre sans rôle
  // clair ; un rocher réduit à l'échelle d'un dossier, trop petit pour
  // qu'une grotte s'y lise).
  const rockCx = w * 0.5
  const rockWidth = w * 0.46
  const rockHeight = h * 0.48
  rocher(ctx, rockCx, cyBase, rockWidth, rockHeight, rng, LUEUR, {
    stone: VIOLET_PROFOND,
    shade: ENCRE_SOMBRE,
    accent: ENCRE_SOMBRE,
  })

  // La bouche de la grotte : centrée sur le rocher, et nettement plus
  // petite que lui dans les deux dimensions (voir `boucheDeGrotte()`) —
  // c'est cette marge qui garantit qu'elle reste À L'INTÉRIEUR de la
  // silhouette du rocher quel que soit son tirage aléatoire, jamais collée
  // à son sommet ou à ses bords comme les tentatives précédentes.
  const archWidth = rockWidth * 0.34
  const archHeight = rockHeight * 0.34
  boucheDeGrotte(ctx, rockCx, cyBase, archWidth, archHeight, rng)

  // Le feu, à l'entrée même de la grotte : c'est lui, avec la silhouette,
  // qui fait reconnaître la scène comme un feu tenu dans un abri plutôt
  // qu'un rocher quelconque et un feu de camp sans lien entre eux.
  // Plafond de flamme : nettement sous `archHeight`, jamais égal à elle —
  // la flamme la plus haute doit rester visiblement à l'intérieur de
  // l'arche, pas juste effleurer son fond.
  const foyerRayon = h * 0.13
  foyer(ctx, rockCx, cyBase, foyerRayon, archHeight * 0.72, rng)

  // La silhouette, assise juste à côté du feu, à l'entrée de la grotte —
  // assez près pour appartenir clairement à cette scène. `childWatchingSea`
  // réutilisée telle quelle : sa posture (genoux repliés, vue de dos) dit
  // déjà « quelqu'un qui regarde », peu importe ce qui est regardé.
  //
  // Éclairée par le feu (peau et vêtement chauds), pas une silhouette tout
  // en noir : à cette échelle, une figure entièrement sombre sur un rocher
  // tout aussi sombre disparaît — seule une tête isolée s'y devinait. Le
  // rocher, lui, reste dans sa propre famille violette (`VIOLET_PROFOND`/
  // `ENCRE_SOMBRE`) : c'est l'écart de teinte ET de valeur entre les deux
  // qui les sépare, pas un simple contour.
  childWatchingSea(ctx, rockCx + foyerRayon * 2, cyBase, h * 0.22, rng, LUEUR, {
    skin: PIERRE_CHAUDE,
    hair: ENCRE_SOMBRE,
    clothes: OCRE,
    accent: ENCRE_SOMBRE,
  })
}
