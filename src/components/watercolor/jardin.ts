import { dryStroke, flecks, polygon, wash } from './engine'
import type { Point } from './engine'
import { attenue, litFromLeft } from './light'
import type { LightPlan } from './light'

/**
 * Le vocabulaire du jardin à la française.
 *
 * Pourquoi ça existe : `architecture.ts` sait peindre un bâtiment, pas ce
 * qu'il y a devant. Or un jardin à la française ne se lit pas à sa
 * végétation — une masse verte reste une tache, quelle que soit sa
 * texture — mais à sa **géométrie** : des parterres rectangulaires posés
 * en miroir de part et d'autre d'un axe, des ifs taillés en cônes répétés
 * à intervalle régulier, un bassin parfaitement elliptique. C'est la
 * régularité qui dit « jardin dessiné par un homme », par opposition à
 * n'importe quel bosquet.
 *
 * Conséquence sur le style : ici, contrairement au reste du moteur, la
 * répétition presque parfaite est un atout et non un défaut. On ne casse
 * le rythme qu'à la marge, juste assez pour que le pinceau reste visible.
 */

/** Un quadrilatère en perspective : coin haut-gauche, haut-droit, bas-droit, bas-gauche. */
export type Quad = [Point, Point, Point, Point]

/**
 * Un point à l'intérieur d'un quadrilatère, en coordonnées relatives
 * (`u` de gauche à droite, `v` de haut en bas). Interpoler dans le quad
 * plutôt que de calculer un rectangle est ce qui garde les plates-bandes
 * DANS la perspective du parterre : un rectangle inscrit à la main aurait
 * des bords parallèles, et trahirait aussitôt le plan couché en un plan
 * vertical.
 */
function inQuad(quad: Quad, u: number, v: number): Point {
  const [tl, tr, br, bl] = quad
  const topX = tl[0] + (tr[0] - tl[0]) * u
  const topY = tl[1] + (tr[1] - tl[1]) * u
  const botX = bl[0] + (br[0] - bl[0]) * u
  const botY = bl[1] + (br[1] - bl[1]) * u
  return [topX + (botX - topX) * v, topY + (botY - topY) * v]
}

function subQuad(quad: Quad, u0: number, u1: number, v0: number, v1: number): Quad {
  return [
    inQuad(quad, u0, v0),
    inQuad(quad, u1, v0),
    inQuad(quad, u1, v1),
    inQuad(quad, u0, v1),
  ]
}

export interface ParterreOptions {
  /** Le sable clair des allées qui séparent les plates-bandes. */
  sand: string
  /** Le vert des plates-bandes elles-mêmes. */
  green: string
  /** L'ombre au pied des bordures. */
  shade: string
  /** 0 = premier plan, 1 = horizon. */
  distance?: number
  /** Plates-bandes en largeur puis en profondeur. 2 × 2 suffit à la lecture. */
  cols?: number
  rows?: number
}

/**
 * Un parterre : le sable clair d'abord, les plates-bandes vertes ensuite,
 * en retrait — jamais l'inverse.
 *
 * C'est le point qui décide de tout : un parterre peint en vert avec des
 * allées claires par-dessus ne marche pas, parce qu'en `multiply` un ton
 * clair posé sur un ton sombre ne l'éclaircit pas (le même plafond que le
 * highlight des nuages, documenté dans `atmosphere.ts`). Il faut donc
 * réserver le sable, c'est-à-dire poser le clair en premier et NE PAS
 * peindre par-dessus là où l'allée passe. La grille claire qui en résulte
 * est exactement ce qui fait lire « jardin à la française » plutôt que
 * « pelouse ».
 */
