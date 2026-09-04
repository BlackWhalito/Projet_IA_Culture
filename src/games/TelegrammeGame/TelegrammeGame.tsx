import { useCallback, useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import type { TelegrammeContent, GameCompleteResult } from '../../types/game'
import { compterMots, evaluerMessage, type Verdict } from '../../engine/telegramme'
import { elapsedSince } from '../../engine/timing'
import { jouerSon } from '../../engine/sound'
import styles from './TelegrammeGame.module.css'

interface TelegrammeGameProps {
  content: TelegrammeContent
  onComplete: (result: GameCompleteResult) => void
}

type Phase = 'redaction' | 'reception' | 'fini'

const FIN_DELAI_MS = 500
/** Le bouton de la réception reste éteint ce temps-là — voir la skill `pieges-du-projet`. */
const DELAI_ARMEMENT_MS = 700

/**
 * « STOP ».
 *
 * On est employé au guichet du télégraphe. Le message du client coûte trop
 * cher ; il faut le faire tenir dans le tarif, et le destinataire fera
 * exactement ce que le papier dira.
 *
 * Ce que la mécanique enseigne, et qu'un questionnaire ne peut pas : **quels
 * mots portent une information.** On croit que « les » est un mot vide jusqu'au
 * moment où on doit le payer — et où on voit arriver un enfant au lieu de
 * trois. Le morse ne transmettait pas la ponctuation : on écrivait STOP à la
 * place du point, et il se payait comme un mot plein. C'est le seul moment de
 * l'histoire où la ponctuation a eu un prix affiché.
 *
 * On ne peut pas expédier un message trop cher : le bouton reste éteint. On
 * peut seulement rester bloqué, donc choisir.
 */
export function TelegrammeGame({ content, onComplete }: TelegrammeGameProps) {
  const [index, setIndex] = useState(0)
  const [barres, setBarres] = useState<number[]>([])
  const [stops, setStops] = useState<number[]>([])
  const [phase, setPhase] = useState<Phase>('redaction')
  const [verdict, setVerdict] = useState<Verdict | null>(null)
  const [recus, setRecus] = useState(0)
  const [rates, setRates] = useState(0)
  const [restant, setRestant] = useState(content.messages[0]?.secondes ?? 0)
  const [arme, setArme] = useState(false)
  const startedAtRef = useRef(0)
  const finishedRef = useRef(false)

  useEffect(() => {
    startedAtRef.current = Date.now()
  }, [])

  const message = content.messages[index]
  const cout = message ? compterMots(message, barres, stops) : 0
  const finançable = message ? cout <= message.budget : false

  const terminer = useCallback(
    (nbRecus: number, nbRates: number) => {
      if (finishedRef.current) return
      finishedRef.current = true
      setPhase('fini')
      window.setTimeout(() => {
        onComplete({
          correct: nbRecus > nbRates,
          timeMs: elapsedSince(startedAtRef.current),
          mistakes: nbRates,
        })
      }, FIN_DELAI_MS)
    },
    [onComplete],
  )

  const expedier = useCallback(() => {
    setPhase((p) => {
      if (p !== 'redaction') return p
      const v = evaluerMessage(content.messages[index], barres, stops)
      setVerdict(v)
      if (v.recu) setRecus((r) => r + 1)
      else setRates((r) => r + 1)
      jouerSon(v.recu ? 'juste' : 'faux')
      setArme(false)
      return 'reception'
    })
  }, [content.messages, index, barres, stops])

  // Le client attend. À zéro, le télégramme part tel quel — ce que le joueur a
  // laissé sur le papier est ce qui sera transmis.
  useEffect(() => {
    if (!message?.secondes || phase !== 'redaction') return
    const fin = window.setTimeout(expedier, message.secondes * 1000)
    return () => window.clearTimeout(fin)
  }, [phase, index, message?.secondes, expedier])

  useEffect(() => {
    if (!message?.secondes || phase !== 'redaction') return
    const battement = window.setInterval(() => setRestant((r) => Math.max(0, r - 1)), 1000)
    return () => window.clearInterval(battement)
  }, [phase, index, message?.secondes])

  useEffect(() => {
    if (phase !== 'reception') return
    const timer = window.setTimeout(() => setArme(true), DELAI_ARMEMENT_MS)
    return () => window.clearTimeout(timer)
  }, [phase, index])

  function basculerMot(i: number) {
    if (phase !== 'redaction') return
    jouerSon('tap')
    setBarres((b) => (b.includes(i) ? b.filter((k) => k !== i) : [...b, i]))
    // Un STOP posé derrière un mot qu'on vient de barrer flotterait dans le
    // vide : la frontière se définit entre deux mots transmis, pas après un
    // blanc. On le reprend, et le compteur le rembourse.
    setStops((st) => st.filter((k) => k !== i))
  }

  function basculerStop(apres: number) {
    if (phase !== 'redaction') return
    jouerSon('tap')
    setStops((s) => (s.includes(apres) ? s.filter((k) => k !== apres) : [...s, apres]))
  }

  function suivant() {
    if (!arme) return
    if (index + 1 >= content.messages.length) {
      terminer(recus, rates)
      return
    }
    const prochain = index + 1
    setIndex(prochain)
    setBarres([])
    setStops([])
    setVerdict(null)
    setRestant(content.messages[prochain].secondes)
    setPhase('redaction')
  }

  if (phase === 'fini' || !message) return null

  /** Le télégramme tel qu'il partira : mots gardés et STOP posés, dans l'ordre. */
  const transmis = message.mots
    .flatMap((mot, i) => [
      ...(barres.includes(i) ? [] : [mot]),
      ...(stops.includes(i) ? ['STOP'] : []),
    ])
    .join(' ')

  return (
    <div className={styles.game}>
      <p className={styles.bureau}>
        {content.bureau.qui} · {content.bureau.lieu}, {content.bureau.annee}
      </p>

      <div className={styles.entete}>
        <span className={styles.rang}>
          Message {index + 1} / {content.messages.length}
        </span>
        {phase === 'redaction' ? <span className={styles.horloge}>{restant} s</span> : null}
      </div>

      {/* Ce que le client veut. C'est la seule consigne du tour. */}
      <p className={styles.intention}>{message.intention}</p>

      {phase === 'reception' && verdict ? (
        <div className={styles.reception}>
          <p className={styles.libelleRuban}>Reçu à l’autre bout :</p>
          <p className={styles.ruban}>{transmis || '—'}</p>
          <p className={clsx(styles.scene, { [styles.sceneRatee]: !verdict.recu })}>
            {verdict.scene}
          </p>
          <p className={styles.revelation}>{message.revelation}</p>
          <button type="button" className={styles.expedier} disabled={!arme} onClick={suivant}>
            {index + 1 >= content.messages.length ? 'Fermer le guichet' : 'Client suivant'}
          </button>
        </div>
      ) : (
        <>
          {/*
            Le formulaire. Un tap barre un mot, un tap dans un interstice y pose
            un STOP — et ce STOP se paie comme un mot, ce qui est tout le sujet.
          */}
          <div className={styles.formulaire}>
            {message.mots.map((mot, i) => (
              <span key={`${mot}-${i}`} className={styles.groupe}>
                <button
                  type="button"
                  className={clsx(styles.mot, { [styles.motBarre]: barres.includes(i) })}
                  aria-pressed={barres.includes(i)}
                  onClick={() => basculerMot(i)}
                >
                  {mot}
                </button>
                {i < message.mots.length - 1 ? (
                  <button
                    type="button"
                    disabled={barres.includes(i)}
                    className={clsx(styles.fente, { [styles.fentePleine]: stops.includes(i) })}
                    aria-label={
                      stops.includes(i)
                        ? `Retirer le STOP après « ${mot} »`
                        : `Poser un STOP après « ${mot} »`
                    }
                    onClick={() => basculerStop(i)}
                  >
                    {stops.includes(i) ? 'STOP' : '·'}
                  </button>
                ) : null}
              </span>
            ))}
          </div>

          <p className={clsx(styles.compte, { [styles.compteTrop]: !finançable })}>
            <strong>{cout}</strong> mots facturés · tarif : {message.budget}
          </p>

          <button
            type="button"
            className={styles.expedier}
            disabled={!finançable}
            onClick={expedier}
          >
            Expédier
          </button>
          <p className={styles.tarif}>{content.bureau.tarif}</p>
        </>
      )}
    </div>
  )
}
