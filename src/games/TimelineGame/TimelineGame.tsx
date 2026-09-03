import { useCallback, useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import type { TimelineContent, GameCompleteResult } from '../../types/game'
import { shuffle } from '../../engine/shuffle'
import { elapsedSince } from '../../engine/timing'
import { jouerSon } from '../../engine/sound'
import styles from './TimelineGame.module.css'

interface TimelineGameProps {
  content: TimelineContent
  onComplete: (result: GameCompleteResult) => void
}

/** Nombre d'erreurs qui met fin à la manche. */
const ERREURS_MAX = 3
/** Temps de lecture du repère après une pose. */
const POSE_MS = 1500
/** Temps de lecture après une erreur : on montre où la carte allait vraiment. */
const CORRECTION_MS = 2400
const FIN_DELAI_MS = 500

type Phase = 'pose' | 'juste' | 'correction' | 'fini'

/**
 * « Entre deux ».
 *
 * L'ancienne frise donnait toutes les cartes d'un coup et demandait de les
 * ranger. Sur la notion de la frise du temps, ces cartes étaient « Le passé »,
 * « Le présent » et « Le futur » : la réponse était écrite dans les mots.
 *
 * Ici, on reçoit une carte à la fois et on tape la **fente** où elle va, parmi
 * celles déjà posées. Trois conséquences, et c'est tout le jeu :
 *
 * - **on n'a pas besoin de connaître la date, seulement un voisin.** C'est de
 *   la chronologie relative — ce que fait réellement un historien ;
 * - **la mécanique se durcit toute seule** : chaque réussite ouvre une fente de
 *   plus, donc la chance au hasard tombe de 1/2 à 1/7 sur la durée d'une
 *   manche, sans qu'on ajoute la moindre pression artificielle ;
 * - **le hasard produit de vraies situations différentes.** Recevoir 1789 en
 *   troisième quand on a déjà 1492 et 1940 est trivial ; le recevoir en premier
 *   ne dit rien. La même notion donne une frise différente à chaque partie —
 *   c'est la seule mécanique du projet dont on peut dire ça.
 */
export function TimelineGame({ content, onComplete }: TimelineGameProps) {
  const chronologique = [...content.events.keys()].sort(
    (a, b) => content.events[a].sortValue - content.events[b].sortValue,
  )
  const depart = Math.max(1, content.cartesDeDepart ?? 1)

  // La pioche est mélangée, mais les cartes de départ sont prises dans l'ordre
  // chronologique : commencer sur des repères cohérents, pas sur trois dates
  // au hasard qui ne se situent pas les unes par rapport aux autres.
  const [initial] = useState(() => {
    const posees = chronologique.slice(0, depart)
    const reste = chronologique.slice(depart)
    return { posees, pioche: shuffle(reste) }
  })

  const [posees, setPosees] = useState<number[]>(initial.posees)
  const [pioche, setPioche] = useState<number[]>(initial.pioche)
  const [phase, setPhase] = useState<Phase>('pose')
  const [erreurs, setErreurs] = useState(0)
  const [dernierPose, setDernierPose] = useState<number | null>(null)
  const [restant, setRestant] = useState(content.secondesTotal ?? 0)
  const startedAtRef = useRef(0)
  const finishedRef = useRef(false)

  useEffect(() => {
    startedAtRef.current = Date.now()
  }, [])

  const courante = pioche[0]
  const carte = courante === undefined ? null : content.events[courante]

  const terminer = useCallback(
    (gagne: boolean, nbErreurs: number) => {
      if (finishedRef.current) return
      finishedRef.current = true
      setPhase('fini')
      window.setTimeout(() => {
        onComplete({
          correct: gagne,
          timeMs: elapsedSince(startedAtRef.current),
          mistakes: nbErreurs,
        })
      }, FIN_DELAI_MS)
    },
    [onComplete],
  )

  // Le chrono de la manche entière. Il ne se réinitialise jamais entre deux
  // cartes : hésiter sur celle-ci mange le temps des suivantes.
  useEffect(() => {
    if (!content.secondesTotal || phase === 'fini') return
    if (restant <= 0) {
      terminer(false, erreurs)
      return
    }
    const timer = window.setTimeout(() => setRestant((r) => r - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [restant, phase, content.secondesTotal, erreurs, terminer])

  /**
   * La bonne fente : celle où la carte s'insère sans casser l'ordre. On ne
   * compare pas à une position mémorisée mais aux voisins réels, ce qui reste
   * juste même quand deux événements partagent la même date.
   */
  function bonneFente(eventIndex: number): number {
    const valeur = content.events[eventIndex].sortValue
    let i = 0
    while (i < posees.length && content.events[posees[i]].sortValue < valeur) i++
    return i
  }

  function handleFente(fente: number) {
    if (phase !== 'pose' || courante === undefined) return

    const attendue = bonneFente(courante)
    const juste = fente === attendue

    // Juste ou non, la carte va à sa vraie place : une erreur fait avancer la
    // frise au lieu de bloquer. On perd une lanterne, jamais l'information.
    const suivantes = [...posees]
    suivantes.splice(attendue, 0, courante)
    setPosees(suivantes)
    setPioche((p) => p.slice(1))
    setDernierPose(courante)
    jouerSon(juste ? 'depot' : 'faux')

    const nbErreurs = juste ? erreurs : erreurs + 1
    if (!juste) setErreurs(nbErreurs)
    setPhase(juste ? 'juste' : 'correction')

    const delai = juste ? POSE_MS : CORRECTION_MS
    window.setTimeout(() => {
      if (nbErreurs >= ERREURS_MAX) {
        terminer(false, nbErreurs)
        return
      }
      if (pioche.length <= 1) {
        terminer(true, nbErreurs)
        return
      }
      setDernierPose(null)
      setPhase('pose')
    }, delai)
  }

  if (phase === 'fini') return null

  return (
    <div className={styles.game}>
      <div className={styles.entete}>
        <span className={styles.compteur}>
          {pioche.length} {pioche.length > 1 ? 'cartes' : 'carte'} en main
        </span>
        <span className={styles.droite}>
          {content.secondesTotal ? <span className={styles.chrono}>{restant} s</span> : null}
          <span className={styles.lanternes} aria-label={`${ERREURS_MAX - erreurs} erreurs restantes`}>
            {Array.from({ length: ERREURS_MAX }, (_, i) => (
              <span key={i} className={clsx(styles.lanterne, { [styles.lanterneEteinte]: i < erreurs })} />
            ))}
          </span>
        </span>
      </div>

      {/* La carte en main. Elle disparaît pendant la lecture du repère. */}
      <div className={styles.main}>
        {phase === 'pose' && carte ? (
          <div className={styles.carteEnMain}>{carte.label}</div>
        ) : (
          <p className={clsx(styles.repere, { [styles.repereFaux]: phase === 'correction' })}>
            {phase === 'correction' ? 'Pas là. Elle allait ici : ' : ''}
            {dernierPose !== null && (content.events[dernierPose].repere ?? content.events[dernierPose].label)}
          </p>
        )}
      </div>

      {/*
        La frise. Une fente s'ouvre avant chaque carte et après la dernière :
        il y a donc toujours une possibilité de plus que de cartes posées, et
        ce nombre grandit à chaque réussite.
      */}
      <div className={styles.frise}>
        {Array.from({ length: posees.length + 1 }, (_, i) => (
          <div key={`groupe-${i}`} className={styles.groupe}>
            <button
              type="button"
              className={styles.fente}
              disabled={phase !== 'pose'}
              aria-label={
                i === 0
                  ? 'Placer avant la première carte'
                  : `Placer après « ${content.events[posees[i - 1]].label} »`
              }
              onClick={() => handleFente(i)}
            >
              <span className={styles.fenteTrait} aria-hidden="true" />
            </button>
            {i < posees.length && (
              <div
                className={clsx(styles.carte, {
                  [styles.carteNeuve]: posees[i] === dernierPose,
                })}
              >
                <span className={styles.carteLabel}>{content.events[posees[i]].label}</span>
                {content.events[posees[i]].repere && (
                  <span className={styles.carteRepere}>{content.events[posees[i]].repere}</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
