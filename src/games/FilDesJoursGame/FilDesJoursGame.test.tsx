import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { FilDesJoursGame } from './FilDesJoursGame'
import type { IncarnationContent } from '../../types/game'

const SCENARIO_BIDON: IncarnationContent = {
  personnage: { nom: 'Test', annee: '1000', role: 'Cobaye' },
  jauges: [{ id: 'moral', label: 'Moral', depart: 50 }],
  etapes: [
    {
      titre: 'Étape 1',
      scene: 'Une première scène.',
      options: [
        { texte: 'Option A', effets: { moral: 20 }, consequence: 'Ça monte.' },
        { texte: 'Option B', effets: { moral: -20 }, consequence: 'Ça descend.' },
      ],
    },
    {
      titre: 'Étape 2',
      scene: 'Une deuxième scène.',
      options: [{ texte: 'Continuer', effets: { moral: 10 }, consequence: 'Encore un peu.' }],
    },
    {
      titre: 'Étape 3',
      scene: 'Une troisième scène.',
      options: [{ texte: 'Finir', effets: { moral: 10 }, consequence: 'Presque fini.' }],
    },
  ],
  epilogues: [
    { condition: { moral: [80, 100] }, texte: 'Grand triomphe.' },
    { condition: {}, texte: 'Fin ordinaire.' },
  ],
}

describe('FilDesJoursGame', () => {
  it('joue un scénario de 3 étapes de bout en bout et arrive à un épilogue', () => {
    const onComplete = vi.fn()
    render(<FilDesJoursGame content={SCENARIO_BIDON} onComplete={onComplete} />)

    expect(screen.getByText('Étape 1')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Option A' }))
    expect(screen.getByText('Ça monte.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Continuer' }))

    expect(screen.getByText('Étape 2')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Continuer' }))
    expect(screen.getByText('Encore un peu.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Continuer' }))

    expect(screen.getByText('Étape 3')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Finir' }))
    expect(screen.getByText('Presque fini.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Continuer' }))

    // moral parti à 50, effets +20+10+10 = 90 : entre dans la tranche du triomphe.
    expect(screen.getByText('Épilogue')).toBeInTheDocument()
    expect(screen.getByText('Grand triomphe.')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Terminer' }))
    expect(onComplete).toHaveBeenCalledWith({ correct: true, timeMs: expect.any(Number) })
  })

  it('replie sur un épilogue par défaut quand aucune condition ne correspond', () => {
    const onComplete = vi.fn()
    render(<FilDesJoursGame content={SCENARIO_BIDON} onComplete={onComplete} />)

    fireEvent.click(screen.getByRole('button', { name: 'Option B' }))
    fireEvent.click(screen.getByRole('button', { name: 'Continuer' }))
    fireEvent.click(screen.getByRole('button', { name: 'Continuer' }))
    fireEvent.click(screen.getByRole('button', { name: 'Continuer' }))
    fireEvent.click(screen.getByRole('button', { name: 'Finir' }))
    fireEvent.click(screen.getByRole('button', { name: 'Continuer' }))

    // moral parti à 50, effets -20+10+10 = 50 : hors tranche du triomphe (80-100).
    expect(screen.getByText('Fin ordinaire.')).toBeInTheDocument()
  })
})