export function parterre(
  ctx: CanvasRenderingContext2D,
  quad: Quad,
  rng: () => number,
  plan: LightPlan,
  options: ParterreOptions,
): void {
  const { sand, green, shade, distance = 0, cols = 2, rows = 2 } = options

  // Le sol de sable : très pâle, il ne doit surtout pas rivaliser avec le
  // vert des plates-bandes — c'est le fond sur lequel la géométrie se
  // découpe, pas un élément à part entière.
  wash(ctx, quad, rng, {
    color: sand,
    layers: 14,
    alpha: attenue(0.1, distance) / 14,
    spread: 0.05,
    jitter: 0.07,
  })

  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      // Le retrait (0.1 de chaque côté) EST l'allée. Il se calcule en
      // coordonnées du quad, donc il rétrécit avec la perspective comme
      // tout le reste — une allée de largeur constante en pixels
      // redresserait le plan.
      const bed = subQuad(quad, (c + 0.1) / cols, (c + 0.9) / cols, (r + 0.12) / rows, (r + 0.88) / rows)
      // `spread`/`jitter` bien plus hauts que ne le suggère la géométrie
      // du jardin : une plate-bande est taillée au cordeau, mais un bord
      // parfaitement droit sort du moteur en aplat vectoriel — le défaut
      // qui a fait rater la première version de ce tableau. La régularité
      // se lit dans l'ALIGNEMENT des plates-bandes entre elles, jamais
      // dans la netteté de chacune.
      wash(ctx, bed, rng, {
        color: green,
        layers: 20,
        // Le rang le plus proche du spectateur porte plus de pigment :
        // sans cet écart, quatre plates-bandes de valeur identique
        // redressent le plan couché en un damier vertical.
        alpha: (attenue(0.92, distance) * (1 + r * 0.1)) / 20,
        spread: 0.11,
        jitter: 0.26,
      })
      // La granulation : sans elle, une plate-bande de cette taille reste
      // un aplat mort quelle que soit la finesse de son bord.
      const centre = inQuad(bed, 0.5, 0.5)
      const demiL = Math.abs(bed[1][0] - bed[0][0]) * 0.34
      const demiH = Math.abs(bed[3][1] - bed[0][1]) * 0.34
      flecks(ctx, centre[0], centre[1], demiL, demiH, 3, rng, {
        color: green,
        layers: 4,
        alpha: attenue(0.03, distance),
        spread: 0.3,
        jitter: 0.24,
      })
      // La bordure basse, du côté qui regarde le spectateur : le seul
      // bord franc de la plate-bande. Sans lui, deux plates-bandes
      // voisines se fondent en une seule masse dès que le sable qui les
      // sépare passe sous le seuil de visibilité.
      dryStroke(ctx, [bed[3], bed[2]], Math.max(0.7, (bed[2][0] - bed[3][0]) * 0.012), rng, {
        color: shade,
        alpha: attenue(0.34, distance),
        layers: 2,
      })
      // L'ombre que la bordure porte sur le sable, du côté opposé à la
      // lumière : un mince liseré le long du flanc à l'ombre. C'est ce
      // qui empêche les plates-bandes de paraître peintes à plat sur le
      // sol plutôt que plantées dedans — et ça les soumet au plan de
      // lumière de la scène comme n'importe quel volume.
      const dark = litFromLeft(plan) ? [bed[1], bed[2]] : [bed[0], bed[3]]
      dryStroke(ctx, dark, Math.max(0.6, (bed[2][0] - bed[3][0]) * 0.02), rng, {
        color: plan.cool,
        alpha: attenue(0.2, distance),
        layers: 1,
      })

    }
  }
}

export interface TopiaireOptions {
  green: string
  shade: string
  distance?: number
  /**
   * Multiplicateur de densité du pigment. `distance` éclaircit par
   * perspective aérienne ; `weight` sert à autre chose — décider qu'un if
   * est le point le plus SOMBRE du tableau. Un repoussoir de premier plan
   * a besoin des deux : distance nulle ET pigment chargé, sinon il reste
   * dans la même valeur que le reste et la perspective retombe à plat.
   */
  weight?: number
}

/**
 * Un if taillé en cône. Le signe le plus économique du jardin à la
 * française : répété le long d'une allée, à intervalle régulier et en
 * tailles décroissantes, il donne d'un seul coup la géométrie ET la
 * profondeur — un objet de taille connue posé à plusieurs distances est
 * le seul indice qui couche un plan (voir `ripples()` pour la même idée
 * appliquée à l'eau).
 *
 * Le sommet reste **émoussé** (le facteur `0.08` dans la largeur) : une
 * pointe franche, reprise par le flou fractal de `wash()`, se lit comme
 * un crayon ou un cyprès sauvage — pas comme un if taillé au sécateur.
 */
