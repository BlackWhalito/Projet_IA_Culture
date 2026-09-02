import type { MapZone } from '../../types/maps'

/**
 * La carte de France, dérivée de **points géographiques réels** plutôt que
 * dessinée à la main.
 *
 * Trois tentatives ont échoué avant celle-ci, et il vaut la peine de dire
 * pourquoi — c'est ce qui empêche de recommencer.
 *
 * 1. Le contour d'origine se voulait « schématique » : à l'écran, une patate.
 *    Ni Bretagne, ni Cotentin, ni côte méditerranéenne, ni Corse. Or « Cap
 *    sur » est un jeu de **repérage** : sur une silhouette méconnaissable, on
 *    ne raisonne pas, on devine.
 * 2. Une réécriture à l'estime a donné des proportions fausses — on ne juge
 *    pas de mémoire la largeur de la Normandie.
 * 3. Une réécriture posant les bons sommets mais **reliant les points par des
 *    courbes de Bézier choisies à la main** est restée mauvaise : les sommets
 *    étaient justes, les points de contrôle entre eux ne l'étaient pas. On a
 *    d'abord accusé le filtre aquarelle ; un rendu du tracé nu, sans aucun
 *    filtre, a montré que le filtre n'y était pour rien.
 *
 * D'où la forme actuelle : **on ne choisit plus aucun point de contrôle.** Le
 * fichier ne contient que 72 points côtiers et frontaliers réels, en longitude
 * et latitude, et une spline de Catmull-Rom les relie. Corriger la carte, c'est
 * désormais corriger un point de la liste — jamais une courbe.
 *
 * La projection est linéaire, avec deux facteurs différents :
 *
 *     x = 30 + (longitude + 4,8) × 41,5
 *     y = 40 + (51,1 − latitude) × 63,6
 *
 * Aux latitudes françaises un degré de longitude vaut environ 77 km contre 111
 * pour un degré de latitude ; sans cette correction, la France sortirait
 * étirée en largeur.
 *
 * Le résultat se juge à l'œil dans un navigateur, jamais à la lecture des
 * coordonnées.
 */
export const FRANCE_VIEWBOX = '0 0 660 690'

/** Longitude, latitude, et le lieu — le nom sert à retrouver le point à corriger. */
type PointCotier = readonly [number, number, string]

const FRANCE_POINTS: readonly PointCotier[] = [
  // La Manche, de Dunkerque vers l'ouest.
  [2.37, 51.03, 'Dunkerque'],
  [1.86, 50.95, 'Calais'],
  [1.58, 50.87, 'Cap Gris-Nez'],
  [1.61, 50.72, 'Boulogne-sur-Mer'],
  [1.59, 50.52, 'Le Touquet'],
  [1.55, 50.22, 'Baie de Somme'],
  [1.37, 50.06, 'Le Tréport'],
  [1.08, 49.92, 'Dieppe'],
  [0.37, 49.76, 'Fécamp'],
  [0.11, 49.49, 'Le Havre'],
  [0.23, 49.42, 'Honfleur'],
  [-0.25, 49.28, 'Ouistreham'],
  [-1.04, 49.39, 'Grandcamp'],
  // Le Cotentin : trois points suffisent à lui donner sa forme de presqu'île.
  [-1.26, 49.67, 'Barfleur'],
  [-1.62, 49.64, 'Cherbourg'],
  [-1.94, 49.72, 'Cap de la Hague'],
  [-1.79, 49.37, 'Carteret'],
  [-1.6, 48.84, 'Granville'],
  [-1.51, 48.63, 'Mont-Saint-Michel'],
  [-2.02, 48.65, 'Saint-Malo'],
  // La Bretagne, côte nord puis pointe puis côte sud.
  [-2.77, 48.51, 'Saint-Brieuc'],
  [-3.05, 48.78, 'Paimpol'],
  [-3.44, 48.82, 'Perros-Guirec'],
  [-3.98, 48.73, 'Roscoff'],
  [-4.49, 48.39, 'Brest'],
  [-4.74, 48.04, 'Pointe du Raz'],
  [-4.37, 47.8, 'Penmarch'],
  [-3.92, 47.87, 'Concarneau'],
  [-3.37, 47.75, 'Lorient'],
  [-3.12, 47.48, 'Quiberon'],
  [-2.76, 47.55, 'Vannes'],
  [-2.2, 47.28, 'Saint-Nazaire'],
  // La côte atlantique.
  [-1.78, 46.5, "Les Sables-d'Olonne"],
  [-1.15, 46.16, 'La Rochelle'],
  [-1.03, 45.63, 'Royan'],
  [-1.2, 45.3, 'Côte sauvage'],
  [-1.17, 44.66, 'Arcachon'],
  [-1.25, 44.39, 'Biscarrosse'],
  [-1.48, 43.49, 'Bayonne'],
  [-1.78, 43.37, 'Hendaye'],
  // Les Pyrénées, d'ouest en est.
  [-0.66, 42.96, "Pic d'Anie"],
  [0.59, 42.79, 'Luchon'],
  [1.52, 42.5, 'Andorre'],
  [2.65, 42.35, 'Cerdagne'],
  [3.17, 42.44, 'Cerbère'],
  // Le littoral méditerranéen, du Roussillon à Menton.
  [3.03, 42.8, 'Perpignan'],
  [3.15, 43.15, 'Narbonne'],
  [3.7, 43.4, 'Sète'],
  [4.43, 43.38, 'Camargue'],
  [5.37, 43.29, 'Marseille'],
  [5.93, 43.09, 'Toulon'],
  [6.64, 43.25, 'Saint-Tropez'],
  [7.02, 43.53, 'Cannes'],
  [7.51, 43.78, 'Menton'],
  // Les Alpes.
  [6.9, 44.35, 'Vallée de l’Ubaye'],
  [6.65, 44.9, 'Briançon'],
  [6.86, 45.83, 'Mont Blanc'],
  [6.15, 46.2, 'Genève'],
  // Le Jura.
  [6.35, 46.9, 'Pontarlier'],
  [7.0, 47.35, 'Delle'],
  [7.59, 47.55, 'Bâle'],
  // Le fossé rhénan : le bord est de l'Alsace.
  [7.42, 48.08, 'Colmar'],
  [7.79, 48.6, 'Strasbourg'],
  [8.23, 48.97, 'Lauterbourg'],
  // La frontière du nord-est, en remontant vers la Belgique.
  [7.07, 49.11, 'Sarreguemines'],
  [6.17, 49.36, 'Thionville'],
  [5.76, 49.52, 'Longwy'],
  [4.94, 49.7, 'Sedan'],
  [4.72, 49.77, 'Charleville-Mézières'],
  [4.15, 50.05, 'Avesnois'],
  [3.97, 50.28, 'Maubeuge'],
  [3.1, 50.78, 'Frontière de Lille'],
]

