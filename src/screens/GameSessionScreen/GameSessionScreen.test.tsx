import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { GameSessionScreen } from './GameSessionScreen'
import { getNotionById } from '../../content/notions'
import { useProgressStore } from '../../state/progressStore'

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
