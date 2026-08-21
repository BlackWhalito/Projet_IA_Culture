import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { GradeId } from '../types/content'
import type { NotionResult } from '../types/game'
import { createEmptyProgress, PROGRESS_SCHEMA_VERSION, type UserProgress } from '../types/progress'
import { computeNextMastery, computeSessionScore, computeStarRating } from '../engine/scoring'

interface CompleteLevelParams {
  gradeId: GradeId
  levelId: string
  results: NotionResult[]
}

interface ProgressActions {
  completeLevel: (params: CompleteLevelParams) => void
  resetProgress: () => void
}

type ProgressState = UserProgress & ProgressActions

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Garde-fou à la relecture du `localStorage`.
 *
 * Le stockage du navigateur n'est pas digne de confiance : le joueur peut
 * l'éditer, et une sauvegarde écrite par une version antérieure peut avoir une
 * autre forme. Sans ce filtre, la fusion par défaut de zustand remplace les
 * valeurs saines par ce qu'elle trouve — un `levels` à `null` fait alors
 * planter la carte des niveaux à chaque visite, sans moyen d'en sortir.
 *
 * En cas de doute on repart d'une progression vide : reperdre une progression
 * de jeu est bénin, une app qui ne démarre plus ne l'est pas.
 */
export function mergePersistedProgress(persisted: unknown, current: ProgressState): ProgressState {
  if (!isRecord(persisted)) return current

  return {
    ...current,
    gradeProgress: isRecord(persisted.gradeProgress)
      ? (persisted.gradeProgress as UserProgress['gradeProgress'])
      : {},
    levels: isRecord(persisted.levels) ? (persisted.levels as UserProgress['levels']) : {},
    notions: isRecord(persisted.notions) ? (persisted.notions as UserProgress['notions']) : {},
  }
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      ...createEmptyProgress(),

      completeLevel: ({ gradeId, levelId, results }) => {
        const now = new Date().toISOString()

        set((state) => {
          const notions = { ...state.notions }
          for (const result of results) {
            const previous = notions[result.notionId]
            const masteryScore = computeNextMastery(previous?.masteryScore ?? 0, result.correct)
            notions[result.notionId] = {
              notionId: result.notionId,
              timesPlayed: (previous?.timesPlayed ?? 0) + 1,
              timesCorrectFirstTry: (previous?.timesCorrectFirstTry ?? 0) + (result.correct ? 1 : 0),
              lastPlayedAt: now,
              masteryScore,
              mastered: masteryScore >= 70,
            }
          }

          const correctCount = results.filter((r) => r.correct).length
          const starRating = computeStarRating(correctCount, results.length)
          const sessionScore = computeSessionScore(results)
          const previousLevel = state.levels[levelId]

          const levels = {
            ...state.levels,
            [levelId]: {
              levelId,
              completed: true,
              starRating: Math.max(previousLevel?.starRating ?? 0, starRating) as 0 | 1 | 2 | 3,
              bestScore: Math.max(previousLevel?.bestScore ?? 0, sessionScore),
              lastPlayedAt: now,
            },
          }

          const gradeProgress = {
            ...state.gradeProgress,
            [gradeId]: { currentLevelId: levelId },
          }

          return { notions, levels, gradeProgress }
        })
      },

      resetProgress: () => set(createEmptyProgress()),
    }),
    {
      name: 'jeu-culture-progress-v1',
      version: PROGRESS_SCHEMA_VERSION,
      merge: mergePersistedProgress,
    },
  ),
)

/**
 * Lecture ponctuelle hors abonnement, pour figer le record d'avant-partie.
 * Vit ici, au niveau module, plutôt que dans un composant : voir la skill
 * `pieges-du-projet` sur la règle de pureté d'oxlint.
 */
export function readBestScore(levelId: string): number {
  return useProgressStore.getState().levels[levelId]?.bestScore ?? 0
}
