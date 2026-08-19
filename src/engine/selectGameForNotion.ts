import type {
  FillBlankContent,
  MapClickContent,
  MatchContent,
  QcmContent,
  RiviereContent,
  SortContent,
  TimelineContent,
} from '../types/game'
import type { GameTypeId, Notion } from '../types/content'

export type SelectedGame =
  | { gameType: 'qcm'; content: QcmContent }
  | { gameType: 'match'; content: MatchContent }
  | { gameType: 'timeline'; content: TimelineContent }
  | { gameType: 'sort'; content: SortContent }
  | { gameType: 'fillblank'; content: FillBlankContent }
  | { gameType: 'mapclick'; content: MapClickContent }
  | { gameType: 'riviere'; content: RiviereContent }

const GAME_PRIORITY: GameTypeId[] = ['match', 'timeline', 'riviere', 'fillblank', 'mapclick', 'qcm']

export function selectGameForNotion(notion: Notion, pinnedGameType?: GameTypeId): SelectedGame {
  const gameType =
    pinnedGameType && notion.games[pinnedGameType]
      ? pinnedGameType
      : GAME_PRIORITY.find((type) => notion.games[type])

  if (!gameType) {
    throw new Error(`Aucun jeu défini pour la notion ${notion.id}`)
  }

  return { gameType, content: notion.games[gameType] } as SelectedGame
}
