import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { GradeId } from '../types/content'
import type { NotionResult } from '../games/gameTypes'
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
