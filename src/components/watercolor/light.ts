/**
 * Le plan de valeurs d'une scène.
 *
 * Pourquoi ça existe : la faiblesse la plus visible d'une peinture générée,
 * c'est que chaque objet calcule son ombre dans son coin. Rien ne se répond,
 * et l'ensemble paraît décousu même quand chaque forme est correcte. Un
 * peintre décide d'abord **une** lumière et **une** échelle de valeurs pour
 * tout le tableau, puis y soumet chaque objet.
 *
 * Ici, `LightPlan` porte cette décision unique, et les scènes la consultent
 * au lieu de choisir leurs opacités à la main.
 */

export interface LightPlan {
  /** D'où vient la lumière, en degrés (0 = droite, 90 = bas, 180 = gauche). */
  angleDeg: number
  /** Couleur de la lumière — réchauffe les faces éclairées. */
  warm: string
  /** Couleur de l'ombre — toujours colorée, jamais grise (règle `aquarelle`). */
  cool: string
  /** Le noir le plus dense de la scène, réservé aux tout petits accents. */
  accent: string
}

/**
 * La lumière vient-elle de la gauche ? Décide de quel côté tombe l'ombre
 * pour tout élément de la scène. À utiliser partout plutôt que de recopier
 * le calcul : trois copies de la même formule finissent par diverger.
 */
export function litFromLeft(plan: LightPlan): boolean {
  return Math.cos((plan.angleDeg * Math.PI) / 180) < 0
}

/**
 * Les cinq valeurs d'une scène.
 *
 * Ce sont des **densités de pigment cumulées**, pas des niveaux de gris :
 * `OMBRE` s'ajoute par-dessus `MOYEN` déjà posé, donc sa valeur propre est
 * plus basse alors que le résultat à l'écran est plus sombre. Ne pas les
 * comparer entre elles comme une échelle.
 *
 * La règle qui compte : `LUMIERE` reste du papier presque nu, et `ACCENT`
 * ne couvre qu'une poignée de pixels — les fenêtres, une proue, une
 * silhouette. C'est ce rapport entre de très petits noirs et de grandes
 * zones claires qui fait qu'une aquarelle « claque » ; étaler l'accent en
 * grandes masses produit l'inverse, une image lourde et sans air.
 */
export const VALEUR = {
  /** Papier réservé : on ne peint pas, ou à peine. */
  LUMIERE: 0.04,
  /** Surface éclairée, encore très claire. */
  CLAIR: 0.1,
  /** Le corps d'une masse, posé en premier. Couvre le plus de surface. */
  MOYEN: 0.42,
  /** L'ombre, ajoutée PAR-DESSUS le corps. Par masses limitées. */
  OMBRE: 0.34,
  /** Les tout petits accents. Jamais sur une grande surface. */
  ACCENT: 0.62,
} as const

/**
 * Perspective aérienne : plus un élément est loin, plus il perd contraste et
 * saturation, quelle que soit sa valeur propre. `distance` va de 0 (au
 * premier plan) à 1 (à l'horizon).
 */
export function attenue(valeur: number, distance: number): number {
  return valeur * (1 - distance * 0.72)
}
