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

export interface SortContent {
  categories: { id: string; label: string }[]
  items: { label: string; categoryId: string }[]
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

export interface FillBlankContent {
  /** Sentence containing a single `{{blank}}` placeholder. */
  sentence: string
  answer: string
  choices: string[]
}

export interface MapClickContent {
  mapId: string
  targetId: string
}
