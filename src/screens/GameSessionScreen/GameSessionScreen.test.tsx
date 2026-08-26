import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { GameSessionScreen } from './GameSessionScreen'
import { getNotionById } from '../../content/notions'
import { useProgressStore } from '../../state/progressStore'
import { LEVEL_BACKDROP } from './backdrops'

const NOTION_ID = 'cp-histoire-prehistoire'

/** Fait avancer le délai interne de QcmGame avant qu'il n'appelle `onComplete`. */
function laisserLeJeuConclure() {
  act(() => {
    vi.advanceTimersByTime(600)
  })
}

function jouerLaBonneReponse() {
  const qcm = getNotionById(NOTION_ID)!.games.qcm!
  fireEvent.click(screen.getByRole('button', { name: qcm.choices[qcm.correctIndex] }))
  laisserLeJeuConclure()
}

describe('GameSessionScreen', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    useProgressStore.getState().resetProgress()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  /**
   * L'œuvre de fond est décorative et le reste : elle ne doit jamais
   * arriver dans l'arbre d'accessibilité. Si elle s'y annonçait, un
   * lecteur d'écran lirait une description de paroi ornée avant chaque
   * question — une nuisance, pour une image qui n'apporte rien à qui ne la
   * voit pas.
   */
  it('pose le fond du niveau sans jamais l\'annoncer, et seulement là où il existe', () => {
    expect(LEVEL_BACKDROP['cp-level-1']).toBeDefined()
    expect(LEVEL_BACKDROP['cp-level-2']).toBeUndefined()

    const { container, unmount } = render(
      <MemoryRouter>
        <GameSessionScreen
          gradeId="cp"
          levelId="cp-level-1"
          title="Niveau 1"
          queue={[{ notionId: NOTION_ID }]}
        />
      </MemoryRouter>,
    )
    expect(container.querySelectorAll('canvas')).toHaveLength(1)
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    unmount()

    const sansFond = render(
      <MemoryRouter>
        <GameSessionScreen
          gradeId="cp"
          levelId="cp-level-2"
          title="Niveau 2"
          queue={[{ notionId: NOTION_ID }]}
        />
      </MemoryRouter>,
    )
    expect(sansFond.container.querySelectorAll('canvas')).toHaveLength(0)
  })

  /**
   * Régression : la coquille de jeu était identifiée par `key={notion.id}`.
   * Deux entrées de file pointant la même notion partageaient donc la même clé,
   * React ne remontait pas `GameShell`, et son état interne survivait — la
   * deuxième question n'était jamais posée, on tombait directement sur l'écran de
   * récompense de la première, score et maîtrise comptés deux fois.
   */
  it('repose réellement la question quand un niveau rejoue la même notion', () => {
    const question = getNotionById(NOTION_ID)!.games.qcm!.question
    render(
      <MemoryRouter>
        <GameSessionScreen
          gradeId="cp"
          levelId="cp-test-doublon"
          title="Test"
          queue={[
            { notionId: NOTION_ID, gameType: 'qcm' },
            { notionId: NOTION_ID, gameType: 'qcm' },
          ]}
        />
      </MemoryRouter>,
    )

    expect(screen.getByText('1 / 2')).toBeInTheDocument()
    jouerLaBonneReponse()

    // Première récompense : le savoir arrive après le jeu.
    const continuer = screen.getByRole('button', { name: 'Continuer' })
    fireEvent.click(continuer)

    // La deuxième entrée doit rejouer, pas afficher la récompense de la première.
    expect(screen.getByText('2 / 2')).toBeInTheDocument()
    expect(screen.getByText(question)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Continuer' })).not.toBeInTheDocument()
  })

  it('enregistre la progression une fois la file épuisée', () => {
    render(
      <MemoryRouter>
        <GameSessionScreen
          gradeId="cp"
          levelId="cp-test-simple"
          title="Test"
          queue={[{ notionId: NOTION_ID, gameType: 'qcm' }]}
        />
      </MemoryRouter>,
    )

    jouerLaBonneReponse()
    fireEvent.click(screen.getByRole('button', { name: 'Continuer' }))

    expect(screen.getByText('1 / 1 bonnes réponses')).toBeInTheDocument()
    const progression = useProgressStore.getState()
    expect(progression.levels['cp-test-simple'].completed).toBe(true)
    expect(progression.notions[NOTION_ID].timesPlayed).toBe(1)
  })
})
