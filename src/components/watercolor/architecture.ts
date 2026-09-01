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
    spread: 0.025,
    jitter: 0.03,
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
    spread: 0.03,
    jitter: 0.05,
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
    spread: 0.03,
    jitter: 0.04,
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

  // Le sommet. Cassé, il se code en PALIERS — un segment horizontal à une
  // hauteur, une chute quasi verticale, un nouveau palier. Jamais une pente
  // continue : `wash()` repasse son flou fractal par-dessus le contour qu'on
  // lui donne, et une diagonale reprise par ce flou se courbe et se lit comme
  // un éclat de verre, pas comme une pierre rompue.
  const xg = x - radius * 0.82 + lean
  const xd = x + radius * 0.82 + lean
  const sommet: Point[] = []
  if (broken) {
    const paliers = 3
    const pas = (xd - xg) / paliers
    for (let i = 0; i < paliers; i += 1) {
      const yy = yTop + (rng() - 0.5) * radius * 0.85
      sommet.push([xg + pas * i, yy], [xg + pas * (i + 1), yy])
    }
  } else {
    sommet.push([xg, yTop], [xd, yTop])
  }

  // Le fût.
  wash(ctx, [[x - radius, yBase], ...sommet, [x + radius, yBase]], rng, {
    color: stone,
    layers: 18,
    alpha: attenue(VALEUR.MOYEN, distance) / 18,
    spread: 0.03,
    jitter: 0.04,
  })

  // LE MODELÉ — ce qui manquait le plus. Un fût est un cylindre : sans une
  // moitié ombrée, il reste un rectangle, et une rangée de rectangles se lit
  // comme des bâtiments. C'est ce dégradé, bien plus que la cannelure, qui
  // fait lire « colonne ». L'ombre tombe du côté opposé à la lumière, comme
  // partout ailleurs dans la scène.
  const ombreG = lit ? x + radius * 0.12 : x - radius
  const ombreD = lit ? x + radius : x - radius * 0.12
  wash(ctx, [
    [ombreG, yBase],
    [ombreG + lean * 0.8, yTop],
    [ombreD + lean * 0.8, yTop],
    [ombreD, yBase],
  ], rng, {
    color: shade,
    layers: 14,
    alpha: attenue(0.34, distance) / 14,
    spread: 0.04,
    jitter: 0.05,
  })

  // Les cannelures : trois traits, pas un. Une seule rainure se lit comme une
  // rayure accidentelle ; c'est leur RÉPÉTITION régulière qui dit la pierre
  // taillée. Elles s'arrêtent sous le chapiteau, jamais dedans.
  for (const t of [-0.42, 0, 0.42]) {
    const fx = x + radius * t
    dryStroke(ctx, [[fx, yBase - radius * 0.2], [fx + lean, yTop + radius * 0.25]], radius * 0.11, rng, {
      color: shade,
      alpha: attenue(0.26, distance),
      layers: 2,
    })
  }

  // La base : un bloc plus large au sol. Sans elle une colonne a l'air plantée
  // dans le sol comme un poteau ; avec elle, elle repose dessus.
  wash(ctx, [
    [x - radius * 1.24, yBase],
    [x - radius * 1.05, yBase - radius * 0.42],
    [x + radius * 1.05, yBase - radius * 0.42],
    [x + radius * 1.24, yBase],
  ], rng, {
    color: stone,
    layers: 10,
    alpha: attenue(VALEUR.CLAIR, distance) / 10,
    spread: 0.05,
    jitter: 0.06,
  })

  if (!broken) {
    // Le chapiteau en deux morceaux : l'échine évasée, puis l'abaque, la
    // dalle plate posée dessus. Un seul trapèze faisait un chapeau ; ce sont
    // les deux registres superposés qui font un chapiteau.
    wash(ctx, [
      [x - radius * 0.95, yTop],
      [x - radius * 1.2, yTop - radius * 0.4],
      [x + radius * 1.2, yTop - radius * 0.4],
      [x + radius * 0.95, yTop],
    ], rng, {
      color: stone,
      layers: 12,
      alpha: attenue(VALEUR.CLAIR, distance) / 12,
      spread: 0.05,
      jitter: 0.06,
    })
    wash(ctx, [
      [x - radius * 1.34, yTop - radius * 0.4],
      [x - radius * 1.34, yTop - radius * 0.72],
      [x + radius * 1.34, yTop - radius * 0.72],
      [x + radius * 1.34, yTop - radius * 0.4],
    ], rng, {
      color: stone,
      layers: 10,
      alpha: attenue(VALEUR.MOYEN, distance) / 10,
      spread: 0.03,
      jitter: 0.04,
    })
    dryStroke(ctx, [
      [x - radius * 1.34, yTop - radius * 0.72],
      [x + radius * 1.34, yTop - radius * 0.72],
    ], radius * 0.1, rng, { color: plan.accent, alpha: attenue(0.3, distance), layers: 2 })
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