function projeter([lon, lat]: PointCotier): [number, number] {
  return [30 + (lon + 4.8) * 41.5, 40 + (51.1 - lat) * 63.6]
}

const arrondi = (n: number) => Math.round(n * 10) / 10

/**
 * Spline de Catmull-Rom fermée, convertie en courbes de Bézier cubiques.
 *
 * La tension de 0,85 (plutôt que 1) évite que la courbe ne dépasse ses points
 * dans les caps serrés — sans elle, la pointe du Raz partait au large.
 */
function contourFerme(points: readonly PointCotier[], tension = 0.85): string {
  const P = points.map(projeter)
  const n = P.length
  const au = (i: number) => P[((i % n) + n) % n]

  let d = `M${arrondi(P[0][0])},${arrondi(P[0][1])}`
  for (let i = 0; i < n; i++) {
    const [p0, p1, p2, p3] = [au(i - 1), au(i), au(i + 1), au(i + 2)]
    const c1x = p1[0] + ((p2[0] - p0[0]) / 6) * tension
    const c1y = p1[1] + ((p2[1] - p0[1]) / 6) * tension
    const c2x = p2[0] - ((p3[0] - p1[0]) / 6) * tension
    const c2y = p2[1] - ((p3[1] - p1[1]) / 6) * tension
    d += ` C${arrondi(c1x)},${arrondi(c1y)} ${arrondi(c2x)},${arrondi(c2y)} ${arrondi(p2[0])},${arrondi(p2[1])}`
  }
  return `${d} Z`
}

export const FRANCE_CONTOUR_PATH = contourFerme(FRANCE_POINTS)

/**
 * La Corse, tracée à part : séparée du continent, elle ne peut pas appartenir
 * au même chemin. Elle est posée à sa vraie place, et c'est l'un des repères
 * les plus efficaces de la carte — une France sans son île au large se
 * reconnaît nettement moins vite.
 */
export const FRANCE_CORSE_PATH =
  'M617,566 C625,572 626,588 621,606 C615,626 602,638 594,634 ' +
  'C588,628 590,610 596,592 C602,574 610,563 617,566 Z'


/**
 * Les reliefs, en hachures.
 *
 * Ils ne servent pas à enseigner la géologie : la carte était « un bloc de
 * couleur avec des traits et des points », et un pays plat ne donne envie de
 * rien. Trois massifs suffisent à faire lire un pays qui se soulève — Alpes,
 * Pyrénées, Massif central — et ils tombent chacun à leur vraie place.
 *
 * Chaque entrée est une hachure : un trait court, incliné dans le sens de la
 * pente, dont l'épaisseur dit la hauteur.
 */
