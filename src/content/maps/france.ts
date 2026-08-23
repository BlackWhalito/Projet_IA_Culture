import type { MapZone } from '../../types/maps'

/**
 * Carte simplifiée en code (aucune illustration externe, voir la skill `aquarelle`) :
 * un contour schématique de l'Hexagone, pas un tracé cartographique précis. Les
 * coordonnées sont choisies pour rester reconnaissables et bien espacées à l'échelle
 * d'un enfant de CP, pas pour l'exactitude géographique au pixel près.
 */
export const FRANCE_VIEWBOX = '0 0 600 640'

/**
 * Premier essai jugé raté par le propriétaire (« on dirait un pâté ») : un
 * ovale presque uni, sans aucun des repères qui rendent le contour de la
 * France reconnaissable d'un coup d'œil. Cette version encode volontairement
 * trois repères, dans l'ordre où l'œil les cherche : la pointe de la
 * Bretagne (un vrai triangle qui pointe à l'ouest, pas une simple encoche —
 * `L40,250` la tire loin du reste du tracé), la presqu'île du Cotentin
 * juste au nord d'elle (même principe, `L155,115` — un premier essai en `Q`
 * lissait la pointe jusqu'à la rendre imperceptible, signalé par le
 * `verificateur`), et le creux du golfe du Lion sur la côte méditerranéenne
 * (la suite de `Q` entre Marseille et l'Espagne, qui rentre vers le nord
 * avant de ressortir). Toujours pas un tracé cartographique précis (voir
 * plus bas) — juste assez de silhouette pour se reconnaître.
 */
export const FRANCE_CONTOUR_PATH =
  'M200,80 Q260,50 330,45 Q400,40 460,60 Q505,78 525,110 Q558,145 565,215 ' +
  'Q568,275 550,325 Q535,375 540,420 Q545,460 540,470 Q515,530 490,562 ' +
  'Q460,585 430,555 Q400,528 380,530 Q345,532 330,555 Q315,578 300,568 ' +
  'Q260,585 200,570 Q140,552 115,520 Q95,490 92,440 Q90,390 100,350 ' +
  'L108,300 L40,250 L130,195 L155,115 L200,80 Z'

/**
 * 5 des 8 pays frontaliers de la France (voir `cp-geographie-pays-voisins`) : Monaco,
 * l'Andorre et le Luxembourg sont réels mais trop petits pour rester lisibles comme
 * zones distinctes à cette échelle simplifiée. Décision produit mineure, à valider :
 * les ajouter demanderait surtout de l'espace, pas une nouvelle capacité technique.
 */
export const FRANCE_ZONES: MapZone[] = [
  { id: 'paris', label: 'Paris', kind: 'ville', cx: 330, cy: 190 },
  { id: 'lille', label: 'Lille', kind: 'ville', cx: 365, cy: 65 },
  { id: 'strasbourg', label: 'Strasbourg', kind: 'ville', cx: 545, cy: 175 },
  { id: 'rennes', label: 'Rennes', kind: 'ville', cx: 165, cy: 235 },
  { id: 'nantes', label: 'Nantes', kind: 'ville', cx: 175, cy: 305 },
  { id: 'lyon', label: 'Lyon', kind: 'ville', cx: 430, cy: 370 },
  { id: 'bordeaux', label: 'Bordeaux', kind: 'ville', cx: 195, cy: 430 },
  { id: 'toulouse', label: 'Toulouse', kind: 'ville', cx: 290, cy: 500 },
  { id: 'marseille', label: 'Marseille', kind: 'ville', cx: 445, cy: 535 },
  { id: 'nice', label: 'Nice', kind: 'ville', cx: 535, cy: 495 },

  { id: 'seine', label: 'La Seine', kind: 'fleuve', d: 'M330,190 Q260,150 180,110', labelX: 245, labelY: 135 },
  { id: 'loire', label: 'La Loire', kind: 'fleuve', d: 'M420,330 Q300,300 170,300', labelX: 300, labelY: 285 },
  { id: 'rhone', label: 'Le Rhône', kind: 'fleuve', d: 'M430,370 Q440,460 450,535', labelX: 455, labelY: 450 },
  { id: 'garonne', label: 'La Garonne', kind: 'fleuve', d: 'M290,500 Q220,470 150,420', labelX: 205, labelY: 495 },

  { id: 'espagne', label: 'Espagne', kind: 'pays-voisin', cx: 250, cy: 618 },
  { id: 'belgique', label: 'Belgique', kind: 'pays-voisin', cx: 365, cy: 18 },
  { id: 'allemagne', label: 'Allemagne', kind: 'pays-voisin', cx: 595, cy: 160 },
  { id: 'suisse', label: 'Suisse', kind: 'pays-voisin', cx: 595, cy: 340 },
  { id: 'italie', label: 'Italie', kind: 'pays-voisin', cx: 595, cy: 480 },
]

export const FRANCE_ZONES_BY_ID: Record<string, MapZone> = Object.fromEntries(
  FRANCE_ZONES.map((zone) => [zone.id, zone]),
)
