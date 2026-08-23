import { useEffect, useRef, useState } from 'react'
import type { FilDesJoursContent, GameCompleteResult } from '../../types/game'
import { appliquerEffets, enEchec, jaugesInitiales, resoudreEpilogue } from '../../engine/fildesjours'
import { elapsedSince } from '../../engine/timing'
import styles from './FilDesJoursGame.module.css'

interface FilDesJoursGameProps {
  content: FilDesJoursContent
  onComplete: (result: GameCompleteResult) => void
}

type Phase = 'regle' | 'scene' | 'consequence' | 'echec' | 'epilogue'

interface Consequence {
  texte: string
  historique?: string
}

export function FilDesJoursGame({ content, onComplete }: FilDesJoursGameProps) {
  const [stepIndex, setStepIndex] = useState(0)
  const [jauges, setJauges] = useState(() => jaugesInitiales(content.jauges))
  const [phase, setPhase] = useState<Phase>('regle')
  const [consequence, setConsequence] = useState<Consequence | null>(null)
  const [deltas, setDeltas] = useState<Record<string, number> | null>(null)
  const startedAtRef = useRef(0)

  useEffect(() => {
    startedAtRef.current = Date.now()
  }, [])

  const etape = content.etapes[stepIndex]
  const epilogue = phase === 'epilogue' ? resoudreEpilogue(jauges, content.epilogues) : null

  function handleChoix(option: FilDesJoursContent['etapes'][number]['options'][number]) {
    setJauges((j) => appliquerEffets(j, option.effets))
    setDeltas(option.effets)
    setConsequence({ texte: option.consequence, historique: option.historique })
    setPhase('consequence')
  }

  function handleContinuer() {
    setConsequence(null)
    setDeltas(null)
    if (enEchec(content.jauges, jauges)) {
      setPhase('echec')
    } else if (stepIndex + 1 >= content.etapes.length) {
      setPhase('epilogue')
    } else {
      setStepIndex((i) => i + 1)
      setPhase('scene')
    }
  }

  function handleTerminer(correct: boolean) {
    onComplete({ correct, timeMs: elapsedSince(startedAtRef.current) })
  }

  return (
    <div className={styles.game}>
      <div className={styles.entete}>
        <span className={styles.personnage}>
          {content.personnage.nom} · {content.personnage.annee}
        </span>
        <span className={styles.role}>{content.personnage.role}</span>
      </div>

      {phase !== 'regle' && (
        <div className={styles.jauges}>
          {content.jauges.map((jauge) => {
            const delta = phase === 'consequence' ? deltas?.[jauge.id] : undefined
            return (
              <div key={jauge.id} className={styles.jauge}>
                <span className={styles.jaugeLabel}>{jauge.label}</span>
                <div className={styles.jaugeBarre}>
                  <div className={styles.jaugeRemplissage} style={{ width: `${jauges[jauge.id] ?? 0}%` }} />
                </div>
                {delta !== undefined && delta !== 0 && (
                  <span className={delta > 0 ? styles.deltaPositif : styles.deltaNegatif}>
                    {delta > 0 ? `+${delta}` : delta}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      )}

      {phase === 'regle' && (
        <div className={styles.scene}>
          <p className={styles.texte}>{content.regle}</p>
          <button type="button" className={styles.primaryButton} onClick={() => setPhase('scene')}>
            Commencer
          </button>
        </div>
      )}

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

      {phase === 'echec' && (
        <div className={styles.scene}>
          <h2 className={styles.titre}>La partie s'arrête là</h2>
          <p className={styles.texte}>{content.echec}</p>
          <button type="button" className={styles.primaryButton} onClick={() => handleTerminer(false)}>
            Terminer
          </button>
        </div>
      )}

      {phase === 'epilogue' && epilogue && (
        <div className={styles.scene}>
          <h2 className={styles.titre}>Épilogue</h2>
          <p className={styles.texte}>{epilogue.texte}</p>
          <button type="button" className={styles.primaryButton} onClick={() => handleTerminer(true)}>
            Terminer
          </button>
        </div>
      )}
    </div>
  )
}
