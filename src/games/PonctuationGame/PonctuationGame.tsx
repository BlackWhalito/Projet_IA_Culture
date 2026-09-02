import { useCallback, useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import type { PonctuationContent, GameCompleteResult } from '../../types/game'
import { elapsedSince } from '../../engine/timing'
import { jouerSon } from '../../engine/sound'
import styles from './PonctuationGame.module.css'

interface PonctuationGameProps {
  content: PonctuationContent
  onComplete: (result: GameCompleteResult) => void
}

/** Temps de lecture du verdict avant le cas suivant. */
const VERDICT_MS = 3200

type Phase = 'pose' | 'verdict' | 'fini'

/** Deux configurations sont égales si chaque fente porte le même signe. */
function memeConfig(a: (string | null)[], b: (string | null)[]): boolean {
  return a.length === b.length && a.every((signe, i) => signe === b[i])
}

/**
 * « La virgule qui sauve ».
 *
 * On est le secrétaire qui met au propre une phrase dictée, et l'on pose la
 * ponctuation qui lui donne le sens **commandé** — sachant que la même suite de
 * mots peut dire l'inverse.
 *
 * Trois choix de conception :
 *
 * - **Un tap fait cycler la fente** (rien → , → : → ? → …) au lieu d'ouvrir un
 *   menu. Un seul geste, réversible, sans cible fine : c'est ce qui rend la
 *   mécanique jouable au pouce sans rien coder de continu.
 * - **La ligne de lecture se réécrit en direct**, avant toute validation. Voir
 *   le sens basculer sous son doigt *est* le plaisir de ce jeu ; le garder pour
 *   l'écran de correction le tuerait.
 * - **Le hasard ne passe pas.** Deux fentes à trois signes font neuf
 *   configurations, quatre fentes à cinq signes en font six cent vingt-cinq, et
 *   une seule est acceptée. C'est le test qui avait démasqué La Rivière, qu'on
 *   gagnait sans lire : celui-ci le passe par construction.
 */
export function PonctuationGame({ content, onComplete }: PonctuationGameProps) {
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>('pose')
  const [config, setConfig] = useState<(string | null)[]>(() => content.cas[0].fentes.map(() => null))
  const [reussis, setReussis] = useState(0)
  const [rates, setRates] = useState(0)
  const [dernierJuste, setDernierJuste] = useState(false)
  const startedAtRef = useRef(0)
  const finishedRef = useRef(false)

  useEffect(() => {
    startedAtRef.current = Date.now()
  }, [])

  const cas = content.cas[index]

  const cacheter = useCallback(() => {
    setPhase((p) => {
      if (p !== 'pose') return p
      const juste = memeConfig(config, cas.attendu)
      setDernierJuste(juste)
      if (juste) setReussis((r) => r + 1)
      else setRates((r) => r + 1)
      jouerSon(juste ? 'juste' : 'faux')
      return 'verdict'
    })
  }, [config, cas.attendu])

  // Le sablier du cas. Il n'interrompt pas : à son terme, la lettre part telle
  // quelle — ce que le joueur a posé est ce qui est cacheté.
  useEffect(() => {
    if (phase !== 'pose') return
    const timer = window.setTimeout(cacheter, cas.secondes * 1000)
    return () => window.clearTimeout(timer)
  }, [phase, cas.secondes, cacheter])

  // Cas suivant, ou fin de manche.
  useEffect(() => {
    if (phase !== 'verdict') return
    const timer = window.setTimeout(() => {
      if (index + 1 >= content.cas.length) {
        if (finishedRef.current) return
        finishedRef.current = true
        setPhase('fini')
        onComplete({
          correct: reussis > content.cas.length / 2,
          timeMs: elapsedSince(startedAtRef.current),
          mistakes: rates,
        })
        return
      }
      const suivant = index + 1
      setIndex(suivant)
      setConfig(content.cas[suivant].fentes.map(() => null))
      setPhase('pose')
    }, VERDICT_MS)
    return () => window.clearTimeout(timer)
  }, [phase, index, content.cas, reussis, rates, onComplete])

  function cyclerFente(rang: number) {
    if (phase !== 'pose') return
    jouerSon('tap')
    setConfig((c) => {
      const suivant = [...c]
      const actuel = suivant[rang]
      const position = actuel === null ? -1 : cas.signes.indexOf(actuel)
      // Le cycle repasse par « rien » : on peut toujours revenir en arrière.
      const prochaine = position + 1
      suivant[rang] = prochaine >= cas.signes.length ? null : cas.signes[prochaine]
      return suivant
    })
  }

  if (phase === 'fini' || !cas) return null

  const lecture = cas.lectures.find((l) => memeConfig(l.config, config))

  return (
    <div className={styles.game}>
      <div className={styles.entete}>
        <span className={styles.compteur}>
          {index + 1} / {content.cas.length}
        </span>
        <span className={styles.atelier}>
          {content.atelier.qui}
          {content.atelier.annee ? ` · ${content.atelier.annee}` : ''}
        </span>
      </div>

      <p className={styles.commande}>{cas.commande}</p>

      {/*
        La phrase. Chaque fente est un bouton à part entière, dimensionné pour
        le pouce : c'est de l'interface, elle garde ses bords nets.
      */}
      <div className={styles.phrase}>
        {cas.mots.map((mot, i) => {
          const rang = cas.fentes.indexOf(i)
          return (
            <span key={`${mot}-${i}`} className={styles.groupe}>
              <span className={styles.mot}>{mot}</span>
              {rang >= 0 && (
                <button
                  type="button"
                  className={clsx(styles.fente, { [styles.fenteVide]: config[rang] === null })}
                  disabled={phase !== 'pose'}
                  aria-label={`Ponctuation après « ${mot} » : ${config[rang] ?? 'aucune'}`}
                  onClick={() => cyclerFente(rang)}
                >
                  {config[rang] ?? '·'}
                </button>
              )}
            </span>
          )
        })}
      </div>

      {phase === 'pose' ? (
        <p className={clsx(styles.lecture, { [styles.lectureVide]: !lecture })}>
          {lecture ? lecture.texte : 'Pour l’instant, ça ne veut rien dire de précis.'}
        </p>
      ) : (
        <div className={styles.verdict}>
          <p className={dernierJuste ? styles.verdictJuste : styles.verdictFaux}>
            {dernierJuste ? 'Cacheté. C’est le sens commandé.' : 'La lettre part avec le mauvais sens.'}
          </p>
          <p className={styles.adverse}>{cas.adverse}</p>
        </div>
      )}

      <button type="button" className={styles.cacheter} disabled={phase !== 'pose'} onClick={cacheter}>
        Cacheter
      </button>
    </div>
  )
}