export function topiaire(
  ctx: CanvasRenderingContext2D,
  x: number,
  yBase: number,
  height: number,
  rng: () => number,
  plan: LightPlan,
  options: TopiaireOptions,
): void {
  const { green, shade, distance = 0, weight = 1 } = options
  const lit = litFromLeft(plan)
  const radius = height * 0.35

  const steps = 6
  const left: Point[] = []
  const right: Point[] = []
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps
    const w = radius * ((1 - t) ** 0.8 * 0.86 + 0.14) * (1 + (rng() - 0.5) * 0.26)
    const y = yBase - height * t
    left.push([x - w, y])
    right.push([x + w, y])
  }
  const cone: Point[] = [...left, ...right.reverse()]

  // L'ombre portée au sol, posée AVANT le cône : elle part du pied et
  // s'étire à l'opposé de la lumière. C'est elle qui pose l'if sur le
  // sable au lieu de le laisser flotter — même rôle que l'ombre des
  // tambours de `fallenColumn()`.
  // Elle part des points MÊMES du pied du cône et s'étire à l'opposé de
  // la lumière — jamais une ellipse indépendante posée à côté, qui
  // atterrit toujours un peu décalée et se lit comme un losange qui flotte
  // sous l'arbre (le défaut relevé sur la première version).
  const shadowShift = lit ? radius * 2 : -radius * 2
  wash(ctx, [
    [x - radius, yBase - radius * 0.12],
    [x + radius, yBase - radius * 0.12],
    [x + radius + shadowShift, yBase + radius * 0.3],
    [x - radius * 0.4 + shadowShift, yBase + radius * 0.36],
  ], rng, {
    color: plan.cool,
    layers: 9,
    alpha: (attenue(0.3, distance) * weight) / 9,
    spread: 0.16,
    jitter: 0.18,
  })

  wash(ctx, cone, rng, {
    color: green,
    layers: 26,
    alpha: (attenue(0.66, distance) * weight) / 20,
    spread: 0.14,
    jitter: 0.34,
  })

  // La moitié à l'ombre : reprise des points MÊMES du cône du côté opposé
  // à la lumière, refermée sur l'axe. Une seconde forme posée à côté
  // déborderait du cône et, en `multiply`, resterait visible à côté de lui
  // (le piège déjà documenté pour `ruinFacade`).
  const dark = lit ? right : left
  wash(ctx, [[x, yBase], ...dark, [x, yBase - height]], rng, {
    color: shade,
    layers: 14,
    alpha: (attenue(0.46, distance) * weight) / 14,
    spread: 0.12,
    jitter: 0.3,
  })
  // Le feuillage : quelques dépôts de pigment plus drus dans la masse.
  // C'est ce qui distingue un if taillé d'un cône de signalisation.
  flecks(ctx, x, yBase - height * 0.45, radius * 0.7, height * 0.3, 5, rng, {
    color: shade,
    layers: 5,
    alpha: attenue(0.06, distance),
    spread: 0.3,
    jitter: 0.24,
  })

}

export interface BassinOptions {
  /** La pierre du margelle. */
  stone: string
  /** L'eau retenue dans le bassin. */
  water: string
  /** L'ombre de la margelle projetée sur l'eau. */
  shade: string
  distance?: number
}

/**
 * Un bassin : une ellipse de pierre, l'eau en retrait, et l'ombre que la
 * margelle projette sur l'eau du côté de la lumière.
 *
 * L'ellipse est volontairement peu déformée (`spread` très bas) : c'est
 * un ouvrage maçonné, sa régularité est le sujet. Un bassin aux bords
 * baveux redevient une flaque.
 */
export function bassin(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  rng: () => number,
  plan: LightPlan,
  options: BassinOptions,
): void {
  const { stone, water, shade, distance = 0 } = options
  const lit = litFromLeft(plan)

  wash(ctx, polygon(cx, cy, rx, ry, 16, 0, rng), rng, {
    color: stone,
    layers: 12,
    alpha: attenue(0.16, distance) / 12,
    spread: 0.06,
    jitter: 0.14,
  })
  wash(ctx, polygon(cx, cy, rx * 0.9, ry * 0.84, 16, 0, rng), rng, {
    color: water,
    layers: 22,
    alpha: attenue(0.78, distance) / 22,
    spread: 0.06,
    jitter: 0.16,
  })

  // L'ombre de la margelle : un croissant contre le bord intérieur, du
  // côté d'où vient la lumière — c'est de ce côté que la pierre porte
  // ombre sur l'eau, jamais du côté éclairé.
  const arc: Point[] = []
  const from = lit ? Math.PI * 0.86 : Math.PI * 1.86
  for (let a = 0; a <= 8; a += 1) {
    const t = from + (a / 8) * Math.PI * 0.62
    arc.push([cx + Math.cos(t) * rx * 0.9, cy + Math.sin(t) * ry * 0.84])
  }
  for (let a = 8; a >= 0; a -= 1) {
    const t = from + (a / 8) * Math.PI * 0.62
    arc.push([cx + Math.cos(t) * rx * 0.62, cy + Math.sin(t) * ry * 0.55])
  }
  wash(ctx, arc, rng, {
    color: shade,
    layers: 10,
    alpha: attenue(0.4, distance) / 10,
    spread: 0.1,
    jitter: 0.12,
  })

  // La margelle côté spectateur : un arc suivi sur toute sa courbe, en
  // beaucoup de points. Un trait en trois points se referme en chevron —
  // à l'écran, une pointe sous le bassin, pas une margelle.
  const bord: Point[] = []
  for (let a = 0; a <= 12; a += 1) {
    const t = Math.PI * 0.12 + (a / 12) * Math.PI * 0.76
    bord.push([cx + Math.cos(t) * rx * 0.97, cy + Math.sin(t) * ry * 0.97])
  }
  dryStroke(ctx, bord, Math.max(0.8, ry * 0.16), rng, {
    color: plan.accent,
    alpha: attenue(0.26, distance),
    layers: 2,
    jitter: 0.1,
  })
}

