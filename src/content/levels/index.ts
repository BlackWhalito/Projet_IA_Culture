import type { GradeId, LevelDef } from '../../types/content'
import { CP_LEVELS } from './cp-levels'

export const ALL_LEVELS: LevelDef[] = [...CP_LEVELS]

export function getLevelsByGrade(gradeId: GradeId): LevelDef[] {
  return ALL_LEVELS.filter((level) => level.gradeId === gradeId).sort((a, b) => a.order - b.order)
}

export function getLevelById(levelId: string): LevelDef | undefined {
  return ALL_LEVELS.find((level) => level.id === levelId)
}
