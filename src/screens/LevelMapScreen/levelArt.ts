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
 * source de lumière. Corrigé en resserrant le halo (rayon divisé par deux)
 * et en réservant le clair vif au tout petit cœur, via `highlight()` plutôt
 * qu'un `wash()` de plus.
 */
function foyer(ctx: CanvasRenderingContext2D, cx: number, cyBase: number, rayon: number, rng: () => number): void {
  // La lueur ambiante qui remplit tout l'intérieur de la bouche de grotte,
  // AVANT le lit de braises et les flammes : sans elle, tout ce que ces
  // formes étroites ne couvrent pas reste du papier nu, qui perce alors en
  // blanc cru dans l'ouverture — plus clair que le ciel lui-même, un
  // défaut repéré à l'écran plutôt qu'au calcul. Le rocher, peint après,
  // rassombrit tout ce qui déborde de l'ouverture réelle : cette lueur peut
  // largement dépasser la bouche sans risque.
  wash(ctx, polygon(cx, cyBase - rayon * 0.95, rayon * 1.05, rayon * 1.6, 10, 0, rng), rng, {
    color: OCRE,
    layers: 20,
    alpha: 0.4 / 20,
    spread: 0.18,
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
 */
function grotte(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  cyBase: number,
  boucheX: number,
  boucheRayon: number,
  rng: () => number,
): void {
  const x0 = -w * 0.06
  const x1 = w * 1.06
  // La voûte reste nettement sous les plateaux du sommet (voir plus bas,
  // qui ne descendent jamais sous 0.34h) : une gorge qui remonterait
  // jusqu'à la ligne de crête percerait le rocher de part en part au lieu
  // d'y creuser une bouche.
  const gorge = cyBase - boucheRayon * 1.05
  const naissance = cyBase - boucheRayon * 0.3

  // Le sommet en plateaux : des paliers plats reliés par des chutes
  // quasi verticales, jamais une pente progressive.
  const marches = 4
  const sommet: Point[] = []
  let plateauY = cyBase - h * (0.36 + rng() * 0.1)
  for (let i = 0; i <= marches; i += 1) {
    const t = i / marches
    const xStart = x0 + (x1 - x0) * t
    const xEnd = x0 + (x1 - x0) * Math.min(1, t + 1 / marches / 2)
    sommet.push([xStart, plateauY])
    sommet.push([xEnd, plateauY])
    plateauY = cyBase - h * (0.34 + rng() * 0.12)
  }

  const contour: Point[] = [
    [x0, cyBase],
    ...sommet,
    [x1, cyBase],
    [boucheX + boucheRayon * 1.15, cyBase],
    [boucheX + boucheRayon * 0.95, naissance],
    [boucheX + boucheRayon * 0.5, gorge],
    [boucheX, gorge - boucheRayon * 0.3],
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

  foyer(ctx, boucheX, h * 0.98, boucheRayon * 0.75, rng)
  grotte(ctx, w, h, h * 0.98, boucheX, boucheRayon, rng)

  // La silhouette, accroupie tout contre le foyer côté droit — assez près
  // pour appartenir clairement à la scène du feu, pas posée à distance sur
  // le sol nu. `childWatchingSea` réutilisée telle quelle : sa posture
  // (genoux repliés, vue de dos) dit déjà « quelqu'un qui regarde », peu
  // importe ce qui est regardé. Toutes ses couleurs restent sombres : à
  // contre-jour du feu, c'est une silhouette, pas une figure éclairée.
  // Échelle relevée (0.14h → 0.24h) : à la toute petite taille d'affichage
  // réelle de la vignette, une figure à 0.14h se perdait dans la masse du
  // rocher plutôt que de se lire comme quelqu'un d'assis.
  childWatchingSea(ctx, boucheX + boucheRayon * 1.35, h * 0.98, h * 0.24, rng, LUEUR, {
    skin: VIOLET_PROFOND,
    hair: ENCRE_SOMBRE,
    clothes: ENCRE_SOMBRE,
    accent: PIERRE_CHAUDE,
  })
}
