import { dryStroke, polygon, wash } from './engine'
import type { Point } from './engine'
import { attenue, litFromLeft } from './light'
import type { LightPlan } from './light'

/**
 * Les animaux.
 *
 * Une seule règle gouverne ce module, et elle a été payée deux fois sur le
 * cheval de `knightOnHorse` : **un animal se peint d'un seul contour
 * fermé.** Assemblé en morceaux — un tronc, un trait d'encolure, une boule
 * de tête — il sort en table à pattes surmontée d'un ballon. Ce qui fait
 * reconnaître une bête, ce sont les PASSAGES : l'attache de la tête, la
 * courbe de la croupe, le creux du dos. Aucun n'existe si chaque partie est
 * peinte à part. Corps, cou et tête vont donc toujours dans un seul
 * polygone ; seuls les membres, la queue et ce qui est porté se posent
 * ensuite.
 *
 * Corollaire : l'espèce se joue sur une ou deux PROPORTIONS, jamais sur du
 * détail. Un museau trop court fait un lama à la place d'un cheval, des
 * oreilles trop petites un chien à la place d'un renard. À l'échelle d'une
 * vignette, aucun réglage de couleur ne rattrape une proportion fausse.
 */

export interface AnimalOptions {
  /** La robe, le pelage, le plumage. */
  coat: string
  /** L'ombre sous le ventre et sur le flanc opposé à la lumière. */
  shade: string
  /** Les tout petits noirs : œil, sabot, bout du museau. */
  accent: string
  distance?: number
  weight?: number
  /** Sens : -1 tourné vers la gauche, 1 vers la droite. */
  facing?: -1 | 1
}

/**
 * Un mammouth, de profil. `height` est la hauteur au garrot.
 *
 * Trois traits, et aucun autre ne compte : **la bosse du garrot** (le
 * point le plus haut de l'animal, très en avant, juste derrière le crâne),
 * **la trompe** qui descend jusqu'au sol et s'y recourbe, et **les défenses
 * en croissant** qui repartent vers le haut. Un éléphant a le dos plat et
 * de grandes oreilles ; un mammouth a le dos en pente et de petites
 * oreilles. C'est ce profil en toboggan, plus que la fourrure, qui le date.
 */
