/**
 * Moteur de peinture aquarelle générative.
 *
 * Pourquoi il existe : une forme SVG écrite à la main ne ressemble jamais à
 * de l'aquarelle, quel que soit le filtre appliqué par-dessus — les bords
 * restent lisses et le pigment reste plat. La vraie sensation vient de
 * l'accumulation : on déforme une même forme des dizaines de fois et on
 * empile les copies en très faible opacité. Là où beaucoup de copies se
 * recouvrent, la couleur fonce ; sur les franges, une seule passe laisse un
 * voile. C'est ce gradient irrégulier qui fait le bord d'aquarelle, les
 * auréoles et le grain.
 *
 * Tout est déterministe : une même graine rend toujours la même peinture,
 * donc l'écran ne scintille pas d'un rechargement à l'autre.
 */

export type Point = [number, number]

/** Générateur pseudo-aléatoire déterministe (mulberry32). */
export function makeRng(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Approximation d'une loi normale centrée réduite, bornée à ±1 environ. */
function gauss(rng: () => number): number {
  return (rng() + rng() + rng() - 1.5) / 1.5
}

/**
 * Subdivise chaque arête et déplace le nouveau point perpendiculairement,
 * d'une quantité proportionnelle à la longueur de l'arête. Répété, ça donne
 * une frontière fractale : irrégulière à toutes les échelles, comme un bord
 * de pigment. `variance` autour de 0.1 reste organique ; au-delà de 0.3 la
 * forme part en lambeaux.
 */
export function deform(points: Point[], depth: number, variance: number, rng: () => number): Point[] {
  let current = points
  let v = variance
  for (let d = 0; d < depth; d += 1) {
    const next: Point[] = []
    for (let i = 0; i < current.length; i += 1) {
      const a = current[i]
      const b = current[(i + 1) % current.length]
      next.push(a)
      const dx = b[0] - a[0]
      const dy = b[1] - a[1]
      const len = Math.hypot(dx, dy)
      if (len < 0.001) continue
      const amount = gauss(rng) * v * len
      next.push([(a[0] + b[0]) / 2 - (dy / len) * amount, (a[1] + b[1]) / 2 + (dx / len) * amount])
    }
    current = next
    v *= 0.82
  }
  return current
}

/**
 * Un polygone, point de départ de toute forme peinte. `rng` (optionnel)
 * décale chaque sommet radialement d'environ ±12 % : sans lui, `deform`
 * applique le même bruit à intervalles réguliers sur une ellipse parfaite et
 * produit une silhouette en pétales de fleur, bien trop régulière pour de
 * l'eau ou une masse rocheuse.
 */
export function polygon(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  sides: number,
  rotation = 0,
  rng?: () => number,
): Point[] {
  const points: Point[] = []
  for (let i = 0; i < sides; i += 1) {
    const angle = rotation + (i / sides) * Math.PI * 2
    const j = rng ? 1 + gauss(rng) * 0.12 : 1
    points.push([cx + Math.cos(angle) * rx * j, cy + Math.sin(angle) * ry * j])
  }
  return points
}

function tracePath(ctx: CanvasRenderingContext2D, points: Point[]): void {
  ctx.beginPath()
  ctx.moveTo(points[0][0], points[0][1])
  for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i][0], points[i][1])
  ctx.closePath()
}

export interface WashOptions {
  /** Couleur du pigment, en `rgb(r g b)` ou `#rrggbb`. */
  color: string
  /** Nombre de passes empilées. 25 à 50 : en dessous c'est plat, au-dessus c'est opaque. */
  layers?: number
  /** Opacité d'une passe. Autour de 0.03 ; l'accumulation fait le reste. */
  alpha?: number
  /** Irrégularité de la forme parente — la silhouette générale. */
  spread?: number
  /** Irrégularité entre deux passes — le bord baveux. */
  jitter?: number
}

/**
 * Peint un lavis : la forme donnée, déformée puis réempilée en couches
 * translucides. À appeler sur un contexte déjà réglé en `multiply` si on veut
 * que les lavis se mélangent comme du pigment plutôt que se recouvrir.
 */
export function wash(
  ctx: CanvasRenderingContext2D,
  base: Point[],
  rng: () => number,
  options: WashOptions,
): void {
  const { color, layers = 34, alpha = 0.03, spread = 0.16, jitter = 0.085 } = options
  const parent = deform(base, 4, spread, rng)
  ctx.save()
  ctx.fillStyle = color
  ctx.globalAlpha = alpha
  for (let i = 0; i < layers; i += 1) {
    tracePath(ctx, deform(parent, 2, jitter, rng))
    ctx.fill()
  }
  ctx.restore()
}

