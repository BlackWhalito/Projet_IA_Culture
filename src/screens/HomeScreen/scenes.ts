import type { PaintScene } from '../../components/watercolor/WatercolorScene'
import { dryStroke, granulation, hardEdge, polygon, reserve, stroke, wash } from '../../components/watercolor/engine'
import type { Point } from '../../components/watercolor/engine'
import {
  column,
  dome,
  facade,
  fallenColumn,
  pediment,
  ruinFacade,
} from '../../components/watercolor/architecture'
import { cloud, gradedWash, reflection, ripples } from '../../components/watercolor/atmosphere'
import { adultReading, childWatchingSea, girlWriting } from '../../components/watercolor/figure'
import { litFromLeft } from '../../components/watercolor/light'
import type { LightPlan } from '../../components/watercolor/light'

/**
 * Les deux tableaux qui encadrent l'accueil. Pensés comme des aquarelles
 * abstraites, pas comme des illustrations : on lit une atmosphère avant de
 * lire un sujet. La palette reste celle de la skill `aquarelle`, dominée par
 * le bleu ardoise et portée par les violets qui font les ombres.
 */

const BLEU = '#5a7fa0'
const BLEU_CLAIR = '#8fb0c9'
const TURQUOISE = '#4f9a92'
const VIOLET = '#8d6aa8'
const VIOLET_BRUME = '#c3b0d4'
const VIOLET_PROFOND = '#5d4574'
const OCRE = '#c1663f'
const SABLE = '#d9a35f'
const VERT = '#7a9455'
const PAPIER = '#f7f2e7'
const ENCRE_SOMBRE = '#241d2b'
const PIERRE_CHAUDE = '#d8bd96'
const PIERRE_PALE = '#e6d9c4'

/**
 * La lumière unique des deux tableaux : elle vient de la gauche, chaude, et
 * toutes les ombres tombent donc à droite de chaque volume. C'est cette
 * décision prise une seule fois qui fait que les éléments se répondent —
 * l'harmonie qui manquait quand chaque objet calculait son ombre seul.
 */
const LUMIERE: LightPlan = {
  angleDeg: 200,
  warm: SABLE,
  cool: VIOLET_PROFOND,
  accent: ENCRE_SOMBRE,
}

/**
 * Un éclat de lumière réservée sur l'eau : un trait fin et allongé, jamais
 * une nappe. `highlight()`/`wash()` déforme toujours une forme aussi plate
 * (un ratio largeur/hauteur élevé) vers un disque, quels que soient les
 * réglages de `spread`/`jitter` — le contour fermé finit par s'arrondir.
 * `dryStroke`, fait pour les traits, garde le fil de lumière.
 */
function glint(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  length: number,
  thickness: number,
  rng: () => number,
  alpha: number,
): void {
  dryStroke(ctx, [
    [cx - length / 2, cy],
    [cx, cy + (rng() - 0.5) * thickness],
    [cx + length / 2, cy],
  ], thickness, rng, { color: PAPIER, alpha, layers: 2, jitter: 0.05 })
}

/** Chemin ondulant d'un bord à l'autre, à hauteur `y`. */
function houle(y: number, amplitude: number, w: number, rng: () => number): Point[] {
  const points: Point[] = []
  for (let i = 0; i <= 12; i += 1) {
    points.push([(i / 12) * w, y + Math.sin(i * 1.3 + amplitude) * amplitude + (rng() - 0.5) * amplitude * 0.6])
  }
  return points
}

/**
 * Une voile : un triangle penché, sa coque, son mât. Minuscule — c'est ce
 * qui donne l'échelle à la lagune. Sans un objet de taille connue, une
 * étendue d'eau n'a aucune profondeur lisible.
 */
