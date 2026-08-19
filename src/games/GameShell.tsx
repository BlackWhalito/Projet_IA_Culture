import { useState, type CSSProperties } from 'react'
import type { GameTypeId, Notion } from '../types/content'
import { selectGameForNotion } from '../engine/selectGameForNotion'
import { DOMAINS } from '../content/domains'
import { GameRouter } from './GameRouter'
import type { GameCompleteResult, NotionResult } from './gameTypes'
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
  const selected = selectGameForNotion(notion, pinnedGameType)
  const domain = DOMAINS[notion.domainId]

  return (
    <div className={styles.shell}>
      <div className={styles.domainBadge} style={{ '--_domain-color': domain.color } as CSSProperties}>
        <span aria-hidden="true">{domain.icon}</span> {domain.label}
      </div>

      {phase === 'playing' && (
        <GameRouter
          selected={selected}
          onComplete={(r) => {
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
