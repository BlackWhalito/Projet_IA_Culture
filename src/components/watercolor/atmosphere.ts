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

  // La masse : plusieurs bulbes de tailles inégales alignés sur une base
  // commune, plutôt qu'une seule forme — un nuage est un agrégat. On garde
  // trace du lobe le plus proche de la lumière : c'est lui qui portera le
  // sommet éclairé plus bas.
  const lobes = 3 + Math.floor(rng() * 3)
  let litLobe: { lx: number; lw: number; lh: number } | undefined
  for (let i = 0; i < lobes; i += 1) {
    const t = lobes === 1 ? 0.5 : i / (lobes - 1)
    const lx = cx - width / 2 + width * t
    const scale = 0.55 + rng() * 0.75
    const lw = (width / lobes) * 1.5 * scale
    const lh = height * scale
    const base: Point[] = []
    for (let a = 0; a <= 12; a += 1) {
      const ang = Math.PI + (a / 12) * Math.PI
      base.push([lx + Math.cos(ang) * lw * 0.5, cy + Math.sin(ang) * lh])
    }
    base.push([lx + lw * 0.5, cy], [lx - lw * 0.5, cy])
    wash(ctx, base, rng, {
      color: light,
      layers: 14,
      alpha: alpha / 14,
      spread: 0.11,
      jitter: 0.13,
    })
    if (!litLobe || (lit ? lx < litLobe.lx : lx > litLobe.lx)) litLobe = { lx, lw, lh }

    // L'ombre de CE lobe : un écho compressé du MÊME contour `base`, pas
    // une nouvelle ellipse posée à côté. Une forme indépendante, même
    // petite, peut atterrir décalée du lobe qui l'a produite et se lire
    // comme un disque qui flotte tout seul sous les nuages — exactement le
    // défaut que ce remplacement visait à corriger, sous une autre forme.
    // En reprenant les points de `base` et en les resserrant vers le bas,
    // l'ombre reste géométriquement à l'intérieur de la silhouette du lobe.
    const shadeBase: Point[] = base.map(([px, py]) => [
      lx + (px - lx) * 0.8,
      cy + (py - cy) * 0.55 + lh * 0.22,
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
  if (litLobe) {
    highlight(
      ctx,
      polygon(
        litLobe.lx + (lit ? -litLobe.lw * 0.1 : litLobe.lw * 0.1),
        cy - litLobe.lh * 0.6,
        litLobe.lw * 0.24,
        litLobe.lh * 0.32,
        9,
        rng() * 6,
        rng,
      ),
      rng,
      { color: highlightColor, alpha: 0.14 },
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
