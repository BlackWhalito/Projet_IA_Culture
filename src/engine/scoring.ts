const MASTERY_CORRECT_DELTA = 20
const MASTERY_INCORRECT_DELTA = -10
export const MASTERY_THRESHOLD = 70

export function computeNextMastery(previousScore: number, correct: boolean): number {
  const delta = correct ? MASTERY_CORRECT_DELTA : MASTERY_INCORRECT_DELTA
  return Math.min(100, Math.max(0, previousScore + delta))
}

export function computeStarRating(correctCount: number, total: number): 0 | 1 | 2 | 3 {
  if (total === 0) return 0
  const ratio = correctCount / total
  if (ratio >= 0.9) return 3
  if (ratio >= 0.7) return 2
  if (ratio >= 0.4) return 1
  return 0
}

/**
 * Ramène un nombre d'étoiles dans les bornes affichables.
 *
 * Le type `0 | 1 | 2 | 3` n'existe plus à l'exécution : une valeur relue du
 * `localStorage` peut être négative, énorme, ou pas un nombre du tout. Or
 * l'affichage passe par `String.repeat`, qui lève une `RangeError` sur un
 * compte négatif — assez pour rendre la carte des niveaux inaccessible.
 */
export function clampStarRating(value: unknown): 0 | 1 | 2 | 3 {
  const n = Math.trunc(Number(value))
  if (!Number.isFinite(n) || n < 0) return 0
  return (n > 3 ? 3 : n) as 0 | 1 | 2 | 3
}

const POINTS_JUSTE = 100
const PENALITE_ERREUR = 15
const BONUS_RAPIDITE_MAX = 50
/** Au-delà, la rapidité ne rapporte plus rien : on ne récompense pas le tap frénétique. */
const PLAFOND_RAPIDITE_MS = 15_000

/**
 * Forme minimale attendue par le score. `GameCompleteResult` la satisfait
 * structurellement, sans que le moteur dépende du dossier des jeux.
 */
export interface ScoredAttempt {
  correct: boolean
  timeMs: number
  mistakes?: number
}

/**
 * Score d'une session, la seule chose qu'on puisse battre en rejouant.
 * Les étoiles restent la porte de déverrouillage ; le score, lui, mesure la manière.
 */
export function computeSessionScore(attempts: ScoredAttempt[]): number {
  let total = 0
  for (const attempt of attempts) {
    if (!attempt.correct) continue
    const rapidite = Math.max(0, 1 - attempt.timeMs / PLAFOND_RAPIDITE_MS)
    total += POINTS_JUSTE
    total += Math.round(BONUS_RAPIDITE_MAX * rapidite)
    total -= (attempt.mistakes ?? 0) * PENALITE_ERREUR
  }
  return Math.max(0, total)
}
