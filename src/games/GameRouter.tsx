import type { SelectedGame } from '../engine/selectGameForNotion'
import type { GameCompleteResult } from '../types/game'
import { QcmGame } from './QcmGame/QcmGame'
import { TimelineGame } from './TimelineGame/TimelineGame'
import { RiviereGame } from './RiviereGame/RiviereGame'
import { FilDesJoursGame } from './FilDesJoursGame/FilDesJoursGame'
import { CapSurGame } from './CapSurGame/CapSurGame'
import { ChaineGame } from './ChaineGame/ChaineGame'
import { PonctuationGame } from './PonctuationGame/PonctuationGame'
import { VersGame } from './VersGame/VersGame'
import { TelegrammeGame } from './TelegrammeGame/TelegrammeGame'
import { FlatterieGame } from './FlatterieGame/FlatterieGame'

interface GameRouterProps {
  selected: SelectedGame
  onComplete: (result: GameCompleteResult) => void
}

export function GameRouter({ selected, onComplete }: GameRouterProps) {
  switch (selected.gameType) {
    case 'flatterie':
      return <FlatterieGame content={selected.content} onComplete={onComplete} />
    case 'telegramme':
      return <TelegrammeGame content={selected.content} onComplete={onComplete} />
    case 'qcm':
      return <QcmGame content={selected.content} onComplete={onComplete} />
    case 'timeline':
      return <TimelineGame content={selected.content} onComplete={onComplete} />
    case 'riviere':
      return <RiviereGame content={selected.content} onComplete={onComplete} />
    case 'fildesjours':
      return <FilDesJoursGame content={selected.content} onComplete={onComplete} />
    case 'capsur':
      return <CapSurGame content={selected.content} onComplete={onComplete} />
    case 'chaine':
      return <ChaineGame content={selected.content} onComplete={onComplete} />
    case 'ponctuation':
      return <PonctuationGame content={selected.content} onComplete={onComplete} />
    case 'vers':
      return <VersGame content={selected.content} onComplete={onComplete} />
  }
}
