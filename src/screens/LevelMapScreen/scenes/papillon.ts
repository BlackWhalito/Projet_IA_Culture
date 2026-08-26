import type { PaintScene } from '../../../components/watercolor/WatercolorScene'
import { contour, dryStroke, polygon, wash } from '../../../components/watercolor/engine'
import type { Point } from '../../../components/watercolor/engine'
import { gradedWash, vignette } from '../../../components/watercolor/atmosphere'
import { collines } from '../../../components/watercolor/terrain'
import {
  ENCRE_SOMBRE,
  OCRE,
  PIERRE_CHAUDE,
  SABLE,
  VERT,
  VIOLET,
  VIOLET_BRUME,
  VIOLET_PROFOND,
} from '../../../components/watercolor/palette'
import { OMBRE_FEUILLAGE } from './lumiere'

/**
 * Un papillon aux ailes ouvertes, vu de dessus.
 *
 * Quatre ailes, jamais deux : c'est la paire postérieure, plus petite et
 * décalée vers le bas, qui fait la différence entre un papillon et un
 * nœud papillon. Le corps reste très mince — un corps épais donne une
 * mite. Et les antennes, deux traits fins terminés en massue, sont le
 * détail le plus rentable de la figure : sans elles, la forme reste
 * ambiguë ; avec elles, plus aucun doute.
 */
function papillon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  envergure: number,
  rng: () => number,
  options: { wing: string; edge: string; body: string; tilt?: number; weight?: number },
): void {
  const { wing, edge, body, tilt = -0.12, weight = 1 } = options
  const demi = envergure / 2
  const cos = Math.cos(tilt)
  const sin = Math.sin(tilt)
  const place = (dx: number, dy: number): Point => [
    x + (dx * cos - dy * sin) * demi,
    y + (dx * sin + dy * cos) * demi,
  ]

  // Chaque aile est une ELLIPSE inclinée, pas un polygone dessiné à la
  // main. Deux versions à sommets explicites ont rendu des cerfs-volants
  // facettés : `wash()` ne déforme chaque arête que d'une fraction de sa
  // longueur, donc une aile de six sommets garde ses six angles quels que
  // soient `spread` et `jitter`. Une ellipse à seize sommets, elle, sort
  // ronde — et une aile de papillon EST ronde.
  const aile = (cote: number, cx: number, cy: number, rx: number, ry: number, rot: number, alpha: number): void => {
    const c = place(cx * cote, cy)
    wash(ctx, polygon(c[0], c[1], demi * rx, demi * ry, 16, rot * cote + tilt, rng), rng, {
      color: wing,
      layers: 20,
      alpha: (alpha * weight) / 20,
      spread: 0.07,
      jitter: 0.16,
    })
    // Le bout d'aile sombre : une petite ellipse poussée vers la pointe,
    // et RIEN de plus. Un liseré suivant tout le contour laissait des
    // coins noirs qui se lisaient comme des trous ; une ellipse large et
    // centrée, elle, faisait un ocelle géant au milieu de l'aile. Le bout
    // assombri est à la fois plus juste (beaucoup d'espèces l'ont) et le
    // seul qui reste confiné là où on le veut.
    // Le bord de l'aile, par tronçons : sans lui, deux ellipses de
    // couleur restent deux pétales. C'est le trait qui fait l'aile.
    const bord: Point[] = []
    for (let i = 0; i <= 14; i += 1) {
      const a = (i / 14) * Math.PI * 2
      const p0 = place((cx + Math.cos(a + rot * cote) * rx * 0.98) * cote, cy + Math.sin(a + rot * cote) * ry * 0.98)
      bord.push(p0)
    }
    contour(ctx, bord, rng, {
      color: edge,
      width: envergure * 0.014,
      alpha: 0.34 * weight,
      layers: 1,
      coverage: 0.46,
      runs: 3,
    })
    const b = place((cx + 0.34) * cote, cy - 0.04)
    wash(ctx, polygon(b[0], b[1], demi * rx * 0.4, demi * ry * 0.5, 14, rot * cote + tilt, rng), rng, {
      color: edge,
      layers: 12,
      alpha: (alpha * 0.36 * weight) / 12,
      spread: 0.14,
      jitter: 0.28,
    })
  }

  for (const cote of [-1, 1]) {
    aile(cote, 0.52, -0.3, 0.54, 0.36, -0.5, 1.0)
    aile(cote, 0.4, 0.34, 0.4, 0.3, 0.5, 0.86)
    // Les ocelles, les seuls petits noirs de la figure.
    for (const [dx, dy] of [[0.5, -0.34], [0.38, 0.32]] as Array<[number, number]>) {
      const p = place(dx * cote, dy)
      wash(ctx, polygon(p[0], p[1], envergure * 0.026, envergure * 0.026, 9, 0, rng), rng, {
        color: edge,
        layers: 8,
        alpha: 0.7 / 8,
        spread: 0.14,
        jitter: 0.2,
      })
    }
  }

  // Le corps, très mince, et les antennes en massue. Un corps épais
  // donnerait une mite ; les antennes, deux traits, lèvent toute ambiguïté.
  dryStroke(ctx, [place(0, -0.5), place(0, 0.56)], envergure * 0.045, rng, {
    color: body,
    alpha: 0.8,
    layers: 2,
  })
  for (const cote of [-1, 1]) {
    dryStroke(ctx, [place(0, -0.46), place(0.26 * cote, -0.86)], envergure * 0.02, rng, {
      color: body,
      alpha: 0.62,
      layers: 1,
      jitter: 0.08,
    })
    const bout = place(0.28 * cote, -0.9)
    wash(ctx, polygon(bout[0], bout[1], envergure * 0.022, envergure * 0.022, 8, 0, rng), rng, {
      color: body,
      layers: 6,
      alpha: 0.7 / 6,
      spread: 0.14,
      jitter: 0.18,
    })
  }
}

