import { useEffect, useRef, useState } from 'react'
import type { IncarnationContent } from '../../types/game'
import type { GameCompleteResult } from '../gameTypes'
import { appliquerEffets, jaugesInitiales, resoudreEpilogue } from '../../engine/incarnation'
import { elapsedSince } from '../../engine/timing'
import styles from './FilDesJoursGame.module.css'

interface FilDesJoursGameProps {
  content: IncarnationContent
  onComplete: (result: GameCompleteResult) => void
}

type Phase = 'scene' | 'consequence' | 'epilogue'

interface Consequence {
  texte: string
  historique?: string
}

export function FilDesJoursGame({ content, onComplete }: FilDesJoursGameProps) {
  const [stepIndex, setStepIndex] = useState(0)
  const [jauges, setJauges] = useState(() => jaugesInitiales(content.jauges))
  const [phase, setPhase] = useState<Phase>('scene')
  const [consequence, setConsequence] = useState<Consequence | null>(null)
  const startedAtRef = useRef(0)

  useEffect(() => {
    startedAtRef.current = Date.now()
  }, [])

  const etape = content.etapes[stepIndex]
  const epilogue = phase === 'epilogue' ? resoudreEpilogue(jauges, content.epilogues) : null

  function handleChoix(option: IncarnationContent['etapes'][number]['options'][number]) {
    setJauges((j) => appliquerEffets(j, option.effets))
    setConsequence({ texte: option.consequence, historique: option.historique })
    setPhase('consequence')
  }

  function handleContinuer() {
    setConsequence(null)
    if (stepIndex + 1 >= content.etapes.length) {
      setPhase('epilogue')
    } else {
      setStepIndex((i) => i + 1)
      setPhase('scene')
    }
  }

  function handleTerminer() {
    onComplete({ correct: true, timeMs: elapsedSince(startedAtRef.current) })
  }

  return (
    <div className={styles.game}>
      <div className={styles.entete}>
        <span className={styles.personnage}>
          {content.personnage.nom} · {content.personnage.annee}
        </span>
        <span className={styles.role}>{content.personnage.role}</span>
      </div>

      <div className={styles.jauges}>
        {content.jauges.map((jauge) => (
          <div key={jauge.id} className={styles.jauge}>
            <span className={styles.jaugeLabel}>{jauge.label}</span>
            <div className={styles.jaugeBarre}>
              <div className={styles.jaugeRemplissage} style={{ width: `${jauges[jauge.id] ?? 0}%` }} />
            </div>
          </div>
        ))}
      </div>

      {phase === 'scene' && (
        <div className={styles.scene}>
          <h2 className={styles.titre}>{etape.titre}</h2>
          <p className={styles.texte}>{etape.scene}</p>
          <div className={styles.options}>
            {etape.options.map((option) => (
              <button
                key={option.texte}
                type="button"
                className={styles.option}
                onClick={() => handleChoix(option)}
              >
                {option.texte}
              </button>
            ))}
          </div>
        </div>
      )}

      {phase === 'consequence' && consequence && (
        <div className={styles.scene}>
          <p className={styles.texte}>{consequence.texte}</p>
          {consequence.historique && <p className={styles.historique}>{consequence.historique}</p>}
          <button type="button" className={styles.primaryButton} onClick={handleContinuer}>
            Continuer
          </button>
        </div>
      )}

      {phase === 'epilogue' && epilogue && (
        <div className={styles.scene}>
          <h2 className={styles.titre}>Épilogue</h2>
          <p className={styles.texte}>{epilogue.texte}</p>
          <button type="button" className={styles.primaryButton} onClick={handleTerminer}>
            Terminer
          </button>
        </div>
      )}
    </div>
  )
}
