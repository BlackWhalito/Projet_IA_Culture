import type { MapZone } from '../../types/maps'

/**
 * Carte simplifiée en code (aucune illustration externe, voir la skill `aquarelle`) :
 * un contour schématique de l'Hexagone, pas un tracé cartographique précis. Les
 * coordonnées sont choisies pour rester reconnaissables et bien espacées à l'échelle
 * d'un enfant de CP, pas pour l'exactitude géographique au pixel près.
 */
export const FRANCE_VIEWBOX = '0 0 600 640'

/**
 * Contour et positions **projetés depuis de vraies coordonnées (longitude,
 * latitude)**, pas dessinés à la main.
 *
 * Deux essais successifs de tracé à la main ont été jugés ratés par le
 * propriétaire (« on dirait un pâté », puis « ça ne ressemble à rien ») :
 * ajuster des points de contrôle de courbes de Bézier à l'aveugle ne produit
 * jamais une silhouette reconnaissable, quel que soit le nombre d'itérations.
 * La bonne méthode était de partir de la géographie réelle — une cinquantaine
 * de points de côte et de frontière (Dunkerque, cap de la Hague, pointe du
 * Raz, Gironde, Pyrénées, golfe du Lion, Alpes, Rhin), projetés en
 * équirectangulaire avec la longitude comprimée par cos(46,7°) pour ne pas
 * étirer le pays en largeur.
 *
 * Conséquence utile au-delà de l'esthétique : les villes sont désormais à
 * leur place réelle les unes par rapport aux autres, donc les questions de
 * points cardinaux (« la ville la plus à l'est ») sont géographiquement
 * justes, ce qu'un tracé approximatif ne garantissait pas.
 *
 * Les segments restent droits : le filtre aquarelle (`aq-bord-*`) déforme
 * déjà le trait, et lisser en courbes par-dessus arrondirait justement les
 * caps qui font reconnaître la France.
 *
 * Le générateur ayant produit ces chiffres est reproductible — reprendre la
 * liste de coordonnées et la même projection pour toute retouche, plutôt que
 * de déplacer un point à la main.
 */
export const FRANCE_CONTOUR_PATH =
  'M335,35 L302,45 L301,89 L246,122 L242,136 L201,142 L187,124 L158,121 ' +
  'L174,155 L176,192 L123,195 L62,190 L42,209 L60,228 L44,232 L78,248 ' +
  'L100,251 L148,282 L165,333 L191,356 L194,394 L190,454 L181,498 L174,532 ' +
  'L165,541 L209,574 L265,584 L308,597 L367,601 L362,564 L389,538 L436,541 ' +
  'L457,544 L480,556 L508,554 L535,518 L545,512 L520,474 L524,419 L518,377 ' +
  'L488,353 L485,338 L515,300 L548,263 L549,215 L554,196 L562,166 L513,158 ' +
  'L488,137 L475,132 L437,116 L409,84 L387,70 L363,61 L342,31 Z'

/**
 * 5 des 8 pays frontaliers de la France (voir `cp-geographie-pays-voisins`) : Monaco,
 * l'Andorre et le Luxembourg sont réels mais trop petits pour rester lisibles comme
 * zones distinctes à cette échelle simplifiée. Décision produit mineure, à valider :
 * les ajouter demanderait surtout de l'espace, pas une nouvelle capacité technique.
 */
export const FRANCE_ZONES: MapZone[] = [
  { id: 'paris', label: 'Paris', kind: 'ville', cx: 334, cy: 178 },
  { id: 'lille', label: 'Lille', kind: 'ville', cx: 363, cy: 61 },
  { id: 'strasbourg', label: 'Strasbourg', kind: 'ville', cx: 554, cy: 196 },
  { id: 'rennes', label: 'Rennes', kind: 'ville', cx: 169, cy: 227 },
  { id: 'nantes', label: 'Nantes', kind: 'ville', cx: 174, cy: 286 },
  { id: 'lyon', label: 'Lyon', kind: 'ville', cx: 435, cy: 382 },
  { id: 'bordeaux', label: 'Bordeaux', kind: 'ville', cx: 214, cy: 443 },
  { id: 'toulouse', label: 'Toulouse', kind: 'ville', cx: 296, cy: 524 },
  { id: 'marseille', label: 'Marseille', kind: 'ville', cx: 457, cy: 544 },
  { id: 'nice', label: 'Nice', kind: 'ville', cx: 535, cy: 518 },

  {
    id: 'seine',
    label: 'La Seine',
    kind: 'fleuve',
    d: 'M430,248 L372,208 L334,178 L307,155 L283,139 L242,136',
    labelX: 300,
    labelY: 148,
  },
  {
    id: 'loire',
    label: 'La Loire',
    kind: 'fleuve',
    d: 'M409,442 L360,346 L332,280 L315,241 L266,274 L174,286 L148,282',
    labelX: 255,
    labelY: 300,
  },
  {
    id: 'rhone',
    label: 'Le Rhône',
    kind: 'fleuve',
    d: 'M479,353 L435,382 L437,437 L434,501 L436,541',
    labelX: 466,
    labelY: 452,
  },
  {
    id: 'garonne',
    label: 'La Garonne',
    kind: 'fleuve',
    d: 'M274,570 L296,524 L263,485 L214,443 L194,394',
    labelX: 232,
    labelY: 500,
  },

  { id: 'espagne', label: 'Espagne', kind: 'pays-voisin', cx: 221, cy: 626 },
  { id: 'belgique', label: 'Belgique', kind: 'pays-voisin', cx: 417, cy: 40 },
  { id: 'allemagne', label: 'Allemagne', kind: 'pays-voisin', cx: 583, cy: 149 },
  { id: 'suisse', label: 'Suisse', kind: 'pays-voisin', cx: 577, cy: 310 },
  { id: 'italie', label: 'Italie', kind: 'pays-voisin', cx: 579, cy: 452 },
]

export const FRANCE_ZONES_BY_ID: Record<string, MapZone> = Object.fromEntries(
  FRANCE_ZONES.map((zone) => [zone.id, zone]),
)
