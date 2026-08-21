import { dryStroke, hatch, wash } from './engine'
import type { Point } from './engine'
import { VALEUR, attenue } from './light'
import type { LightPlan } from './light'

/**
 * Le vocabulaire d'architecture peinte.
 *
 * Pourquoi ça existe : une masse verticale effilée n'est une tour que dans
 * l'intention de celui qui l'a écrite — à l'écran, elle se lit comme un
 * crayon. Ce qui fait lire un bâtiment, ce sont des éléments identifiables
 * et répétés : une rangée de fenêtres, une arcade, une corniche, un toit
 * qui a une pente. Ce module fournit ces « mots » ; les scènes les
 * assemblent.
 *
 * Chaque fonction prend le `LightPlan` de la scène pour que toutes les
 * ombres viennent du même côté. C'est ce qui crée l'harmonie qu'on ne peut
 * pas obtenir en réglant chaque objet séparément.
 */

export interface BuildingOptions {
  /** Couleur de la pierre au soleil. */
  stone: string
  /** Couleur de l'ombre portée sur la façade. */
  shade: string
  /** 0 = premier plan, 1 = horizon. Atténue tout par perspective aérienne. */
  distance?: number
  /** Rangées de fenêtres. 0 pour un mur aveugle. */
  floors?: number
  /** Fenêtres par rangée. */
  bays?: number
}

/**
 * Les petits noirs : des ouvertures irrégulières, très sombres, minuscules.
 * C'est l'élément qui fait basculer une masse en bâtiment habité — et le
 * seul endroit où l'on s'autorise la valeur `ACCENT`.
 */
function windows(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  floors: number,
  bays: number,
  rng: () => number,
  plan: LightPlan,
  distance: number,
): void {
  if (floors < 1 || bays < 1) return
  const w = x1 - x0
  const h = y1 - y0
  const cellW = w / (bays + 1)
  const cellH = h / (floors + 1)
  const openW = cellW * 0.42
  const openH = cellH * 0.5
  for (let r = 1; r <= floors; r += 1) {
    for (let c = 1; c <= bays; c += 1) {
      // Une ouverture sur six reste fermée : une grille parfaitement remplie
      // se lit comme une texture régulière, pas comme un bâtiment.
      if (rng() < 0.16) continue
      const cx = x0 + cellW * c + (rng() - 0.5) * cellW * 0.18
      const cy = y0 + cellH * r + (rng() - 0.5) * cellH * 0.12
      const ww = openW * (0.7 + rng() * 0.6)
      const hh = openH * (0.7 + rng() * 0.6)
      wash(ctx, [
        [cx - ww / 2, cy - hh / 2],
        [cx + ww / 2, cy - hh / 2],
        [cx + ww / 2, cy + hh / 2],
        [cx - ww / 2, cy + hh / 2],
      ], rng, {
        color: plan.accent,
        layers: 5,
        alpha: attenue(VALEUR.ACCENT, distance) / 5,
        spread: 0.06,
        jitter: 0.1,
      })
    }
  }
}

/**
 * Une façade : la masse de pierre, son côté à l'ombre décidé par la lumière
 * de la scène, ses fenêtres, et une arête nette du côté éclairé.
 */
