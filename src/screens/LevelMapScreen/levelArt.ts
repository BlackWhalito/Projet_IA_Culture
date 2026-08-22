import type { PaintScene } from '../../components/watercolor/WatercolorScene'
import type { Point } from '../../components/watercolor/engine'
import { dryStroke, highlight, polygon, wash } from '../../components/watercolor/engine'
import { gradedWash } from '../../components/watercolor/atmosphere'
import { childWatchingSea } from '../../components/watercolor/figure'
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
const VIOLET_PROFOND = '#5d4574'
const VIOLET_NUIT = '#3d2f52'
const ENCRE_SOMBRE = '#241d2b'
const PIERRE_CHAUDE = '#d8bd96'
const PRESQUE_BLANC = '#f3e6cf'

/**
 * La lumière de la scène : le feu lui-même, pas un soleil. Placé à gauche
 * du centre — la silhouette assise à sa droite est donc éclairée de son
 * côté gauche, exactement comme si elle regardait vraiment le foyer.
 */
const LUEUR: LightPlan = {
  angleDeg: 180,
  warm: SABLE,
  cool: VIOLET_NUIT,
  accent: ENCRE_SOMBRE,
}

/**
 * Le foyer : un halo chaud resserré, deux langues de flamme en deux tons
 * (braise sombre puis ocre par-dessus) et un cœur presque blanc — le seul
 * endroit clair de tout le tableau. Peint AVANT le rocher : en `multiply`,
 * rien ne peut jamais éclaircir ce qui est peint par-dessus, donc la lueur
 * doit occuper sa place sur le papier avant que le rocher ne vienne se
 * refermer autour d'elle, jamais l'inverse.
 *
 * Premier essai : un halo large et pâle (SABLE/OCRE à faible opacité) qui se
 * lisait comme une tente beige posée devant le rocher plutôt qu'une lueur de
 * feu — un lavis clair et étendu reste toujours un aplat, jamais une
 * source de lumière. Corrigé en resserrant le halo et en réservant le clair
 * vif au tout petit cœur, via `highlight()` plutôt qu'un `wash()` de plus.
 *
 * Second essai, avec la graine réellement utilisée en production
 * (`WatercolorScene` sème sur l'index du niveau, donc 0 pour le Niveau 1) :
 * la hauteur du halo avait été reprise d'un multiple de `rayon` totalement
 * déconnecté de la géométrie réelle de l'encoche (`apex` dans `grotte()`),
 * si bien qu'elle dépassait le sommet du rocher sur les tirages où ses
 * plateaux tombaient bas — la « tente » du premier essai, sous une autre
 * forme. `apex` est maintenant l'unique source de vérité pour la hauteur
 * du halo, la même valeur que celle qui borne l'encoche dans `grotte()`.
 */
