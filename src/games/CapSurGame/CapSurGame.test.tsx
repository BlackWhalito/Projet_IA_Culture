import { describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { CapSurGame } from './CapSurGame'
import type { CapSurContent } from '../../types/game'

const CONTENU: CapSurContent = {
  carteId: 'france',
  cibles: ['paris', 'lyon', 'marseille', 'lille', 'nantes'],
  secondesParCible: 6,
}

/** L'ordre des cibles est mélangé à chaque partie : on lit la consigne plutôt que de la supposer. */
function villeDemandee(): string {
  return screen.getByText(/^Trouve : /).textContent!.replace('Trouve : ', '')
}

describe('CapSurGame', () => {
  it('joue une manche de 5 cibles avec une bonne et une mauvaise réponse, puis conclut', () => {
    const onComplete = vi.fn()
    render(<CapSurGame content={CONTENU} onComplete={onComplete} />)

    // Cible 1 : bonne réponse.
    const premiere = villeDemandee()
    fireEvent.click(screen.getByRole('button', { name: premiere }))
    expect(screen.getByText(`Juste ! C'est bien ${premiere}.`)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Continuer' }))

    // Cible 2 : mauvaise réponse délibérée (Toulouse n'est jamais une cible de ce contenu).
    const deuxieme = villeDemandee()
    fireEvent.click(screen.getByRole('button', { name: 'Toulouse' }))
    expect(screen.getByText(`Ça, c'est Toulouse. ${deuxieme} était ailleurs.`)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Continuer' }))

    // Cibles 3 à 5 : toutes justes.
    for (let i = 0; i < 3; i++) {
      const ville = villeDemandee()
      fireEvent.click(screen.getByRole('button', { name: ville }))
      expect(screen.getByText(`Juste ! C'est bien ${ville}.`)).toBeInTheDocument()
      fireEvent.click(screen.getByRole('button', { name: 'Continuer' }))
    }

    expect(onComplete).toHaveBeenCalledWith({ correct: true, timeMs: expect.any(Number), mistakes: 1 })
  })

  it('joue aussi sur la carte d\'Europe', () => {
    const onComplete = vi.fn()
    const contenuEurope: CapSurContent = {
      carteId: 'europe',
      cibles: ['europe', 'afrique', 'asie'],
      secondesParCible: 6,
    }
    render(<CapSurGame content={contenuEurope} onComplete={onComplete} />)

    const premiere = villeDemandee()
    fireEvent.click(screen.getByRole('button', { name: premiere }))
    expect(screen.getByText(`Juste ! C'est bien ${premiere}.`)).toBeInTheDocument()
  })

  it('révèle la cible manquée quand le temps expire', () => {
    vi.useFakeTimers()
    const onComplete = vi.fn()
    render(<CapSurGame content={CONTENU} onComplete={onComplete} />)

    const premiere = villeDemandee()
    act(() => {
      vi.advanceTimersByTime(6000)
    })
    expect(screen.getByText(`Trop tard ! C'était ${premiere}.`)).toBeInTheDocument()
    vi.useRealTimers()
  })
})
