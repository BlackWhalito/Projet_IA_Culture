import type { MapZone } from '../../types/maps'

/**
 * Même technique que `france.ts` : un contour schématique, pas un tracé cartographique
 * précis. La coupure à l'est (avant la Pologne) et l'absence de forme séparée pour les
 * îles (Royaume-Uni) sont volontaires — simplifié pour un enfant de CP, pas pour
 * l'exactitude au pixel près.
 */
export const EUROPE_VIEWBOX = '0 0 700 600'

export const EUROPE_CONTOUR_PATH =
  'M140,440 Q60,420 100,370 Q140,320 180,260 Q220,200 270,130 Q320,60 400,100 ' +
  'Q480,140 520,210 Q560,280 520,370 Q480,460 430,470 Q380,480 300,470 Q220,460 140,440 Z'

/**
 * 8 pays d'Europe (dont les 5 déjà présents comme voisins sur la carte de France,
 * `cp-geographie-pays-voisins`) plus les 5 continents cités par `cp-geographie-
 * continents`, placés à la périphérie dans leur direction réelle depuis l'Europe.
 */
export const EUROPE_ZONES: MapZone[] = [
  { id: 'france', label: 'France', kind: 'pays', cx: 250, cy: 300 },
  { id: 'espagne-eu', label: 'Espagne', kind: 'pays', cx: 140, cy: 400 },
  { id: 'portugal', label: 'Portugal', kind: 'pays', cx: 90, cy: 415 },
  { id: 'royaume-uni', label: 'Royaume-Uni', kind: 'pays', cx: 130, cy: 210 },
  { id: 'allemagne-eu', label: 'Allemagne', kind: 'pays', cx: 340, cy: 220 },
  { id: 'italie-eu', label: 'Italie', kind: 'pays', cx: 360, cy: 420 },
  { id: 'suisse-eu', label: 'Suisse', kind: 'pays', cx: 300, cy: 310 },
  { id: 'belgique-eu', label: 'Belgique', kind: 'pays', cx: 230, cy: 230 },

  { id: 'europe', label: "L'Europe", kind: 'continent', cx: 430, cy: 200 },
  { id: 'afrique', label: "L'Afrique", kind: 'continent', cx: 280, cy: 565 },
  { id: 'asie', label: "L'Asie", kind: 'continent', cx: 650, cy: 300 },
  { id: 'amerique', label: "L'Amérique", kind: 'continent', cx: 20, cy: 300 },
  { id: 'oceanie', label: "L'Océanie", kind: 'continent', cx: 665, cy: 565 },
]

export const EUROPE_ZONES_BY_ID: Record<string, MapZone> = Object.fromEntries(
  EUROPE_ZONES.map((zone) => [zone.id, zone]),
)