/**
 * Un trait de pinceau : une bande le long d'un chemin, peinte comme un lavis.
 * Sert aux horizons, aux reflets, aux mâts — tout ce qui est linéaire sans
 * devoir être droit.
 */
export function stroke(
  ctx: CanvasRenderingContext2D,
  path: Point[],
  width: number,
  rng: () => number,
  options: WashOptions,
): void {
  const top: Point[] = []
  const bottom: Point[] = []
  for (let i = 0; i < path.length; i += 1) {
    const a = path[Math.max(0, i - 1)]
    const b = path[Math.min(path.length - 1, i + 1)]
    const dx = b[0] - a[0]
    const dy = b[1] - a[1]
    const len = Math.hypot(dx, dy) || 1
    // La largeur varie le long du trait — un pinceau réel n'a jamais une
    // pression parfaitement constante. Sans ça, le trait ressemble à un
    // ruban tracé au marqueur plutôt qu'à un coup de pinceau.
    const w = (width / 2) * (0.35 + rng() * 0.9)
    const nx = -(dy / len) * w
    const ny = (dx / len) * w
    top.push([path[i][0] + nx, path[i][1] + ny])
    bottom.unshift([path[i][0] - nx, path[i][1] - ny])
  }
  wash(ctx, [...top, ...bottom], rng, { layers: 14, alpha: 0.02, spread: 0.04, jitter: 0.07, ...options })
}

export interface StrokeOptions {
  /** Couleur du trait, en `rgb(r g b)` ou `#rrggbb`. */
  color: string
  /** Opacité de chaque passe. Un vrai coup de pinceau est dense : 0.4 à 0.7, pas 0.03. */
  alpha?: number
  /** Nombre de passes. 3 à 6 : assez pour un bord un peu vivant, pas assez pour lisser en aplat. */
  layers?: number
  /** Irrégularité du bord, plus fine que celle d'un lavis. */
  jitter?: number
}

/**
 * Un vrai coup de pinceau : un ruban effilé aux deux bouts, peint en peu de
 * passes denses plutôt qu'en dizaines de passes translucides. `wash` fond
 * une masse ; `dryStroke` marque un geste — c'est la différence entre une
 * tache de couleur et un trait qui donne l'impression d'une main qui a
 * décrit une arête, un mât, une hachure d'ombre.
 */
/**
 * Ajoute des points intermédiaires par interpolation linéaire jusqu'à
 * atteindre `minPoints`, sans changer la forme du chemin. `dryStroke` calcule
 * l'effilement à partir de l'index du point le long du chemin : avec
 * seulement 2 points (une simple droite, le cas le plus courant — un mât, un
 * bord droit), les deux seules valeurs de `sin` tombent près de 0 aux deux
 * bouts et le trait entier reste quasi invisible, faute d'un point au milieu
 * qui atteindrait la pleine largeur.
 */
export function resample(path: Point[], minPoints: number): Point[] {
  if (path.length >= minPoints) return path
  const lengths: number[] = [0]
  for (let i = 1; i < path.length; i += 1) {
    lengths.push(lengths[i - 1] + Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]))
  }
  const total = lengths[lengths.length - 1] || 1
  const out: Point[] = []
  for (let s = 0; s < minPoints; s += 1) {
    const target = (s / (minPoints - 1)) * total
    let seg = 0
    while (seg < lengths.length - 2 && lengths[seg + 1] < target) seg += 1
    const segLen = lengths[seg + 1] - lengths[seg] || 1
    const t = (target - lengths[seg]) / segLen
    const [x0, y0] = path[seg]
    const [x1, y1] = path[seg + 1]
    out.push([x0 + (x1 - x0) * t, y0 + (y1 - y0) * t])
  }
  return out
}

export function dryStroke(
  ctx: CanvasRenderingContext2D,
  rawPath: Point[],
  width: number,
  rng: () => number,
  options: StrokeOptions,
): void {
  const { color, alpha = 0.55, layers = 4, jitter = 0.05 } = options
  const path = resample(rawPath, 7)
  const n = path.length
  const top: Point[] = []
  const bottom: Point[] = []
  for (let i = 0; i < n; i += 1) {
    const a = path[Math.max(0, i - 1)]
    const b = path[Math.min(n - 1, i + 1)]
    const dx = b[0] - a[0]
    const dy = b[1] - a[1]
    const len = Math.hypot(dx, dy) || 1
    // Effilé aux deux bouts, comme un pinceau qui se lève du papier — sans
    // ça, chaque touche a l'air coupée au ciseau plutôt que posée.
    const taper = n > 1 ? Math.sin((i / (n - 1)) * Math.PI) ** 0.6 : 1
    const w = (width / 2) * taper * (0.75 + rng() * 0.5)
    const nx = -(dy / len) * w
    const ny = (dx / len) * w
    top.push([path[i][0] + nx, path[i][1] + ny])
    bottom.unshift([path[i][0] - nx, path[i][1] - ny])
  }
  const base = [...top, ...bottom]
  ctx.save()
  ctx.fillStyle = color
  ctx.globalAlpha = alpha
  for (let l = 0; l < layers; l += 1) {
    tracePath(ctx, deform(base, 2, jitter, rng))
    ctx.fill()
  }
  ctx.restore()
}

