import { dryStroke, polygon, wash } from './engine'
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
 */
export function gradedWash(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  stops: Array<{ at: number; color: string; alpha: number }>,
  rng: () => number,
  patches = 7,
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

  // La matière vient ensuite : quelques larges nappes irrégulières posées
  // par-dessus, qui cassent l'uniformité mécanique du dégradé sans y
  // réintroduire de frontière horizontale.
  const height = y1 - y0
  for (let p = 0; p < patches; p += 1) {
    const t = (p + 0.5) / patches
    let near = stops[0]
    for (const stop of stops) if (Math.abs(stop.at - t) < Math.abs(near.at - t)) near = stop
    const cx = x0 + (x1 - x0) * (0.2 + rng() * 0.6)
    const cy = y0 + height * (t + (rng() - 0.5) * 0.12)
    // Très large et très faible : une nappe qu'on remarque se lit comme un
    // objet flottant dans l'eau ou un nuage collé au ciel. Elle doit se
    // sentir, pas se voir.
    wash(ctx, polygon(cx, cy, (x1 - x0) * (0.45 + rng() * 0.4), height * (0.12 + rng() * 0.12), 12, rng() * 6, rng), rng, {
      color: near.color,
      layers: 8,
      alpha: (near.alpha * 0.07) / 8,
      spread: 0.22,
      jitter: 0.16,
    })
  }
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
  options: { light: string; shade: string; alpha?: number },
): void {
  const { light, shade, alpha = 0.14 } = options
  const lit = litFromLeft(plan)

  // La masse : plusieurs bulbes de tailles inégales alignés sur une base
  // commune, plutôt qu'une seule forme — un nuage est un agrégat.
  const lobes = 3 + Math.floor(rng() * 3)
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
  }

  // Le dessous, en ombre : une bande basse et étroite, décalée du côté
  // opposé à la lumière.
  const shadeShift = lit ? width * 0.08 : -width * 0.08
  wash(ctx, polygon(cx + shadeShift, cy - height * 0.1, width * 0.42, height * 0.22, 11, 0, rng), rng, {
    color: shade,
    layers: 10,
    alpha: (alpha * 1.5) / 10,
    spread: 0.14,
    jitter: 0.15,
  })
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