export function mammouth(
  ctx: CanvasRenderingContext2D,
  x: number,
  yGround: number,
  height: number,
  rng: () => number,
  plan: LightPlan,
  options: AnimalOptions,
): void {
  const { coat, shade, accent, distance = 0, weight = 1, facing = -1 } = options
  const f = facing
  const H = height
  const yDos = yGround - H

  // L'ombre au sol, sous la masse : elle pose l'animal au lieu de le
  // laisser flotter, et elle suit le plan de lumière de la scène comme
  // toute autre ombre portée.
  wash(ctx, polygon(x, yGround + H * 0.03, H * 0.7, H * 0.08, 9, 0, rng), rng, {
    color: plan.cool,
    layers: 8,
    alpha: (attenue(0.36, distance) * weight) / 8,
    spread: 0.16,
    jitter: 0.22,
  })

  // Les pattes ensuite, en LAVIS et non au trait : `dryStroke` effile ses
  // deux bouts, donc une patte courte et large tracée avec lui sort en
  // losange — sous le ventre, six losanges sombres se lisaient comme des
  // membres surnuméraires. Une colonne a besoin d'un polygone.
  for (const [px, ecart] of [[0.3, 0.06], [0.18, -0.02], [-0.3, 0.02], [-0.44, -0.06]] as Array<[number, number]>) {
    const hx = x + f * H * px
    const bx = x + f * H * (px + ecart)
    wash(ctx, [
      [hx - H * 0.1, yDos + H * 0.34],
      [hx + H * 0.1, yDos + H * 0.34],
      [bx + H * 0.09, yGround + H * 0.02],
      [bx - H * 0.09, yGround + H * 0.02],
    ], rng, {
      color: coat,
      layers: 16,
      alpha: (attenue(0.68, distance) * weight) / 16,
      spread: 0.05,
      jitter: 0.12,
    })
  }

  const corps: Point[] = ([
    // poitrail et ventre, bas et lourds
    [0.42, 0.34], [0.16, 0.5], [-0.16, 0.52], [-0.44, 0.46],
    // arrière-train fuyant : la croupe est BASSE, c'est la pente du dos
    [-0.6, 0.3], [-0.62, 0.14],
    // le dos qui remonte vers la bosse du garrot
    [-0.44, 0.06], [-0.14, -0.02], [0.16, -0.14],
    // la bosse, point culminant, très en avant
    [0.34, -0.24], [0.5, -0.16],
    // le crâne, en arrière et au-dessus de la trompe
    [0.62, -0.2], [0.76, -0.1], [0.78, 0.1],
    // la joue et l'amorce de la trompe
    [0.66, 0.22], [0.54, 0.2],
  ] as Array<[number, number]>).map(([dx, dy]) => [x + f * H * dx, yDos + H * dy] as Point)
  wash(ctx, corps, rng, {
    color: coat,
    layers: 24,
    alpha: (attenue(0.86, distance) * weight) / 24,
    spread: 0.05,
    jitter: 0.13,
  })

  // La toison : un OURLET continu qui pend sous le ventre, festonné en
  // dessous. Peinte en mèches séparées (deux essais), elle se lisait comme
  // une rangée de tentacules ou de pattes surnuméraires — chaque mèche
  // était plus sombre que le corps qu'elle recouvrait. Une seule masse,
  // au bord ondulé, dit « fourrure longue » sans ajouter de membres.
  const ourlet: Point[] = [[x + f * H * 0.38, yDos + H * 0.4]]
  for (let i = 0; i <= 8; i += 1) {
    const t = i / 8
    ourlet.push([
      x + f * H * (0.38 - t * 0.98),
      yDos + H * (0.54 + (i % 2 === 0 ? 0.04 : -0.02)),
    ])
  }
  ourlet.push([x - f * H * 0.58, yDos + H * 0.38])
  wash(ctx, ourlet, rng, {
    color: coat,
    layers: 14,
    alpha: (attenue(0.5, distance) * weight) / 14,
    spread: 0.06,
    jitter: 0.2,
  })

  // La trompe : elle descend jusqu'au sol puis se recourbe vers l'avant.
  // Droite, elle se lit comme une corde ; c'est la courbe finale qui la
  // fait vivante.
  dryStroke(ctx, [
    [x + f * H * 0.68, yDos + H * 0.16],
    [x + f * H * 0.76, yDos + H * 0.46],
    [x + f * H * 0.72, yDos + H * 0.74],
    [x + f * H * 0.86, yDos + H * 0.86],
  ], H * 0.11 * weight, rng, {
    color: coat,
    alpha: attenue(0.62, distance) * weight,
    layers: 2,
    jitter: 0.14,
  })

  // Les défenses : un croissant net et CLAIR qui repart vers le haut.
  // Elles doivent trancher sur la masse sombre du corps, c'est le seul
  // endroit de l'animal où l'on pose un ton pâle.
  for (const decalage of [0, 0.06]) {
    dryStroke(ctx, [
      [x + f * H * (0.7 + decalage), yDos + H * 0.24],
      [x + f * H * (0.92 + decalage), yDos + H * 0.5],
      [x + f * H * (1.06 + decalage), yDos + H * 0.36],
      [x + f * H * (1.04 + decalage), yDos + H * 0.2],
    ], H * 0.07 * weight, rng, {
      color: shade,
      alpha: attenue(0.5, distance) * weight,
      layers: 2,
      jitter: 0.1,
    })
  }

  // L'œil : un seul petit noir, et le mammouth regarde.
  dryStroke(ctx, [
    [x + f * H * 0.63, yDos - H * 0.02],
    [x + f * H * 0.66, yDos],
  ], H * 0.055 * weight, rng, { color: accent, alpha: attenue(0.7, distance), layers: 2 })
}

