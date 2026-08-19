import type { Notion } from '../types/content'
import { CP_FRANCAIS } from './grades/cp/francais'
import { CP_GEOGRAPHIE } from './grades/cp/geographie'
import { CP_HISTOIRE } from './grades/cp/histoire'
import { CP_SCIENCES } from './grades/cp/sciences'

export const ALL_NOTIONS: Notion[] = [
  ...CP_HISTOIRE,
  ...CP_GEOGRAPHIE,
  ...CP_SCIENCES,
  ...CP_FRANCAIS,
]

const NOTIONS_BY_ID: Map<string, Notion> = new Map(
  ALL_NOTIONS.map((notion) => [notion.id, notion]),
)

export function getNotionById(notionId: string): Notion | undefined {
  return NOTIONS_BY_ID.get(notionId)
}
