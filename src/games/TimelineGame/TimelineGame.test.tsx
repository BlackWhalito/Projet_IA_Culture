import { describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { TimelineGame } from './TimelineGame'
import type { TimelineContent } from '../../types/game'

const CONTENU: TimelineContent = {
  events: [
    { label: "L'œuf", sortValue: 1 },
    { label: 'La chenille', sortValue: 2 },
    { label: 'La chrysalide', sortValue: 3 },
    { label: 'Le papillon', sortValue: 4 },
  ],
}

function carte(label: string) {
  return screen.getByRole('button', { name: label })
}

describe('TimelineGame', () => {
  it('conclut juste et sans erreur quand on place tout dans l\'ordre', () => {
    vi.useFakeTimers()
    const onComplete = vi.fn()
    render(<TimelineGame content={CONTENU} onComplete={onComplete} />)

    for (const e of CONTENU.events) fireEvent.click(carte(e.label))
    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(onComplete).toHaveBeenCalledWith({ correct: true, timeMs: expect.any(Number), mistakes: 0 })
    vi.useRealTimers()
  })

  /**
   * Le test qui justifie le refus immédiat.
   *
   * Avant, on posait les quatre cartes dans n'importe quel ordre et l'échec
   * n'était annoncé qu'à l'écran suivant, sans dire laquelle était mal placée :
   * ni le joueur ni le score n'apprenaient rien. Une carte hors tour doit
   * rester dans le plateau, et coûter une erreur.
   */
  it('refuse une carte hors tour, la laisse dans le plateau, et compte l\'erreur', () => {
    vi.useFakeTimers()
    const onComplete = vi.fn()
    render(<TimelineGame content={CONTENU} onComplete={onComplete} />)

    fireEvent.click(carte('Le papillon'))
    act(() => {
      vi.advanceTimersByTime(500)
    })
    // Toujours cliquable : elle n'a pas été placée.
    expect(carte('Le papillon')).toBeInTheDocument()

    for (const e of CONTENU.events) fireEvent.click(carte(e.label))
    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(onComplete).toHaveBeenCalledWith({ correct: true, timeMs: expect.any(Number), mistakes: 1 })
    vi.useRealTimers()
  })

  it('déclare la manche perdue au-delà de la tolérance', () => {
    vi.useFakeTimers()
    const onComplete = vi.fn()
    render(<TimelineGame content={CONTENU} onComplete={onComplete} />)

    // Trois refus sur quatre événements : au-dessus de la tolérance de 50 %.
    for (const label of ['Le papillon', 'La chrysalide', 'La chenille']) {
      fireEvent.click(carte(label))
      act(() => {
        vi.advanceTimersByTime(500)
      })
    }

    for (const e of CONTENU.events) fireEvent.click(carte(e.label))
    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(onComplete).toHaveBeenCalledWith({ correct: false, timeMs: expect.any(Number), mistakes: 3 })
    vi.useRealTimers()
  })
})
