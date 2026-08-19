import { describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { CapSurGame } from './CapSurGame'
import type { MapClickContent } from '../../types/game'

const CONTENU: MapClickContent = {
  carteId: 'france',
  cibles: ['paris', 'lyon', 'marseille', 'lille', 'nantes'],
  secondesParCible: 6,
}

describe('CapSurGame', () => {
  it('joue une manche de 5 cibles avec une bonne et une mauvaise réponse, puis conclut', () => {
    const onComplete = vi.fn()
    render(<CapSurGame content={CONTENU} onComplete={onComplete} />)

    expect(screen.getByText('Trouve : Paris')).toBeInTheDocument()

    // Bonne réponse sur la première cible.
    fireEvent.click(screen.getByRole('button', { name: 'Paris' }))
    expect(screen.getByText("Juste ! C'est bien Paris.")).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Continuer' }))

    // Mauvaise réponse sur la deuxième cible (Lyon demandé, Marseille touché).
    expect(screen.getByText('Trouve : Lyon')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Marseille' }))
    expect(screen.getByText('Ça, c\'est Marseille. Lyon était ailleurs.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Continuer' }))

    // Les trois cibles restantes, toutes justes.
    for (const [consigne, ville] of [
      ['Marseille', 'Marseille'],
      ['Lille', 'Lille'],
      ['Nantes', 'Nantes'],
    ]) {
      expect(screen.getByText(`Trouve : ${consigne}`)).toBeInTheDocument()
      fireEvent.click(screen.getByRole('button', { name: ville }))
      fireEvent.click(screen.getByRole('button', { name: 'Continuer' }))
    }

    expect(onComplete).toHaveBeenCalledWith({ correct: true, timeMs: expect.any(Number), mistakes: 1 })
  })

  it('révèle la cible manquée quand le temps expire', () => {
    vi.useFakeTimers()
    const onComplete = vi.fn()
    render(<CapSurGame content={CONTENU} onComplete={onComplete} />)

    act(() => {
      vi.advanceTimersByTime(6000)
    })
    expect(screen.getByText("Trop tard ! C'était Paris.")).toBeInTheDocument()
    vi.useRealTimers()
  })
})
