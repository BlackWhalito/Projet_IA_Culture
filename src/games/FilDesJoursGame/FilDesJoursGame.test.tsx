import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { FilDesJoursGame } from './FilDesJoursGame'
import type { FilDesJoursContent } from '../../types/game'

const SCENARIO_BIDON: FilDesJoursContent = {
  personnage: { nom: 'Test', annee: '1000', role: 'Cobaye' },
  regle: 'Une jauge, le moral, monte ou descend selon tes choix.',
  echec: 'Le moral est tombé à zéro : la partie est terminée.',
  jauges: [{ id: 'moral', label: 'Moral', depart: 50, critique: true }],
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

/** Un moral déjà bas : une seule mauvaise option suffit à le faire tomber à 0. */
const SCENARIO_ECHEC: FilDesJoursContent = {
  personnage: { nom: 'Test', annee: '1000', role: 'Cobaye' },
  regle: 'Une jauge critique : si elle tombe à zéro, la partie s\'arrête.',
  echec: "Le moral s'est effondré.",
  jauges: [{ id: 'moral', label: 'Moral', depart: 15, critique: true }],
  etapes: [
    {
      titre: 'Étape 1',
      scene: 'Une scène tendue.',
      options: [{ texte: 'Insister', effets: { moral: -20 }, consequence: "L'équipage se détourne." }],
    },
    {
      titre: 'Étape 2',
      scene: 'Ne devrait jamais être atteinte.',
      options: [{ texte: 'Continuer', effets: {}, consequence: '...' }],
    },
  ],
  epilogues: [{ condition: {}, texte: 'Fin ordinaire.' }],
}

function commencer() {
  fireEvent.click(screen.getByRole('button', { name: 'Commencer' }))
}

describe('FilDesJoursGame', () => {
  it("affiche la règle avant de commencer, et n'affiche pas encore les jauges", () => {
    render(<FilDesJoursGame content={SCENARIO_BIDON} onComplete={vi.fn()} />)
    expect(screen.getByText(SCENARIO_BIDON.regle)).toBeInTheDocument()
    expect(screen.queryByText('Moral')).not.toBeInTheDocument()
    expect(screen.queryByText('Étape 1')).not.toBeInTheDocument()
  })

  it('joue un scénario de 3 étapes de bout en bout et arrive à un épilogue', () => {
    const onComplete = vi.fn()
    render(<FilDesJoursGame content={SCENARIO_BIDON} onComplete={onComplete} />)
    commencer()

    expect(screen.getByText('Étape 1')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Option A' }))
    expect(screen.getByText('Ça monte.')).toBeInTheDocument()
    // Le delta du choix s'affiche pendant l'écran de conséquence.
    expect(screen.getByText('+20')).toBeInTheDocument()
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
    commencer()

    fireEvent.click(screen.getByRole('button', { name: 'Option B' }))
    fireEvent.click(screen.getByRole('button', { name: 'Continuer' }))
    fireEvent.click(screen.getByRole('button', { name: 'Continuer' }))
    fireEvent.click(screen.getByRole('button', { name: 'Continuer' }))
    fireEvent.click(screen.getByRole('button', { name: 'Finir' }))
    fireEvent.click(screen.getByRole('button', { name: 'Continuer' }))

    // moral parti à 50, effets -20+10+10 = 50 : hors tranche du triomphe (80-100).
    expect(screen.getByText('Fin ordinaire.')).toBeInTheDocument()
  })

  it('termine la partie en échec dès qu\'une jauge critique tombe à 0, sans attendre la fin du scénario', () => {
    const onComplete = vi.fn()
    render(<FilDesJoursGame content={SCENARIO_ECHEC} onComplete={onComplete} />)
    commencer()

    fireEvent.click(screen.getByRole('button', { name: 'Insister' }))
    expect(screen.getByText("L'équipage se détourne.")).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Continuer' }))

    // La deuxième étape ne doit jamais s'afficher : l'échec l'a court-circuitée.
    expect(screen.queryByText('Ne devrait jamais être atteinte.')).not.toBeInTheDocument()
    expect(screen.getByText(SCENARIO_ECHEC.echec)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Terminer' }))
    expect(onComplete).toHaveBeenCalledWith({ correct: false, timeMs: expect.any(Number) })
  })
})