/**
 * Un oiseau perché, vu de profil, tête tournée vers le spectateur.
 *
 * Sert au corbeau de la fable. Le corps est une simple goutte inclinée —
 * c'est **la queue longue et la posture penchée en avant** qui font
 * l'oiseau perché, jamais le détail des plumes. Le bec est le seul accent :
 * court et fort pour un corvidé, il suffit à écarter le moineau.
 */
export function oiseauPerche(
  ctx: CanvasRenderingContext2D,
  x: number,
  yPerch: number,
  height: number,
  rng: () => number,
  plan: LightPlan,
  options: AnimalOptions & { beak?: string },
): void {
  const { coat, shade, accent, distance = 0, weight = 1, facing = -1, beak = accent } = options
  const f = facing
  const H = height

  const corps: Point[] = ([
    [0.0, 0.0], [-0.24, -0.1], [-0.46, -0.3], [-0.5, -0.52],
    [-0.34, -0.74], [-0.1, -0.86], [0.12, -0.84], [0.26, -0.7],
    [0.28, -0.48], [0.2, -0.2], [0.12, -0.04],
  ] as Array<[number, number]>).map(([dx, dy]) => [x + f * H * dx, yPerch + H * dy] as Point)
  wash(ctx, corps, rng, {
    color: coat,
    layers: 22,
    alpha: (attenue(2.1, distance) * weight) / 22,
    spread: 0.05,
    jitter: 0.13,
  })

  // La queue : longue, oblique, en arrière et vers le bas. Le trait le
  // plus long de la figure, et celui qui fait la silhouette.
  dryStroke(ctx, [
    [x - f * H * 0.4, yPerch - H * 0.34],
    [x - f * H * 0.82, yPerch - H * 0.34],
    [x - f * H * 1.08, yPerch - H * 0.28],
  ], H * 0.2 * weight, rng, {
    color: coat,
    alpha: attenue(1.4, distance) * weight,
    layers: 3,
    jitter: 0.12,
  })

  // Le dessous du corps prend l'ombre — la lumière tombe d'en haut, donc
  // le ventre d'un oiseau perché est toujours son côté sombre, quel que
  // soit le côté d'où vient le soleil.
  wash(ctx, polygon(
    x + (litFromLeft(plan) ? H * 0.08 : -H * 0.08),
    yPerch - H * 0.34,
    H * 0.34,
    H * 0.2,
    10,
    0,
    rng,
  ), rng, {
    color: shade,
    layers: 12,
    alpha: (attenue(0.34, distance) * weight) / 12,
    spread: 0.16,
    jitter: 0.26,
  })

  // Le bec, court et pointu, et l'œil juste derrière.
  dryStroke(ctx, [
    [x + f * H * 0.2, yPerch - H * 0.74],
    [x + f * H * 0.66, yPerch - H * 0.62],
  ], H * 0.14 * weight, rng, { color: beak, alpha: attenue(0.95, distance), layers: 3 })
  dryStroke(ctx, [
    [x + f * H * 0.12, yPerch - H * 0.74],
    [x + f * H * 0.17, yPerch - H * 0.73],
  ], H * 0.09 * weight, rng, { color: accent, alpha: attenue(0.8, distance), layers: 2 })

  // Les pattes, deux traits fins jusqu'à la branche.
  for (const d of [-0.06, 0.06]) {
    dryStroke(ctx, [
      [x + f * H * (0.02 + d), yPerch - H * 0.14],
      [x + f * H * (0.04 + d), yPerch + H * 0.03],
    ], H * 0.05 * weight, rng, { color: shade, alpha: attenue(0.6, distance), layers: 1 })
  }
}

