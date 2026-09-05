import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import clsx from 'clsx'
import type { ARebourseContent, GameCompleteResult } from '../../types/game'
import { mepriseDe, memeOrdre } from '../../engine/arebours'
import { shuffle } from '../../engine/shuffle'
import { elapsedSince } from '../../engine/timing'
import { jouerSon } from '../../engine/sound'
import styles from './ARebourseGame.module.css'

interface ARebourseGameProps {
  content: ARebourseContent
  onComplete: (result: GameCompleteResult) => void
}

type Phase = 'compose' | 'verdict' | 'fini'

const FEUILLES_MAX = 3
const FIN_DELAI_MS = 500
/** Voir la skill `pieges-du-projet` : deux boutons à la même place. */
const DELAI_ARMEMENT_MS = 600

/**
 * « À rebours ».
 *
 * On te demande une liste que tu récites depuis l'école, mais jamais dans le
 * sens où tu l'as apprise. « Bleu blanc rouge » ne dit pas quelle couleur est
 * à la hampe : une liste sue par cœur est une chaîne qu'on ne sait parcourir
 * que dans un sens.
 *
 * **Deux règles de code rendent le piège loyal**, et elles ne sont pas
 * négociables : la consigne reste affichée en entier pendant toute la demande,
 * et le chrono ne démarre qu'au premier tap. Le joueur a toujours le temps de
 * lire ; ce qui le trahit est son réflexe, jamais une formulation.
 */
