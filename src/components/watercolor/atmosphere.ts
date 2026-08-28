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

  // Les lobes ne sont plus PEINTS un par un : on calcule seulement leur
  // géométrie, puis on peint leur enveloppe en une seule fois.
  //
  // C'est la correction de fond du « feston ». Chaque lobe était jusqu'ici un
  // demi-dôme lavé séparément ; comme tout se compose en `multiply`, chaque
  // recouvrement fonçait et redessinait le contour de son voisin. L'agrégat se
  // lisait donc comme une rangée d'arches — et aucun réglage du hasard ne
  // pouvait le supprimer, parce que le défaut ne venait pas du tirage mais du
  // NOMBRE DE COUPS DE PINCEAU. Un nuage est une masse, il se peint d'un seul
  // geste ; ce sont ses bosses qui varient, pas le nombre de lavis.
  const geo: Array<{ lx: number; ly: number; lw: number; lh: number }> = []
  let litLobe: { lx: number; ly: number; lw: number; lh: number } | undefined
  for (let i = 0; i < lobes; i += 1) {
    const t = slots[i] / span
    const lx = lxs[i]
    const taper = 0.62 + Math.sin(t * Math.PI) ** 0.7 * 0.38
    const scale = taper * (0.75 + rng() * 0.45)
    let lw = (width / lobes) * 1.6 * scale
    let lh = height * scale
    // Chevauchement garanti avec le plus éloigné des deux voisins : un lobe
    // qui ne recouvre pas le suivant laisse un creux dans l'enveloppe, et
    // l'agrégat redevient une suite de bosses distinctes.
    const gapLeft = i > 0 ? lx - lxs[i - 1] : undefined
    const gapRight = i < lobes - 1 ? lxs[i + 1] - lx : undefined
    const neighborGap =
      gapLeft === undefined ? gapRight : gapRight === undefined ? gapLeft : Math.max(gapLeft, gapRight)
    if (neighborGap !== undefined) {
      const neededLw = neighborGap * 1.7
      if (neededLw > lw) {
        const growth = Math.min(neededLw / lw, 1.8)
        lw *= growth
        lh *= growth
      }
    }
    // La base reste PRESQUE plate — un nuage a un dessous plat, pas ondulé.
    const ly = cy + (rng() - 0.5) * height * 0.12
    geo.push({ lx, ly, lw, lh })
    // Le lobe qui recevra le sommet éclairé : le plus HAUT, jamais le plus à
    // gauche — le lobe d'extrémité est par construction le plus petit, et un
    // blanc réservé dessus se détachait de la masse comme une pastille.
    if (!litLobe || lh > litLobe.lh) litLobe = { lx, ly, lw, lh }
  }

  // L'enveloppe supérieure : pour chaque abscisse, le point le plus haut de
  // tous les dômes. Une seule forme fermée, donc un seul lavis, donc aucun
  // contour interne.
  const x0 = Math.min(...geo.map((g) => g.lx - g.lw / 2))
  const x1 = Math.max(...geo.map((g) => g.lx + g.lw / 2))
  const baseY = Math.max(...geo.map((g) => g.ly))
  const contour: Point[] = []
  const pas = 48
  for (let i = 0; i <= pas; i += 1) {
    const px = x0 + ((x1 - x0) * i) / pas
    let top = baseY
    for (const g of geo) {
      const u = (px - g.lx) / (g.lw / 2)
      if (Math.abs(u) < 1) {
        const y = g.ly - g.lh * Math.sqrt(1 - u * u)
        if (y < top) top = y
      }
    }
    contour.push([px, top])
  }
  contour.push([x1, baseY], [x0, baseY])
  wash(ctx, contour, rng, {
    color: light,
    layers: 16,
    alpha: alpha / 16,
    spread: 0.1,
    jitter: 0.12,
  })

  // L'ombre : le MÊME contour, resserré vers le bas. Une forme dérivée partage
  // la géométrie de son parent — recalculée à côté, même de peu, elle finit
  // par se lire comme une tache qui flotte sous le nuage.
  const cxTout = (x0 + x1) / 2
  const hMax = baseY - Math.min(...contour.map((pt) => pt[1]))
  wash(
    ctx,
    contour.map(([px, py]) => [cxTout + (px - cxTout) * 0.86, baseY + (py - baseY) * 0.5 + hMax * 0.16] as Point),
    rng,
    { color: shade, layers: 10, alpha: (alpha * 1.05) / 10, spread: 0.13, jitter: 0.15 },
  )

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