export const FRANCE_RELIEFS: { d: string; epaisseur: number }[] = [
  // Les Alpes : la chaîne la plus haute, du Léman à la Méditerranée.
  { d: 'M474,352 l14,-9', epaisseur: 3.4 },
  { d: 'M486,372 l15,-10', epaisseur: 3.6 },
  { d: 'M492,396 l16,-10', epaisseur: 3.6 },
  { d: 'M496,420 l15,-10', epaisseur: 3.2 },
  { d: 'M500,444 l14,-9', epaisseur: 2.8 },
  { d: 'M462,368 l12,-8', epaisseur: 2.4 },
  { d: 'M470,392 l13,-8', epaisseur: 2.6 },
  { d: 'M476,416 l12,-8', epaisseur: 2.4 },
  // Les Pyrénées : une barre presque horizontale, d'Hendaye à Cerbère.
  { d: 'M196,536 l13,-7', epaisseur: 3.2 },
  { d: 'M226,542 l13,-7', epaisseur: 3.4 },
  { d: 'M256,548 l13,-7', epaisseur: 3.4 },
  { d: 'M286,552 l13,-7', epaisseur: 3.2 },
  { d: 'M316,554 l13,-7', epaisseur: 2.8 },
  // Le Massif central : un dôme au cœur du pays, plus bas et plus étalé.
  { d: 'M330,392 l11,-7', epaisseur: 2.2 },
  { d: 'M352,404 l11,-7', epaisseur: 2.4 },
  { d: 'M340,424 l11,-7', epaisseur: 2.4 },
  { d: 'M364,432 l11,-7', epaisseur: 2.2 },
  { d: 'M348,452 l11,-7', epaisseur: 2 },
  { d: 'M372,460 l10,-6', epaisseur: 1.9 },
  // Les Vosges et le Jura, discrets, à l'est.
  { d: 'M492,236 l11,-7', epaisseur: 2 },
  { d: 'M498,262 l11,-7', epaisseur: 2.2 },
  { d: 'M488,300 l11,-7', epaisseur: 2.2 },
]

/**
 * 5 des 8 pays frontaliers de la France (voir `cp-geographie-pays-voisins`) : Monaco,
 * l'Andorre et le Luxembourg sont réels mais trop petits pour rester lisibles comme
 * zones distinctes à cette échelle simplifiée. Décision produit mineure, à valider :
 * les ajouter demanderait surtout de l'espace, pas une nouvelle capacité technique.
 *
 * Villes et fleuves suivent la même projection que le contour. Une ville posée
 * au mauvais endroit ferait enseigner à « Cap sur » une géographie fausse —
 * c'est la seule chose que ce jeu ne peut pas se permettre.
 */
export const FRANCE_ZONES: MapZone[] = [
  { id: 'paris', label: 'Paris', kind: 'ville', cx: 327, cy: 182 },
  { id: 'lille', label: 'Lille', kind: 'ville', cx: 357, cy: 79 },
  { id: 'strasbourg', label: 'Strasbourg', kind: 'ville', cx: 538, cy: 202 },
  { id: 'rennes', label: 'Rennes', kind: 'ville', cx: 159, cy: 230 },
  { id: 'nantes', label: 'Nantes', kind: 'ville', cx: 165, cy: 287 },
  { id: 'lyon', label: 'Lyon', kind: 'ville', cx: 430, cy: 380 },
  { id: 'bordeaux', label: 'Bordeaux', kind: 'ville', cx: 205, cy: 438 },
  { id: 'toulouse', label: 'Toulouse', kind: 'ville', cx: 289, cy: 517 },
  { id: 'marseille', label: 'Marseille', kind: 'ville', cx: 450, cy: 528 },
  { id: 'nice', label: 'Nice', kind: 'ville', cx: 528, cy: 505 },

  {
    id: 'seine',
    label: 'La Seine',
    kind: 'fleuve',
    d: 'M392,268 Q350,216 327,184 Q292,156 240,148',
    labelX: 330,
    labelY: 150,
  },
  {
    id: 'loire',
    label: 'La Loire',
    kind: 'fleuve',
    d: 'M432,418 Q398,340 340,252 Q288,262 220,278 Q192,284 150,288',
    labelX: 268,
    labelY: 246,
  },
  {
    id: 'rhone',
    label: 'Le Rhône',
    kind: 'fleuve',
    d: 'M430,378 Q428,442 440,524',
    labelX: 470,
    labelY: 452,
  },
  {
    id: 'garonne',
    label: 'La Garonne',
    kind: 'fleuve',
    d: 'M289,514 Q248,472 205,440 Q192,418 186,396',
    labelX: 254,
    labelY: 536,
  },

  { id: 'espagne', label: 'Espagne', kind: 'pays-voisin', cx: 245, cy: 636 },
  { id: 'belgique', label: 'Belgique', kind: 'pays-voisin', cx: 420, cy: 58 },
  { id: 'allemagne', label: 'Allemagne', kind: 'pays-voisin', cx: 618, cy: 148 },
  { id: 'suisse', label: 'Suisse', kind: 'pays-voisin', cx: 594, cy: 302 },
  { id: 'italie', label: 'Italie', kind: 'pays-voisin', cx: 596, cy: 434 },
]

export const FRANCE_ZONES_BY_ID: Record<string, MapZone> = Object.fromEntries(
  FRANCE_ZONES.map((zone) => [zone.id, zone]),
)
