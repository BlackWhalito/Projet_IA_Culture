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

    // Cible 2 : mauvaise réponse délibérée. Elle doit porter sur une autre
    // CIBLE de la manche, pas sur une ville quelconque de la carte : seules
    // les cibles sont désormais tapables (les 19 zones l'étaient toutes
    // avant, ce qui laissait rater une ville en touchant un fleuve voisin).
    const deuxieme = villeDemandee()
    const autreCible = ['Paris', 'Lyon', 'Marseille', 'Lille', 'Nantes'].find((v) => v !== deuxieme)!
    fireEvent.click(screen.getByRole('button', { name: autreCible }))
    expect(screen.getByText(`Ça, c'est ${autreCible}. ${deuxieme} était ailleurs.`)).toBeInTheDocument()
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

  it('affiche la consigne personnalisée quand une clue est fournie pour la cible, au lieu du nom réel', () => {
    const onComplete = vi.fn()
    const contenuAvecClue: CapSurContent = {
      carteId: 'france',
      cibles: ['lille'],
      clues: { lille: 'La ville la plus au nord' },
      secondesParCible: 6,
    }
    render(<CapSurGame content={contenuAvecClue} onComplete={onComplete} />)

    expect(screen.getByText('La ville la plus au nord')).toBeInTheDocument()
    expect(screen.queryByText('Trouve : Lille')).not.toBeInTheDocument()

    // La réponse, elle, révèle bien le vrai nom.
    fireEvent.click(screen.getByRole('button', { name: 'Lille' }))
    expect(screen.getByText("Juste ! C'est bien Lille.")).toBeInTheDocument()
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