export function ARebourseGame({ content, onComplete }: ARebourseGameProps) {
  const [index, setIndex] = useState(0)
  const [poses, setPoses] = useState<string[]>([])
  const [phase, setPhase] = useState<Phase>('compose')
  const [reussies, setReussies] = useState(0)
  const [gachees, setGachees] = useState(0)
  const [juste, setJuste] = useState(false)
  const [meprise, setMeprise] = useState<string | undefined>(undefined)
  const [restant, setRestant] = useState<number | null>(null)
  const [enCours, setEnCours] = useState(false)
  const posesRef = useRef<string[]>([])
  const [arme, setArme] = useState(false)
  const startedAtRef = useRef(0)
  const finishedRef = useRef(false)

  useEffect(() => {
    startedAtRef.current = Date.now()
  }, [])

  // Le compte à rebours lit les tuiles posées à l'instant où il expire, pas
  // celles d'il y a huit secondes.
  useEffect(() => {
    posesRef.current = poses
  }, [poses])

  const demande = content.demandes[index]

  // Le rack est mélangé une fois par demande : l'ordre du contenu ne doit
  // jamais souffler la réponse.
  const rack = useMemo(
    () => shuffle(content.suite.filter((t) => demande?.attendu.includes(t.id))),
    [content.suite, demande],
  )

  const terminer = useCallback(
    (nbReussies: number, nbGachees: number) => {
      if (finishedRef.current) return
      finishedRef.current = true
      setPhase('fini')
      window.setTimeout(() => {
        onComplete({
          correct: nbReussies > nbGachees,
          timeMs: elapsedSince(startedAtRef.current),
          mistakes: nbGachees,
        })
      }, FIN_DELAI_MS)
    },
    [onComplete],
  )

  const juger = useCallback(
    (ordre: string[]) => {
      const bon = memeOrdre(ordre, demande.attendu)
      setJuste(bon)
      setMeprise(bon ? undefined : mepriseDe(demande, ordre))
      if (bon) setReussies((r) => r + 1)
      else setGachees((g) => g + 1)
      jouerSon(bon ? 'juste' : 'faux')
      setRestant(null)
      setEnCours(false)
      setArme(false)
      setPhase('verdict')
    },
    [demande],
  )

  /*
   * Le chrono ne court qu'une fois la première tuile posée. C'est la
   * contrepartie du piège : on ne peut pas perdre pour n'avoir pas eu le temps
   * de lire la consigne.
   *
   * Il est en deux morceaux — un délai unique qui juge, un battement d'une
   * seconde qui l'affiche — pour la même raison que dans « Douze pieds » :
   * fondre les deux obligerait à appeler `juger` DANS l'effet quand il atteint
   * zéro, ce qu'oxlint refuse à juste titre. La fin d'une demande est un
   * événement, pas une synchronisation.
   */
  useEffect(() => {
    if (phase !== 'compose' || !enCours) return
    const fin = window.setTimeout(() => juger(posesRef.current), demande.secondes * 1000)
    return () => window.clearTimeout(fin)
  }, [phase, enCours, index, demande.secondes, juger])

  useEffect(() => {
    if (phase !== 'compose' || !enCours) return
    const battement = window.setInterval(
      () => setRestant((r) => (r === null ? null : Math.max(0, r - 1))),
      1000,
    )
    return () => window.clearInterval(battement)
  }, [phase, enCours, index])

  useEffect(() => {
    if (phase !== 'verdict') return
    const timer = window.setTimeout(() => setArme(true), DELAI_ARMEMENT_MS)
    return () => window.clearTimeout(timer)
  }, [phase, index])

  function poser(id: string) {
    if (phase !== 'compose' || poses.includes(id)) return
    jouerSon('tap')
    const suivant = [...poses, id]
    setPoses(suivant)
    if (!enCours) {
      setRestant(demande.secondes)
      setEnCours(true)
    }
    // Dernier emplacement rempli : on valide. On ne relit pas son travail, on
    // est un ouvrier payé à la ligne — et c'est ce qui empêche de rattraper
    // un réflexe après coup.
    if (suivant.length === demande.attendu.length) juger(suivant)
  }

  function reprendre(rang: number) {
    if (phase !== 'compose') return
    jouerSon('tap')
    setPoses((p) => p.filter((_, i) => i !== rang))
  }

  function continuer() {
    if (!arme) return
    const fini = index + 1 >= content.demandes.length || gachees >= FEUILLES_MAX
    if (fini) {
      terminer(reussies, gachees)
      return
    }
    setIndex((i) => i + 1)
    setPoses([])
    setRestant(null)
    setEnCours(false)
    setArme(false)
    setPhase('compose')
  }

  if (phase === 'fini' || !demande) return null

  const teinteDe = (id: string) => content.suite.find((t) => t.id === id)?.couleur
  const libelleDe = (id: string) => content.suite.find((t) => t.id === id)?.label ?? id
  const derniere = index + 1 >= content.demandes.length || gachees >= FEUILLES_MAX
  const [avant, apres] = demande.consigne.split(demande.accent)

  return (
    <div className={styles.game}>
      <p className={styles.atelier}>
        {content.atelier.qui} · {content.atelier.lieu}, {content.atelier.annee}
      </p>

      <div className={styles.entete}>
        <span className={styles.rang}>
          Demande {index + 1} / {content.demandes.length}
        </span>
        {/* Les feuilles qu'il reste. Dessinées, pas écrites : les caractères
            de bloc pleins et vides ne sont pas garantis par les polices
            système, et le vide s'affichait en carré de fonte manquante. */}
        <span className={styles.feuilles} aria-label={`${FEUILLES_MAX - gachees} feuilles restantes`}>
          {Array.from({ length: FEUILLES_MAX }, (_, i) => (
            <span
              key={i}
              className={clsx(styles.feuille, { [styles.feuilleGachee]: i < gachees })}
            />
          ))}
        </span>
        {restant !== null ? <span className={styles.horloge}>{restant} s</span> : null}
      </div>

      {/*
        La consigne reste là, entière, pendant toute la demande — verdict
        compris. Le fragment qui porte le piège est souligné : on ne cache rien,
        c'est le réflexe qui trahit.
      */}
      <p className={styles.demande}>
        {avant}
        <strong className={styles.accent}>{demande.accent}</strong>
        {apres}
      </p>

      {phase === 'verdict' ? (
        <div className={styles.resultat}>
          <Rendu
            ordre={poses}
            rendu={demande.rendu}
            teinteDe={teinteDe}
            libelleDe={libelleDe}
          />
          {meprise ? <p className={styles.meprise}>{meprise}</p> : null}
          {!juste && !meprise ? (
            <p className={styles.meprise}>
              L’ordre juste était : {demande.attendu.map(libelleDe).join(', ')}.
            </p>
          ) : null}
          <p className={styles.verdict}>{demande.verdict}</p>
          <button type="button" className={styles.suivant} disabled={!arme} onClick={continuer}>
            {derniere ? 'Rendre le composteur' : 'Demande suivante'}
          </button>
        </div>
      ) : (
        <>
          {/* Le composteur : les emplacements, dans l'ordre où on les remplit. */}
          <div className={styles.composteur}>
            {demande.attendu.map((_, i) => {
              const id = poses[i]
              return id ? (
                <button
                  key={`${id}-${i}`}
                  type="button"
                  className={styles.pose}
                  style={teinteDe(id) ? { borderColor: teinteDe(id) } : undefined}
                  onClick={() => reprendre(i)}
                >
                  {teinteDe(id) ? (
                    <span className={styles.pastille} style={{ background: teinteDe(id) }} />
                  ) : null}
                  {libelleDe(id)}
                </button>
              ) : (
                <span key={i} className={styles.vide}>
                  {i + 1}
                </span>
              )
            })}
          </div>

          <div className={styles.rack}>
            {rack.map((tuile) => (
              <button
                key={tuile.id}
                type="button"
                className={clsx(styles.tuile, { [styles.tuileUtilisee]: poses.includes(tuile.id) })}
                disabled={poses.includes(tuile.id)}
                onClick={() => poser(tuile.id)}
              >
                {tuile.couleur ? (
                  <span className={styles.pastille} style={{ background: tuile.couleur }} />
                ) : null}
                {tuile.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

/** Ce que le compositeur vient de monter, dessiné. */
function Rendu({
  ordre,
  rendu,
  teinteDe,
  libelleDe,
}: {
  ordre: string[]
  rendu?: 'bandes' | 'bandesH' | 'liste'
  teinteDe: (id: string) => string | undefined
  libelleDe: (id: string) => string
}) {
  if (rendu === 'bandes' || rendu === 'bandesH') {
    return (
      <div
        className={clsx(styles.drapeau, { [styles.drapeauH]: rendu === 'bandesH' })}
        role="img"
        aria-label={ordre.map(libelleDe).join(', ')}
      >
        {ordre.map((id, i) => (
          <span key={`${id}-${i}`} className={styles.bande} style={{ background: teinteDe(id) }} />
        ))}
      </div>
    )
  }
  return <p className={styles.ligne}>{ordre.map(libelleDe).join(' · ')}</p>
}
