import { useCallback, useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import type { RiviereContent, GameCompleteResult } from '../../types/game'
import { shuffle } from '../../engine/shuffle'
import { elapsedSince } from '../../engine/timing'
import styles from './RiviereGame.module.css'

interface RiviereGameProps {
  content: RiviereContent
  onComplete: (result: GameCompleteResult) => void
}

interface QueueItem {
  spawnId: number
  flottantIndex: number
}

/** Tous les combien d'objets classés correctement la vitesse augmente. */
const PALIER_ACCELERATION = 5
/** Nombre de mots ratés (sortis de l'écran) qui met fin à la manche. */
const RATES_MAX = 3
/** Durée plancher d'une chute, pour que l'accélération ne rende jamais le mot injouable. */
const VITESSE_MIN_SEC = 1.2
const REJET_DUREE_MS = 500
const FIN_DELAI_MS = 400

/**
 * Effet de bord volontaire (mélange + compteur de spawnId) : n'appeler que depuis un
 * effet ou un gestionnaire, jamais depuis le corps d'un updater de state (React StrictMode
 * invoque les updaters deux fois en dev, ce qui doublerait le mélange et le compteur).
 */
function nouvelleVague(taille: number, compteur: { current: number }): QueueItem[] {
  return shuffle(Array.from({ length: taille }, (_, i) => i)).map((flottantIndex) => {
    compteur.current += 1
    return { spawnId: compteur.current, flottantIndex }
  })
}

export function RiviereGame({ content, onComplete }: RiviereGameProps) {
  // La première vague utilise les indices 0..N-1 comme spawnId, sans toucher au compteur
  // (accéder à un ref pendant le rendu est proscrit) ; le compteur ne sert qu'aux vagues
  // suivantes, générées dans un effet.
  const spawnCounterRef = useRef(content.flottants.length)
  const [queue, setQueue] = useState<QueueItem[]>(() =>
    shuffle(Array.from({ length: content.flottants.length }, (_, i) => i)).map((flottantIndex, i) => ({
      spawnId: i,
      flottantIndex,
    })),
  )
  const [selectedSpawnId, setSelectedSpawnId] = useState<number | null>(null)
  const [rejectPanierId, setRejectPanierId] = useState<string | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [rateCount, setRateCount] = useState(0)
  const [wrongTapCount, setWrongTapCount] = useState(0)
  // Sans `regle`, la partie démarre directement — comportement historique,
  // préservé pour tout contenu qui n'a pas encore ce champ.
  const [enRegle, setEnRegle] = useState(Boolean(content.regle))
  const [prefersReducedMotion] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const startedAtRef = useRef(0)
  const finishedRef = useRef(false)

  const finished = correctCount >= content.objectif || rateCount >= RATES_MAX
  const current = finished ? null : (queue[0] ?? null)
  // Dérivée de correctCount plutôt que gardée en state : c'est une fonction pure du
  // nombre de paliers franchis, pas une valeur qui a besoin d'un effet pour se synchroniser.
  const paliersFranchis = Math.floor(correctCount / PALIER_ACCELERATION)
  const vitesseSec = Math.max(
    VITESSE_MIN_SEC,
    content.vitesseInitialeSec * (1 - content.accelerationParPalier) ** paliersFranchis,
  )

  useEffect(() => {
    if (enRegle) return
    startedAtRef.current = Date.now()
  }, [enRegle])

  // Un seul mot en jeu à la fois : le retirer de la file avance vers le suivant, en
  // rechargeant une nouvelle vague si elle est épuisée (au cas où objectif > nombre de
  // flottants disponibles). L'effet de bord (mélange + compteur) reste interne à cet
  // updater sans jamais appeler un autre setState : même invoqué deux fois par
  // StrictMode, une seule des deux vagues calculées est effectivement retenue par React.
  const avancerQueue = useCallback(() => {
    setQueue((q) => {
      const reste = q.slice(1)
      return reste.length > 0 ? reste : nouvelleVague(content.flottants.length, spawnCounterRef)
    })
  }, [content.flottants.length])

  function handleWordTap(spawnId: number) {
    if (finished || rejectPanierId) return
    setSelectedSpawnId(spawnId)
  }

  function handlePanierTap(panierId: string) {
    if (finished || !current || selectedSpawnId !== current.spawnId) return
    const flottant = content.flottants[current.flottantIndex]

    if (flottant.panierId === panierId) {
      setSelectedSpawnId(null)
      setCorrectCount((c) => c + 1)
      avancerQueue()
      return
    }

    setWrongTapCount((w) => w + 1)
    setRejectPanierId(panierId)
    window.setTimeout(() => setRejectPanierId(null), REJET_DUREE_MS)
  }

  // Un mot non classé qui atteint le bas de l'écran compte comme raté. Ne
  // démarre jamais pendant l'écran de règle : sans cette garde, le premier
  // mot tombait et pouvait être compté raté pendant que le joueur lisait
  // encore la règle, avant d'avoir rien pu faire.
  useEffect(() => {
    if (!current || finished || enRegle) return
    const dureeMs = vitesseSec * 1000
    const timer = window.setTimeout(() => {
      setSelectedSpawnId(null)
      setRateCount((r) => r + 1)
      avancerQueue()
    }, dureeMs)
    return () => window.clearTimeout(timer)
  }, [current, vitesseSec, finished, enRegle, avancerQueue])

  // Fin de manche : objectif atteint (victoire) ou trois ratés (échec).
  useEffect(() => {
    if (finishedRef.current || !finished) return
    finishedRef.current = true
    const succes = correctCount >= content.objectif
    const timeMs = elapsedSince(startedAtRef.current)
    const mistakes = wrongTapCount + rateCount
    window.setTimeout(() => {
      onComplete({ correct: succes, timeMs, mistakes })
    }, FIN_DELAI_MS)
  }, [finished, correctCount, rateCount, wrongTapCount, content.objectif, onComplete])

  if (enRegle && content.regle) {
    return (
      <div className={styles.game}>
        <div className={styles.regle}>
          <p className={styles.regleTexte}>{content.regle}</p>
          <button type="button" className={styles.primaryButton} onClick={() => setEnRegle(false)}>
            Commencer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.game}>
      <div className={styles.entete}>
        <span>
          {Math.min(correctCount, content.objectif)} / {content.objectif} classés
        </span>
        <span className={styles.rates} aria-hidden="true">
          {Array.from({ length: RATES_MAX }, (_, i) => (
            <span key={i} className={clsx(styles.rateDot, { [styles.rateDotPerdu]: i < rateCount })} />
          ))}
        </span>
      </div>

      <div className={styles.piste}>
        {current && (
          <button
            key={current.spawnId}
            type="button"
            className={clsx(styles.flottant, {
              [styles.flottantStatique]: prefersReducedMotion,
              [styles.selectionne]: selectedSpawnId === current.spawnId,
            })}
            style={prefersReducedMotion ? undefined : { animationDuration: `${vitesseSec}s` }}
            onClick={() => handleWordTap(current.spawnId)}
          >
            {content.flottants[current.flottantIndex].label}
          </button>
        )}
      </div>

      <div className={styles.paniers}>
        {content.paniers.map((panier) => (
          <button
            key={panier.id}
            type="button"
            className={clsx(styles.panier, { [styles.rejet]: rejectPanierId === panier.id })}
            onClick={() => handlePanierTap(panier.id)}
          >
            {panier.label}
          </button>
        ))}
      </div>
    </div>
  )
}
