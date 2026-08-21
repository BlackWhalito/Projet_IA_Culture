import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { GradeId, GameTypeId } from '../../types/content'
import { getNotionById } from '../../content/notions'
import { GameShell } from '../../games/GameShell'
import type { NotionResult } from '../../types/game'
import { readBestScore, useProgressStore } from '../../state/progressStore'
import { computeSessionScore, computeStarRating } from '../../engine/scoring'
import styles from './GameSessionScreen.module.css'

interface GameSessionScreenProps {
  gradeId: GradeId
  levelId: string
  title: string
  queue: { notionId: string; gameType?: GameTypeId }[]
  backTo?: string
}

export function GameSessionScreen({ gradeId, levelId, title, queue, backTo }: GameSessionScreenProps) {
  const [index, setIndex] = useState(0)
  const [results, setResults] = useState<NotionResult[]>([])
  const completeLevel = useProgressStore((state) => state.completeLevel)
  // Figé au montage : `completeLevel` écrasera le record avant l'affichage du résumé.
  const [previousBest] = useState(() => readBestScore(levelId))

  const current = queue[index]
  const isDone = index >= queue.length

  function handleContinue(result: NotionResult) {
    const nextResults = [...results, result]
    setResults(nextResults)
    if (index + 1 >= queue.length) {
      completeLevel({ gradeId, levelId, results: nextResults })
    }
    setIndex(index + 1)
  }

  if (isDone) {
    const correctCount = results.filter((r) => r.correct).length
    const starRating = computeStarRating(correctCount, results.length)
    const sessionScore = computeSessionScore(results)
    const isRecord = previousBest > 0 && sessionScore > previousBest
    return (
      <div className={styles.session}>
        <h1>{title}</h1>
        <div className={styles.results}>
          <p className={styles.stars} aria-label={`${starRating} étoiles sur 3`}>
            {'⭐'.repeat(starRating)}
            {'☆'.repeat(3 - starRating)}
          </p>
          <p className={styles.score}>
            {correctCount} / {results.length} bonnes réponses
          </p>
          <p className={styles.points}>{sessionScore} points</p>
          {isRecord && <p className={styles.record}>Nouveau record !</p>}
          {!isRecord && previousBest > 0 && (
            <p className={styles.previousBest}>Ton record : {previousBest} points</p>
          )}
          {backTo && (
            <Link to={backTo} className={styles.backLink}>
              Retour à la carte
            </Link>
          )}
        </div>
      </div>
    )
  }

  const notion = getNotionById(current.notionId)
  if (!notion) {
    throw new Error(`Notion introuvable : ${current.notionId}`)
  }

  return (
    <div className={styles.session}>
      <h1>{title}</h1>
      <p className={styles.progress}>
        {index + 1} / {queue.length}
      </p>
      <GameShell
        key={notion.id}
        notion={notion}
        pinnedGameType={current.gameType}
        onContinue={handleContinue}
      />
    </div>
  )
}
