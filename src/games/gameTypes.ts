export interface GameCompleteResult {
  correct: boolean
  timeMs: number
  /** Erreurs commises avant d'aboutir, pour les mécaniques qui laissent réessayer. */
  mistakes?: number
  /** Meilleure série de bonnes réponses consécutives dans la manche. */
  streak?: number
}

export interface NotionResult extends GameCompleteResult {
  notionId: string
}