function voile(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  taille: number,
  rng: () => number,
  distance: number,
): void {
  const alpha = 0.5 * (1 - distance * 0.7)
  reserve(ctx, [
    [x, y - taille * 2.1],
    [x + taille * 0.85, y - taille * 0.1],
    [x - taille * 0.15, y - taille * 0.1],
  ], rng, 0.95 - distance * 0.45)
  dryStroke(ctx, [[x, y - taille * 2.2], [x, y]], taille * 0.1, rng, {
    color: ENCRE_SOMBRE,
    alpha: alpha * 0.8,
    layers: 2,
  })
  dryStroke(ctx, [[x - taille * 0.9, y], [x + taille * 0.9, y]], taille * 0.22, rng, {
    color: ENCRE_SOMBRE,
    alpha: alpha * 0.9,
    layers: 2,
  })
}

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
function rocher(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cyBase: number,
  width: number,
  height: number,
  rng: () => number,
  plan: LightPlan,
  options: { stone: string; shade: string },
): Point {
  const { stone, shade } = options
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
    color: ENCRE_SOMBRE,
    alpha: 0.4,
    layers: 2,
  })

  // Le sommet, pour y poser une figure assise : le point le plus haut du
  // contour, pas nécessairement `cx` — le tirage par sommet peut décaler le
  // point culminant.
  return edge.reduce((a, b) => (b[1] < a[1] ? b : a))
}

/**
 * Gauche — la lagune. Un vrai lieu plutôt qu'une abstraction : une rive
 * lointaine et pâle à l'horizon, des voiles qui donnent l'échelle, une
 * étendue d'eau qui occupe les deux tiers bas. Même lumière que la cité
 * engloutie (`LUMIERE`), pour que les deux tableaux se répondent.
 *
 * Une étendue d'eau seule, sans horizon ni objet de taille connue, se lit
 * comme des bandes de couleur empilées — c'est le sujet qui fait la
 * profondeur, pas la matière.
 */
