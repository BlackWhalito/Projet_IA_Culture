import { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import type { TimelineContent, GameCompleteResult } from '../../types/game'
import { shuffle } from '../../engine/shuffle'
import { elapsedSince } from '../../engine/timing'
import styles from './TimelineGame.module.css'

interface TimelineGameProps {
  content: TimelineContent
  onComplete: (result: GameCompleteResult) => void
}

export function TimelineGame({ content, onComplete }: TimelineGameProps) {
  const [trayOrder] = useState<number[]>(() => shuffle(content.events.map((_, i) => i)))
  const [placed, setPlaced] = useState<number[]>([])
  const startedAtRef = useRef(0)

  useEffect(() => {
    startedAtRef.current = Date.now()
  }, [])

  function handlePick(eventIndex: number) {
    if (placed.includes(eventIndex)) return
    const nextPlaced = [...placed, eventIndex]
    setPlaced(nextPlaced)

    if (nextPlaced.length === content.events.length) {
      const expectedOrder = [...content.events]
        .map((_, i) => i)
        .sort((a, b) => content.events[a].sortValue - content.events[b].sortValue)
      const correct = nextPlaced.every((eventIndex, slot) => eventIndex === expectedOrder[slot])
      const timeMs = elapsedSince(startedAtRef.current)
      window.setTimeout(() => onComplete({ correct, timeMs }), 400)
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
              className={styles.trayCard}
              onClick={() => handlePick(eventIndex)}
            >
              {content.events[eventIndex].label}
            </button>
          ))}
      </div>
    </div>
  )
}
