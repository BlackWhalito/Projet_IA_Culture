import { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import type { FillBlankContent } from '../../types/game'
import type { GameCompleteResult } from '../gameTypes'
import { shuffle } from '../../engine/shuffle'
import { elapsedSince } from '../../engine/timing'
import styles from './FillBlankGame.module.css'

interface FillBlankGameProps {
  content: FillBlankContent
  onComplete: (result: GameCompleteResult) => void
}

export function FillBlankGame({ content, onComplete }: FillBlankGameProps) {
  const [choiceOrder] = useState<string[]>(() => shuffle(content.choices))
  const [selected, setSelected] = useState<string | null>(null)
  const startedAtRef = useRef(0)

  useEffect(() => {
    startedAtRef.current = Date.now()
  }, [])

  function handleChoice(choice: string) {
    if (selected !== null) return
    setSelected(choice)
    const correct = choice === content.answer
    const timeMs = elapsedSince(startedAtRef.current)
    window.setTimeout(() => onComplete({ correct, timeMs }), 550)
  }

  const [before, after] = content.sentence.split('{{blank}}')

  return (
    <div className={styles.game}>
      <p className={styles.sentence}>
        {before}
        <span
          className={clsx(styles.blank, {
            [styles.correct]: selected !== null && selected === content.answer,
            [styles.incorrect]: selected !== null && selected !== content.answer,
          })}
        >
          {selected ?? '_____'}
        </span>
        {after}
      </p>
      <div className={styles.choices}>
        {choiceOrder.map((choice) => {
          const isSelected = selected === choice
          const isAnswer = choice === content.answer
          const showResult = selected !== null && (isSelected || isAnswer)
          return (
            <button
              key={choice}
              type="button"
              className={clsx(styles.choice, {
                [styles.choiceCorrect]: showResult && isAnswer,
                [styles.choiceIncorrect]: showResult && isSelected && !isAnswer,
              })}
              disabled={selected !== null}
              onClick={() => handleChoice(choice)}
            >
              {choice}
            </button>
          )
        })}
      </div>
    </div>
  )
}
