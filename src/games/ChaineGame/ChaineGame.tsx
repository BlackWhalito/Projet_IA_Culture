import { useCallback, useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import type { ChaineContent, GameCompleteResult } from '../../types/game'
import { elapsedSince } from '../../engine/timing'
import { jouerSon } from '../../engine/sound'
import styles from './ChaineGame.module.css'

interface ChaineGameProps {
  content: ChaineContent
  onComplete: (result: GameCompleteResult) => void
}

/** Mise de départ, et de retour après une erreur. */
const MISE_INITIALE = 100
/** Nombre d'erreurs qui met fin à la manche. */
const ERREURS_MAX = 3
/** Déplacement horizontal, en pixels, au-delà duquel la carte est validée. */
const SEUIL_VALIDATION = 60
/** Temps de lecture du verdict avant la carte suivante. */
const VERDICT_MS = 2600

type Phase = 'carte' | 'verdict' | 'fini'

/**
 * « Je te crois pas ».
 *
 * Le remplaçant du QCM, et la première mécanique du projet où l'on peut
 * **perdre quelque chose qu'on avait déjà gagné**. C'était le manque de fond
 * relevé par le propriétaire : « ces jeux ne donnent pas envie d'y revenir ».
 * Sans mise, un chrono n'est qu'une horloge.
 *
 * Trois décisions de conception qui ne sont pas des détails :
 *
 * - **Le balayage est horizontal**, jamais vertical : la page défile
 *   verticalement, et un geste vertical entrerait en conflit avec elle. La
 *   carte est centrée, donc loin des zones de retour arrière du navigateur.
 * - **On peut encaisser à tout moment.** C'est la seule décision intéressante
 *   du jeu, et elle arrive à chaque carte : continuer double la mise, se
 *   tromper la remet à zéro.
 * - **Les cartes ne sont pas mélangées.** L'ordre du contenu est celui de la
 *   perfidie croissante : la tentation d'encaisser doit culminer exactement
 *   quand les vrais pièges arrivent. Mélanger détruirait la courbe.
 */
export function ChaineGame({ content, onComplete }: ChaineGameProps) {
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>('carte')
  const [mise, setMise] = useState(MISE_INITIALE)
  const [encaisse, setEncaisse] = useState(0)
  const [erreurs, setErreurs] = useState(0)
  const [reponses, setReponses] = useState<{ juste: boolean; expire: boolean }[]>([])
  const [glissement, setGlissement] = useState(0)
  const [prefersReducedMotion] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const startedAtRef = useRef(0)
  const pointerRef = useRef<{ id: number; x0: number } | null>(null)
  const finishedRef = useRef(false)

  useEffect(() => {
    startedAtRef.current = Date.now()
  }, [])

  const carte = content.affirmations[index]
  const derniereReponse = reponses[reponses.length - 1]

  const terminer = useCallback(
    (gains: number) => {
      if (finishedRef.current) return
      finishedRef.current = true
      setPhase('fini')
      const justes = reponses.filter((r) => r.juste).length
      onComplete({
        correct: justes > reponses.length / 2,
        timeMs: elapsedSince(startedAtRef.current),
        mistakes: reponses.filter((r) => !r.juste).length,
        // Le score de cette mécanique est la mise encaissée : c'est le chiffre
        // qu'on veut battre, et il ne se confond pas avec le nombre de bonnes
        // réponses — encaisser tôt, c'est avoir raison sans oser.
        streak: gains,
      })
    },
    [onComplete, reponses],
  )

  const repondre = useCallback(
    (dit: boolean | null) => {
      if (phase !== 'carte' || !carte) return
      const expire = dit === null
      const juste = !expire && dit === carte.vrai
      setGlissement(0)
      pointerRef.current = null
      setReponses((r) => [...r, { juste, expire }])
      jouerSon(juste ? 'juste' : 'faux')

      if (juste) {
        setMise((m) => m * 2)
      } else {
        setMise(MISE_INITIALE)
        setErreurs((e) => e + 1)
      }
      setPhase('verdict')
    },
    [phase, carte],
  )

  // Le chrono de la carte. Il ne se réinitialise qu'au changement de carte :
  // hésiter coûte, et c'est ce qui empêche de réfléchir indéfiniment.
  useEffect(() => {
    if (phase !== 'carte' || !carte) return
    const timer = window.setTimeout(() => repondre(null), content.secondesParCarte * 1000)
    return () => window.clearTimeout(timer)
  }, [phase, carte, content.secondesParCarte, repondre])

  // Passage à la carte suivante, ou fin de manche.
  useEffect(() => {
    if (phase !== 'verdict') return
    const timer = window.setTimeout(() => {
      const troisErreurs = erreurs >= ERREURS_MAX
      const plusDeCartes = index + 1 >= content.affirmations.length
      if (troisErreurs || plusDeCartes) {
        terminer(encaisse)
        return
      }
      setIndex((i) => i + 1)
      setPhase('carte')
    }, VERDICT_MS)
    return () => window.clearTimeout(timer)
  }, [phase, erreurs, index, content.affirmations.length, encaisse, terminer])

  function handleEncaisser() {
    if (phase !== 'carte') return
    jouerSon('victoire')
    const total = encaisse + mise
    setEncaisse(total)
    terminer(total)
  }

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (phase !== 'carte') return
    pointerRef.current = { id: e.pointerId, x0: e.clientX }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const p = pointerRef.current
    if (!p || p.id !== e.pointerId) return
    setGlissement(e.clientX - p.x0)
  }

  function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    const p = pointerRef.current
    if (!p || p.id !== e.pointerId) return
    const dx = e.clientX - p.x0
    pointerRef.current = null
    if (Math.abs(dx) >= SEUIL_VALIDATION) repondre(dx > 0)
    else setGlissement(0)
  }

  /** `pointercancel` : le navigateur reprend le geste (défilement, appel). */
  function handlePointerCancel() {
    pointerRef.current = null
    setGlissement(0)
  }

  if (phase === 'fini' || !carte) return null

  const engagement = Math.max(-1, Math.min(1, glissement / SEUIL_VALIDATION))

  return (
    <div className={styles.game}>
      <div className={styles.entete}>
        <span className={styles.compteur}>
          {index + 1} / {content.affirmations.length}
        </span>
        <span className={styles.lanternes} aria-label={`${ERREURS_MAX - erreurs} erreurs restantes`}>
          {Array.from({ length: ERREURS_MAX }, (_, i) => (
            <span key={i} className={clsx(styles.lanterne, { [styles.lanterneEteinte]: i < erreurs })} />
          ))}
        </span>
      </div>

      <p className={styles.mise}>
        <span className={styles.miseValeur}>{mise}</span> en jeu
      </p>

      <div className={styles.pile}>
        <div
          className={clsx(styles.carte, {
            [styles.carteVrai]: engagement > 0.35,
            [styles.carteFaux]: engagement < -0.35,
            [styles.carteFigee]: prefersReducedMotion,
          })}
          style={
            prefersReducedMotion || phase !== 'carte'
              ? undefined
              : { transform: `translateX(${glissement}px) rotate(${engagement * 6}deg)` }
          }
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
        >
          {phase === 'verdict' && derniereReponse ? (
            <>
              <p className={derniereReponse.juste ? styles.verdictJuste : styles.verdictFaux}>
                {derniereReponse.expire ? 'Trop tard.' : derniereReponse.juste ? 'Bien vu.' : 'Raté.'}
              </p>
              <p className={styles.verdictTexte}>{carte.verdict}</p>
            </>
          ) : (
            <p className={styles.affirmation}>{carte.texte}</p>
          )}
        </div>
      </div>

      {/*
        Les deux boutons doublent le balayage, ils ne le remplacent pas : le
        geste est le plaisir, les boutons sont l'accessibilité (clavier, et
        joueur qui n'a pas compris qu'on pouvait glisser).
      */}
      <div className={styles.reponses}>
        <button
          type="button"
          className={clsx(styles.bouton, styles.boutonFaux)}
          disabled={phase !== 'carte'}
          onClick={() => repondre(false)}
        >
          Je te crois pas
        </button>
        <button
          type="button"
          className={clsx(styles.bouton, styles.boutonVrai)}
          disabled={phase !== 'carte'}
          onClick={() => repondre(true)}
        >
          C’est vrai
        </button>
      </div>

      <button
        type="button"
        className={styles.encaisser}
        disabled={phase !== 'carte'}
        onClick={handleEncaisser}
      >
        J’encaisse {encaisse + mise}
      </button>
    </div>
  )
}
