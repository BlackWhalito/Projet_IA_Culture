import { useCallback, useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import type { VersContent, GameCompleteResult } from '../../types/game'
import { compterPieds, versRecevable, type Tuile } from '../../engine/metrique'
import { elapsedSince } from '../../engine/timing'
import { jouerSon } from '../../engine/sound'
import styles from './VersGame.module.css'

interface VersGameProps {
  content: VersContent
  onComplete: (result: GameCompleteResult) => void
}

type Mot = VersContent['strophes'][number]['reserve'][number]
type Phase = 'ecriture' | 'revelation' | 'fini'

const FIN_DELAI_MS = 500

/**
 * Le bouton de la révélation reste éteint ce temps-là.
 *
 * Sans ce délai, un double tap sur « Écrire » sautait la manche entière : le
 * second tap tombait sur « Vers suivant », qui venait d'apparaître exactement
 * au même endroit, et le joueur passait au quatrain suivant sans avoir vu le
 * vers de Hugo — la seule récompense du jeu. Un tap impatient suffisait.
 */
const DELAI_ARMEMENT_MS = 700

/** « Triste, et le jour… » et « triste et le jour » sont le même vers. */
function nu(texte: string): string {
  return texte
    .toLowerCase()
    .replace(/[.,;:!?«»…]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * « Douze pieds ».
 *
 * Trois vers de Hugo sont écrits, il faut finir le quatrième. Douze pieds
 * exactement, et sur la bonne rime.
 *
 * Ce que la mécanique enseigne, et qu'un questionnaire sur les rimes ne peut
 * pas enseigner : **le e muet ne se compte qu'en fonction du mot suivant.**
 * « Demeure » vaut trois pieds devant une consonne et deux devant une voyelle.
 * Quand le joueur pose un mot commençant par une voyelle, le dernier trait du
 * mot précédent **se vide sous ses yeux** — la règle se constate, elle ne
 * s'énonce pas. C'est tout le jeu, et c'est ce qui le rend impossible à
 * remplacer par un QCM.
 *
 * On ne peut pas valider un vers faux : le bouton reste éteint. Le seul échec
 * possible est le temps qui s'épuise — et même alors, on repart avec le vers
 * de Hugo et ce qu'il a gagné à ce choix-là.
 */
export function VersGame({ content, onComplete }: VersGameProps) {
  const [index, setIndex] = useState(0)
  const [poses, setPoses] = useState<number[]>([])
  const [phase, setPhase] = useState<Phase>('ecriture')
  const [reussies, setReussies] = useState(0)
  const [ratees, setRatees] = useState(0)
  const [restant, setRestant] = useState(content.secondesParStrophe ?? 0)
  const [arme, setArme] = useState(false)
  const startedAtRef = useRef(0)
  const finishedRef = useRef(false)

  useEffect(() => {
    startedAtRef.current = Date.now()
  }, [])

  const strophe = content.strophes[index]
  const tuiles: Tuile[] = poses.map((i) => strophe.reserve[i])
  const pieds = compterPieds(tuiles)
  const recevable = versRecevable(
    tuiles,
    strophe.piedsCible,
    strophe.rimeCle,
    (tuile) => (tuile as Mot).rimeCle,
  )

  const memeVers = nu(tuiles.map((t) => t.mot).join(' ')) === nu(strophe?.versReel ?? '')

  const terminer = useCallback(
    (nbReussies: number, nbRatees: number) => {
      if (finishedRef.current) return
      finishedRef.current = true
      setPhase('fini')
      window.setTimeout(() => {
        onComplete({
          correct: nbReussies > nbRatees,
          timeMs: elapsedSince(startedAtRef.current),
          mistakes: nbRatees,
        })
      }, FIN_DELAI_MS)
    },
    [onComplete],
  )

  const revelerStrophe = useCallback(
    (gagnee: boolean) => {
      setReussies((r) => (gagnee ? r + 1 : r))
      setRatees((e) => (gagnee ? e : e + 1))
      jouerSon(gagnee ? 'victoire' : 'defaite')
      setArme(false)
      setPhase('revelation')
    },
    [],
  )

  useEffect(() => {
    if (phase !== 'revelation') return
    const timer = window.setTimeout(() => setArme(true), DELAI_ARMEMENT_MS)
    return () => window.clearTimeout(timer)
  }, [phase, index])

  /**
   * La révélation attend qu'on la quitte. Elle défilait toute seule en cinq
   * secondes, ce qui suffit à voir le vers de Hugo et pas à lire pourquoi il
   * l'a écrit — or c'est la récompense de la manche, pas une transition.
   */
  function continuer() {
    if (!arme) return
    if (index + 1 >= content.strophes.length) {
      terminer(reussies, ratees)
      return
    }
    setIndex((i) => i + 1)
    setPoses([])
    setRestant(content.secondesParStrophe ?? 0)
    setPhase('ecriture')
  }

  /*
   * La bougie, en deux morceaux volontairement séparés : un délai unique qui
   * achève la manche, et un battement d'une seconde qui ne sert qu'à
   * l'afficher. Les fondre en un seul compte à rebours obligerait à appeler
   * revelerStrophe DANS l'effet quand il atteint zéro — c'est le
   * react(set-state-in-effect) qu'oxlint refuse, et il a raison : la fin de la
   * manche est un événement, pas une synchronisation.
   */
  useEffect(() => {
    if (!content.secondesParStrophe || phase !== 'ecriture') return
    const fin = window.setTimeout(
      () => revelerStrophe(false),
      content.secondesParStrophe * 1000,
    )
    return () => window.clearTimeout(fin)
  }, [phase, index, content.secondesParStrophe, revelerStrophe])

  useEffect(() => {
    if (!content.secondesParStrophe || phase !== 'ecriture') return
    const battement = window.setInterval(() => setRestant((r) => Math.max(0, r - 1)), 1000)
    return () => window.clearInterval(battement)
  }, [phase, index, content.secondesParStrophe])

  function poser(i: number) {
    if (phase !== 'ecriture' || poses.includes(i)) return
    jouerSon('tap')
    setPoses((p) => [...p, i])
  }

  /** Taper un mot déjà posé le retire, et recalcule tout le peigne. */
  function retirer(rang: number) {
    if (phase !== 'ecriture') return
    jouerSon('tap')
    setPoses((p) => p.filter((_, k) => k !== rang))
  }

  if (phase === 'fini' || !strophe) return null

  return (
    <div className={styles.game}>
      <p className={styles.auteur}>
        {content.auteur} · {content.oeuvre}, {content.annee}
      </p>
      <div className={styles.entete}>
        {content.strophes.length > 1 ? (
          <span className={styles.rang}>
            Quatrain {index + 1} / {content.strophes.length}
          </span>
        ) : null}
        {content.secondesParStrophe && phase === 'ecriture' ? (
          <span className={styles.bougie}>{restant} s</span>
        ) : null}
      </div>

      {/* Les vers déjà écrits : le contexte sonore dont dépend la rime. */}
      <div className={styles.amont}>
        {strophe.amont.map((vers) => (
          <p key={vers} className={styles.versAmont}>
            {vers}
          </p>
        ))}
      </div>

      {phase === 'revelation' ? (
        <div className={styles.revelation}>
          <p className={styles.versJoueur}>
            {tuiles.length > 0 ? (
              tuiles.map((t) => t.mot).join(' ')
            ) : (
              <span className={styles.lignePlaceholder}>La bougie s’est éteinte.</span>
            )}
          </p>
          {memeVers ? (
            <p className={styles.libelleReel}>
              Mot pour mot, c’est le vers de {content.auteur}.
            </p>
          ) : (
            <>
              <p className={styles.libelleReel}>{content.auteur}, lui, a écrit :</p>
              <p className={styles.versReel}>{strophe.versReel}</p>
            </>
          )}
          <p className={styles.commentaire}>{strophe.commentaire}</p>
          <button
            type="button"
            className={styles.ecrire}
            disabled={!arme}
            onClick={continuer}
          >
            {index + 1 >= content.strophes.length ? 'Fermer le recueil' : 'Vers suivant'}
          </button>
        </div>
      ) : (
        <>
          {/* La ligne en cours. Chaque mot posé est repris en tapant dessus. */}
          <div className={styles.ligne}>
            {poses.length === 0 ? (
              <span className={styles.lignePlaceholder}>Compose ton vers ici.</span>
            ) : (
              poses.map((i, rang) => (
                <button
                  key={`${i}-${rang}`}
                  type="button"
                  className={styles.motPose}
                  onClick={() => retirer(rang)}
                >
                  {strophe.reserve[i].mot}
                </button>
              ))
            )}
          </div>

          {/*
            Le peigne. Douze traits, un par pied.
            C'est ici que se voit l'élision : poser un mot commençant par une
            voyelle vide le dernier trait du mot précédent.
          */}
          <div className={styles.peigne} aria-label={`${pieds} pieds sur ${strophe.piedsCible}`}>
            {Array.from({ length: strophe.piedsCible }, (_, i) => (
              <span
                key={i}
                className={clsx(styles.dent, {
                  [styles.dentPleine]: i < pieds,
                  [styles.dentTrop]: pieds > strophe.piedsCible,
                })}
              />
            ))}
          </div>

          <p className={styles.compte}>
            <span className={clsx({ [styles.compteTrop]: pieds > strophe.piedsCible })}>{pieds}</span>
            {' / '}
            {strophe.piedsCible} pieds · rime en {strophe.rimeAffichee}
          </p>

          <div className={styles.reserve}>
            {strophe.reserve.map((mot, i) => (
              <button
                key={mot.mot}
                type="button"
                className={clsx(styles.tuile, { [styles.tuileUtilisee]: poses.includes(i) })}
                disabled={poses.includes(i)}
                onClick={() => poser(i)}
              >
                {mot.mot}
              </button>
            ))}
          </div>

          {/*
            On ne peut pas valider un vers faux — on peut seulement rester
            bloqué. C'est ce qui force à chercher au lieu de tenter.
          */}
          <button
            type="button"
            className={styles.ecrire}
            disabled={!recevable}
            onClick={() => revelerStrophe(true)}
          >
            Écrire
          </button>
        </>
      )}
    </div>
  )
}
