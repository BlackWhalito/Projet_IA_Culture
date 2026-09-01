import { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import type { QcmContent, GameCompleteResult } from '../../types/game'
import { elapsedSince } from '../../engine/timing'
import { shuffle } from '../../engine/shuffle'
import { jouerSon } from '../../engine/sound'
import styles from './QcmGame.module.css'

interface QcmGameProps {
  content: QcmContent
  onComplete: (result: GameCompleteResult) => void
}

/**
 * Les propositions sont mélangées à chaque partie.
 *
 * Les 40 QCM du projet ont tous `correctIndex: 0`, et ce composant les
 * affichait autrefois dans l'ordre du contenu : la bonne réponse était donc
 * **toujours le premier bouton**, et un joueur qui le remarquait gagnait sans
 * lire. Le mélange se fait sur les indices d'origine, jamais sur les textes :
 * `correctIndex` continue de désigner la bonne réponse dans le contenu, qui
 * n'a pas eu à être touché.
 */
export function QcmGame({ content, onComplete }: QcmGameProps) {
  const [ordre] = useState<number[]>(() => shuffle(content.choices.map((_, i) => i)))
  const [selectedOrigIndex, setSelectedOrigIndex] = useState<number | null>(null)
  const startedAtRef = useRef(0)

  useEffect(() => {
    startedAtRef.current = Date.now()
  }, [])

  function handleChoice(origIndex: number) {
    if (selectedOrigIndex !== null) return
    setSelectedOrigIndex(origIndex)
    const correct = origIndex === content.correctIndex
    jouerSon(correct ? 'juste' : 'faux')
    const timeMs = elapsedSince(startedAtRef.current)
    window.setTimeout(() => onComplete({ correct, timeMs, mistakes: correct ? 0 : 1 }), 550)
  }

  return (
    <div className={styles.game}>
      <p className={styles.question}>{content.question}</p>
      <div className={styles.choices}>
        {ordre.map((origIndex) => {
          const choice = content.choices[origIndex]
          const isSelected = selectedOrigIndex === origIndex
          const isCorrectChoice = origIndex === content.correctIndex
          const showResult = selectedOrigIndex !== null && (isSelected || isCorrectChoice)
          return (
            <button
              key={origIndex}
              type="button"
              className={clsx(styles.choice, {
                [styles.correct]: showResult && isCorrectChoice,
                [styles.incorrect]: showResult && isSelected && !isCorrectChoice,
              })}
              disabled={selectedOrigIndex !== null}
              onClick={() => handleChoice(origIndex)}
            >
              {choice}
            </button>
          )
        })}
      </div>
    </div>
  )
}
