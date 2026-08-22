import { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import type { QcmContent, GameCompleteResult } from '../../types/game'
import { elapsedSince } from '../../engine/timing'
import styles from './QcmGame.module.css'

interface QcmGameProps {
  content: QcmContent
  onComplete: (result: GameCompleteResult) => void
}

export function QcmGame({ content, onComplete }: QcmGameProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const startedAtRef = useRef(0)

  useEffect(() => {
    startedAtRef.current = Date.now()
  }, [])

  function handleChoice(index: number) {
    if (selectedIndex !== null) return
    setSelectedIndex(index)
    const correct = index === content.correctIndex
    const timeMs = elapsedSince(startedAtRef.current)
    window.setTimeout(() => onComplete({ correct, timeMs }), 550)
  }

  return (
    <div className={styles.game}>
      <p className={styles.question}>{content.question}</p>
      <div className={styles.choices}>
        {content.choices.map((choice, index) => {
          const isSelected = selectedIndex === index
          const isCorrectChoice = index === content.correctIndex
          const showResult = selectedIndex !== null && (isSelected || isCorrectChoice)
          return (
            <button
              key={choice}
              type="button"
              className={clsx(styles.choice, {
                [styles.correct]: showResult && isCorrectChoice,
                [styles.incorrect]: showResult && isSelected && !isCorrectChoice,
              })}
              disabled={selectedIndex !== null}
              onClick={() => handleChoice(index)}
            >
              {choice}
            </button>
          )
        })}
      </div>
    </div>
  )
}
