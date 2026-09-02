import { useCallback, useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import type { RiviereContent, GameCompleteResult } from '../../types/game'
import { shuffle } from '../../engine/shuffle'
import { elapsedSince } from '../../engine/timing'
import { jouerSon } from '../../engine/sound'
import { RiviereDecor } from './RiviereDecor'
import styles from './RiviereGame.module.css'

interface RiviereGameProps {
  content: RiviereContent
  onComplete: (result: GameCompleteResult) => void
}

interface QueueItem {
  spawnId: number
  flottantIndex: number
}

/**
 * Tous les combien d'objets classés correctement la vitesse augmente.
 *
 * À 5, la promesse « ça accélère » était creuse : les objectifs du contenu
 * valent 4 à 8, donc trois des huit Rivières du CP ne franchissaient JAMAIS de
 * palier, et les cinq autres en franchissaient exactement un, souvent au
 * dernier mot. À 3, une manche de 6 en franchit deux.
 */
const PALIER_ACCELERATION = 3
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
  const [prefersReducedMotion] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const startedAtRef = useRef(0)
  const finishedRef = useRef(false)

  // Un mot perdu est un mot perdu, qu'il ait filé au bas de l'écran ou qu'il se
  // soit échoué sur la mauvaise rive : les deux consomment la même réserve.
  const perdus = rateCount + wrongTapCount
  const finished = correctCount >= content.objectif || perdus >= RATES_MAX
  const current = finished ? null : (queue[0] ?? null)
  // Dérivée de correctCount plutôt que gardée en state : c'est une fonction pure du
  // nombre de paliers franchis, pas une valeur qui a besoin d'un effet pour se synchroniser.
  const paliersFranchis = Math.floor(correctCount / PALIER_ACCELERATION)
  const vitesseSec = Math.max(
    VITESSE_MIN_SEC,
    content.vitesseInitialeSec * (1 - content.accelerationParPalier) ** paliersFranchis,
  )

  useEffect(() => {
    startedAtRef.current = Date.now()
  }, [])

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
    if (finished) return
    jouerSon('tap')
    setSelectedSpawnId(spawnId)
  }

  function handlePanierTap(panierId: string) {
    if (finished || !current || selectedSpawnId !== current.spawnId) return
    const flottant = content.flottants[current.flottantIndex]

    if (flottant.panierId === panierId) {
      setSelectedSpawnId(null)
      setCorrectCount((c) => c + 1)
      jouerSon('depot')
      avancerQueue()
      return
    }

    // Mauvaise rive : le mot s'y échoue et disparaît. Il n'y a PAS de seconde
    // chance sur le même mot.
    //
    // C'est le correctif le plus important de cette mécanique. Avant, un
    // mauvais dépôt ne consommait rien et ne désélectionnait pas le mot : avec
    // deux rives — le cas de cinq des huit Rivières du CP — taper l'une puis
    // l'autre garantissait la bonne réponse. Vérifié en jouant : manche gagnée
    // 5/5 et « Bonne réponse ! » sans avoir lu un seul mot. La seule mécanique
    // à tension du projet n'en avait aucune.
    setSelectedSpawnId(null)
    setWrongTapCount((w) => w + 1)
    jouerSon('faux')
    setRejectPanierId(panierId)
    avancerQueue()
    window.setTimeout(() => setRejectPanierId(null), REJET_DUREE_MS)
  }

  // Un mot non classé qui atteint le bas de l'écran compte comme raté.
  useEffect(() => {
    if (!current || finished) return
    const dureeMs = vitesseSec * 1000
    const timer = window.setTimeout(() => {
      setSelectedSpawnId(null)
      setRateCount((r) => r + 1)
      jouerSon('rate')
      avancerQueue()
    }, dureeMs)
    return () => window.clearTimeout(timer)
  }, [current, vitesseSec, finished, avancerQueue])

  // Fin de manche : objectif atteint (victoire), ou trois mots perdus (échec),
  // qu'ils aient filé ou se soient échoués sur la mauvaise rive.
  useEffect(() => {
    if (finishedRef.current || !finished) return
    finishedRef.current = true
    const succes = correctCount >= content.objectif
    const timeMs = elapsedSince(startedAtRef.current)
    const mistakes = perdus
    window.setTimeout(() => {
      onComplete({ correct: succes, timeMs, mistakes })
    }, FIN_DELAI_MS)
  }, [finished, correctCount, perdus, content.objectif, onComplete])

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
        <RiviereDecor />
        {current && (
          <button
            key={current.spawnId}
            type="button"
            className={clsx(styles.flottant, {
              [styles.flottantStatique]: prefersReducedMotion,
              [styles.selectionne]: selectedSpawnId === current.spawnId,
            })}
            // Deux animations : la chute, dont la durée suit l'accélération du
            // jeu, et la dérive latérale, dont la durée est fixe — c'est la
            // rivière qui balance, pas le mot qui s'agite. Une seule valeur
            // ici s'appliquerait aux deux.
            style={prefersReducedMotion ? undefined : { animationDuration: `${vitesseSec}s, 2.6s` }}
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
