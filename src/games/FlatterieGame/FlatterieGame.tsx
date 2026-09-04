import { useCallback, useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import type { FlatterieContent, GameCompleteResult } from '../../types/game'
import {
  aCourtDeMots,
  dire,
  effetDe,
  issue,
  PLEIN,
  type EtatFlatterie,
} from '../../engine/flatterie'
import { elapsedSince } from '../../engine/timing'
import { jouerSon } from '../../engine/sound'
import styles from './FlatterieGame.module.css'

interface FlatterieGameProps {
  content: FlatterieContent
  onComplete: (result: GameCompleteResult) => void
}

type Phase = 'parole' | 'fin' | 'fini'

const FIN_DELAI_MS = 500
/** Voir la skill `pieges-du-projet` : deux boutons à la même place. */
const DELAI_ARMEMENT_MS = 700

/**
 * « Maître Renard ».
 *
 * On est le renard. Il y a un fromage à cinq mètres de haut, et on n'a que des
 * mots. Ce que la mécanique enseigne, et qu'un questionnaire sur la fable ne
 * peut pas — un questionnaire demande qui l'a écrite, ce qui est du trivia :
 * **l'ordre des compliments est la fable.** Le renard commence par une chose
 * vraie et vérifiable, il anoblit avant de flatter, il passe à l'invérifiable
 * sous une forme conditionnelle qui ne l'engage à rien — et il ne demande
 * jamais au corbeau de chanter. Il crée le manque et laisse l'autre le combler.
 *
 * D'où le coup gagnant, que personne ne trouve du premier coup : se taire.
 */
export function FlatterieGame({ content, onComplete }: FlatterieGameProps) {
  const [etat, setEtat] = useState<EtatFlatterie>({
    vanite: content.cible.vaniteDepart,
    mefiance: content.cible.mefianceDepart,
    dites: [],
  })
  const [reaction, setReaction] = useState<string | null>(null)
  const [phase, setPhase] = useState<Phase>('parole')
  const [gagne, setGagne] = useState(false)
  const [restant, setRestant] = useState(content.secondes)
  const [arme, setArme] = useState(false)
  const startedAtRef = useRef(0)
  const finishedRef = useRef(false)

  useEffect(() => {
    startedAtRef.current = Date.now()
  }, [])

  const etatIssue = issue(etat)
  const pret = etatIssue === 'pret'

  const conclure = useCallback((succes: boolean, mot: string) => {
    setGagne(succes)
    setReaction(mot)
    jouerSon(succes ? 'victoire' : 'defaite')
    setArme(false)
    setPhase('fin')
  }, [])

  // La branche ne se garde pas éternellement : le corbeau finit par s'en aller.
  useEffect(() => {
    if (phase !== 'parole') return
    const fin = window.setTimeout(
      () => conclure(false, 'Il s’ébroue, regarde ailleurs, et s’envole avec son fromage.'),
      content.secondes * 1000,
    )
    return () => window.clearTimeout(fin)
  }, [phase, content.secondes, conclure])

  useEffect(() => {
    if (phase !== 'parole') return
    const battement = window.setInterval(() => setRestant((r) => Math.max(0, r - 1)), 1000)
    return () => window.clearInterval(battement)
  }, [phase])

  useEffect(() => {
    if (phase !== 'fin') return
    const timer = window.setTimeout(() => setArme(true), DELAI_ARMEMENT_MS)
    return () => window.clearTimeout(timer)
  }, [phase])

  function parler(id: string) {
    if (phase !== 'parole' || etat.dites.includes(id)) return
    const replique = content.repliques.find((r) => r.id === id)
    if (!replique) return

    jouerSon('tap')
    const effet = effetDe(replique, etat.dites)
    const suivant = dire(etat, replique)
    setEtat(suivant)

    if (issue(suivant) === 'perdu') {
      conclure(false, effet.reaction)
      return
    }
    if (aCourtDeMots(content, suivant)) {
      conclure(false, `${effet.reaction} Et tu n’as plus rien à dire.`)
      return
    }
    setReaction(effet.reaction)
  }

  function declencher() {
    if (phase !== 'parole' || !pret) return
    conclure(true, content.declencheur.reaction)
  }

  function terminer() {
    if (!arme || finishedRef.current) return
    finishedRef.current = true
    setPhase('fini')
    window.setTimeout(() => {
      onComplete({
        correct: gagne,
        timeMs: elapsedSince(startedAtRef.current),
        mistakes: gagne ? 0 : 1,
      })
    }, FIN_DELAI_MS)
  }

  if (phase === 'fini') return null

  return (
    <div className={styles.game}>
      <p className={styles.fable}>
        {content.fable.auteur} · {content.fable.titre}, {content.fable.annee}
      </p>

      {/*
        Le décor : une branche et le fromage. Peint une fois, jamais animé sous
        filtre — les filtres SVG sont chers, et rien ne bouge pendant qu'on joue.
      */}
      <svg className={styles.scene} viewBox="0 0 300 130" role="presentation" aria-hidden="true">
        {/* Le feuillage : plusieurs masses qui se recouvrent, jamais un seul
            aplat — un aplat lit comme un nuage. Lointain, donc violet-brume :
            la perspective atmosphérique crée la profondeur à elle seule. */}
        <g style={{ mixBlendMode: 'multiply' }}>
          <ellipse cx="62" cy="20" rx="46" ry="20" fill="var(--violet-brume)" opacity="0.34" filter="url(#aq-bord-1)" />
          <ellipse cx="132" cy="14" rx="52" ry="22" fill="var(--violet-brume)" opacity="0.3" filter="url(#aq-bord-3)" />
          <ellipse cx="214" cy="18" rx="44" ry="19" fill="var(--violet-brume)" opacity="0.32" filter="url(#aq-bord-2)" />
          <ellipse cx="272" cy="26" rx="34" ry="16" fill="var(--violet-brume)" opacity="0.28" filter="url(#aq-bord-4)" />
          <ellipse cx="104" cy="30" rx="38" ry="14" fill="var(--violet)" opacity="0.18" filter="url(#aq-bord-2)" />
          <ellipse cx="196" cy="32" rx="34" ry="13" fill="var(--violet)" opacity="0.16" filter="url(#aq-bord-1)" />
        </g>

        {/* La branche : deux traits superposés, jamais une droite parfaite. */}
        <g style={{ mixBlendMode: 'multiply' }}>
          <path
            d="M2 96 C 62 88, 118 78, 174 70 C 224 63, 266 58, 298 54"
            fill="none"
            stroke="var(--violet-profond)"
            strokeWidth="7"
            strokeLinecap="round"
            opacity="0.44"
            filter="url(#aq-bord-2)"
          />
          <path
            d="M2 99 C 60 91, 120 81, 172 73 C 226 65, 264 61, 298 57"
            fill="none"
            stroke="var(--violet)"
            strokeWidth="4"
            strokeLinecap="round"
            opacity="0.32"
            filter="url(#aq-bord-4)"
          />
          <path
            d="M96 84 C 104 70, 112 60, 124 52"
            fill="none"
            stroke="var(--violet-profond)"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.34"
            filter="url(#aq-bord-3)"
          />
          <path
            d="M56 90 C 50 78, 46 70, 38 62"
            fill="none"
            stroke="var(--violet-profond)"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.28"
            filter="url(#aq-bord-1)"
          />
        </g>

        {/*
          Le fromage, posé SUR la branche. Le lavis de papier dessous est
          indispensable : sans lui le `multiply` laisse la branche traverser la
          meule, qui lit alors comme un autocollant transparent. Aucun filtre
          ici — il s'anime à la chute, et un feTurbulence recalculé à chaque
          image ruine le framerate sur téléphone.
        */}
        <g
          className={clsx(styles.fromage, { [styles.fromageTombe]: phase === 'fin' && gagne })}
        >
          <path d="M196 66 L244 58 L244 42 L196 50 Z" fill="var(--papier)" />
          <g style={{ mixBlendMode: 'multiply' }}>
            <path d="M196 66 L244 58 L244 42 L196 50 Z" fill="var(--color-domain-histoire)" opacity="0.5" />
            <path d="M199 64 L242 56 L242 45 L199 53 Z" fill="var(--color-domain-histoire)" opacity="0.34" />
            <path d="M196 50 L244 42 L244 47 L196 55 Z" fill="var(--color-domain-histoire)" opacity="0.22" />
            <circle cx="212" cy="57" r="3.2" fill="var(--violet-profond)" opacity="0.24" />
            <circle cx="230" cy="52" r="2.4" fill="var(--violet-profond)" opacity="0.2" />
          </g>
        </g>
      </svg>

      {phase === 'fin' ? (
        <div className={styles.epilogue}>
          <p className={clsx(styles.reaction, { [styles.reactionRatee]: !gagne })}>{reaction}</p>
          <p className={styles.morale}>{gagne ? content.moraleReussite : content.moraleEchec}</p>

          {/*
            Ce qui se découvre à la fin : lesquelles de ces phrases sont de La
            Fontaine. Deux ne le sont pas, et ce sont celles qui font tout rater.
          */}
          <ul className={styles.releve}>
            {content.repliques
              .filter((r) => etat.dites.includes(r.id))
              .map((r) => (
                <li key={r.id} className={styles.releveLigne}>
                  <span className={styles.releveTexte}>{r.texte}</span>
                  <span className={clsx(styles.sceau, { [styles.sceauFaux]: !r.authentique })}>
                    {r.authentique ? 'La Fontaine' : 'de ton cru'}
                  </span>
                </li>
              ))}
          </ul>

          <button type="button" className={styles.declencheur} disabled={!arme} onClick={terminer}>
            Ramasser le fromage
          </button>
        </div>
      ) : (
        <>
          <div className={styles.entete}>
            <span className={styles.cible}>
              {content.cible.nom}, et {content.cible.possede}
            </span>
            <span className={styles.horloge}>{restant} s</span>
          </div>

          {/* Deux jauges. Bords nets : c'est de l'interface, pas du décor. */}
          <div className={styles.jauges}>
            <div className={styles.jauge}>
              <span className={styles.jaugeNom}>Il se rengorge</span>
              <span
                className={styles.piste}
                role="meter"
                aria-label={`Vanité : ${etat.vanite} sur ${PLEIN}`}
                aria-valuenow={etat.vanite}
                aria-valuemin={0}
                aria-valuemax={PLEIN}
              >
                <span className={styles.remplissage} style={{ width: `${etat.vanite}%` }} />
              </span>
            </div>
            <div className={styles.jauge}>
              <span className={styles.jaugeNom}>Il se méfie</span>
              <span
                className={clsx(styles.piste, styles.pisteMefiance)}
                role="meter"
                aria-label={`Méfiance : ${etat.mefiance} sur ${PLEIN}`}
                aria-valuenow={etat.mefiance}
                aria-valuemin={0}
                aria-valuemax={PLEIN}
              >
                <span className={styles.remplissageMefiance} style={{ width: `${etat.mefiance}%` }} />
              </span>
            </div>
          </div>

          <p className={styles.reaction}>{reaction ?? 'Il te regarde. Il ne dit rien.'}</p>

          <div className={styles.repliques}>
            {content.repliques.map((r) => (
              <button
                key={r.id}
                type="button"
                className={styles.replique}
                disabled={etat.dites.includes(r.id)}
                onClick={() => parler(r.id)}
              >
                {r.texte}
              </button>
            ))}
          </div>

          {/*
            Le déclencheur ne s'allume qu'à vanité pleine — et c'est celui qui
            gagne : ne rien dire. Le renard de la fable ne demande jamais au
            corbeau de chanter.
          */}
          {pret ? (
            <button type="button" className={styles.declencheur} onClick={declencher}>
              {content.declencheur.texte}
            </button>
          ) : null}
        </>
      )}
    </div>
  )
}