function foyer(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cyBase: number,
  boucheRayon: number,
  apex: number,
  rng: () => number,
): void {
  const rayon = boucheRayon * 0.75

  // La lueur ambiante qui remplit l'intérieur de la bouche de grotte,
  // AVANT le lit de braises et les flammes : sans elle, tout ce que ces
  // formes étroites ne couvrent pas reste du papier nu, qui perce alors en
  // blanc cru dans l'ouverture — plus clair que le ciel lui-même. Bornée à
  // `apex` (avec une petite marge), jamais au-delà : le rocher ne peut
  // rassombrir que ce qui tombe dans sa PROPRE silhouette, pas au-dessus.
  const ambientTop = apex - boucheRayon * 0.05
  const ambientRy = (cyBase - ambientTop) / 2
  wash(ctx, polygon(cx, cyBase - ambientRy, boucheRayon * 0.95, ambientRy, 10, 0, rng), rng, {
    color: OCRE,
    layers: 20,
    alpha: 0.4 / 20,
    spread: 0.16,
    jitter: 0.14,
  })

  // Le lit de braises, tassé au sol — pas un cercle, une masse basse.
  wash(ctx, polygon(cx, cyBase - rayon * 0.1, rayon * 0.9, rayon * 0.4, 9, 0, rng), rng, {
    color: BRAISE,
    layers: 16,
    alpha: 0.5 / 16,
    spread: 0.16,
    jitter: 0.14,
  })

  for (const [dx, flameH, flameW, color, alpha] of [
    [-rayon * 0.26, rayon * 1.4, rayon * 0.36, BRAISE, 0.62],
    [rayon * 0.02, rayon * 1.8, rayon * 0.42, BRAISE, 0.65],
    [rayon * 0.32, rayon * 1.2, rayon * 0.3, BRAISE, 0.58],
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
      { color, alpha, layers: 3, jitter: 0.09 },
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
 * Le rocher qui referme la scène autour du foyer : un contour unique et
 * concave, la bouche de la grotte étant une encoche qui remonte depuis le
 * sol jusque dans la masse — même principe qu'une arche (`peinture-
 * generative.md`) : montant, remontée dans le vide, voûte, redescente,
 * montant. Sans cette encoche dans le contour lui-même, aucun calque posé
 * par-dessus la lueur ne pourrait la laisser paraître : `multiply` ne
 * fait jamais qu'assombrir ce qu'il recouvre.
 *
 * Le sommet du rocher suit la règle des contours brisés : des plateaux
 * irréguliers (segment horizontal, chute quasi verticale, nouveau segment),
 * jamais une pente — une pente reprise par le bruit fractal de `wash` se lit
 * comme un pic de montagne, pas une paroi rocheuse.
 *
 * `ENCRE_SOMBRE` en couleur PRINCIPALE, pas `VIOLET_NUIT` : un premier
 * essai en violet nuit restait un gris-lavande moyen même à 32 couches — la
 * densité cumulée d'un `wash` reste loin de l'opacité de sa couleur nominale
 * (mesuré : `VIOLET_NUIT` à 32 couches ne couvre qu'environ 45 % du papier).
 * Une seconde passe en `ENCRE_SOMBRE` par-dessus toute la masse pousse la
 * valeur vers un vrai sombre nocturne, la nuance de `VIOLET_NUIT` ne
 * survivant plus qu'en teinte de l'ombre, pas comme couleur de corps.
 *
 * `naissance`/`gorge`/`apex` sont calculés une seule fois par
 * `boucheGeometrie()` et transmis ici plutôt que recalculés localement :
 * `foyer()` doit borner son halo sur exactement la même valeur d'`apex`,
 * jamais une approximation qui pourrait diverger de quelques pixels.
 */
function grotte(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  cyBase: number,
  boucheX: number,
  boucheRayon: number,
  naissance: number,
  gorge: number,
  apex: number,
  rng: () => number,
): void {
  const x0 = -w * 0.06
  const x1 = w * 1.06

  // Le sommet en plateaux : des paliers plats reliés par des chutes
  // quasi verticales, jamais une pente progressive. Le plancher de tirage
  // (0.38h, pas 0.34h) garde une vraie marge de sécurité au-dessus d'`apex`
  // (0.324h) : à 0.34h la marge n'était que de 0.016h, assez fine pour que
  // le bruit fractal de `wash()` la mange par endroits — mesuré à l'écran
  // avec la graine réelle de production (seed=0), pas seulement au calcul.
  const marches = 4
  const sommet: Point[] = []
  let plateauY = cyBase - h * (0.4 + rng() * 0.1)
  for (let i = 0; i <= marches; i += 1) {
    const t = i / marches
    const xStart = x0 + (x1 - x0) * t
    const xEnd = x0 + (x1 - x0) * Math.min(1, t + 1 / marches / 2)
    sommet.push([xStart, plateauY])
    sommet.push([xEnd, plateauY])
    plateauY = cyBase - h * (0.38 + rng() * 0.12)
  }

  const contour: Point[] = [
    [x0, cyBase],
    ...sommet,
    [x1, cyBase],
    [boucheX + boucheRayon * 1.15, cyBase],
    [boucheX + boucheRayon * 0.95, naissance],
    [boucheX + boucheRayon * 0.5, gorge],
    [boucheX, apex],
    [boucheX - boucheRayon * 0.5, gorge],
    [boucheX - boucheRayon * 0.95, naissance],
    [boucheX - boucheRayon * 1.15, cyBase],
  ]

  wash(ctx, contour, rng, {
    color: ENCRE_SOMBRE,
    layers: 34,
    alpha: 0.7 / 34,
    spread: 0.045,
    jitter: 0.055,
  })
  // Seconde passe, sur la même silhouette entière : c'est elle qui pousse
  // la masse au-delà du gris-moyen d'une unique passe (voir la note plus
  // haut sur la densité cumulée réelle de `wash`).
  wash(ctx, contour, rng, {
    color: ENCRE_SOMBRE,
    layers: 20,
    alpha: 0.45 / 20,
    spread: 0.05,
    jitter: 0.06,
  })
  // Une ombre plus profonde sur le tiers droit de la masse, en violet
  // plutôt qu'en noir : sans elle, le rocher reste un aplat uniforme
  // malgré sa silhouette juste, et c'est cette teinte qui doit rester
  // perceptible en violet nocturne, pas la couleur de corps.
  wash(
    ctx,
    [
      [x0 + (x1 - x0) * 0.6, cyBase],
      ...sommet.filter(([px]) => px >= x0 + (x1 - x0) * 0.55),
      [x1, cyBase],
    ],
    rng,
    { color: VIOLET_NUIT, layers: 14, alpha: 0.22 / 14, spread: 0.05, jitter: 0.06 },
  )

  // La lèvre de la grotte, tout contre la lueur : un trait chaud et net,
  // seule arête qui capte vraiment le feu plutôt que la nuit.
  dryStroke(
    ctx,
    [
      [boucheX - boucheRayon * 1.05, cyBase],
      [boucheX - boucheRayon * 0.5, naissance],
      [boucheX, gorge],
      [boucheX + boucheRayon * 0.5, naissance],
      [boucheX + boucheRayon * 1.05, cyBase],
    ],
    boucheRayon * 0.1,
    rng,
    { color: SABLE, alpha: 0.45, layers: 2, jitter: 0.05 },
  )
}

/**
 * « La veille du feu » — le temps fort du Niveau 1 (la Préhistoire, tenir
 * un feu). Une bouche de grotte dans la nuit, un feu, une silhouette
 * accroupie qui le veille. Choisi pour rester lisible à très petite taille :
 * une masse sombre percée d'un point chaud survit à la réduction là où un
 * détail fin ne survivrait pas.
 *
 * Le ciel passe par `gradedWash` (dégradé natif), pas par un `wash` posé sur
 * un grand rectangle : deux `wash` fractals voisins (le ciel, le rocher)
 * s'érodent chacun sur leurs bords de façon indépendante et laissaient, à la
 * jointure, un ruban de papier presque nu — un dégradé natif n'a pas de bord
 * à éroder, et couvre tout le rectangle sans trou, quelle que soit la
 * silhouette du rocher peinte par-dessus ensuite.
 */
function veilleDuFeuScene(ctx: CanvasRenderingContext2D, w: number, h: number, rng: () => number): void {
  const horizon = h * 0.68

  // Le ciel nocturne : dégradé sombre, jamais un noir pur — violet profond
  // en haut, qui se réchauffe à peine près de l'horizon, comme si la lueur
  // du feu portait jusque-là. Descend volontairement bas (0.68h, bien
  // au-delà du point le plus bas que peuvent atteindre les plateaux du
  // sommet du rocher, voir `grotte()`) : `wash()` éronde son propre bord de
  // façon imprévisible, et un ciel qui s'arrêterait pile à la hauteur
  // moyenne du sommet laisse, sur les colonnes où le rocher érode plus haut
  // que prévu, un ruban de papier nu entre les deux — mesuré à l'écran, pas
  // seulement au calcul (voir le commentaire de `grotte()` sur la densité
  // réelle des lavis).
  gradedWash(ctx, -w * 0.05, -h * 0.05, w * 1.05, horizon, [
    { at: 0, color: VIOLET_NUIT, alpha: 0.68 },
    { at: 0.55, color: VIOLET_NUIT, alpha: 0.5 },
    { at: 0.85, color: SABLE, alpha: 0.22 },
    { at: 1, color: SABLE, alpha: 0.14 },
  ])

  // Deux étoiles, à peine posées, tenues dans le tiers haut — jamais assez
  // bas pour rivaliser avec la bande chaude de l'horizon ou le foyer.
  wash(ctx, polygon(w * 0.16, h * 0.1, w * 0.006, w * 0.006, 6, 0, rng), rng, {
    color: PRESQUE_BLANC,
    layers: 6,
    alpha: 0.3 / 6,
    spread: 0.1,
    jitter: 0.15,
  })
  wash(ctx, polygon(w * 0.84, h * 0.16, w * 0.005, w * 0.005, 6, 0, rng), rng, {
    color: PRESQUE_BLANC,
    layers: 6,
    alpha: 0.25 / 6,
    spread: 0.1,
    jitter: 0.15,
  })

  const boucheX = w * 0.4
  const boucheRayon = h * 0.24
  const cyBase = h * 0.98
  // Calculée une seule fois, transmise telle quelle à `foyer()` ET
  // `grotte()` : les deux doivent s'accorder sur exactement la même valeur
  // d'`apex`, jamais deux approximations qui pourraient diverger.
  const naissance = cyBase - boucheRayon * 0.3
  const gorge = cyBase - boucheRayon * 1.05
  const apex = gorge - boucheRayon * 0.3

  foyer(ctx, boucheX, cyBase, boucheRayon, apex, rng)
  grotte(ctx, w, h, cyBase, boucheX, boucheRayon, naissance, gorge, apex, rng)

  // La silhouette, accroupie tout contre le foyer côté droit — assez près
  // pour appartenir clairement à la scène du feu, pas posée à distance sur
  // le sol nu. `childWatchingSea` réutilisée telle quelle : sa posture
  // (genoux repliés, vue de dos) dit déjà « quelqu'un qui regarde », peu
  // importe ce qui est regardé. Toutes ses couleurs restent sombres : à
  // contre-jour du feu, c'est une silhouette, pas une figure éclairée.
  // Échelle relevée (0.14h → 0.24h) : à la toute petite taille d'affichage
  // réelle de la vignette, une figure à 0.14h se perdait dans la masse du
  // rocher plutôt que de se lire comme quelqu'un d'assis.
  //
  // `clothes: VIOLET_NUIT`, pas `ENCRE_SOMBRE` comme le premier essai :
  // `grotte()` peint le rocher précisément dans `ENCRE_SOMBRE` — vêtir la
  // silhouette de la même teinte que ce qu'elle a juste devant elle en
  // `multiply` ne crée aucun contraste, tout le corps (hanches, dos, bras)
  // se fond dans le rocher et il ne reste plus qu'une tête qui flotte,
  // repéré à l'écran avec la graine réelle de production.
  childWatchingSea(ctx, boucheX + boucheRayon * 1.35, cyBase, h * 0.24, rng, LUEUR, {
    skin: VIOLET_PROFOND,
    hair: ENCRE_SOMBRE,
    clothes: VIOLET_NUIT,
    accent: PIERRE_CHAUDE,
  })
}
