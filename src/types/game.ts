export interface QcmContent {
  question: string
  choices: string[]
  correctIndex: number
  mode?: 'truefalse' | 'multi'
  timeLimitSec?: number
}

export interface MatchContent {
  pairs: { left: string; right: string; leftImage?: string }[]
}

export interface TimelineContent {
  events: { label: string; sortValue: number; image?: string }[]
}

export interface RiviereContent {
  paniers: { id: string; label: string }[]
  flottants: { label: string; panierId: string }[]
  /** Durée en secondes pour qu'un mot traverse l'écran de haut en bas au démarrage. */
  vitesseInitialeSec: number
  /** Réduction proportionnelle de la durée de chute tous les `PALIER` objets classés (ex: 0.15 = 15% plus rapide). */
  accelerationParPalier: number
  /** Nombre d'objets à classer correctement pour gagner la manche. */
  objectif: number
}

export interface MapClickContent {
  carteId: 'france' | 'europe' | 'monde'
  /** Ids de zones de la carte, dans l'ordre où elles sont demandées. */
  cibles: string[]
  secondesParCible: number
}

export interface IncarnationContent {
  personnage: { nom: string; annee: string; role: string }
  jauges: { id: string; label: string; depart: number }[]
  etapes: {
    titre: string
    scene: string
    options: { texte: string; effets: Record<string, number>; consequence: string; historique?: string }[]
  }[]
  epilogues: { condition: Record<string, [number, number]>; texte: string }[]
}
