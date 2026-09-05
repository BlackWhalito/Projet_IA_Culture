/**
 * Une courbe lisse qui passe par des points donnés.
 *
 * Catmull-Rom converti en Béziers cubiques, comme le contour de la France
 * (`src/content/maps/france.ts`) — mais en chemin **ouvert**, ce qui manquait.
 *
 * La règle apprise sur la carte de France vaut ici : on ne choisit jamais les
 * points de contrôle à la main. On pose les points par où la courbe doit
 * passer, et les tangentes s'en déduisent. Une rivière dont on écrit les
 * Béziers à l'estime fait des coudes qu'on n'a pas voulus, et on les corrige
 * un par un sans jamais tomber juste.
 */
export interface Point {
  x: number
  y: number
}

const arrondi = (n: number) => Math.round(n * 10) / 10

export function courbeOuverte(points: readonly Point[], tension = 1): string {
  if (points.length === 0) return ''
  if (points.length === 1) return `M${arrondi(points[0].x)},${arrondi(points[0].y)}`

  // Les extrémités sont doublées : sans elles, la tangente du premier et du
  // dernier segment est indéfinie et la courbe part de travers.
  const au = (i: number) => points[Math.min(points.length - 1, Math.max(0, i))]

  let d = `M${arrondi(points[0].x)},${arrondi(points[0].y)}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = au(i - 1)
    const p1 = au(i)
    const p2 = au(i + 1)
    const p3 = au(i + 2)
    const c1x = p1.x + ((p2.x - p0.x) / 6) * tension
    const c1y = p1.y + ((p2.y - p0.y) / 6) * tension
    const c2x = p2.x - ((p3.x - p1.x) / 6) * tension
    const c2y = p2.y - ((p3.y - p1.y) / 6) * tension
    d += ` C${arrondi(c1x)},${arrondi(c1y)} ${arrondi(c2x)},${arrondi(c2y)} ${arrondi(p2.x)},${arrondi(p2.y)}`
  }
  return d
}

/**
 * Un générateur déterministe.
 *
 * Les roseaux et les cailloux de la berge doivent être irréguliers, mais
 * **identiques d'un rendu à l'autre** : un décor qui se redessine autrement à
 * chaque montage scintille, et `Math.random()` dans un composant est de toute
 * façon refusé par oxlint (voir la skill `pieges-du-projet`). On sème une
 * suite reproductible, calculée une fois au niveau module.
 */
export function semer(graine: number): () => number {
  let etat = graine >>> 0
  return () => {
    etat = (etat * 1664525 + 1013904223) >>> 0
    return etat / 0x100000000
  }
}
