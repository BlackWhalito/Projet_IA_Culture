import { courbeOuverte, type Point } from '../../engine/courbe'

/**
 * Le repère partagé par le dessin de la rivière et les plaques du DOM.
 *
 * Il vit dans son propre fichier parce qu'oxlint refuse qu'un module exporte à
 * la fois des composants et autre chose (`react(only-export-components)`, voir
 * la skill `pieges-du-projet`) — mais la vraie raison est ailleurs : si le SVG
 * et les plaques calculaient chacun leurs positions, elles dériveraient au
 * premier changement de pas, et le décalage ne se verrait qu'à l'écran.
 */

/** Largeur du repère de dessin. La hauteur dépend du nombre de niveaux. */
export const LARGEUR = 390
/** Distance verticale entre deux niveaux. */
export const PAS = 150
/** Marge au-dessus du premier niveau et sous le dernier. */
export const MARGE = 96
/** Demi-largeur du chenal. Le lit garde sa largeur ; c'est son axe qui bouge. */
const DEMI_CHENAL = 105

export function hauteurPour(nombre: number): number {
  return MARGE * 2 + PAS * (nombre - 1)
}

/** Où se pose chaque niveau : en quinconce, une rive puis l'autre. */
export function positionNiveau(i: number): Point {
  return { x: i % 2 === 0 ? 118 : 272, y: MARGE + i * PAS }
}

/**
 * L'axe du courant.
 *
 * Il est en **opposition** avec les haltes : quand une halte est à gauche,
 * l'axe part à droite, et la berge gauche vient donc affleurer sous la plaque.
 * C'est ce qui fait que chaque niveau ressemble à un embarcadère posé au bord
 * de l'eau, au lieu d'une étiquette flottant par-dessus la rivière.
 */
function axe(nombre: number): Point[] {
  return [
    { x: 120, y: -70 },
    ...Array.from({ length: nombre }, (_, i) => ({
      x: i % 2 === 0 ? 270 : 120,
      y: MARGE + i * PAS,
    })),
    { x: 270, y: hauteurPour(nombre) + 70 },
  ]
}

export function courantPath(nombre: number): string {
  return courbeOuverte(axe(nombre))
}

/** Le même axe, décalé — c'est la ligne de rive. */
function rive(nombre: number, cote: -1 | 1): Point[] {
  return axe(nombre).map((p) => ({ x: p.x + cote * DEMI_CHENAL, y: p.y }))
}

/**
 * Une berge : la rive, refermée sur le bord du cadre.
 *
 * On déborde largement hors du repère (−60 / +60) pour qu'aucun bord droit
 * n'apparaisse à l'écran — la première version dessinait deux rectangles, et
 * la page lisait comme trois colonnes au lieu d'une rivière.
 */
export function bergePath(nombre: number, cote: -1 | 1): string {
  const points = rive(nombre, cote)
  const courbe = courbeOuverte(points)
  const sansM = courbe.slice(courbe.indexOf(' C'))
  const bord = cote === -1 ? -60 : LARGEUR + 60
  const h = hauteurPour(nombre)
  return (
    `M${bord},${-90} L${points[0].x},${points[0].y}${sansM} ` +
    `L${bord},${h + 90} Z`
  )
}
