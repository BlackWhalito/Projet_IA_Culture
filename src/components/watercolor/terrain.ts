import { dryStroke, wash } from './engine'
import type { Point } from './engine'
import { litFromLeft } from './light'
import type { LightPlan } from './light'

/**
 * Le relief : masses solides de premier ou d'arrière-plan (rocher, terrain).
 *
 * Extrait de `HomeScreen/scenes.ts`, où `rocher()` avait déjà fait ses
 * preuves (le rocher de la lagune) : plutôt que d'improviser une nouvelle
 * masse rocheuse par écran — chaque tentative refaite from scratch a coûté
 * une itération ratée sur le tableau du Niveau 1 (voir `LevelMapScreen/
 * levelArt.ts`) — un même rendu déjà jugé beau se réutilise.
 */

/**
 * Un rocher de premier plan : masse sombre et anguleuse qui mord le bord
 * bas du tableau. Contrairement à un nuage (base plate, sommet bombé et
 * mou), un rocher veut un contour plus dur — moins de `spread`/`jitter`,
 * une silhouette à facettes plutôt qu'une bosse arrondie. Rendu `stone`
 * bien plus opaque que n'importe quel lavis atmosphérique de la scène :
 * c'est le seul objet solide et net au premier plan, il doit se voir comme
 * tel plutôt que se fondre dans l'eau.
 *
 * Retourne le point (x, y) du sommet, pour y poser une figure assise.
 */
export function rocher(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cyBase: number,
  width: number,
  height: number,
  rng: () => number,
  plan: LightPlan,
  options: { stone: string; shade: string; accent: string },
): Point {
  const { stone, shade, accent } = options
  const lit = litFromLeft(plan)
  const x0 = cx - width / 2
  const x1 = cx + width / 2

  // Le contour : une poignée de sommets inégaux reliés de gauche à droite,
  // jamais une bosse arrondie — c'est la ligne brisée, comme sur
  // `ruinFacade`, qui distingue un rocher anguleux d'un nuage. Bombé au
  // centre par le même gabarit `taper` que les nuages, mais avec un tirage
  // par sommet net (pas de spread/jitter mou) pour garder des angles francs.
  const peaks = 4 + Math.floor(rng() * 2)
  const edge: Point[] = []
  for (let i = 0; i <= peaks; i += 1) {
    const t = i / peaks
    const taper = 0.3 + Math.sin(t * Math.PI) * 0.7
    edge.push([x0 + width * t, cyBase - height * taper * (0.55 + rng() * 0.45)])
  }

  // La masse. `warm`/`shade` reprennent ensuite les points de CE contour —
  // jamais un rectangle indépendant : en `multiply`, rien n'occulte rien,
  // un aplat qui déborde du contour reste visible flottant à côté du
  // rocher plutôt que dessus (piège déjà documenté pour `ruinFacade`).
  wash(ctx, [[x0, cyBase], ...edge, [x1, cyBase]], rng, {
    color: stone,
    layers: 28,
    alpha: 0.65 / 28,
    spread: 0.045,
    jitter: 0.05,
  })

  const mid = Math.floor(edge.length / 2)
  const warmSlice = lit ? edge.slice(0, mid + 1) : edge.slice(mid)
  const warmBase: Point[] = lit
    ? [[x0, cyBase], ...warmSlice, [warmSlice[warmSlice.length - 1][0], cyBase]]
    : [[warmSlice[0][0], cyBase], ...warmSlice, [x1, cyBase]]
  wash(ctx, warmBase, rng, { color: plan.warm, layers: 10, alpha: 0.12 / 10, spread: 0.035, jitter: 0.05 })

  const shadeSlice = lit ? edge.slice(mid) : edge.slice(0, mid + 1)
  const shadeBase: Point[] = lit
    ? [[shadeSlice[0][0], cyBase], ...shadeSlice, [x1, cyBase]]
    : [[x0, cyBase], ...shadeSlice, [shadeSlice[shadeSlice.length - 1][0], cyBase]]
  wash(ctx, shadeBase, rng, { color: shade, layers: 16, alpha: 0.32 / 16, spread: 0.045, jitter: 0.06 })

  // L'arête éclairée, nette — le seul bord franc de la masse.
  const edgeXY = lit ? edge[0] : edge[edge.length - 1]
  dryStroke(ctx, [[edgeXY[0], cyBase], [edgeXY[0], edgeXY[1]]], 1.2, rng, {
    color: accent,
    alpha: 0.4,
    layers: 2,
  })

  // Le sommet, pour y poser une figure assise : le point le plus haut du
  // contour, pas nécessairement `cx` — le tirage par sommet peut décaler le
  // point culminant.
  return edge.reduce((a, b) => (b[1] < a[1] ? b : a))
}