/**
 * Un renard assis, de profil, museau levé.
 *
 * Deux proportions le décident, et rien d'autre : **des oreilles hautes et
 * triangulaires** (un tiers de la hauteur de la tête — plus petites, c'est
 * un chien), et **une queue aussi épaisse que le corps**, posée au sol et
 * remontant en pointe claire. Le museau effilé aide, mais à cette échelle
 * ce sont les oreilles et la queue qui portent toute la reconnaissance.
 */
export function renardAssis(
  ctx: CanvasRenderingContext2D,
  x: number,
  yGround: number,
  height: number,
  rng: () => number,
  plan: LightPlan,
  options: AnimalOptions & { tip?: string },
): void {
  const { coat, shade, accent, distance = 0, weight = 1, facing = -1, tip = shade } = options
  const f = facing
  const H = height
  const lit = litFromLeft(plan)

  // La queue, posée au sol derrière l'animal et peinte AVANT lui : elle
  // passe derrière la croupe, pas dessus.
  dryStroke(ctx, [
    [x - f * H * 0.14, yGround - H * 0.12],
    [x - f * H * 0.52, yGround - H * 0.02],
    [x - f * H * 0.82, yGround - H * 0.16],
  ], H * 0.26 * weight, rng, {
    color: coat,
    alpha: attenue(0.72, distance) * weight,
    layers: 3,
    jitter: 0.14,
  })
  dryStroke(ctx, [
    [x - f * H * 0.68, yGround - H * 0.09],
    [x - f * H * 0.86, yGround - H * 0.18],
  ], H * 0.16 * weight, rng, {
    color: tip,
    alpha: attenue(0.5, distance) * weight,
    layers: 2,
    jitter: 0.16,
  })

  // Corps, cou, tête et oreilles d'un seul tenant. Le dos file en
  // diagonale de la croupe posée au sol jusqu'au sommet du crâne : c'est
  // cette ligne continue qui fait « assis », plus que les pattes.
  const corps: Point[] = ([
    [-0.3, 0.0], [-0.34, -0.3], [-0.22, -0.52], [-0.06, -0.7],
    [0.02, -0.86], [-0.04, -1.02], [0.1, -0.96],
    [0.18, -1.06], [0.24, -0.92],
    [0.42, -0.86], [0.52, -0.78], [0.4, -0.72],
    [0.22, -0.66], [0.18, -0.44], [0.26, -0.14], [0.24, 0.0],
  ] as Array<[number, number]>).map(([dx, dy]) => [x + f * H * dx, yGround + H * dy] as Point)
  wash(ctx, corps, rng, {
    color: coat,
    layers: 22,
    alpha: (attenue(0.84, distance) * weight) / 22,
    spread: 0.045,
    jitter: 0.11,
  })

  // Le flanc à l'ombre, repris DANS le contour du corps.
  const cote = lit ? 1 : -1
  wash(ctx, [
    [x + f * H * 0.24 * cote, yGround],
    [x + f * H * 0.2 * cote, yGround - H * 0.5],
    [x - f * H * 0.06 * cote, yGround - H * 0.62],
    [x - f * H * 0.22 * cote, yGround - H * 0.2],
  ], rng, {
    color: shade,
    layers: 12,
    alpha: (attenue(0.34, distance) * weight) / 12,
    spread: 0.12,
    jitter: 0.2,
  })

  // L'œil, un seul petit noir.
  dryStroke(ctx, [
    [x + f * H * 0.24, yGround - H * 0.83],
    [x + f * H * 0.28, yGround - H * 0.82],
  ], H * 0.07 * weight, rng, { color: accent, alpha: attenue(0.8, distance), layers: 2 })
  // L'ombre au sol, qui l'assoit vraiment.
  wash(ctx, polygon(x, yGround + H * 0.02, H * 0.55, H * 0.06, 9, 0, rng), rng, {
    color: plan.cool,
    layers: 8,
    alpha: (attenue(0.34, distance) * weight) / 8,
    spread: 0.16,
    jitter: 0.22,
  })
}