export const oceanScene: PaintScene = (ctx, w, h, rng) => {
  const horizon = h * 0.34

  // Ciel : un vrai dégradé continu, plus dense et plus froid en haut, se
  // vidant vers l'horizon où le papier reste presque nu. C'est cette bande
  // claire juste au-dessus de l'eau qui donne la lumière du tableau.
  gradedWash(ctx, -w * 0.05, 0, w * 1.05, horizon, [
    { at: 0, color: VIOLET, alpha: 0.36 },
    { at: 0.42, color: VIOLET_BRUME, alpha: 0.26 },
    { at: 0.78, color: SABLE, alpha: 0.18 },
    { at: 1, color: SABLE, alpha: 0.06 },
  ])

  // Trois nuages, décalés et de tailles franchement inégales — alignés ou
  // de même taille, ils redeviennent une frise décorative.
  cloud(ctx, w * 0.34, h * 0.075, w * 0.52, h * 0.055, rng, LUMIERE, {
    light: PIERRE_PALE,
    shade: VIOLET,
    alpha: 0.17,
    highlight: PAPIER,
  })
  cloud(ctx, w * 0.86, h * 0.18, w * 0.34, h * 0.03, rng, LUMIERE, {
    light: PIERRE_PALE,
    shade: VIOLET_BRUME,
    alpha: 0.11,
    highlight: PAPIER,
  })


  // La rive lointaine : des silhouettes très pâles, à peine posées, avec un
  // campanile qui dépasse — assez pour que l'horizon soit un lieu.
  facade(ctx, w * 0.24, horizon - h * 0.045, horizon, w * 0.3, rng, LUMIERE, {
    stone: VIOLET_BRUME,
    shade: VIOLET,
    distance: 0.92,
    floors: 0,
    bays: 0,
  })
  facade(ctx, w * 0.62, horizon - h * 0.03, horizon, w * 0.34, rng, LUMIERE, {
    stone: VIOLET_BRUME,
    shade: VIOLET,
    distance: 0.94,
    floors: 0,
    bays: 0,
  })
  // Le campanile de la rive : il doit rester dans la même valeur pâle que
  // le reste de l'horizon. Plus saturé que ce qui l'entoure, il se détache
  // comme une barre posée devant plutôt qu'un bâtiment dans la brume.
  facade(ctx, w * 0.44, horizon - h * 0.075, horizon, w * 0.035, rng, LUMIERE, {
    stone: VIOLET_BRUME,
    shade: VIOLET,
    distance: 0.9,
    floors: 0,
    bays: 0,
  })
  dome(ctx, w * 0.78, horizon - h * 0.025, w * 0.05, rng, LUMIERE, {
    stone: VIOLET_BRUME,
    shade: VIOLET,
    distance: 0.9,
  })

  // L'eau : des masses larges et superposées, de plus en plus sombres et
  // franches en descendant — c'est la perspective, l'eau lointaine est
  // toujours plus pâle que celle qui est à nos pieds.
  // L'eau : un seul dégradé continu du pâle (horizon) au profond (premier
  // plan). Des ellipses de couleurs différentes empilées se liraient
  // toujours comme des bandes — l'œil trouve la frontière quel que soit le
  // recouvrement.
  // Un dégradé natif est bien plus faible qu'une accumulation de lavis à
  // opacité comparable : il ne passe qu'une fois. Les valeurs doivent donc
  // être nettement plus hautes qu'on ne l'attend.
  gradedWash(ctx, -w * 0.05, horizon, w * 1.05, h * 1.02, [
    { at: 0, color: SABLE, alpha: 0.07 },
    { at: 0.16, color: BLEU_CLAIR, alpha: 0.16 },
    { at: 0.42, color: TURQUOISE, alpha: 0.34 },
    { at: 0.7, color: BLEU, alpha: 0.54 },
    { at: 0.88, color: VIOLET_PROFOND, alpha: 0.66 },
    { at: 1, color: ENCRE_SOMBRE, alpha: 0.5 },
  ])

  // Le bord de flaque à l'horizon : là où la flaque du ciel s'est arrêtée, le
  // pigment a migré vers sa limite et y a laissé une ligne dense. Une seule
  // ligne dure dans tout le haut du tableau suffit à réveiller l'ensemble.
  hardEdge(ctx, [
    [w * 0.02, horizon + h * 0.0015],
    [w * 0.2, horizon - h * 0.0018],
    [w * 0.46, horizon + h * 0.001],
  ], 1.6, rng, { color: VIOLET, alpha: 0.22 })
  hardEdge(ctx, [
    [w * 0.62, horizon - h * 0.001],
    [w * 0.86, horizon + h * 0.0016],
    [w * 1.0, horizon],
  ], 1.4, rng, { color: VIOLET, alpha: 0.18 })

  // Les reflets de la rive, tirés verticalement juste sous l'horizon.
  reflection(ctx, w * 0.24, w * 0.3, horizon, h * 0.045, VIOLET_BRUME, rng, 5)
  reflection(ctx, w * 0.62, w * 0.34, horizon, h * 0.038, VIOLET_BRUME, rng, 5)
  reflection(ctx, w * 0.44, w * 0.04, horizon, h * 0.055, VIOLET, rng, 2)

  // Les rides, en perspective : serrées et fines près de l'horizon, plus
  // rares et plus marquées au premier plan. C'est cette variation d'échelle
  // qui couche le plan d'eau — des touches de taille constante feraient
  // lire un mur vertical texturé.
  ripples(ctx, 0, w, horizon + h * 0.02, h * 1.0, 34, rng, {
    color: BLEU,
    accent: VIOLET_PROFOND,
  })

  // Les voiles : deux au loin, minuscules, une plus près et plus franche.
  // La réserve maîtresse : la bande de lumière juste sous l'horizon. C'est
  // elle qui fait respirer tout le tableau — un plan d'eau sans clair franc
  // reste une nappe de couleur.
  //
  // Posée AVANT les voiles : une réserve efface tout ce qui est déjà là, sans
  // distinction. Appelée après, elle mangeait la coque des deux voiliers du
  // fond, qui se retrouvaient à flotter sur du blanc.
  reserve(ctx, [
    [-w * 0.05, horizon + h * 0.01],
    [w * 0.38, horizon + h * 0.005],
    [w * 0.76, horizon + h * 0.012],
    [w * 1.05, horizon + h * 0.008],
    [w * 1.05, horizon + h * 0.024],
    [w * 0.62, horizon + h * 0.03],
    [w * 0.22, horizon + h * 0.022],
    [-w * 0.05, horizon + h * 0.028],
  ], rng, 0.7)

  voile(ctx, w * 0.3, horizon + h * 0.035, w * 0.035, rng, 0.75)
  voile(ctx, w * 0.68, horizon + h * 0.05, w * 0.045, rng, 0.6)
  voile(ctx, w * 0.44, h * 0.62, w * 0.075, rng, 0.15)

  // Éclats de lumière réservée sur les crêtes.
  stroke(ctx, houle(h * 0.55, 4, w * 0.8, rng), 2, rng, { color: PAPIER, alpha: 0.045, layers: 10 })
  reserve(ctx, [
    [w * 0.4, h * 0.494], [w * 0.52, h * 0.4875], [w * 0.84, h * 0.4835],
    [w * 0.94, h * 0.489], [w * 0.84, h * 0.4945], [w * 0.52, h * 0.4985],
  ], rng, 0.55)
  reserve(ctx, [
    [w * 0.05, h * 0.7645], [w * 0.16, h * 0.7575], [w * 0.42, h * 0.7535],
    [w * 0.52, h * 0.759], [w * 0.42, h * 0.7645], [w * 0.16, h * 0.7685],
  ], rng, 0.48)

  // La granulation de l'eau : les grains d'un pigment lourd se déposent dans
  // les creux du papier, d'autant plus dru que le lavis est profond. C'est ce
  // gradient de densité, plus que le piqueté lui-même, qui fait le pigment.
  granulation(ctx, 0, horizon + h * 0.12, w, h * 0.85, 520, rng, {
    color: VIOLET_PROFOND,
    alpha: 0.2,
  })

  // Une profondeur qui referme le bas du tableau.
  wash(ctx, polygon(w * 0.5, h * 1.06, w * 0.95, h * 0.2, 11, 0, rng), rng, {
    color: VIOLET_PROFOND,
    layers: 20,
    alpha: 0.055,
    spread: 0.16,
  })
  wash(ctx, polygon(w * 0.5, h * 1.12, w * 0.8, h * 0.13, 9, 0, rng), rng, {
    color: ENCRE_SOMBRE,
    layers: 14,
    alpha: 0.045,
    spread: 0.2,
  })

  // Le rocher et l'enfant : premier plan qui ancre le regard, peint en
  // dernier pour rester le point le plus net du tableau. La base mord
  // légèrement le bord bas du canvas — un rocher de premier plan qui
  // s'arrête net sur une ligne aurait l'air posé plutôt qu'ancré.
  // Taille et contraste largement au-dessus du premier essai : à taille
  // d'affichage réelle (~170px de large), un rocher à l'échelle d'une
  // voile lointaine se perd complètement — le premier plan a besoin d'une
  // masse et d'une valeur nettement plus fortes que tout le reste du
  // tableau pour se lire comme proche plutôt que comme un débris flottant.
  // `stone` en VIOLET_PROFOND, pas ENCRE_SOMBRE comme la première version :
  // les deux valaient la même teinte quasi noire, donc toute la masse
  // restait sombre au sommet. En `multiply`, une couleur posée sur un fond
  // quasi noir reste quasi noire quelle que soit sa teinte — mesuré par le
  // `verificateur` sur le vêtement de l'enfant (écart de ~18/255 à peine),
  // qui fusionnait avec le rocher plutôt que de s'en détacher. `shade`
  // garde ENCRE_SOMBRE pour l'ombre portée, mais la face éclairée reste
  // assez claire pour qu'une figure posée dessus s'en distingue encore.
  const rockTop = rocher(ctx, w * 0.64, h * 1.0, w * 0.72, h * 0.2, rng, LUMIERE, {
    stone: VIOLET_PROFOND,
    shade: ENCRE_SOMBRE,
  })
  // Assise relevée au-dessus du sommet plutôt qu'à cheval dessus : posée
  // dans la masse du rocher, la silhouette (torse, genoux) se fondait dans
  // sa teinte la plus sombre. Contre le ciel, elle reste nette quelle que
  // soit la face du rocher sur laquelle tombe le sommet.
  childWatchingSea(ctx, rockTop[0], rockTop[1] + h * 0.004, h * 0.085, rng, LUMIERE, {
    skin: PIERRE_CHAUDE,
    hair: VIOLET_PROFOND,
    clothes: OCRE,
    accent: ENCRE_SOMBRE,
  })
}
/**
 * Droite — la cité engloutie. Un temple en ruine au premier plan, un dôme
 * encore debout, et l'eau qui a tout englouti jusqu'au quai.
 *
 * Réécrite après l'avoir enfin regardée à sa taille d'affichage réelle
 * (317px de large, pas 170) : la version précédente se lisait comme une
 * skyline moderne — une dizaine de tours fines, à angles droits, percées de
 * fenêtres rectangulaires régulièrement espacées. Ce sont ces fenêtres, plus
 * que tout le reste, qui disaient « immeuble de bureaux » : l'Antiquité n'a
 * pas de grille de fenêtres, elle a des ouvertures rares et sombres.
 *
 * Trois décisions en découlent, et elles priment sur l'envie d'ajouter de la
 * matière (voir `references/peinture-generative.md`, « le piège fondateur ») :
 *
 * 1. **Moins de masses, plus grandes.** Cinq volumes lisibles valent mieux que
 *    dix silhouettes qui se confondent en peigne.
 * 2. **Un temple, pas une colonnade éparse.** Deux fûts épais surmontés d'un
 *    fronton, assez grands pour être lus d'un coup : c'est le repère le plus
 *    univoque de l'Antiquité, bien plus qu'une colonne isolée au loin.
 * 3. **Des noirs, enfin.** La version d'avant n'avait aucune valeur dense.
 *    Quelques ouvertures sombres et la coque de la barque suffisent — étalé,
 *    le noir alourdit, concentré il structure.
 */
