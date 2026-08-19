import type { GradeLevel } from '../../types/content'

/**
 * Registry of every French school grade the app could eventually cover.
 * Adding a grade later is purely additive: flip `enabled` and add its
 * content/level files — no engine or screen code needs to change.
 */
export const GRADE_LEVELS: GradeLevel[] = [
  { id: 'cp', label: 'CP', order: 1, enabled: true },
  { id: 'ce1', label: 'CE1', order: 2, enabled: false },
  { id: 'ce2', label: 'CE2', order: 3, enabled: false },
  { id: 'cm1', label: 'CM1', order: 4, enabled: false },
  { id: 'cm2', label: 'CM2', order: 5, enabled: false },
  { id: '6e', label: '6e', order: 6, enabled: false },
  { id: '5e', label: '5e', order: 7, enabled: false },
  { id: '4e', label: '4e', order: 8, enabled: false },
  { id: '3e', label: '3e', order: 9, enabled: false },
]
