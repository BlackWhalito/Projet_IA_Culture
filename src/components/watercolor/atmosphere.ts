import { dryStroke, highlight, polygon, wash } from './engine'
import type { Point } from './engine'
import { litFromLeft } from './light'
import type { LightPlan } from './light'

/**
 * Le ciel et l'eau.
 *
 * Pourquoi un module à part : ce sont les deux grandes surfaces d'un
 * tableau, et celles qu'on rate le plus facilement. Une masse de couleur
 * posée sans structure n'est ni un ciel ni une mer — c'est une tache. Ce
 * qui les fait exister :
 *
 * - **un dégradé continu**, pas des bandes de couleurs juxtaposées ;
 * - **une échelle qui varie avec la distance** — c'est le seul indice qui
 *   fait lire un plan qui s'éloigne plutôt qu'un mur vertical ;
 * - **une structure interne** : un nuage a une base plate et un sommet
 *   bombé, une vague a une crête claire et un creux sombre.
 */

/**
 * Une lune : un disque et son halo, tous deux en dégradé radial natif —
 * jamais la technique `wash()` (polygone déformé par un bruit fractal),
 * pensée pour un bord de pigment organique. Un disque de lune veut un bord
 * lisse et un halo qui s'éteint en douceur tout autour : le même bruit
 * fractal qui fait un beau rocher irrégulier fait ici un cercle bancal et
 * un halo en tache, jamais la forme nette qu'une lune demande.
 */