/**
 * Une chenille sur une feuille : une file de bourrelets qui se chevauchent.
 *
 * Le chevauchement fait tout. Des disques disjoints donnent un collier ;
 * il faut qu'ils empiètent l'un sur l'autre d'un bon tiers pour que le
 * corps soit continu et que la segmentation se lise quand même.
 */
function chenille(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  longueur: number,
  rng: () => number,
  options: { body: string; shade: string },
): void {
  const { body, shade } = options
  const anneaux = 6
  const r = longueur / (anneaux * 0.7)
  for (let i = 0; i < anneaux; i += 1) {
    const t = i / (anneaux - 1)
    const bx = x - longueur / 2 + longueur * t
    const by = y - Math.sin(t * Math.PI) * r * 0.5
    wash(ctx, polygon(bx, by, r * 0.62, r * 0.55, 9, 0, rng), rng, {
      color: i % 2 === 0 ? body : shade,
      layers: 12,
      alpha: 0.6 / 12,
      spread: 0.1,
      jitter: 0.16,
    })
  }
  // Deux antennes minuscules à l'avant, pour donner un sens à la file.
  dryStroke(ctx, [
    [x + longueur * 0.46, y - r * 0.5],
    [x + longueur * 0.58, y - r * 1.1],
  ], r * 0.16, rng, { color: shade, alpha: 0.55, layers: 1 })
}

/**
 * Une chrysalide suspendue : une goutte inversée et son fil d'attache.
 *
 * Le fil compte autant que la goutte. Sans lui, la forme est un bourgeon ;
 * avec lui, elle pend, et c'est le fait de pendre qui la rend
 * reconnaissable.
 */
function chrysalide(
  ctx: CanvasRenderingContext2D,
  x: number,
  yAttache: number,
  longueur: number,
  rng: () => number,
  options: { shell: string; shade: string },
): void {
  const { shell, shade } = options
  dryStroke(ctx, [[x, yAttache], [x, yAttache + longueur * 0.16]], longueur * 0.05, rng, {
    color: shade,
    alpha: 0.6,
    layers: 1,
  })
  wash(ctx, [
    [x, yAttache + longueur * 0.14],
    [x + longueur * 0.24, yAttache + longueur * 0.4],
    [x + longueur * 0.18, yAttache + longueur * 0.84],
    [x, yAttache + longueur],
    [x - longueur * 0.18, yAttache + longueur * 0.84],
    [x - longueur * 0.24, yAttache + longueur * 0.4],
  ], rng, { color: shell, layers: 18, alpha: 0.6 / 18, spread: 0.06, jitter: 0.12 })
  // Les stries obliques de l'enveloppe, du côté à l'ombre.
  for (let i = 0; i < 3; i += 1) {
    const ty = yAttache + longueur * (0.34 + i * 0.18)
    dryStroke(ctx, [[x - longueur * 0.16, ty], [x + longueur * 0.14, ty + longueur * 0.08]], longueur * 0.04, rng, {
      color: shade,
      alpha: 0.35,
      layers: 1,
    })
  }
}

/** Une feuille lancéolée portée par un pétiole, orientée par `sens`. */
function feuille(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  longueur: number,
  sens: number,
  rng: () => number,
  options: { green: string; shade: string },
): Point {
  const { green, shade } = options
  const bout: Point = [x + sens * longueur, y - longueur * 0.28]
  wash(ctx, [
    [x, y],
    [x + sens * longueur * 0.45, y - longueur * 0.34],
    bout,
    [x + sens * longueur * 0.5, y + longueur * 0.06],
  ], rng, { color: green, layers: 18, alpha: 0.56 / 18, spread: 0.07, jitter: 0.14 })
  dryStroke(ctx, [[x, y], bout], longueur * 0.035, rng, { color: shade, alpha: 0.4, layers: 1 })
  return bout
}

