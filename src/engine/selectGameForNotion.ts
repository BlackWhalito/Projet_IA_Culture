import type {
  ChaineContent,
  FilDesJoursContent,
  CapSurContent,
  MatchContent,
  QcmContent,
  RiviereContent,
  TimelineContent,
} from '../types/game'
import type { GameTypeId, Notion } from '../types/content'

export type SelectedGame =
  | { gameType: 'qcm'; content: QcmContent }
  | { gameType: 'match'; content: MatchContent }
  | { gameType: 'timeline'; content: TimelineContent }
  | { gameType: 'capsur'; content: CapSurContent }
  | { gameType: 'riviere'; content: RiviereContent }
  | { gameType: 'fildesjours'; content: FilDesJoursContent }
  | { gameType: 'chaine'; content: ChaineContent }

const GAME_PRIORITY: GameTypeId[] = ['fildesjours', 'chaine', 'match', 'timeline', 'riviere', 'capsur', 'qcm']

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