export function moon(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string): void {
  const rgb = hexToRgb(color)

  const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 3)
  halo.addColorStop(0, `rgba(${rgb}, 0.22)`)
  halo.addColorStop(0.4, `rgba(${rgb}, 0.09)`)
  halo.addColorStop(1, `rgba(${rgb}, 0)`)
  ctx.save()
  ctx.fillStyle = halo
  ctx.beginPath()
  ctx.arc(cx, cy, r * 3, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  // Le disque : un dégradé radial resserré plutôt qu'un aplat, pour une
  // toute petite rondeur de volume — jamais un cercle parfaitement plat,
  // qui se lirait comme une pastille collée plutôt qu'une sphère.
  const disque = ctx.createRadialGradient(cx - r * 0.15, cy - r * 0.15, 0, cx, cy, r)
  disque.addColorStop(0, `rgba(${rgb}, 0.6)`)
  disque.addColorStop(0.7, `rgba(${rgb}, 0.48)`)
  disque.addColorStop(1, `rgba(${rgb}, 0.36)`)
  ctx.save()
  ctx.fillStyle = disque
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function hexToRgb(color: string): string {
  const n = parseInt(color.slice(1), 16)
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`
}

/**
 * Un lavis dégradé : la même masse peinte en tranches horizontales dont la
 * couleur et l'opacité glissent progressivement.
 *
 * C'est le remplacement direct de « plusieurs ellipses de couleurs
 * différentes empilées », qui se lit toujours comme des bandes quel que
 * soit leur recouvrement — l'œil trouve la frontière. Ici il n'y a aucune
 * frontière à trouver.
 *
 * Volontairement SANS texture ajoutée par-dessus. Deux tentatives l'ont
 * fait ici (des `wash()` adoucis, puis des dégradés radiaux sans bord) et
 * les deux ont fini identifiées comme « des taches » par le propriétaire.
 * La raison tient au blend `multiply` lui-même, pas à la netteté du bord :
 * n'importe quelle touche de couleur posée sur un dégradé assombrit
 * localement, et un assombrissement isolé se voit — bord dur ou pas. Le
 * grain de `WatercolorScene` (appliqué une fois sur toute la scène) donne
 * déjà la texture ; ce dégradé n'a besoin de rien d'autre.
 */
export function gradedWash(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  stops: Array<{ at: number; color: string; alpha: number }>,
): void {
  // Le fond est un vrai dégradé natif. Le peindre en tranches empilées
  // — même très recouvrantes — laisse toujours un rayage horizontal
  // visible : chaque tranche a un bord, et l'œil les aligne en stries.
  // Un `createLinearGradient` n'a aucun bord à trouver.
  const gradient = ctx.createLinearGradient(0, y0, 0, y1)
  for (const stop of stops) {
    gradient.addColorStop(Math.min(1, Math.max(0, stop.at)), hexToRgba(stop.color, stop.alpha))
  }
  ctx.save()
  ctx.fillStyle = gradient
  ctx.fillRect(x0, y0, x1 - x0, y1 - y0)
  ctx.restore()
}

/**
 * `#rrggbb` + opacité → `rgba(...)`, pour les arrêts de dégradé natifs.
 *
 * Toute autre forme est rendue telle quelle : `addColorStop` lève une
 * `SyntaxError` sur une couleur invalide, et comme la peinture se fait dans
 * un `useEffect`, la scène entière cesse alors d'être peinte sans rien
 * afficher d'anormal. Mieux vaut une couleur ignorée qu'un canvas vide.
 */
function hexToRgba(color: string, alpha: number): string {
  if (!/^#[0-9a-f]{6}$/i.test(color)) return color
  const n = parseInt(color.slice(1), 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`
}

/**
 * Un nuage : base plate, sommet bombé, flanc éclairé du côté de la lumière
 * et dessous en ombre violette.
 *
 * Une ellipse uniforme ne fait jamais un nuage — c'est l'opposition entre
 * un dessous plat et sombre et un sommet arrondi clair qui le crée. Sans
 * elle, on obtient une tache ronde qui flotte.
 */
export function cloud(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  width: number,
  height: number,
  rng: () => number,
  plan: LightPlan,
  options: { light: string; shade: string; alpha?: number; highlight?: string },
): void {
  const { light, shade, alpha = 0.16, highlight: highlightColor = light } = options
  const lit = litFromLeft(plan)

  // La masse : plusieurs bulbes de tailles inégales, plus haut au centre et
  // rasé aux extrémités — plutôt qu'une seule forme, un nuage est un agrégat.
  // On garde trace du lobe le plus proche de la lumière : c'est lui qui
  // portera le sommet éclairé plus bas.
  const lobes = 4 + Math.floor(rng() * 3)

  // Les lobes ne sont plus posés sur une grille régulière (`i / lobes`) :
  // c'est cette régularité — bulbes de même taille, à intervalle constant,
  // sur une même ligne de base parfaitement droite — qui les faisait lire
  // comme une frise de bosses ou un feston décoratif plutôt qu'un nuage.
  // Un décalage CUMULATIF (chaque position dépend de la précédente) casse
  // l'espacement sans jamais permuter deux lobes dans le désordre.
  // Amplitude modérée (±0.2, pas ±0.35) : il suffit de casser l'espacement
  // exactement égal pour perdre la lecture « frise » — un tirage trop large
  // peut isoler un lobe d'extrémité au-delà de ce que le chevauchement
  // garanti plus bas peut rattraper sans grossir démesurément.
  const slots: number[] = []
  let cursor = 0
  for (let i = 0; i < lobes; i += 1) {
    cursor += 1 + (rng() - 0.5) * 0.4
    slots.push(cursor)
  }
  const span = slots[slots.length - 1] || 1
  const lxs = slots.map((s) => cx - width / 2 + width * (s / span))

  let litLobe: { lx: number; ly: number; lw: number; lh: number } | undefined
  for (let i = 0; i < lobes; i += 1) {
    const t = slots[i] / span
    const lx = lxs[i]
    // Le gabarit qui fait la silhouette AVANT toute couleur : un nuage se
    // gonfle au centre et s'amenuise vers ses bords. Sans ce gabarit, seul
    // le tirage aléatoire dessine le contour et rend parfois une rangée de
    // bosses de taille comparable — exactement la « frise » observée.
    // Plafonné à 1 au centre : un premier réglage plus haut (1.3) laissait
    // le lobe central avaler tout le nuage en un seul dôme disproportionné,
    // le défaut inverse de la frise — un agrégat a besoin de plusieurs
    // bulbes du même ordre de grandeur, pas d'un géant et des miettes.
    // Plancher relevé (0.55, pas 0.4) : un lobe d'extrémité trop rétréci
    // reste fin même une fois élargi pour chevaucher son voisin (voir plus
    // bas) — sa hauteur, elle, n'était pas corrigée, donc son dôme restait
    // un aplat bas à côté de dômes bien plus hauts, toujours perçu comme
    // séparé plutôt que comme un lobe du même agrégat.
    const taper = 0.62 + Math.sin(t * Math.PI) ** 0.7 * 0.38
    const scale = taper * (0.75 + rng() * 0.45)
    let lw = (width / lobes) * 1.6 * scale
    let lh = height * scale
    // Chevauchement garanti avec le(s) voisin(s), quel que soit le tirage
    // de `scale` : un lobe d'extrémité qui tire un petit `scale` ET ne
    // recouvre pas son voisin se détache du reste et retombe dans le
    // défaut visé par cette fonction — une tache isolée, à plus petite
    // échelle. Vérifié en zoomant sur les nuages rendus (voir le rapport du
    // `verificateur`) : le corps de chaque nuage était corrigé, ses
    // extrémités les plus fines restaient fragiles.
    //
    // `lh` grandit dans la MÊME proportion que `lw`, pas seulement la
    // largeur : élargir un lobe sans le rehausser produit un aplat large et
    // bas, qui reste séparé du sommet bombé du voisin — c'est la forme, pas
    // seulement la couleur, qui doit se souder à l'agrégat.
    //
    // Le pire des deux écarts, pas le meilleur : dimensionner sur le PLUS
    // PETIT des deux voisins (une erreur du premier essai) ne garantit rien
    // côté opposé — un lobe peut chevaucher sa gauche et rester détaché à
    // droite. Dimensionner sur le plus GRAND couvre les deux côtés à la
    // fois, l'autre étant alors chevauché plus largement que nécessaire.
    const gapLeft = i > 0 ? lx - lxs[i - 1] : undefined
    const gapRight = i < lobes - 1 ? lxs[i + 1] - lx : undefined
    const neighborGap =
      gapLeft === undefined ? gapRight : gapRight === undefined ? gapLeft : Math.max(gapLeft, gapRight)
    if (neighborGap !== undefined) {
      const neededLw = neighborGap * 1.7
      if (neededLw > lw) {
        // Croissance plafonnée : sans plafond, un lobe tiré minuscule à côté
        // d'un voisin très éloigné peut être multiplié par un facteur énorme
        // et avaler tout le nuage — le défaut du dôme disproportionné,
        // sous une autre forme. Mieux vaut un chevauchement encore un peu
        // court qu'un lobe qui écrase les autres.
        const growth = Math.min(neededLw / lw, 1.8)
        lw *= growth
        lh *= growth
      }
    }
    // La base reste PRESQUE plate — un nuage a un dessous plat, pas
    // ondulé — mais un tout petit débattement (12 % de la hauteur du lobe)
    // évite que tous les lobes s'alignent sur une règle, seconde source de
    // l'effet « décoratif ».
    const ly = cy + (rng() - 0.5) * height * 0.12
    const base: Point[] = []
    for (let a = 0; a <= 12; a += 1) {
      const ang = Math.PI + (a / 12) * Math.PI
      base.push([lx + Math.cos(ang) * lw * 0.5, ly + Math.sin(ang) * lh])
    }
    base.push([lx + lw * 0.5, ly], [lx - lw * 0.5, ly])
    wash(ctx, base, rng, {
      color: light,
      layers: 14,
      alpha: alpha / 14,
      spread: 0.11,
      jitter: 0.13,
    })
    // Le lobe qui reçoit le sommet éclairé : le plus HAUT (`lh` max), pas le
    // plus à gauche. Choisir par position pure s'est révélé être le vrai
    // bug derrière la « tache dorée détachée » qui a survécu à plusieurs
    // essais de chevauchement des lobes : le lobe le plus proche du bord
    // lit (gauche) est, par construction du gabarit `taper`, aussi le plus
    // PETIT — le blanc réservé, plus dense qu'un simple lavis de corps
    // (`highlight()` empile 16 couches à alpha 0.09, contre 14 couches à
    // `alpha/14` pour un lobe), rendait ce minuscule lobe bien plus visible
    // et saturé que le reste de l'agrégat, détaché de la masse principale.
    if (!litLobe || lh > litLobe.lh) litLobe = { lx, ly, lw, lh }

    // L'ombre de CE lobe : un écho compressé du MÊME contour `base`, pas
    // une nouvelle ellipse posée à côté. Une forme indépendante, même
    // petite, peut atterrir décalée du lobe qui l'a produite et se lire
    // comme un disque qui flotte tout seul sous les nuages — exactement le
    // défaut que ce remplacement visait à corriger, sous une autre forme.
    // En reprenant les points de `base` et en les resserrant vers le bas,
    // l'ombre reste géométriquement à l'intérieur de la silhouette du lobe.
    const shadeBase: Point[] = base.map(([px, py]) => [
      lx + (px - lx) * 0.8,
      ly + (py - ly) * 0.55 + lh * 0.22,
    ])
    wash(ctx, shadeBase, rng, {
      color: shade,
      layers: 9,
      alpha: (alpha * 1.1) / 9,
      spread: 0.14,
      jitter: 0.16,
    })
  }

  // Le sommet éclairé : un blanc réservé net sur le lobe côté lumière. Sans
  // ce clair franc, le nuage n'a qu'un dégradé mou entre deux tons voisins
  // de la même famille que le ciel — il s'y noie au lieu de s'en détacher.
  //
  // Réservé aux nuages assez denses (`alpha >= 0.15`) : `wash()` divise
  // l'`alpha` du corps par son nombre de couches (`alpha/14` pour un lobe),
  // alors que `highlight()` NE divise PAS la sienne par ses 16 couches —
  // les deux `alpha` ne vivent pas sur la même échelle, et aucun facteur de
  // proportionnalité simple ne les fait correspondre pour tous les cas
  // (essayé : `alpha*0.7` restait quasi identique à l'ancienne constante
  // sur un nuage pâle, donc sans effet ; voir le rapport du `verificateur`
  // sur `scenes.ts:137` et `:258`). Plus simple et plus robuste : un nuage
  // pâle (fond, brume) n'a pas besoin d'un sommet qui « attrape la
  // lumière » — cet accent n'a de sens que sur les nuages francs du
  // premier plan.
  if (litLobe && alpha >= 0.15) {
    // Rayon plafonné à celui d'un lobe « moyen » (`width/lobes`), pas
    // celui du lobe élu — sinon, quand le chevauchement forcé plus haut a
    // agrandi ce lobe, l'éclat grandit avec lui et son contraste avec les
    // lobes voisins non éclairés devient plus dur, retombant vers l'effet
    // « pastille détachée » que ce correctif visait à éliminer.
    const hw = Math.min(litLobe.lw, width / lobes)
    const hh = Math.min(litLobe.lh, height)
    highlight(
      ctx,
      polygon(
        litLobe.lx + (lit ? -hw * 0.1 : hw * 0.1),
        litLobe.ly - hh * 0.6,
        hw * 0.24,
        hh * 0.32,
        9,
        rng() * 6,
        rng,
      ),
      rng,
      // Alpha bien plus basse que l'ancienne constante (0.11) : en
      // `multiply`, 16 couches à 0.11 cumulent une couverture proche de
      // 85 % — quasi opaque, donc quasi la couleur brute de `highlightColor`
      // plutôt qu'un voile translucide. Le `verificateur` a mesuré le
      // résultat réel (PAPIER × PIERRE_PALE ≈ 223,206,178 — un kaki net,
      // pas un blanc réservé) et confirmé que ça se lisait comme une
      // pastille détachée, pas comme un sommet qui attrape la lumière.
      // À 0.035, la couverture cumulée tombe autour de 30 % : assez pour
      // rester un clair perceptible, assez peu pour que le ton du nuage en
      // dessous reste dominant.
      { color: highlightColor, alpha: 0.035 },
    )
  }
}

/**
 * Les rides d'un plan d'eau, en perspective.
 *
 * La clé, et l'erreur la plus fréquente : des touches de taille constante
 * font lire un mur vertical texturé. Dans la réalité les rides paraissent
 * **serrées, fines et longues** près de l'horizon, puis **espacées, plus
 * épaisses et plus courtes** en approchant du bord bas. C'est cette
 * variation seule qui couche le plan et crée la profondeur.
 */
export function ripples(
  ctx: CanvasRenderingContext2D,
  x0: number,
  x1: number,
  yHorizon: number,
  yNear: number,
  count: number,
  rng: () => number,
  options: { color: string; accent: string },
): void {
  const { color, accent } = options
  const width = x1 - x0
  const depth = yNear - yHorizon
  for (let i = 0; i < count; i += 1) {
    // Distribution en puissance : beaucoup de rides tassées près de
    // l'horizon, de plus en plus rares en descendant.
    const t = Math.pow(rng(), 0.55)
    const y = yHorizon + depth * t
    const len = width * (0.5 - t * 0.34) * (0.5 + rng())
    const thickness = depth * (0.0016 + t * 0.006)
    const cx = x0 + width * (0.1 + rng() * 0.8)
    dryStroke(ctx, [
      [cx - len / 2, y],
      [cx, y + (rng() - 0.5) * thickness * 2],
      [cx + len / 2, y],
    ], thickness, rng, {
      color: t > 0.62 ? accent : color,
      alpha: 0.06 + t * 0.14,
      layers: 1,
      jitter: 0.08,
    })
  }
}

/**
 * Les reflets verticaux sous un objet posé sur l'eau.
 *
 * Un reflet n'est pas une copie délavée : c'est la couleur de l'objet
 * **tirée vers le bas** et cassée par la surface. Ce sont les cassures qui
 * font l'eau ; une copie continue reste une tache symétrique.
 */
export function reflection(
  ctx: CanvasRenderingContext2D,
  cx: number,
  width: number,
  ySurface: number,
  length: number,
  color: string,
  rng: () => number,
  strands = 5,
): void {
  for (let s = 0; s < strands; s += 1) {
    const sx = cx - width / 2 + (width * (s + 0.5)) / strands
    const len = length * (0.45 + rng() * 0.9)
    // Le brin reste très fin devant sa longueur (voir le rapport minimum
    // dans `references/peinture-generative.md`) : au-delà d'environ 1/30,
    // l'effilement de `dryStroke` le transforme en fuseau pointu suspendu
    // sous la berge — l'effet stalactite, immédiatement faux.
    const thickness = Math.min((width / strands) * 0.35, len * 0.032)
    dryStroke(ctx, [
      [sx, ySurface],
      [sx + (rng() - 0.5) * width * 0.05, ySurface + len * 0.5],
      [sx + (rng() - 0.5) * width * 0.08, ySurface + len],
    ], thickness, rng, {
      color,
      alpha: 0.1 + rng() * 0.08,
      layers: 2,
      jitter: 0.14,
    })
  }
}
