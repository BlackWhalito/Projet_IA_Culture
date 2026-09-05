import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { GradeId, GameTypeId } from '../../types/content'
import { getNotionById } from '../../content/notions'
import { GameShell } from '../../games/GameShell'
import type { NotionResult } from '../../types/game'
import { readBestScore, useProgressStore } from '../../state/progressStore'
import { computeSessionScore, computeStarRating } from '../../engine/scoring'
import { arreterMusique, demarrerMusique } from '../../engine/musique'
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

  /**
   * L'ambiance du niveau tourne pendant toute la session et s'arrête en
   * sortant. Elle est liée au NIVEAU, pas au jeu : passer d'une mécanique à la
   * suivante ne doit pas couper la musique, sinon on entend une saccade à
   * chaque écran.
   *
   * Le navigateur suspend l'audio tant que l'utilisateur n'a pas interagi ;
   * `demarrerMusique` réveille le contexte, et le premier tap du joueur suffit
   * à le débloquer. Le fondu d'entrée de 2,5 s rend cette latence inaudible.
   */
  useEffect(() => {
    demarrerMusique(levelId)
    return () => arreterMusique()
  }, [levelId])

  /**
   * Passer un jeu, en bac à sable.
   *
   * Le résultat n'est PAS ajouté à `results` : une manche sautée ne doit
   * laisser aucune trace. Ni le score, ni les étoiles, ni la maîtrise de la
   * notion ne bougent — et si c'est le dernier jeu qu'on passe,
   * `completeLevel` n'est jamais appelé, donc le niveau ne se marque pas
   * terminé sur un test.
   */
  function handlePasser() {
    setIndex(index + 1)
  }

  function handleContinue(result: NotionResult) {
    const nextResults = [...results, result]
    setResults(nextResults)
    if (index + 1 >= queue.length) {
      completeLevel({ gradeId, levelId, results: nextResults })
    }
    setIndex(index + 1)
  }

  if (isDone) {
    // Bac à sable : tout a été passé. Afficher « 0 / 0 » et zéro étoile
    // laisserait croire à une manche ratée alors que rien n'a été joué.
    if (results.length === 0) {
      return (
        <div className={styles.session}>
          <h1>{title}</h1>
          <div className={styles.results}>
            <p className={styles.score}>Tous les jeux ont été passés.</p>
            <p className={styles.previousBest}>Rien n’a été enregistré.</p>
            {backTo && (
              <Link to={backTo} className={styles.backLink}>
                Retour à la carte
              </Link>
            )}
          </div>
        </div>
      )
    }

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
        // La position dans la file, pas la notion : une même notion peut revenir
        // dans un niveau (jouée en qcm puis en capsur). Une clé identique ne
        // remonterait pas GameShell, qui resterait bloqué sur son écran de feedback.
        key={`${index}-${notion.id}`}
        notion={notion}
        pinnedGameType={current.gameType}
        levelId={levelId}
        onContinue={handleContinue}
        onPasser={handlePasser}
      />
    </div>
  )
}