export function facade(
  ctx: CanvasRenderingContext2D,
  x: number,
  yTop: number,
  yBase: number,
  width: number,
  rng: () => number,
  plan: LightPlan,
  options: BuildingOptions,
): void {
  const { stone, shade, distance = 0, floors = 4, bays = 2 } = options
  const x0 = x - width / 2
  const x1 = x + width / 2
  const litFromLeft = Math.cos((plan.angleDeg * Math.PI) / 180) < 0

  wash(ctx, [
    [x0, yBase],
    [x0, yTop],
    [x1, yTop],
    [x1, yBase],
  ], rng, {
    color: stone,
    layers: 24,
    alpha: attenue(VALEUR.MOYEN, distance) / 24,
    spread: 0.025,
    jitter: 0.03,
  })

  // Le côté opposé à la lumière prend l'ombre — toujours du même côté pour
  // toute la scène, c'est ce qui fait tenir l'ensemble.
  const shadeFrom = litFromLeft ? x0 + width * 0.55 : x0
  const shadeTo = litFromLeft ? x1 : x0 + width * 0.45
  wash(ctx, [
    [shadeFrom, yBase],
    [shadeFrom, yTop],
    [shadeTo, yTop],
    [shadeTo, yBase],
  ], rng, {
    color: shade,
    layers: 12,
    alpha: attenue(VALEUR.OMBRE, distance) / 12,
    spread: 0.03,
    jitter: 0.04,
  })

  windows(ctx, x0, yTop, x1, yBase, floors, bays, rng, plan, distance)

  // L'arête éclairée, nette : le seul bord franc de la façade.
  const edgeX = litFromLeft ? x0 : x1
  dryStroke(ctx, [[edgeX, yTop], [edgeX, yBase]], 1.1, rng, {
    color: plan.accent,
    alpha: attenue(0.42, distance),
    layers: 2,
  })
}

/**
 * Une corniche : le trait horizontal qui coiffe une façade, avec son ombre
 * portée juste dessous. Court, mais c'est lui qui donne l'épaisseur de la
 * pierre.
 */
export function cornice(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  rng: () => number,
  plan: LightPlan,
  distance = 0,
): void {
  const x0 = x - width / 2
  const x1 = x + width / 2
  const t = width * 0.05
  wash(ctx, [
    [x0 - t, y],
    [x1 + t, y],
    [x1 + t, y + t],
    [x0 - t, y + t],
  ], rng, {
    color: plan.cool,
    layers: 10,
    alpha: attenue(VALEUR.OMBRE, distance) / 10,
    spread: 0.04,
    jitter: 0.05,
  })
  dryStroke(ctx, [[x0 - t, y], [x1 + t, y + (rng() - 0.5) * t * 0.4]], 1, rng, {
    color: plan.accent,
    alpha: attenue(0.36, distance),
    layers: 2,
  })
}

/**
 * Une arcade : la rangée d'arches qui donne son rythme à une façade
 * vénitienne. La répétition régulière mais jamais parfaite est exactement ce
 * qui manque à une forme unique, aussi bien peinte soit-elle.
 */
export function arcade(
  ctx: CanvasRenderingContext2D,
  x0: number,
  x1: number,
  yTop: number,
  yBase: number,
  count: number,
  rng: () => number,
  plan: LightPlan,
  distance = 0,
): void {
  const span = (x1 - x0) / count
  const radius = span * 0.34
  for (let i = 0; i < count; i += 1) {
    const cx = x0 + span * (i + 0.5)
    // Le sommet de l'arche se place depuis le HAUT de l'ouverture, pas
    // depuis un point flottant au milieu : une arche part du sol, monte
    // droit jusqu'à la naissance de la courbe, puis tourne. Sans les
    // montants, il ne reste qu'un pétale suspendu.
    const springline = yTop + (yBase - yTop) * 0.42
    const arch: Point[] = [[cx - radius, yBase], [cx - radius, springline]]
    for (let a = 0; a <= 10; a += 1) {
      const t = Math.PI - (a / 10) * Math.PI
      arch.push([cx + Math.cos(t) * radius, springline - Math.sin(t) * radius])
    }
    arch.push([cx + radius, yBase])
    wash(ctx, arch, rng, {
      color: plan.accent,
      layers: 10,
      alpha: attenue(VALEUR.ACCENT, distance) / 10,
      spread: 0.03,
      jitter: 0.045,
    })
  }
}

/**
 * Un toit à deux pentes, décalé : la pente et le débord sont ce qui
 * distingue un bâtiment d'un bloc. Un sommet pointu centré donne un crayon,
 * jamais une maison.
 */
