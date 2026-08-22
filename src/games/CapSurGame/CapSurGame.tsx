import { useCallback, useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import type { CapSurContent, GameCompleteResult } from '../../types/game'
import { elapsedSince } from '../../engine/timing'
import { shuffle } from '../../engine/shuffle'
import { FranceMap } from '../../components/maps/FranceMap'
import { EuropeMap } from '../../components/maps/EuropeMap'
import { FRANCE_ZONES_BY_ID } from '../../content/maps/france'
import { EUROPE_ZONES_BY_ID } from '../../content/maps/europe'
import styles from './CapSurGame.module.css'

interface CapSurGameProps {
  content: CapSurContent
  onComplete: (result: GameCompleteResult) => void
}

type Phase = 'jeu' | 'feedback'

interface Feedback {
  correct: boolean
  toucheLabel: string | null
  cibleLabel: string
}

function zonesPourCarte(carteId: CapSurContent['carteId']) {
  if (carteId === 'france') return FRANCE_ZONES_BY_ID
  if (carteId === 'europe') return EUROPE_ZONES_BY_ID
  throw new Error(`Carte pas encore disponible pour Cap sur : ${carteId}`)
}

export function CapSurGame({ content, onComplete }: CapSurGameProps) {
  const [cibles] = useState(() => shuffle(content.cibles))
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>('jeu')
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [revealedIds, setRevealedIds] = useState<string[]>([])
  const [correctCount, setCorrectCount] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  const [prefersReducedMotion] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const startedAtRef = useRef(0)
  const finishedRef = useRef(false)

  useEffect(() => {
    startedAtRef.current = Date.now()
  }, [])

  const zones = zonesPourCarte(content.carteId)
  const termine = index >= cibles.length
  const cible = termine ? null : zones[cibles[index]]

  const resoudre = useCallback(
    (toucheId: string | null) => {
      if (!cible) return
      const touche = toucheId ? zones[toucheId] : null
      const correct = touche?.id === cible.id
      if (correct) {
        setCorrectCount((c) => c + 1)
        setRevealedIds((ids) => (ids.includes(cible.id) ? ids : [...ids, cible.id]))
      } else {
        setMistakes((m) => m + 1)
      }
      setFeedback({ correct, toucheLabel: touche?.label ?? null, cibleLabel: cible.label })
      setPhase('feedback')
    },
    [cible, zones],
  )

  // Le brouillard se referme : une seule chance par cible, minutée. Remise à zéro à
  // chaque nouvelle cible (index) ou dès qu'un tap résout la manche en cours (phase).
  useEffect(() => {
    if (phase !== 'jeu' || !cible) return
    const dureeMs = content.secondesParCible * 1000
    const timer = window.setTimeout(() => resoudre(null), dureeMs)
    return () => window.clearTimeout(timer)
  }, [phase, cible, content.secondesParCible, resoudre])

  useEffect(() => {
    if (finishedRef.current || !termine) return
    finishedRef.current = true
    const timeMs = elapsedSince(startedAtRef.current)
    const succes = correctCount >= Math.ceil(cibles.length / 2)
    onComplete({ correct: succes, timeMs, mistakes })
  }, [termine, correctCount, mistakes, cibles.length, onComplete])

  function handleContinuer() {
    setFeedback(null)
    setPhase('jeu')
    setIndex((i) => i + 1)
  }

  if (termine) return null

  return (
    <div className={styles.game}>
      <div className={styles.entete}>
        <span>
          {index + 1} / {cibles.length}
        </span>
        {phase === 'jeu' && cible && (
          <span className={styles.consigne}>{content.clues?.[cible.id] ?? `Trouve : ${cible.label}`}</span>
        )}
      </div>

      <div className={styles.carteZone}>
        {content.carteId === 'europe' ? (
          <EuropeMap
            onZoneClick={(id) => phase === 'jeu' && resoudre(id)}
            showAllLabels={false}
            revealedZoneIds={revealedIds}
            activeZoneId={phase === 'feedback' ? (cible?.id ?? null) : null}
          />
        ) : (
          <FranceMap
            onZoneClick={(id) => phase === 'jeu' && resoudre(id)}
            showAllLabels={false}
            revealedZoneIds={revealedIds}
            activeZoneId={phase === 'feedback' ? (cible?.id ?? null) : null}
          />
        )}
        {phase === 'jeu' && (
          <div
            key={index}
            className={clsx(styles.brouillard, { [styles.brouillardStatique]: prefersReducedMotion })}
            style={prefersReducedMotion ? undefined : { animationDuration: `${content.secondesParCible}s` }}
            aria-hidden="true"
          />
        )}
      </div>

      {phase === 'feedback' && feedback && (
        <div className={styles.feedback}>
          {feedback.correct ? (
            <p className={styles.correctText}>Juste ! C'est bien {feedback.cibleLabel}.</p>
          ) : feedback.toucheLabel ? (
            <p className={styles.incorrectText}>
              Ça, c'est {feedback.toucheLabel}. {feedback.cibleLabel} était ailleurs.
            </p>
          ) : (
            <p className={styles.incorrectText}>Trop tard ! C'était {feedback.cibleLabel}.</p>
          )}
          <button type="button" className={styles.primaryButton} onClick={handleContinuer}>
            Continuer
          </button>
        </div>
      )}
    </div>
  )
}