/**
 * Le cycle du papillon, dans une prairie d'été.
 *
 * Les trois états sont dans la même image, et à des places qui racontent
 * l'ordre sans avoir besoin de flèches : la chenille EN BAS sur une
 * feuille, la chrysalide suspendue AU-DESSUS d'elle, le papillon EN VOL
 * tout en haut. La lecture monte, comme le cycle.
 *
 * C'est le seul tableau de la série en gros plan — les sept autres sont
 * des paysages. Le contraste d'échelle est délibéré : au milieu d'une
 * carte de niveaux, une image qui change de distance focale attire l'œil
 * plus sûrement qu'une image qui change seulement de couleur.
 */
export const papillonScene: PaintScene = (ctx, w, h, rng) => {
  const horizon = h * 0.5

  gradedWash(ctx, -w * 0.05, 0, w * 1.05, horizon + h * 0.02, [
    { at: 0, color: VIOLET_BRUME, alpha: 0.3 },
    { at: 0.5, color: SABLE, alpha: 0.14 },
    { at: 1, color: SABLE, alpha: 0.04 },
  ])
  vignette(ctx, -w * 0.05, 0, w * 1.05, horizon + h * 0.02, {
    cx: w * 0.28,
    cy: horizon * 0.8,
    color: VIOLET,
    alpha: 0.24,
    creux: 0.26,
  })

  collines(ctx, -w * 0.05, w * 1.05, horizon - h * 0.05, horizon + h * 0.05, rng, {
    green: VERT,
    shade: VIOLET,
    distance: 0.6,
    bosses: 2,
  })
  gradedWash(ctx, -w * 0.05, horizon, w * 1.05, h * 1.02, [
    { at: 0, color: VERT, alpha: 0.2 },
    { at: 0.55, color: VERT, alpha: 0.4 },
    { at: 1, color: VIOLET_PROFOND, alpha: 0.5 },
  ])

  // La touffe d'herbes du premier plan, semée sur toute la largeur : plus
  // haute et plus sombre en descendant, c'est elle qui couche la prairie.
  for (let i = 0; i < 64; i += 1) {
    const t = Math.pow(rng(), 0.6)
    const gx = w * (-0.02 + rng() * 1.04)
    const gy = horizon + (h * 1.04 - horizon) * t
    const gh = h * (0.04 + t * 0.16)
    dryStroke(ctx, [
      [gx, gy],
      [gx + (rng() - 0.5) * gh * 0.9, gy - gh * 0.6],
      [gx + (rng() - 0.5) * gh * 1.8, gy - gh],
    ], Math.max(0.5, gh * 0.055), rng, {
      color: t > 0.88 ? VIOLET_PROFOND : VERT,
      alpha: 0.16 + t * 0.36,
      layers: 1,
      jitter: 0.14,
    })
  }

  // La tige porteuse : elle traverse tout le tableau de bas en haut et
  // relie les trois états. Sans elle, ils flotteraient chacun dans son coin.
  const tigeX = w * 0.26
  dryStroke(ctx, [
    [tigeX + w * 0.03, h * 1.04],
    [tigeX, h * 0.78],
    [tigeX - w * 0.01, h * 0.5],
  ], w * 0.012, rng, { color: VERT, alpha: 0.62, layers: 2, jitter: 0.06 })

  const feuilleBasse = feuille(ctx, tigeX + w * 0.002, h * 0.82, w * 0.14, 1, rng, {
    green: VERT,
    shade: OMBRE_FEUILLAGE,
  })
  feuille(ctx, tigeX - w * 0.006, h * 0.62, w * 0.11, -1, rng, {
    green: VERT,
    shade: OMBRE_FEUILLAGE,
  })

  chenille(ctx, feuilleBasse[0] - w * 0.05, feuilleBasse[1] + h * 0.03, w * 0.1, rng, {
    body: OCRE,
    shade: VIOLET_PROFOND,
  })
  chrysalide(ctx, tigeX - w * 0.07, h * 0.62, h * 0.13, rng, {
    shell: PIERRE_CHAUDE,
    shade: VIOLET_PROFOND,
  })

  // Le papillon : la plus grande forme du tableau, et la seule qui vole.
  // Placé haut et à l'opposé de la tige, il ferme la diagonale que la
  // chenille et la chrysalide ont commencée.
  papillon(ctx, w * 0.66, h * 0.3, w * 0.34, rng, {
    wing: OCRE,
    edge: ENCRE_SOMBRE,
    body: ENCRE_SOMBRE,
    tilt: -0.14,
  })
  // Un second, minuscule et pâli, pour la profondeur.
  papillon(ctx, w * 0.9, h * 0.14, w * 0.1, rng, {
    wing: PIERRE_CHAUDE,
    edge: VIOLET,
    body: VIOLET_PROFOND,
    tilt: 0.2,
    weight: 0.7,
  })
}
