import type { MapZone } from '../../types/maps'

/**
 * Carte simplifiée en code (aucune illustration externe, voir la skill `aquarelle`) :
 * un contour schématique de l'Hexagone, pas un tracé cartographique précis. Les
 * coordonnées sont choisies pour rester reconnaissables et bien espacées à l'échelle
 * d'un enfant de CP, pas pour l'exactitude géographique au pixel près.
 */
export const FRANCE_VIEWBOX = '0 0 600 640'

export const FRANCE_CONTOUR_PATH =
  'M340,50 Q400,40 480,95 Q560,150 560,240 Q560,330 560,395 Q560,460 560,490 ' +
  'Q560,520 515,540 Q470,560 410,575 Q350,590 260,575 Q170,560 155,510 ' +
  'Q140,460 120,390 Q100,320 70,280 Q40,240 90,210 Q140,180 150,150 ' +
  'Q160,120 220,90 Q280,60 340,50 Z'

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
