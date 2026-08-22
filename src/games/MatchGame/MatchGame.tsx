import { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import type { MatchContent, GameCompleteResult } from '../../types/game'
import { shuffle } from '../../engine/shuffle'
import { elapsedSince } from '../../engine/timing'
import styles from './MatchGame.module.css'

interface MatchGameProps {
  content: MatchContent
  onComplete: (result: GameCompleteResult) => void
}

interface Card {
  pairIndex: number
  text: string
}

function toCards(pairs: MatchContent['pairs'], side: 'left' | 'right'): Card[] {
  return shuffle(pairs.map((pair, pairIndex) => ({ pairIndex, text: pair[side] })))
}

export function MatchGame({ content, onComplete }: MatchGameProps) {
  const [leftCards] = useState<Card[]>(() => toCards(content.pairs, 'left'))
  const [rightCards] = useState<Card[]>(() => toCards(content.pairs, 'right'))
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null)
  const [selectedRight, setSelectedRight] = useState<number | null>(null)
  const [matched, setMatched] = useState<Set<number>>(new Set())
  const [wrongPair, setWrongPair] = useState<[number, number] | null>(null)
  const mistakesRef = useRef(0)
  const startedAtRef = useRef(0)

  useEffect(() => {
    startedAtRef.current = Date.now()
  }, [])

  function evaluate(leftPairIndex: number, rightPairIndex: number) {
    if (leftPairIndex === rightPairIndex) {
      const nextMatched = new Set(matched)
      nextMatched.add(leftPairIndex)
      setMatched(nextMatched)
      setSelectedLeft(null)
      setSelectedRight(null)
      if (nextMatched.size === content.pairs.length) {
        const timeMs = elapsedSince(startedAtRef.current)
        // Finir la manche est toujours un succès — il n'y a pas de seuil de raté
        // possible sur cette mécanique, seulement des essais. Les erreurs
        // pénalisent le score via `mistakes`, elles ne coûtent plus l'étoile
        // entière dès la première hésitation.
        window.setTimeout(
          () => onComplete({ correct: true, timeMs, mistakes: mistakesRef.current }),
          400,
        )
      }
      return
    }
    mistakesRef.current += 1
    setWrongPair([leftPairIndex, rightPairIndex])
    window.setTimeout(() => {
      setWrongPair(null)
      setSelectedLeft(null)
      setSelectedRight(null)
    }, 500)
  }

  function handlePick(side: 'left' | 'right', pairIndex: number) {
    if (wrongPair || matched.has(pairIndex)) return
    if (side === 'left') {
      setSelectedLeft(pairIndex)
      if (selectedRight !== null) evaluate(pairIndex, selectedRight)
    } else {
      setSelectedRight(pairIndex)
      if (selectedLeft !== null) evaluate(selectedLeft, pairIndex)
    }
  }

  function cardState(side: 'left' | 'right', pairIndex: number) {
    const selected = side === 'left' ? selectedLeft : selectedRight
    return {
      isMatched: matched.has(pairIndex),
      isSelected: selected === pairIndex,
      isWrong: wrongPair !== null && wrongPair[side === 'left' ? 0 : 1] === pairIndex,
    }
  }

  return (
    <div className={styles.game}>
      <div className={styles.columns}>
        <div className={styles.column}>
          {leftCards.map((card) => {
            const state = cardState('left', card.pairIndex)
            return (
              <button
                key={card.pairIndex}
                type="button"
                className={clsx(styles.card, {
                  [styles.matched]: state.isMatched,
                  [styles.selected]: state.isSelected,
                  [styles.wrong]: state.isWrong,
                })}
                disabled={state.isMatched}
                onClick={() => handlePick('left', card.pairIndex)}
              >
                {card.text}
              </button>
            )
          })}
        </div>
        <div className={styles.column}>
          {rightCards.map((card) => {
            const state = cardState('right', card.pairIndex)
            return (
              <button
                key={card.pairIndex}
                type="button"
                className={clsx(styles.card, {
                  [styles.matched]: state.isMatched,
                  [styles.selected]: state.isSelected,
                  [styles.wrong]: state.isWrong,
                })}
                disabled={state.isMatched}
                onClick={() => handlePick('right', card.pairIndex)}
              >
                {card.text}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