export const citeEngloutieScene: PaintScene = (ctx, w, h, rng) => {
  const quai = h * 0.68

  // Ciel : un dégradé continu, chaud en haut, qui se vide vers l'horizon.
  // Confiné au ciel — en `multiply`, un lavis qui déborde sur la ville reste
  // visible À TRAVERS les façades et se lit comme une écharpe.
  gradedWash(ctx, -w * 0.05, 0, w * 1.05, h * 0.4, [
    { at: 0, color: OCRE, alpha: 0.24 },
    { at: 0.4, color: VIOLET_BRUME, alpha: 0.28 },
    { at: 0.8, color: SABLE, alpha: 0.16 },
    { at: 1, color: SABLE, alpha: 0.05 },
  ])

  // Trois nuages franchement inégaux, décalés, à des hauteurs différentes.
  // La version d'avant en alignait de même taille et de même hauteur : à
  // l'écran, une frise de festons identiques, le contraire d'un ciel.
  cloud(ctx, w * 0.68, h * 0.08, w * 0.5, h * 0.052, rng, LUMIERE, {
    light: VIOLET_BRUME,
    shade: VIOLET,
    alpha: 0.16,
    highlight: PAPIER,
  })
  cloud(ctx, w * 0.2, h * 0.2, w * 0.32, h * 0.028, rng, LUMIERE, {
    light: VIOLET_BRUME,
    shade: VIOLET,
    alpha: 0.1,
    highlight: PAPIER,
  })

  // Peu d'éléments, bien séparés. Les versions précédentes empilaient façades
  // lointaines, arcades isolées et éclats de pierre : sans mur derrière elles,
  // les arches se lisaient comme des pierres tombales, et l'ensemble redevenait
  // un amas de petits blocs pâles — le défaut même qu'on cherchait à quitter.
  // Ici : un temple, un dôme, deux gisants. Rien d'autre.

  // Le dôme, posé sur un socle bas et large plutôt que sur une tour. Un
  // rectangle vertical sous une coupole redonne un bâtiment coiffé.
  dome(ctx, w * 0.82, h * 0.47, w * 0.15, rng, LUMIERE, {
    stone: PIERRE_PALE,
    shade: VIOLET,
    distance: 0.45,
  })
  ruinFacade(ctx, w * 0.82, h * 0.57, quai, w * 0.19, rng, LUMIERE, {
    stone: PIERRE_PALE,
    shade: VIOLET_PROFOND,
    moss: VERT,
    distance: 0.45,
    floors: 0,
    bays: 0,
    decay: 0.75,
  })

  // LE TEMPLE — le sujet, et le seul.
  //
  // Le verdict était « ça fait juste des immeubles » : c'est qu'une ruine
  // antique ne se lit pas à ses murs mais à ses COLONNES. Quatre fûts très
  // espacés — deux encore debout sous leur fronton, deux rompus de part et
  // d'autre. C'est l'inégalité des hauteurs, et le ciel visible ENTRE les
  // fûts, qui font la ruine ; serrés, ils fusionnent en un bloc rayé.
  const futR = w * 0.045
  const colonnade: Array<[number, number, boolean]> = [
    [0.12, 0.12, true],
    [0.32, 0.25, false],
    [0.54, 0.25, false],
    [0.72, 0.165, true],
  ]
  for (const [fx, fh, cassee] of colonnade) {
    column(ctx, w * fx, quai, h * fh, futR, rng, LUMIERE, {
      stone: cassee ? PIERRE_CHAUDE : PIERRE_PALE,
      shade: VIOLET_PROFOND,
      distance: 0.08,
      broken: cassee,
    })
  }

  // Le fronton ne coiffe QUE les deux fûts entiers : un temple dont la moitié
  // s'est effondrée. Complet, il dirait « monument intact », l'inverse du sujet.
  pediment(ctx, w * 0.43, quai - h * 0.25 - futR * 1.05, w * 0.34, h * 0.03, rng, LUMIERE, {
    stone: PIERRE_CHAUDE,
    shade: VIOLET_PROFOND,
    distance: 0.08,
  })

  // Les tambours couchés : une colonne qui tombe se brise à ses jointures,
  // elle ne reste jamais entière. C'est le sol jonché qui achève de dire la
  // ruine — mais deux gisants suffisent, au-delà on refait un amas.
  fallenColumn(ctx, w * 0.24, quai - h * 0.006, w * 0.2, w * 0.028, rng, LUMIERE, {
    stone: PIERRE_CHAUDE,
    shade: VIOLET_PROFOND,
    distance: 0.06,
  })
  fallenColumn(ctx, w * 0.64, quai - h * 0.014, w * 0.14, w * 0.02, rng, LUMIERE, {
    stone: PIERRE_PALE,
    shade: VIOLET_PROFOND,
    distance: 0.2,
  })

  // Les reflets : tirés vers le bas puis cassés par des rides. Un reflet qui
  // ne serait qu'une copie délavée reste une tache ; ce sont les cassures qui
  // en font de l'eau. Raccourcis par rapport à la version d'avant, où ils
  // descendaient si bas qu'ils se lisaient comme des rayures verticales.
  for (const [cx, largeur, color, longueur] of [
    [0.1, 0.28, VIOLET_PROFOND, 0.075],
    [0.56, 0.46, PIERRE_CHAUDE, 0.06],
    [0.78, 0.26, PIERRE_PALE, 0.055],
  ] as Array<[number, number, string, number]>) {
    reflection(ctx, w * cx, w * largeur, quai, h * longueur, color, rng, 8)
  }

  // L'eau, tenue sous la ligne de quai pour la même raison que le ciel.
  gradedWash(ctx, -w * 0.05, quai, w * 1.05, h * 1.02, [
    { at: 0, color: SABLE, alpha: 0.1 },
    { at: 0.2, color: BLEU_CLAIR, alpha: 0.2 },
    { at: 0.46, color: TURQUOISE, alpha: 0.28 },
    { at: 0.7, color: BLEU, alpha: 0.4 },
    { at: 1, color: VIOLET_PROFOND, alpha: 0.52 },
  ])
  // Les rides, en perspective : serrées près du quai, plus rares et plus
  // marquées au premier plan. C'est cette variation d'échelle qui couche le
  // plan d'eau — des touches de taille constante feraient lire un mur.
  ripples(ctx, 0, w, quai + h * 0.012, h * 1.0, 30, rng, {
    color: BLEU,
    accent: VIOLET_PROFOND,
  })
  stroke(ctx, houle(h * 0.78, 3, w * 0.9, rng), 2, rng, { color: PAPIER, alpha: 0.04, layers: 9 })

  // La barque : petite, décalée, avec sa voile et son sillage. C'est elle qui
  // donne l'échelle — sans objet de taille connue, la ville n'est pas immense,
  // elle est juste dessinée.
  const bx = w * 0.34
  const by = h * 0.84
  const s = w * 0.05
  wash(ctx, [
    [bx - s, by],
    [bx + s, by],
    [bx + s * 0.6, by + s * 0.5],
    [bx - s * 0.6, by + s * 0.5],
  ], rng, { color: VIOLET_PROFOND, layers: 22, alpha: 0.05, spread: 0.06, jitter: 0.07 })
  wash(ctx, [
    [bx, by - s * 1.9],
    [bx + s * 0.85, by - s * 0.1],
    [bx - s * 0.2, by - s * 0.1],
  ], rng, { color: OCRE, layers: 24, alpha: 0.04, spread: 0.06, jitter: 0.06 })
  dryStroke(ctx, [[bx, by - s * 2], [bx, by]], 1.4, rng, { color: ENCRE_SOMBRE, alpha: 0.5, layers: 3 })
  dryStroke(ctx, [[bx - s, by], [bx + s * 0.6, by + s * 0.5]], 1.6, rng, {
    color: ENCRE_SOMBRE,
    alpha: 0.45,
    layers: 2,
  })
  stroke(ctx, [[bx - s * 1.6, by + s * 0.7], [bx + s * 2.4, by + s * 0.55]], 2.4, rng, {
    color: PAPIER,
    alpha: 0.045,
    layers: 10,
  })

  // Éclats de lumière réservée : toujours des traits fins, jamais des nappes.
  // Une couleur saturée se lirait comme une tache posée sur l'eau, et une
  // forme ronde comme un galet flottant — les deux ont déjà été essayées.
  glint(ctx, w * 0.66, h * 0.75, w * 0.16, h * 0.006, rng, 0.45)
  glint(ctx, w * 0.24, h * 0.92, w * 0.14, h * 0.005, rng, 0.4)

  // Un dernier voile vert-de-gris sur l'eau basse, pour le côté submergé.
  wash(ctx, polygon(w * 0.5, h * 0.95, w * 0.75, h * 0.06, 10, 0, rng), rng, {
    color: VERT,
    layers: 14,
    alpha: 0.016,
    spread: 0.2,
  })
}

