import type { SelectedGame } from '../engine/selectGameForNotion'
import type { GameCompleteResult } from './gameTypes'
import { QcmGame } from './QcmGame/QcmGame'
import { MatchGame } from './MatchGame/MatchGame'
import { TimelineGame } from './TimelineGame/TimelineGame'
import { SortGame } from './SortGame/SortGame'
import { FillBlankGame } from './FillBlankGame/FillBlankGame'
import { RiviereGame } from './RiviereGame/RiviereGame'
import { FilDesJoursGame } from './FilDesJoursGame/FilDesJoursGame'

interface GameRouterProps {
  selected: SelectedGame
  onComplete: (result: GameCompleteResult) => void
}

export function GameRouter({ selected, onComplete }: GameRouterProps) {
  switch (selected.gameType) {
    case 'qcm':
      return <QcmGame content={selected.content} onComplete={onComplete} />
    case 'match':
      return <MatchGame content={selected.content} onComplete={onComplete} />
    case 'timeline':
      return <TimelineGame content={selected.content} onComplete={onComplete} />
    case 'sort':
      return <SortGame content={selected.content} onComplete={onComplete} />
    case 'fillblank':
      return <FillBlankGame content={selected.content} onComplete={onComplete} />
    case 'riviere':
      return <RiviereGame content={selected.content} onComplete={onComplete} />
    case 'incarnation':
      return <FilDesJoursGame content={selected.content} onComplete={onComplete} />
    default:
      throw new Error(`Mécanique de jeu pas encore implémentée : ${selected.gameType}`)
  }
}
