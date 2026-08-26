import { dryStroke, hatch, polygon, wash } from './engine'
import type { Point } from './engine'
import { VALEUR, attenue, litFromLeft } from './light'
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
  /**
   * Irrégularité de la silhouette et du bord. Les valeurs par défaut sont
   * volontairement très basses — une façade est maçonnée, elle doit rester
   * plus nette qu'un feuillage. Mais sur un mur très large elles rendent un
   * rectangle vectoriel : plus la masse est grande, plus il faut monter,
   * sinon le bord se lit comme un tracé au ruban adhésif.
   */
  spread?: number
  jitter?: number
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
  const { stone, shade, distance = 0, floors = 4, bays = 2, spread = 0.025, jitter = 0.03 } = options
  const x0 = x - width / 2
  const x1 = x + width / 2
  const lit = litFromLeft(plan)

  wash(ctx, [
    [x0, yBase],
    [x0, yTop],
    [x1, yTop],
    [x1, yBase],
  ], rng, {
    color: stone,
    layers: 24,
    alpha: attenue(VALEUR.MOYEN, distance) / 24,
    spread,
    jitter,
  })

  // La face au soleil se réchauffe. Une masse d'une seule teinte reste
  // plate quel que soit son modelé : c'est l'écart de température entre le
  // côté éclairé et le côté à l'ombre qui la fait tourner dans l'espace.
  const warmFrom = lit ? x0 : x0 + width * 0.5
  const warmTo = lit ? x0 + width * 0.5 : x1
  wash(ctx, [
    [warmFrom, yBase],
    [warmFrom, yTop],
    [warmTo, yTop],
    [warmTo, yBase],
  ], rng, {
    color: plan.warm,
    layers: 8,
    alpha: attenue(VALEUR.CLAIR, distance) / 8,
    // Les facteurs (1.2 et 5/3) reproduisent EXACTEMENT les anciennes
    // constantes en écrit (0.03 et 0.05) quand `spread`/`jitter` gardent
    // leurs valeurs par défaut : rendre ces réglages paramétrables ne
    // devait rien changer aux tableaux déjà validés.
    spread: spread * 1.2,
    jitter: (jitter * 5) / 3,
  })

  // Le côté opposé à la lumière prend l'ombre — toujours du même côté pour
  // toute la scène, c'est ce qui fait tenir l'ensemble.
  const shadeFrom = lit ? x0 + width * 0.55 : x0
  const shadeTo = lit ? x1 : x0 + width * 0.45
  wash(ctx, [
    [shadeFrom, yBase],
    [shadeFrom, yTop],
    [shadeTo, yTop],
    [shadeTo, yBase],
  ], rng, {
    color: shade,
    layers: 12,
    alpha: attenue(VALEUR.OMBRE, distance) / 12,
    spread: spread * 1.2,
    jitter: (jitter * 4) / 3,
  })

  windows(ctx, x0, yTop, x1, yBase, floors, bays, rng, plan, distance)

  // L'arête éclairée, nette : le seul bord franc de la façade.
  const edgeX = lit ? x0 : x1
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
  gapChance = 0,
): void {
  const span = (x1 - x0) / count
  const radius = span * 0.34
  for (let i = 0; i < count; i += 1) {
    // Une arche effondrée : le rythme casse net, comme une vraie colonnade
    // en ruine plutôt qu'une répétition parfaite.
    if (rng() < gapChance) continue
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
  const lit = litFromLeft(plan)
  const shadeSide: Point[] = []
  for (let a = 0; a <= 8; a += 1) {
    const t = lit ? Math.PI * 1.5 + (a / 8) * Math.PI * 0.5 : Math.PI + (a / 8) * Math.PI * 0.5
    shadeSide.push([x + Math.cos(t) * radius, yBase + Math.sin(t) * radius * 1.15])
  }
  shadeSide.push([x + (lit ? radius : -radius), yBase], [x, yBase])
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
 * Une façade en ruine : le sommet casse en une ligne irrégulière plutôt que
 * de finir par un toit ou une corniche nette, la pierre porte des traces de
 * mousse, et seul le pan le plus haut resté debout garde une arête franche.
 * Remplace `facade()` + `cornice()` + `pitchedRoof()` pour un bâtiment qui
 * doit se lire comme ancien et abandonné, pas seulement patiné — c'est
 * cette ligne de toit brisée, plus que n'importe quelle texture, qui fait
 * « ruine » au premier regard.
 */
export function ruinFacade(
  ctx: CanvasRenderingContext2D,
  x: number,
  yTop: number,
  yBase: number,
  width: number,
  rng: () => number,
  plan: LightPlan,
  options: BuildingOptions & { moss: string; decay?: number },
): void {
  const { stone, shade, moss, distance = 0, floors = 2, bays = 2, decay = 0.5 } = options
  const x0 = x - width / 2
  const x1 = x + width / 2
  const lit = litFromLeft(plan)

  // Quelques pans qui ont tenu, séparés de brèches où l'étage a disparu.
  // La pierre casse en PLATEAUX reliés par des chutes quasi verticales,
  // jamais en pente continue : une rampe qui monte en diagonale, une fois
  // reprise par le flou fractal de `wash()`, se lit comme un pic de
  // montagne ou un éclat de verre — le premier essai de cette fonction
  // faisait exactement ça. Peu de pans larges plutôt que beaucoup de dents
  // : à cette échelle, une silhouette lisible bat une silhouette agitée.
  const segments = 3 + Math.floor(rng() * 2)
  const heights: number[] = []
  for (let s = 0; s < segments; s += 1) {
    const collapsed = rng() < 0.4
    heights.push(collapsed ? 0.42 + rng() * decay : 0.05 + rng() * 0.14)
  }
  // Le tirage peut, par malchance, donner des hauteurs toutes proches — sur
  // un bâtiment étroit ça s'est produit et le sommet rendu était une ligne
  // parfaitement droite, sans aucune brisure visible. On garantit donc un
  // écart minimum entre le pan le plus haut et le plus bas, quel que soit
  // le tirage : la ruine doit se voir à chaque rendu, pas selon la chance.
  if (Math.max(...heights) - Math.min(...heights) < 0.22) {
    heights[Math.floor(rng() * heights.length)] += 0.22
  }
  const edge: Point[] = []
  let topSum = 0
  let cursor = x0
  for (let s = 0; s < segments; s += 1) {
    const nx = s === segments - 1 ? x1 : cursor + width / segments
    const ty = yTop + Math.min(0.95, heights[s]) * (yBase - yTop)
    edge.push([cursor, ty], [nx, ty])
    topSum += ty * 2
    cursor = nx
  }
  const topAvg = topSum / edge.length
  const mid = Math.floor(edge.length / 2)

  wash(ctx, [[x0, yBase], ...edge, [x1, yBase]], rng, {
    color: stone,
    layers: 24,
    alpha: attenue(VALEUR.MOYEN, distance) / 24,
    spread: 0.03,
    jitter: 0.035,
  })

  // Warm/shade suivent la même ligne brisée que la pierre, jamais un
  // rectangle plein : en `multiply` rien n'occulte rien, un aplat qui
  // remonte au-dessus de la brèche traverserait visiblement le ciel.
  const warmSlice = lit ? edge.slice(0, mid + 1) : edge.slice(mid)
  const warmBase: Point[] = lit
    ? [[x0, yBase], ...warmSlice, [warmSlice[warmSlice.length - 1][0], yBase]]
    : [[warmSlice[0][0], yBase], ...warmSlice, [x1, yBase]]
  wash(ctx, warmBase, rng, {
    color: plan.warm,
    layers: 8,
    alpha: attenue(VALEUR.CLAIR, distance) / 8,
    spread: 0.03,
    jitter: 0.05,
  })

  const shadeSlice = lit ? edge.slice(mid) : edge.slice(0, mid + 1)
  const shadeBase: Point[] = lit
    ? [[shadeSlice[0][0], yBase], ...shadeSlice, [x1, yBase]]
    : [[x0, yBase], ...shadeSlice, [shadeSlice[shadeSlice.length - 1][0], yBase]]
  wash(ctx, shadeBase, rng, {
    color: shade,
    layers: 12,
    alpha: attenue(VALEUR.OMBRE, distance) / 12,
    spread: 0.03,
    jitter: 0.04,
  })

  // Les fenêtres restent dans le mur encore debout, sous la moyenne du
  // sommet brisé — au-dessus, il n'y a plus de mur où en percer.
  windows(ctx, x0, topAvg, x1, yBase, floors, bays, rng, plan, distance)

  // La mousse : quelques traces vertes dans les creux, jamais sur tout le
  // mur — même ratio longueur/largeur que `stoneTexture`, pour rester une
  // variation de la pierre et non des griffures.
  const ry = (yBase - topAvg) * 0.4
  const rx = width * 0.46
  hatch(ctx, x, (topAvg + yBase) / 2, rx, ry, 95, Math.round(3 + (1 - distance) * 4), rng, {
    color: moss,
    alpha: attenue(0.1, distance),
    layers: 1,
    length: ry * 0.7,
    width: rx * 0.09,
  })

  // Le seul bord franc : le pan le plus haut resté debout côté lumière —
  // le reste du mur reste tacite, rongé, sans arête.
  const edgeX = lit ? edge[0][0] : edge[edge.length - 1][0]
  const edgeTopY = lit ? edge[0][1] : edge[edge.length - 1][1]
  dryStroke(ctx, [[edgeX, edgeTopY], [edgeX, yBase]], 1.1, rng, {
    color: plan.accent,
    alpha: attenue(0.4, distance),
    layers: 2,
  })
}

/**
 * Une colonne : le signe le plus reconnaissable d'une ruine antique, plus
 * encore qu'un mur cassé. Un fût simple, une cannelure suggérée par un seul
 * trait, un chapiteau plus large en couronnement — sauf si `broken`, où le
 * fût s'arrête net sur une cassure penchée et rien ne le coiffe. Sans
 * colonnes, une ville en ruine reste un empilement de murs quelconque ; ce
 * sont elles qui disent « antique » au premier regard.
 */
export function column(
  ctx: CanvasRenderingContext2D,
  x: number,
  yBase: number,
  height: number,
  radius: number,
  rng: () => number,
  plan: LightPlan,
  options: { stone: string; shade: string; distance?: number; broken?: boolean },
): void {
  const { stone, shade, distance = 0, broken = false } = options
  const lit = litFromLeft(plan)
  const yTop = broken ? yBase - height * (0.3 + rng() * 0.4) : yBase - height
  // Une colonne cassée penche légèrement — une cassure parfaitement
  // verticale a l'air dessinée à la règle, pas rompue par le temps.
  const lean = broken ? (rng() - 0.5) * radius * 1.6 : 0

  wash(ctx, [
    [x - radius, yBase],
    [x - radius * 0.82 + lean, yTop],
    [x + radius * 0.82 + lean, yTop],
    [x + radius, yBase],
  ], rng, {
    color: stone,
    layers: 18,
    alpha: attenue(VALEUR.MOYEN, distance) / 18,
    spread: 0.03,
    jitter: 0.04,
  })

  // La cannelure : un seul trait ombré qui court le long du fût, côté
  // ombre — sans lui, un fût reste un rectangle quelconque, indissociable
  // d'un simple pilier.
  const fluteX = lit ? x + radius * 0.28 : x - radius * 0.28
  dryStroke(ctx, [[fluteX, yBase], [fluteX + lean, yTop]], radius * 0.16, rng, {
    color: shade,
    alpha: attenue(0.3, distance),
    layers: 2,
  })

  if (!broken) {
    // Le chapiteau : le seul bloc plus large que le fût, repère net qui
    // couronne la colonne.
    wash(ctx, [
      [x - radius * 1.3, yTop],
      [x - radius * 1.05, yTop - radius * 0.55],
      [x + radius * 1.05, yTop - radius * 0.55],
      [x + radius * 1.3, yTop],
    ], rng, {
      color: stone,
      layers: 12,
      alpha: attenue(VALEUR.CLAIR, distance) / 12,
      spread: 0.06,
      jitter: 0.07,
    })
  }

  // L'arête éclairée, nette, comme sur une façade.
  const edgeX = lit ? x - radius * 0.82 : x + radius * 0.82
  dryStroke(ctx, [[edgeX, yBase], [edgeX + lean, yTop]], 1, rng, {
    color: plan.accent,
    alpha: attenue(0.35, distance),
    layers: 2,
  })
}

/**
 * Un fronton : le triangle qui coiffe une façade de temple, porté par des
 * colonnes. Avec `column()`, le repère le plus univoque de l'Antiquité
 * gréco-romaine — la silhouette « colonnes + triangle » ne se lit comme
 * rien d'autre, pas même une colonnade isolée. `x`/`width` doivent couvrir
 * les colonnes qui le portent (avec une petite marge), `yBase` leur sommet
 * — chapiteau compris, pas le haut du fût nu, sans quoi le triangle
 * flotte au-dessus d'un vide entre lui et les colonnes.
 */
export function pediment(
  ctx: CanvasRenderingContext2D,
  x: number,
  yBase: number,
  width: number,
  height: number,
  rng: () => number,
  plan: LightPlan,
  options: { stone: string; shade: string; distance?: number },
): void {
  const { stone, shade, distance = 0 } = options
  const lit = litFromLeft(plan)
  const x0 = x - width / 2
  const x1 = x + width / 2
  const apexY = yBase - height

  wash(ctx, [[x0, yBase], [x, apexY], [x1, yBase]], rng, {
    color: stone,
    layers: 20,
    alpha: attenue(VALEUR.MOYEN, distance) / 20,
    spread: 0.035,
    jitter: 0.045,
  })

  // Face éclairée / à l'ombre, coupées à la pointe du triangle — jamais un
  // rectangle qui déborderait du triangle en `multiply` (le piège déjà
  // documenté pour `ruinFacade` : une masse doit rester confinée à sa
  // silhouette, jamais un aplat indépendant posé par-dessus).
  const warmTri: Point[] = lit ? [[x0, yBase], [x, apexY], [x, yBase]] : [[x, yBase], [x, apexY], [x1, yBase]]
  wash(ctx, warmTri, rng, {
    color: plan.warm,
    layers: 8,
    alpha: attenue(VALEUR.CLAIR, distance) / 8,
    spread: 0.03,
    jitter: 0.05,
  })
  const shadeTri: Point[] = lit ? [[x, yBase], [x, apexY], [x1, yBase]] : [[x0, yBase], [x, apexY], [x, yBase]]
  wash(ctx, shadeTri, rng, {
    color: shade,
    layers: 12,
    alpha: attenue(VALEUR.OMBRE, distance) / 12,
    spread: 0.03,
    jitter: 0.04,
  })

  // La corniche horizontale à la base du fronton, comme `cornice()` mais
  // sans son propre lavis d'ombre — c'est elle qui sépare visuellement le
  // triangle des colonnes qu'il coiffe, sans quoi les deux masses se
  // fondent en une seule forme confuse.
  dryStroke(ctx, [[x0, yBase], [x1, yBase + height * 0.02]], height * 0.09, rng, {
    color: plan.accent,
    alpha: attenue(0.34, distance),
    layers: 2,
  })

  // L'arête éclairée, du sommet à la base du côté lit — le seul bord franc.
  const edgeX = lit ? x0 : x1
  dryStroke(ctx, [[x, apexY], [edgeX, yBase]], 1, rng, {
    color: plan.accent,
    alpha: attenue(0.38, distance),
    layers: 2,
  })
}

/**
 * Un tambour de colonne effondré, couché au sol : ce qu'il reste d'une
 * colonne tombée. Toujours plusieurs disques légèrement disjoints, jamais
 * un seul bloc long — une colonne qui tombe se brise à ses jointures, elle
 * ne reste pas entière.
 */
export function fallenColumn(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  length: number,
  radius: number,
  rng: () => number,
  plan: LightPlan,
  options: { stone: string; shade: string; distance?: number },
): void {
  const { stone, shade, distance = 0 } = options
  const drums = 2 + Math.floor(rng() * 2)
  let cursor = x - length / 2
  for (let d = 0; d < drums; d += 1) {
    const dw = (length / drums) * (0.75 + rng() * 0.25)
    const cx = cursor + dw / 2
    wash(ctx, polygon(cx, y - radius * 0.25, dw * 0.48, radius * 0.75, 10, 0, rng), rng, {
      color: stone,
      layers: 16,
      alpha: attenue(VALEUR.MOYEN, distance) / 16,
      spread: 0.05,
      jitter: 0.06,
    })
    // L'ombre courte au sol, du côté opposé à la lumière — c'est elle qui
    // pose le tambour au sol plutôt que de le laisser flotter.
    const lit = litFromLeft(plan)
    const shadowShift = lit ? dw * 0.12 : -dw * 0.12
    wash(ctx, polygon(cx + shadowShift, y + radius * 0.1, dw * 0.42, radius * 0.22, 8, 0, rng), rng, {
      color: shade,
      layers: 8,
      alpha: attenue(VALEUR.OMBRE, distance) / 8,
      spread: 0.1,
      jitter: 0.1,
    })
    cursor += dw + radius * 0.4
  }
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
  // Mais trop fines et trop contrastées, elles basculent dans l'autre excès
  // et rayent la façade comme des griffures : la coulure doit rester une
  // variation de la pierre, pas un trait posé dessus.
  hatch(ctx, cx, cy, rx, ry, 90, Math.round(5 + (1 - distance) * 5), rng, {
    color: plan.cool,
    alpha: attenue(0.09, distance),
    layers: 1,
    length: ry * 0.7,
    width: rx * 0.09,
  })
}

/**
 * Une balustrade couronnée de statues : la ligne de toit d'un palais
 * classique.
 *
 * C'est le repère qui oppose un palais à un château fort, et il est
 * étonnamment sûr à cette échelle. Un château fort se lit à ses tours,
 * c'est-à-dire à des VERTICALES qui cassent la silhouette ; un palais du
 * Grand Siècle se lit à l'inverse, à une ligne de toit presque
 * parfaitement HORIZONTALE, hérissée d'une frise de petits points
 * réguliers — les balustres — et ponctuée de quelques statues. Deux
 * dizaines de pixels de haut suffisent : c'est le rythme qui informe, pas
 * le détail de la pierre.
 *
 * `y` est l'assise, c'est-à-dire le sommet du mur qu'elle couronne : la
 * balustrade se construit AU-DESSUS, vers les valeurs de `y` décroissantes.
 */
export function balustrade(
  ctx: CanvasRenderingContext2D,
  x0: number,
  x1: number,
  y: number,
  height: number,
  rng: () => number,
  plan: LightPlan,
  options: { stone: string; shade: string; distance?: number; statues?: number },
): void {
  const { stone, shade, distance = 0, statues = 0 } = options
  const yTop = y - height

  // Les deux lisses, haute et basse. La haute est le seul trait vraiment
  // franc : c'est elle qui donne l'horizontale tendue du bâtiment, et une
  // horizontale nette vaut plus, à cette taille, que tous les balustres
  // réunis.
  dryStroke(ctx, [[x0, y], [x1, y + (rng() - 0.5) * height * 0.15]], Math.max(0.8, height * 0.16), rng, {
    color: shade,
    alpha: attenue(0.3, distance),
    layers: 2,
  })
  dryStroke(ctx, [[x0, yTop], [x1, yTop + (rng() - 0.5) * height * 0.12]], Math.max(0.8, height * 0.14), rng, {
    color: plan.accent,
    alpha: attenue(0.34, distance),
    layers: 2,
  })

  // Les balustres : de petits fûts serrés entre les deux lisses. Leur
  // largeur est celle du vide qui les sépare, sinon la frise vire soit au
  // pointillé maigre, soit au bandeau plein.
  const pitch = Math.max(2.2, height * 0.85)
  const count = Math.max(3, Math.round((x1 - x0) / pitch))
  const step = (x1 - x0) / count
  for (let i = 0; i < count; i += 1) {
    const bx = x0 + step * (i + 0.5) + (rng() - 0.5) * step * 0.14
    dryStroke(ctx, [[bx, y - height * 0.12], [bx, yTop + height * 0.12]], step * 0.42, rng, {
      color: stone,
      alpha: attenue(0.34, distance),
      layers: 2,
      jitter: 0.08,
    })
  }

  // Les statues : quelques silhouettes debout sur la lisse, à intervalle
  // régulier. Volontairement sans bras ni tête distincts — à cette
  // échelle, une masse étroite deux fois plus haute que la balustrade
  // suffit à faire « statue », et tenter mieux ne produirait que du bruit.
  for (let s = 0; s < statues; s += 1) {
    const sx = x0 + ((x1 - x0) * (s + 0.5)) / statues
    // Trapue plutôt qu'élancée : une silhouette étroite et haute sort en
    // aiguille — une antenne sur le toit, pas une statue. Un vase ou un
    // trophée de couronnement est large d'au moins un tiers de sa hauteur.
    const sh = height * (1.2 + rng() * 0.4)
    wash(ctx, [
      [sx - height * 0.3, yTop],
      [sx - height * 0.26, yTop - sh * 0.55],
      [sx, yTop - sh],
      [sx + height * 0.26, yTop - sh * 0.55],
      [sx + height * 0.3, yTop],
    ], rng, {
      color: shade,
      layers: 10,
      alpha: attenue(0.52, distance) / 10,
      spread: 0.12,
      jitter: 0.16,
    })
  }
}

/**
 * Un crénelage : la rangée de merlons qui couronne un mur ou une tour.
 *
 * C'est LE signe du château fort, et le contrepoint exact de
 * `balustrade()` : les deux couronnent un mur, mais l'une hérisse une
 * ligne de toit de petites verticales pleines et régulières (défendre),
 * l'autre l'ajoure de petits vides (paraître). À l'échelle d'une vignette,
 * c'est cette différence de dentelure — pleine contre ajourée — qui décide
 * si le bâtiment se lit comme une forteresse ou comme un palais, bien
 * avant la couleur de sa pierre.
 *
 * `y` est le chemin de ronde, c'est-à-dire le haut du mur : les merlons se
 * construisent AU-DESSUS, vers les `y` décroissants.
 */
export function battlement(
  ctx: CanvasRenderingContext2D,
  x0: number,
  x1: number,
  y: number,
  height: number,
  rng: () => number,
  plan: LightPlan,
  options: { stone: string; shade: string; distance?: number },
): void {
  const { stone, shade, distance = 0 } = options
  const lit = litFromLeft(plan)
  // Le pas : un merlon plein pour un vide d'à peu près la même largeur.
  // Serrer davantage donne un peigne illisible, espacer donne une rangée
  // de bornes.
  const pas = Math.max(2.4, height * 1.5)
  const count = Math.max(2, Math.round((x1 - x0) / pas))
  const step = (x1 - x0) / count

  for (let i = 0; i < count; i += 1) {
    const mx0 = x0 + step * (i + 0.1)
    const mx1 = x0 + step * (i + 0.68)
    wash(ctx, [
      [mx0, y],
      [mx0, y - height],
      [mx1, y - height],
      [mx1, y],
    ], rng, {
      color: stone,
      layers: 12,
      alpha: attenue(0.55, distance) / 12,
      spread: 0.05,
      jitter: 0.09,
    })
    // Le flanc à l'ombre de chaque merlon : sans lui, la rangée est un
    // aplat découpé, et les créneaux disparaissent dès que le mur derrière
    // eux a la même valeur.
    const ox0 = lit ? mx1 - (mx1 - mx0) * 0.4 : mx0
    const ox1 = lit ? mx1 : mx0 + (mx1 - mx0) * 0.4
    wash(ctx, [
      [ox0, y],
      [ox0, y - height],
      [ox1, y - height],
      [ox1, y],
    ], rng, {
      color: shade,
      layers: 8,
      alpha: attenue(0.4, distance) / 8,
      spread: 0.06,
      jitter: 0.1,
    })
  }

  // Le chemin de ronde : la seule horizontale franche de l'ensemble, celle
  // qui pose les merlons sur un mur au lieu de les laisser flotter.
  dryStroke(ctx, [[x0, y], [x1, y + (rng() - 0.5) * height * 0.12]], Math.max(0.8, height * 0.16), rng, {
    color: plan.accent,
    alpha: attenue(0.36, distance),
    layers: 2,
  })
}

/**
 * Une tour ronde, couronnée soit de créneaux, soit d'un toit en poivrière.
 *
 * Ce qui fait « ronde » à cette échelle n'est pas la silhouette — de face,
 * un cylindre est un rectangle — mais **le modelé** : une bande d'ombre
 * qui court sur toute la hauteur du côté opposé à la lumière, et qui
 * s'arrête avant le bord. Sans elle, la tour est un pilier carré ; avec
 * elle, l'œil la fait tourner tout seul.
 *
 * Les meurtrières remplacent les fenêtres : hautes, étroites, rarissimes.
 * Une tour percée d'une grille de fenêtres n'est plus défensive.
 */
export function roundTower(
  ctx: CanvasRenderingContext2D,
  x: number,
  yTop: number,
  yBase: number,
  radius: number,
  rng: () => number,
  plan: LightPlan,
  options: {
    stone: string
    shade: string
    /** Toit de la tour. `poivriere` = le cône pointu ; `creneaux` = plate-forme crénelée. */
    roof: 'poivriere' | 'creneaux'
    /** Couleur des ardoises, pour une poivrière. */
    roofColor?: string
    distance?: number
    slits?: number
  },
): void {
  const { stone, shade, roof, roofColor = shade, distance = 0, slits = 2 } = options
  const lit = litFromLeft(plan)
  const x0 = x - radius
  const x1 = x + radius

  wash(ctx, [[x0, yBase], [x0, yTop], [x1, yTop], [x1, yBase]], rng, {
    color: stone,
    layers: 22,
    alpha: attenue(VALEUR.MOYEN, distance) / 22,
    spread: 0.03,
    jitter: 0.07,
  })

  // Le modelé cylindrique : l'ombre ne touche pas le bord de la tour, elle
  // s'arrête à ~90 % — c'est ce liseré clair rattrapé sur l'arête qui fait
  // le tournant du volume. Une ombre poussée jusqu'au bord aplatit tout.
  const sFrom = lit ? x + radius * 0.15 : x - radius * 0.9
  const sTo = lit ? x + radius * 0.9 : x - radius * 0.15
  wash(ctx, [[sFrom, yBase], [sFrom, yTop], [sTo, yTop], [sTo, yBase]], rng, {
    color: shade,
    layers: 14,
    alpha: attenue(VALEUR.OMBRE, distance) / 14,
    spread: 0.04,
    jitter: 0.1,
  })

  for (let i = 0; i < slits; i += 1) {
    const sy = yTop + (yBase - yTop) * (0.34 + i * 0.26)
    dryStroke(ctx, [[x - radius * 0.1, sy], [x - radius * 0.1, sy + (yBase - yTop) * 0.13]], radius * 0.22, rng, {
      color: plan.accent,
      alpha: attenue(0.55, distance),
      layers: 2,
      jitter: 0.06,
    })
  }

  if (roof === 'creneaux') {
    battlement(ctx, x0 - radius * 0.12, x1 + radius * 0.12, yTop, radius * 0.75, rng, plan, {
      stone,
      shade,
      distance,
    })
    return
  }

  // La poivrière : un cône franc, et son débord. Le débord compte autant
  // que la pointe — un cône posé pile sur le diamètre de la tour se lit
  // comme un capuchon collé, alors qu'un toit médiéval déborde toujours.
  const debord = radius * 0.34
  const hauteur = radius * 1.9
  wash(ctx, [
    [x0 - debord, yTop],
    [x, yTop - hauteur],
    [x1 + debord, yTop],
  ], rng, {
    color: roofColor,
    layers: 20,
    alpha: attenue(0.7, distance) / 20,
    spread: 0.055,
    jitter: 0.13,
  })
  // Le versant à l'ombre, découpé DANS le triangle et jamais à côté : en
  // `multiply`, un aplat qui dépasse du toit reste visible dans le ciel.
  const versant: Point[] = lit
    ? [[x, yTop - hauteur], [x1 + debord, yTop], [x, yTop]]
    : [[x, yTop - hauteur], [x0 - debord, yTop], [x, yTop]]
  wash(ctx, versant, rng, {
    color: shade,
    layers: 10,
    alpha: attenue(0.34, distance) / 10,
    spread: 0.05,
    jitter: 0.1,
  })
  dryStroke(ctx, [[x0 - debord, yTop], [x1 + debord, yTop]], Math.max(0.7, radius * 0.14), rng, {
    color: plan.accent,
    alpha: attenue(0.34, distance),
    layers: 2,
  })
}

/**
 * Une bannière au bout d'une hampe : le mât, et un fanion triangulaire qui
 * flotte du côté opposé à la lumière.
 *
 * Minuscule, et pourtant l'élément le plus rentable d'un château fort. Une
 * silhouette de forteresse reste ambiguë (une prison ? un silo ?) jusqu'à
 * ce qu'un fanion la date. C'est aussi la seule tache franchement colorée
 * qu'on s'autorise dans une masse de pierre : elle attire l'œil au sommet
 * du donjon, c'est-à-dire exactement où il faut.
 */
export function banner(
  ctx: CanvasRenderingContext2D,
  x: number,
  yBase: number,
  height: number,
  rng: () => number,
  plan: LightPlan,
  options: { cloth: string; distance?: number },
): void {
  const { cloth, distance = 0 } = options
  const sens = litFromLeft(plan) ? 1 : -1
  const yTop = yBase - height
  dryStroke(ctx, [[x, yBase], [x, yTop]], Math.max(0.6, height * 0.06), rng, {
    color: plan.accent,
    alpha: attenue(0.5, distance),
    layers: 2,
  })
  wash(ctx, [
    [x, yTop],
    [x + sens * height * 0.62, yTop + height * 0.16],
    [x + sens * height * 0.44, yTop + height * 0.2],
    [x + sens * height * 0.6, yTop + height * 0.36],
    [x, yTop + height * 0.34],
  ], rng, {
    color: cloth,
    layers: 14,
    alpha: attenue(0.62, distance) / 14,
    spread: 0.07,
    jitter: 0.12,
  })
}
