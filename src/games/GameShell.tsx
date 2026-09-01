import { useState, type CSSProperties } from 'react'
import type { GameTypeId, Notion } from '../types/content'
import { selectGameForNotion } from '../engine/selectGameForNotion'
import { DOMAINS } from '../content/domains'
import { GameRouter } from './GameRouter'
import { definirActif, estActif, jouerSon } from '../engine/sound'
import type { GameCompleteResult, NotionResult } from '../types/game'
import styles from './GameShell.module.css'

interface GameShellProps {
  notion: Notion
  pinnedGameType?: GameTypeId
  onContinue: (result: NotionResult) => void
}

type Phase = 'playing' | 'feedback'

/**
 * Le jeu commence à froid : ni titre ni résumé avant de jouer.
 * L'ancien écran d'intro annonçait la réponse quelques secondes avant de la
 * demander (le résumé et la phrase à trous étaient parfois identiques).
 * Le savoir est désormais la récompense, pas la consigne.
 */
export function GameShell({ notion, pinnedGameType, onContinue }: GameShellProps) {
  const [phase, setPhase] = useState<Phase>('playing')
  const [result, setResult] = useState<GameCompleteResult | null>(null)
  const [sonActif, setSonActif] = useState(() => estActif())
  const selected = selectGameForNotion(notion, pinnedGameType)
  const domain = DOMAINS[notion.domainId]

  function basculerSon() {
    const suivant = !sonActif
    definirActif(suivant)
    setSonActif(suivant)
    // Le retour sonore du rallumage vaut mieux qu'une étiquette : on entend
    // immédiatement ce qu'on vient de récupérer.
    if (suivant) jouerSon('juste')
  }

  return (
    <div className={styles.shell}>
      <div className={styles.entete}>
        <div className={styles.domainBadge} style={{ '--_domain-color': domain.color } as CSSProperties}>
          <span aria-hidden="true">{domain.icon}</span> {domain.label}
        </div>
        <button
          type="button"
          className={styles.sonBouton}
          onClick={basculerSon}
          aria-pressed={sonActif}
          aria-label={sonActif ? 'Couper le son' : 'Activer le son'}
          title={sonActif ? 'Couper le son' : 'Activer le son'}
        >
          <span aria-hidden="true">{sonActif ? '🔊' : '🔇'}</span>
        </button>
      </div>

      {phase === 'playing' && (
        <GameRouter
          selected={selected}
          onComplete={(r) => {
            // Le verdict de la manche sonne ici, une seule fois, plutôt que dans
            // chacune des six mécaniques : elles n'ont à jouer que leurs propres
            // gestes (le dépôt, le rejet, le mot qui file).
            jouerSon(r.correct ? 'victoire' : 'defaite')
            setResult(r)
            setPhase('feedback')
          }}
        />
      )}

      {phase === 'feedback' && result && (
        <div className={styles.feedback}>
          <p className={result.correct ? styles.correctText : styles.incorrectText}>
            {result.correct ? 'Bonne réponse !' : 'Pas tout à fait...'}
          </p>
          <h2 className={styles.notionTitle}>{notion.title}</h2>
          <p className={styles.summary}>{notion.summary}</p>
          {notion.funFact && <p className={styles.funFact}>💡 {notion.funFact}</p>}
          <button
            type="button"
            className={styles.primaryButton}
            onClick={() => onContinue({ ...result, notionId: notion.id })}
          >
            Continuer
          </button>
        </div>
      )}
    </div>
  )
}