export interface JetOptions {
  /** Le voile d'eau pulvérisée. Un ton froid et PÂLE, jamais saturé. */
  spray: string
  /** Le cœur du jet, un peu plus dense. */
  core: string
  distance?: number
}

/**
 * Le jet d'eau : la seule verticale d'une composition qui, sinon, est
 * entièrement horizontale. C'est aussi la seule chose qui bouge dans un
 * jardin dessiné à la règle — sans lui, l'image est correcte et morte.
 *
 * **Il doit monter au-dessus d'une zone de papier nu**, jamais devant une
 * masse sombre. Tout se peint en `multiply` : une gerbe d'eau claire
 * posée sur du vert foncé ne l'éclaircit pas, elle l'assombrit à peine et
 * disparaît. Sur du papier réservé, le même voile pâle se voit comme une
 * vapeur — c'est la seule position où ce motif fonctionne.
 */
export function jetDeau(
  ctx: CanvasRenderingContext2D,
  x: number,
  yBase: number,
  height: number,
  rng: () => number,
  options: JetOptions,
): void {
  const { spray, core, distance = 0 } = options
  const width = height * 0.1

  // La gerbe : une colonne qui s'évase en montant, comme l'eau qui perd
  // sa vitesse et s'ouvre. Une colonne à largeur constante donnerait un
  // mât ; c'est l'évasement seul qui dit « eau sous pression ».
  const steps = 7
  const left: Point[] = []
  const right: Point[] = []
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps
    const w = width * (0.3 + t * t * 0.9)
    const y = yBase - height * t
    left.push([x - w, y])
    right.push([x + w, y])
  }
  // `jitter` très haut : c'est de la vapeur, la seule masse du tableau qui
  // n'a aucun bord. Un contour même légèrement net la fait basculer en
  // lame — le premier essai rendait une épée plantée dans le bassin.
  wash(ctx, [...left, ...right.reverse()], rng, {
    color: spray,
    layers: 14,
    alpha: attenue(0.22, distance) / 14,
    spread: 0.22,
    jitter: 0.4,
  })

  // Pas de masse posée au sommet : une couronne peinte à part se lit comme
  // un champignon planté sur une tige (essayé, raté), et des brins qui
  // rayonnent comme un feu d'artifice (essayé aussi). C'est l'évasement de
  // la gerbe elle-même, plus les deux retombées ci-dessous, qui suffisent.

  // Le cœur : le filet dense qui jaillit de la vasque. Discret — c'est
  // l'épaisseur du voile qui doit se voir, pas une ligne.
  dryStroke(ctx, [
    [x, yBase],
    [x + (rng() - 0.5) * width * 0.3, yBase - height * 0.55],
    [x, yBase - height * 0.88],
  ], width * 0.5, rng, {
    color: core,
    alpha: attenue(0.14, distance),
    layers: 2,
    jitter: 0.14,
  })

  // Deux retombées seulement, courtes et proches de la gerbe : de l'eau
  // qui retombe s'écroule près de sa source.
  for (const side of [-1, 1]) {
    dryStroke(ctx, [
      [x + side * width * 0.4, yBase - height * 0.86],
      [x + side * width * 1.7, yBase - height * 0.78],
      [x + side * width * 2.3, yBase - height * 0.58],
    ], Math.max(0.5, width * 0.22), rng, {
      color: spray,
      alpha: attenue(0.2, distance),
      layers: 1,
      jitter: 0.2,
    })
  }
}