export function pitchedRoof(
  ctx: CanvasRenderingContext2D,
  x: number,
  yEave: number,
  width: number,
  height: number,
  rng: () => number,
  plan: LightPlan,
  options: { color: string; distance?: number; lean?: number },
): void {
  const { color, distance = 0, lean = 0.15 } = options
  const x0 = x - width / 2
  const x1 = x + width / 2
  const ridgeX = x + width * lean
  const overhang = width * 0.08
  wash(ctx, [
    [x0 - overhang, yEave],
    [ridgeX, yEave - height],
    [x1 + overhang, yEave],
  ], rng, {
    color,
    layers: 18,
    alpha: attenue(VALEUR.OMBRE, distance) / 18,
    spread: 0.035,
    jitter: 0.045,
  })
  // L'arête du faîtage, nette et courte.
  dryStroke(ctx, [[x0 - overhang, yEave], [ridgeX, yEave - height]], 1.2, rng, {
    color: plan.accent,
    alpha: attenue(0.4, distance),
    layers: 2,
  })
}

/**
 * Un dôme sur son tambour : la silhouette qui signe une ville d'eau
 * méditerranéenne, et le contrepoint rond dont une skyline de verticales a
 * besoin.
 */
export function dome(
  ctx: CanvasRenderingContext2D,
  x: number,
  yBase: number,
  radius: number,
  rng: () => number,
  plan: LightPlan,
  options: { stone: string; shade: string; distance?: number },
): void {
  const { stone, shade, distance = 0 } = options
  const shell: Point[] = []
  for (let a = 0; a <= 14; a += 1) {
    const t = Math.PI + (a / 14) * Math.PI
    shell.push([x + Math.cos(t) * radius, yBase + Math.sin(t) * radius * 1.15])
  }
  shell.push([x + radius, yBase], [x - radius, yBase])
  wash(ctx, shell, rng, {
    color: stone,
    layers: 20,
    alpha: attenue(VALEUR.MOYEN, distance) / 20,
    spread: 0.04,
    jitter: 0.05,
  })
  // La moitié à l'ombre, du côté opposé à la lumière.
  const litFromLeft = Math.cos((plan.angleDeg * Math.PI) / 180) < 0
  const shadeSide: Point[] = []
  for (let a = 0; a <= 8; a += 1) {
    const t = litFromLeft ? Math.PI * 1.5 + (a / 8) * Math.PI * 0.5 : Math.PI + (a / 8) * Math.PI * 0.5
    shadeSide.push([x + Math.cos(t) * radius, yBase + Math.sin(t) * radius * 1.15])
  }
  shadeSide.push([x + (litFromLeft ? radius : -radius), yBase], [x, yBase])
  wash(ctx, shadeSide, rng, {
    color: shade,
    layers: 10,
    alpha: attenue(VALEUR.OMBRE, distance) / 10,
    spread: 0.05,
    jitter: 0.07,
  })
  // Le lanternon.
  dryStroke(ctx, [[x, yBase - radius * 1.15], [x, yBase - radius * 1.45]], radius * 0.16, rng, {
    color: plan.accent,
    alpha: attenue(0.4, distance),
    layers: 2,
  })
}

/**
 * Une masse de pierre texturée : hachures dans le sens de la façade, pour
 * qu'un grand mur d'ombre ne reste pas un aplat. C'est le geste visible du
 * pinceau sur les grandes surfaces.
 */
export function stoneTexture(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  rng: () => number,
  plan: LightPlan,
  distance = 0,
): void {
  // Des coulures fines et longues, pas des touches épaisses : `dryStroke`
  // effile ses deux bouts, donc une touche large et courte prend une forme
  // de feuille — sur un mur, ça se lit comme du feuillage collé à la façade.
  // Un rapport longueur/largeur d'au moins 20:1 la ramène à une trace d'eau.
  hatch(ctx, cx, cy, rx, ry, 90, Math.round(8 + (1 - distance) * 8), rng, {
    color: plan.cool,
    alpha: attenue(0.22, distance),
    layers: 2,
    length: ry * 0.85,
    width: rx * 0.035,
  })
}