/**
 * Une trame de hachures dirigées : beaucoup de petites touches (`dryStroke`)
 * dispersées dans une zone, orientées globalement selon `angleDeg` avec une
 * déviation individuelle. C'est ce qui donne une surface — un mur, une
 * ombre portée — sans jamais dessiner deux fois le même motif répété.
 */
export function hatch(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  angleDeg: number,
  count: number,
  rng: () => number,
  options: StrokeOptions & { length?: number; width?: number },
): void {
  const { length = Math.max(rx, ry) * 0.5, width = Math.min(rx, ry) * 0.12, ...strokeOptions } = options
  const angle = (angleDeg * Math.PI) / 180
  for (let i = 0; i < count; i += 1) {
    const x = cx + (rng() - 0.5) * 2 * rx
    const y = cy + (rng() - 0.5) * 2 * ry
    const a = angle + (rng() - 0.5) * 0.35
    const len = length * (0.6 + rng() * 0.8)
    const dx = Math.cos(a) * len * 0.5
    const dy = Math.sin(a) * len * 0.5
    const path: Point[] = [
      [x - dx, y - dy],
      [x - dx * 0.4, y - dy * 0.4],
      [x, y],
      [x + dx * 0.4, y + dy * 0.4],
      [x + dx, y + dy],
    ]
    dryStroke(ctx, path, width * (0.6 + rng() * 0.8), rng, strokeOptions)
  }
}

/**
 * Un blanc réservé : réaffirme la couleur du papier (ou une teinte claire)
 * par-dessus ce qui est déjà peint, comme le papier qu'on laisse vierge à
 * l'aquarelle plutôt que peint puis gratté. Sans vrais clairs face aux
 * sombres de `dryStroke`/`wash` dense, une peinture générative reste dans
 * un entre-deux fade — c'est le contraste de valeurs qui manque le plus.
 */
export function highlight(ctx: CanvasRenderingContext2D, base: Point[], rng: () => number, options: WashOptions): void {
  wash(ctx, base, rng, { layers: 18, alpha: 0.09, spread: 0.12, jitter: 0.08, ...options })
}

/**
 * Éclats de pigment : une poignée de petites taches irrégulières dispersées
 * dans une zone, plus foncées ou plus claires que le lavis qu'elles
 * recouvrent. Sans ça, un grand aplat empilé en couches reste uniforme —
 * c'est la granulation qui donne à un lavis sa profondeur, l'endroit où le
 * pigment s'est déposé plus dru.
 */
export function flecks(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  count: number,
  rng: () => number,
  options: WashOptions,
): void {
  for (let i = 0; i < count; i += 1) {
    const fx = cx + (rng() - 0.5) * 2 * rx
    const fy = cy + (rng() - 0.5) * 2 * ry
    const r = (0.08 + rng() * 0.18) * Math.min(rx, ry)
    wash(ctx, polygon(fx, fy, r, r * (0.6 + rng() * 0.8), 7, rng() * 6, rng), rng, {
      layers: 6,
      alpha: 0.03,
      spread: 0.22,
      jitter: 0.16,
      ...options,
    })
  }
}

/**
 * Grain de papier : un bruit monochrome très faible passé en `multiply`.
 * Indispensable — sans lui les lavis flottent, avec lui ils sont posés sur
 * une feuille. Reste sous 8 % d'intensité (règle de la skill `aquarelle`).
 */
export function grain(ctx: CanvasRenderingContext2D, width: number, height: number, rng: () => number): void {
  // Le bruit passe par un canvas intermédiaire : `putImageData` écrit les
  // pixels tels quels et ignore `globalCompositeOperation`, donc il ne peut
  // pas se fondre en `multiply`. `drawImage`, si.
  const scratch = document.createElement('canvas')
  scratch.width = width
  scratch.height = height
  const sctx = scratch.getContext('2d')
  if (!sctx) return
  const image = sctx.createImageData(width, height)
  const data = image.data
  for (let i = 0; i < data.length; i += 4) {
    const n = 232 + Math.floor(rng() * 24)
    data[i] = n
    data[i + 1] = n
    data[i + 2] = n
    data[i + 3] = 255
  }
  sctx.putImageData(image, 0, 0)
  ctx.save()
  ctx.globalCompositeOperation = 'multiply'
  ctx.globalAlpha = 0.5
  ctx.drawImage(scratch, 0, 0)
  ctx.restore()
}
