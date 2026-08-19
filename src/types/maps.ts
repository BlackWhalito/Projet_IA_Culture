/**
 * Une zone d'une carte SVG partagée (`src/content/maps/`) : une ville, un fleuve ou un
 * pays voisin, cliquable et identifiable. Les zones ponctuelles (ville, pays-voisin) sont
 * positionnées par `cx`/`cy` ; les zones filiformes (fleuve) par un chemin `d`, avec une
 * position de label explicite puisqu'un chemin n'a pas de centre évident.
 */
export interface MapZone {
  id: string
  label: string
  kind: 'ville' | 'fleuve' | 'pays-voisin' | 'pays' | 'continent'
  cx?: number
  cy?: number
  d?: string
  labelX?: number
  labelY?: number
}
