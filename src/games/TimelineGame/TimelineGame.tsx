import { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import type { TimelineContent, GameCompleteResult } from '../../types/game'
import { shuffle } from '../../engine/shuffle'
import { elapsedSince } from '../../engine/timing'
import { jouerSon } from '../../engine/sound'
import styles from './TimelineGame.module.css'

interface TimelineGameProps {
  content: TimelineContent
  onComplete: (result: GameCompleteResult) => void
}

/** Part d'erreurs tolérée avant de perdre la manche (voir `MatchGame`). */
const TOLERANCE_ERREURS = 0.5
const REJET_DUREE_MS = 450
const FIN_DELAI_MS = 400

/**
 * La frise refuse une carte mal placée **sur le coup**, au lieu d'attendre la
 * fin pour annoncer un échec global.
 *
 * Avant, on posait les trois cartes dans n'importe quel ordre et on découvrait
 * seulement à l'écran suivant que c'était raté, sans savoir laquelle était mal
 * placée : la mécanique ne rendait aucune information, ni au joueur ni au
 * score. Le refus immédiat apprend en jouant — et comme les erreurs sont
 * comptées, on ne peut pas s'en sortir en essayant toutes les cartes.
 */
export function TimelineGame({ content, onComplete }: TimelineGameProps) {
  const [trayOrder] = useState<number[]>(() => shuffle(content.events.map((_, i) => i)))
  const [placed, setPlaced] = useState<number[]>([])
  const [rejeteIndex, setRejeteIndex] = useState<number | null>(null)
  const [mistakes, setMistakes] = useState(0)
  const startedAtRef = useRef(0)
  const finishedRef = useRef(false)

  useEffect(() => {
    startedAtRef.current = Date.now()
  }, [])

  // L'ordre attendu, calculé une fois : les indices d'événements triés du plus
  // ancien au plus récent.
  const ordreAttendu = [...content.events]
    .map((_, i) => i)
    .sort((a, b) => content.events[a].sortValue - content.events[b].sortValue)

  function handlePick(eventIndex: number) {
    if (rejeteIndex !== null || placed.includes(eventIndex)) return

    const attendu = ordreAttendu[placed.length]
    if (eventIndex !== attendu) {
      setMistakes((m) => m + 1)
      setRejeteIndex(eventIndex)
      jouerSon('faux')
      window.setTimeout(() => setRejeteIndex(null), REJET_DUREE_MS)
      return
    }

    const nextPlaced = [...placed, eventIndex]
    setPlaced(nextPlaced)
    jouerSon('depot')

    if (nextPlaced.length === content.events.length && !finishedRef.current) {
      finishedRef.current = true
      const timeMs = elapsedSince(startedAtRef.current)
      const correct = mistakes <= content.events.length * TOLERANCE_ERREURS
      window.setTimeout(() => onComplete({ correct, timeMs, mistakes }), FIN_DELAI_MS)
    }
  }

  return (
    <div className={styles.game}>
      <div className={styles.slots}>
        {content.events.map((_, slot) => {
          const eventIndex = placed[slot]
          return (
            <div key={slot} className={clsx(styles.slot, { [styles.filled]: eventIndex !== undefined })}>
              <span className={styles.slotNumber}>{slot + 1}</span>
              {eventIndex !== undefined ? content.events[eventIndex].label : ''}
            </div>
          )
        })}
      </div>
      <div className={styles.tray}>
        {trayOrder
          .filter((eventIndex) => !placed.includes(eventIndex))
          .map((eventIndex) => (
            <button
              key={eventIndex}
              type="button"
              className={clsx(styles.trayCard, { [styles.rejete]: rejeteIndex === eventIndex })}
              onClick={() => handlePick(eventIndex)}
            >
              {content.events[eventIndex].label}
            </button>
          ))}
      </div>
    </div>
  )
}
