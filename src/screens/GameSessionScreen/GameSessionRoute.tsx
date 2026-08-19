import { Link, useParams } from 'react-router-dom'
import type { GradeId } from '../../types/content'
import { getLevelById } from '../../content/levels'
import { GameSessionScreen } from './GameSessionScreen'

export function GameSessionRoute() {
  const { gradeId, levelId } = useParams<{ gradeId: GradeId; levelId: string }>()
  const level = levelId ? getLevelById(levelId) : undefined

  if (!gradeId || !level || level.gradeId !== gradeId) {
    return (
      <div>
        <p>Ce niveau est introuvable.</p>
        <Link to="/">Retour à l'accueil</Link>
      </div>
    )
  }

  return (
    <GameSessionScreen
      gradeId={gradeId}
      levelId={level.id}
      title={level.title}
      queue={level.notionIds}
      backTo={`/${gradeId}`}
    />
  )
}