/**
 * Le bandeau au-dessus du titre : une enfant qui écrit à son bureau, qui
 * lève les yeux vers le joueur. Le bas du canvas passe légèrement sous le
 * titre (marge négative en CSS) — le bureau peut y mordre sans problème,
 * mais la tête doit rester nettement au-dessus de cette ligne, elle est le
 * seul endroit où un défaut se verrait vraiment.
 *
 * L'atmosphère (deux lavis pâles) reste à gauche, sobre : la figure est le
 * sujet, pas un élément de plus au milieu des autres.
 */
export const bandeauScene: PaintScene = (ctx, w, h, rng) => {
  stroke(ctx, houle(h * 0.8, 3, w * 0.96, rng), 2, rng, { color: VIOLET_PROFOND, alpha: 0.014, layers: 8 })

  // Deux adultes qui lisent, à la place des deux lavis abstraits d'origine
  // — même emplacement, même famille de teintes (violet/bleu, déjà la
  // charte graphique de ce coin du bandeau), mais des silhouettes
  // reconnaissables plutôt que des taches de couleur. Postées au même
  // niveau de sol que la fillette (`h*0.74`, l'ourlet de sa robe) pour que
  // les trois figures partagent une seule ligne de base.
  //
  // `VIOLET`/`BLEU`, pas `VIOLET_BRUME`/`BLEU_CLAIR` (les teintes des
  // lavis d'origine) : ces variantes pâles étaient pensées pour une
  // atmosphère de fond à faible contraste, pas pour porter un livre. En
  // `multiply`, un livre `PAPIER` (quasi blanc) posé sur un vêtement déjà
  // quasi blanc ne produit presque aucun contraste — signalé par le
  // `verificateur` : la lecture ne se lisait plus, seul le contour du
  // livre restait visible. `girlWriting`, juste à côté, pose le même
  // `PAPIER` sur `VIOLET` (nettement plus saturé) sans ce problème.
  adultReading(ctx, w * 0.15, h * 0.76, h * 0.21, rng, LUMIERE, {
    skin: PIERRE_CHAUDE,
    hair: VIOLET_PROFOND,
    clothes: VIOLET,
    paper: PAPIER,
    accent: ENCRE_SOMBRE,
  })
  adultReading(ctx, w * 0.31, h * 0.76, h * 0.19, rng, LUMIERE, {
    skin: PIERRE_CHAUDE,
    hair: VIOLET_PROFOND,
    clothes: BLEU,
    paper: PAPIER,
    accent: ENCRE_SOMBRE,
  })

  girlWriting(ctx, w * 0.74, h * 0.72, h * 0.235, rng, LUMIERE, {
    skin: PIERRE_CHAUDE,
    hair: VIOLET_PROFOND,
    dress: VIOLET,
    wood: SABLE,
    paper: PAPIER,
    accent: ENCRE_SOMBRE,
  })
}
