import { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import type { MatchContent, GameCompleteResult } from '../../types/game'
import { shuffle } from '../../engine/shuffle'
import { elapsedSince } from '../../engine/timing'
import { jouerSon } from '../../engine/sound'
import styles from './MatchGame.module.css'

interface MatchGameProps {
  content: MatchContent
  onComplete: (result: GameCompleteResult) => void
}

interface Card {
  pairIndex: number
  text: string
}

/**
 * Combien d'erreurs on peut commettre avant que la manche soit perdue, en
 * proportion du nombre de paires. À 0,5, une manche de 5 paires tolère deux
 * hésitations.
 *
 * Ce jeu déclarait autrefois l'échec dès la **première** erreur, et ne
 * transmettait pas `mistakes` du tout — contrairement à La Rivière et à Cap
 * sur. Or la mécanique est censée porter du contenu volontairement piégeux :
 * un jeu où se tromper une fois coûte l'étoile est un jeu où l'on n'ose pas
 * essayer, donc où l'on n'apprend rien.
 */
const TOLERANCE_ERREURS = 0.5

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
  const [mistakes, setMistakes] = useState(0)
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
      jouerSon('depot')
      if (nextMatched.size === content.pairs.length) {
        const timeMs = elapsedSince(startedAtRef.current)
        const correct = mistakes <= content.pairs.length * TOLERANCE_ERREURS
        window.setTimeout(() => onComplete({ correct, timeMs, mistakes }), 400)
      }
      return
    }
    setMistakes((m) => m + 1)
    jouerSon('faux')
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
      else jouerSon('tap')
    } else {
      setSelectedRight(pairIndex)
      if (selectedLeft !== null) evaluate(selectedLeft, pairIndex)
      else jouerSon('tap')
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
