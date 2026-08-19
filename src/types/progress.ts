import type { GradeId } from './content'

export interface NotionProgress {
  notionId: string
  timesPlayed: number
  timesCorrectFirstTry: number
  lastPlayedAt: string
  /** Bounded 0-100 mastery score. */
  masteryScore: number
  mastered: boolean
}

export interface LevelProgress {
  levelId: string
  completed: boolean
  starRating: 0 | 1 | 2 | 3
  bestScore: number
  lastPlayedAt?: string
}

export interface UserProgress {
  version: number
  gradeProgress: Partial<Record<GradeId, { currentLevelId?: string }>>
  levels: Record<string, LevelProgress>
  notions: Record<string, NotionProgress>
}

export const PROGRESS_SCHEMA_VERSION = 1

export function createEmptyProgress(): UserProgress {
  return {
    version: PROGRESS_SCHEMA_VERSION,
    gradeProgress: {},
    levels: {},
    notions: {},
  }
}
