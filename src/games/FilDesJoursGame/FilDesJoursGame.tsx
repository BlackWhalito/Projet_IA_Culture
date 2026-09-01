import { useEffect, useRef, useState } from 'react'
import type { FilDesJoursContent, GameCompleteResult } from '../../types/game'
import { appliquerEffets, jaugesInitiales, resoudreEpilogue } from '../../engine/fildesjours'
import { elapsedSince } from '../../engine/timing'
import { jouerSon } from '../../engine/sound'
import styles from './FilDesJoursGame.module.css'

interface FilDesJoursGameProps {
  content: FilDesJoursContent
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

  function handleChoix(option: FilDesJoursContent['etapes'][number]['options'][number]) {
    jouerSon('tap')
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

  /**
   * L'issue est celle de l'épilogue atteint, et rien d'autre.
   *
   * Deux versions ont échoué avant celle-ci. `correct` a d'abord été renvoyé à
   * `true` en dur : on ne pouvait pas perdre. Puis on l'a lié à « une jauge
   * tombée à zéro », ce qui semblait juste mais ne l'était pas : l'énumération
   * exhaustive des parties donne **1 chemin perdant sur 729** chez Louis XIV et
   * **0 sur 2187** chez Colomb — un `true` déguisé. Pire, ce seul chemin
   * perdant affichait un épilogue triomphal suivi d'un « Pas tout à fait… ».
   *
   * Faire décider l'épilogue supprime la contradiction par construction : le
   * texte que le joueur lit **est** le verdict qu'il reçoit. Le contenu porte
   * les seuils, là où vivent déjà les conditions.
   */
  function handleTerminer() {
    const fin = resoudreEpilogue(jauges, content.epilogues)
    onComplete({
      correct: !fin.echec,
      timeMs: elapsedSince(startedAtRef.current),
      // Chaque choix qui abîme une jauge compte : sans cela cette mécanique
      // était la seule des six à ne jamais être pénalisée au score.
      mistakes: content.jauges.filter((j) => (jauges[j.id] ?? 0) < j.depart).length,
    })
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
