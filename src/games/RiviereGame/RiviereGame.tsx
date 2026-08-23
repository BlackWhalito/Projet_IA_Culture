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

/** Cadence de rafraîchissement du chrono affiché. */
const TICK_MS = 100
/** Durée du flash vert/rouge après une réponse. */
const FLASH_MS = 260
const FIN_DELAI_MS = 400
/** À partir de cette série, on affiche le multiplicateur — en dessous ça n'a rien d'un exploit. */
const SERIE_MIN_AFFICHEE = 2

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

/**
 * Le tri chronométré : un mot (ou une scène) à la fois, à ranger dans le bon panier.
 *
 * Un seul chrono pour toute la manche, pas un minuteur par mot. La version
 * précédente faisait descendre chaque mot pendant 5,5 s : on connaissait la
 * réponse en une demi-seconde puis on regardait le mot dériver, et répondre
 * vite n'apportait rien. Ici le mot suivant apparaît instantanément — le temps
 * gagné en répondant vite est du temps gagné pour la suite, ce qui fait enfin
 * de la vitesse une compétence.
 *
 * Un seul tap, aussi : on tape directement le panier. L'ancienne version
 * demandait de sélectionner le mot PUIS le panier, et taper un panier sans
 * avoir sélectionné le mot ne produisait strictement rien — aucun retour, ce
 * qui se ressentait comme un jeu cassé plutôt que comme une règle.
 */
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
  const [enRegle, setEnRegle] = useState(Boolean(content.regle))
  const [correctCount, setCorrectCount] = useState(0)
  const [wrongCount, setWrongCount] = useState(0)
  const [serie, setSerie] = useState(0)
  const [flash, setFlash] = useState<'juste' | 'faux' | null>(null)
  const [restantMs, setRestantMs] = useState(content.dureeSec * 1000)
  const [prefersReducedMotion] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const startedAtRef = useRef(0)
  const deadlineRef = useRef(0)
  const finishedRef = useRef(false)

  const tempsEcoule = restantMs <= 0
  const objectifAtteint = correctCount >= content.objectif
  const finished = objectifAtteint || tempsEcoule
  const current = finished ? null : (queue[0] ?? null)

  // Le chrono démarre à la sortie de l'écran de règle, pas au montage : sinon
  // le temps s'écoulerait pendant qu'on lit la consigne.
  useEffect(() => {
    if (enRegle) return
    startedAtRef.current = Date.now()
    deadlineRef.current = Date.now() + content.dureeSec * 1000
  }, [enRegle, content.dureeSec])

  // Décompte calé sur une échéance absolue plutôt que sur un cumul de ticks :
  // un `setInterval` dérive (onglet en arrière-plan, frame sautée), une
  // échéance non.
  useEffect(() => {
    if (enRegle || finished) return
    const id = window.setInterval(() => {
      setRestantMs(Math.max(0, deadlineRef.current - Date.now()))
    }, TICK_MS)
    return () => window.clearInterval(id)
  }, [enRegle, finished])

  // Un seul objet en jeu à la fois : le retirer de la file avance vers le suivant, en
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

  function handlePanierTap(panierId: string) {
    if (finished || enRegle || !current) return
    const flottant = content.flottants[current.flottantIndex]
    const juste = flottant.panierId === panierId

    if (juste) {
      setCorrectCount((c) => c + 1)
      setSerie((s) => s + 1)
    } else {
      setWrongCount((w) => w + 1)
      setSerie(0)
    }
    setFlash(juste ? 'juste' : 'faux')
    window.setTimeout(() => setFlash(null), FLASH_MS)
    // Bonne ou mauvaise, on enchaîne : rester bloqué sur un objet raté casse
    // le rythme, et le coût de l'erreur est déjà le temps perdu plus la série
    // remise à zéro.
    avancerQueue()
  }

  // Fin de manche : objectif atteint (victoire) ou temps écoulé (échec).
  useEffect(() => {
    if (finishedRef.current || !finished) return
    finishedRef.current = true
    const timeMs = elapsedSince(startedAtRef.current)
    const id = window.setTimeout(() => {
      onComplete({ correct: objectifAtteint, timeMs, mistakes: wrongCount })
    }, FIN_DELAI_MS)
    return () => window.clearTimeout(id)
  }, [finished, objectifAtteint, wrongCount, onComplete])

  if (enRegle && content.regle) {
    return (
      <div className={styles.game}>
        <div className={styles.regle}>
          <p className={styles.regleTexte}>{content.regle}</p>
          <p className={styles.regleChrono}>
            {content.objectif} bonnes réponses en {content.dureeSec} secondes.
          </p>
          <button type="button" className={styles.primaryButton} onClick={() => setEnRegle(false)}>
            Commencer
          </button>
        </div>
      </div>
    )
  }

  const secondes = Math.ceil(restantMs / 1000)
  const partRestante = Math.max(0, Math.min(1, restantMs / (content.dureeSec * 1000)))
  const presseFin = restantMs <= 5000

  return (
    <div className={styles.game}>
      <div className={styles.chronoBarre} aria-hidden="true">
        <div
          className={clsx(styles.chronoRemplissage, { [styles.chronoUrgent]: presseFin })}
          style={{ width: `${partRestante * 100}%` }}
        />
      </div>

      <div className={styles.entete}>
        <span>
          {Math.min(correctCount, content.objectif)} / {content.objectif}
        </span>
        {serie >= SERIE_MIN_AFFICHEE && <span className={styles.serie}>série ×{serie}</span>}
        <span className={clsx(styles.chronoTexte, { [styles.chronoUrgent]: presseFin })}>
          {secondes}s
        </span>
      </div>

      <div className={styles.piste}>
        {current && (
          <span
            key={current.spawnId}
            className={clsx(styles.flottant, {
              [styles.flottantAnime]: !prefersReducedMotion,
              [styles.juste]: flash === 'juste',
              [styles.faux]: flash === 'faux',
            })}
          >
            {content.flottants[current.flottantIndex].label}
          </span>
        )}
      </div>

      <div className={styles.paniers}>
        {content.paniers.map((panier) => (
          <button
            key={panier.id}
            type="button"
            className={styles.panier}
            onClick={() => handlePanierTap(panier.id)}
          >
            {panier.label}
          </button>
        ))}
      </div>
    </div>
  )
}
