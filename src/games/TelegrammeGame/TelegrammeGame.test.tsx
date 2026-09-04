import { describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { TelegrammeGame } from './TelegrammeGame'
import type { TelegrammeContent } from '../../types/game'

const CONTENU: TelegrammeContent = {
  consigne: 'Fais tenir le message dans le tarif.',
  bureau: { qui: 'Employé', lieu: 'Rouen', annee: '1891', tarif: 'Un STOP se paie comme un mot.' },
  messages: [
    {
      mots: ['GRACIER', 'IMPOSSIBLE', 'ENVOYER', 'AU', 'BAGNE'],
      budget: 6,
      intention: 'Le condamné doit être gracié.',
      porteurs: [{ index: 0, scene: 'Il ne reste qu’un ordre, et c’est le bagne.' }],
      stops: [{ apres: 0, sansLui: 'Le greffier met l’homme dans la charrette.' }],
      stopsFautifs: [{ apres: 1, scene: 'Un mot trop loin : l’homme part au bagne.' }],
      reception: 'Le greffier ouvre la cellule.',
      revelation: 'Cinq mots, deux ordres opposés, le même prix.',
      secondes: 50,
    },
    {
      mots: ['ARRIVE', 'DEMAIN', 'A', 'MIDI'],
      budget: 3,
      intention: 'Viens me chercher demain midi.',
      porteurs: [{ index: 0, scene: 'Il reste chez lui.' }],
      stops: [],
      reception: 'Il est sur le quai.',
      revelation: 'Un STOP se paie.',
      secondes: 45,
    },
  ],
}

const mot = (n: string) => screen.getByRole('button', { name: n })
const fente = (apres: string) => screen.getByLabelText(new RegExp(`STOP après « ${apres} »`))
const cout = () => screen.getByText(/mots facturés/).textContent

describe('TelegrammeGame', () => {
  it('barre un mot au tap et le rend au tap suivant, en refacturant', () => {
    render(<TelegrammeGame content={CONTENU} onComplete={vi.fn()} />)
    expect(cout()).toMatch(/^5 mots facturés/)
    fireEvent.click(mot('AU'))
    expect(cout()).toMatch(/^4 mots facturés/)
    fireEvent.click(mot('AU'))
    expect(cout()).toMatch(/^5 mots facturés/)
  })

  /** Le cœur du sujet : la ponctuation a un prix affiché. */
  it('facture le STOP comme un mot plein', () => {
    render(<TelegrammeGame content={CONTENU} onComplete={vi.fn()} />)
    fireEvent.click(fente('GRACIER'))
    expect(cout()).toMatch(/^6 mots facturés/)
    expect(screen.getByRole('button', { name: /Retirer le STOP/ })).toBeInTheDocument()
  })

  it('éteint « Expédier » tant que le message dépasse le tarif', () => {
    render(<TelegrammeGame content={CONTENU} onComplete={vi.fn()} />)
    fireEvent.click(fente('GRACIER'))
    fireEvent.click(fente('IMPOSSIBLE'))
    expect(cout()).toMatch(/^7 mots facturés/)
    expect(screen.getByRole('button', { name: 'Expédier' })).toBeDisabled()

    fireEvent.click(fente('IMPOSSIBLE'))
    expect(screen.getByRole('button', { name: 'Expédier' })).toBeEnabled()
  })

  it('montre le ruban tel qu’il part, STOP compris', () => {
    render(<TelegrammeGame content={CONTENU} onComplete={vi.fn()} />)
    fireEvent.click(fente('GRACIER'))
    fireEvent.click(screen.getByRole('button', { name: 'Expédier' }))
    expect(screen.getByText('GRACIER STOP IMPOSSIBLE ENVOYER AU BAGNE')).toBeInTheDocument()
    expect(screen.getByText(CONTENU.messages[0].reception)).toBeInTheDocument()
  })

  /**
   * Le STOP posé un cran trop loin donne l'ordre inverse — et le jeu doit le
   * dire ainsi, pas « il manquait un STOP » : le joueur en a bien posé un.
   */
  it('explique un STOP mal placé sans prétendre qu’il manquait', () => {
    render(<TelegrammeGame content={CONTENU} onComplete={vi.fn()} />)
    fireEvent.click(fente('IMPOSSIBLE'))
    fireEvent.click(screen.getByRole('button', { name: 'Expédier' }))
    expect(screen.getByText(/Un mot trop loin/)).toBeInTheDocument()
    expect(screen.queryByText(/charrette/)).not.toBeInTheDocument()
  })

  it('joue la scène du destinataire quand un mot porteur a été sacrifié', () => {
    render(<TelegrammeGame content={CONTENU} onComplete={vi.fn()} />)
    fireEvent.click(mot('GRACIER'))
    fireEvent.click(fente('IMPOSSIBLE'))
    fireEvent.click(screen.getByRole('button', { name: 'Expédier' }))
    expect(screen.getByText(/c’est le bagne/)).toBeInTheDocument()
  })

  it('sert la leçon dans tous les cas, reçu ou non', () => {
    render(<TelegrammeGame content={CONTENU} onComplete={vi.fn()} />)
    fireEvent.click(mot('GRACIER'))
    fireEvent.click(fente('GRACIER'))
    fireEvent.click(screen.getByRole('button', { name: 'Expédier' }))
    expect(screen.getByText(CONTENU.messages[0].revelation)).toBeInTheDocument()
  })

  it('ne laisse pas un double tap sur « Expédier » sauter la réception', () => {
    vi.useFakeTimers()
    try {
      render(<TelegrammeGame content={CONTENU} onComplete={vi.fn()} />)
      fireEvent.click(fente('GRACIER'))
      fireEvent.click(screen.getByRole('button', { name: 'Expédier' }))
      fireEvent.click(screen.getByRole('button', { name: 'Client suivant' }))
      expect(screen.getByText('Message 1 / 2')).toBeInTheDocument()

      act(() => void vi.advanceTimersByTime(800))
      fireEvent.click(screen.getByRole('button', { name: 'Client suivant' }))
      expect(screen.getByText('Message 2 / 2')).toBeInTheDocument()
      // Le formulaire repart à neuf.
      expect(cout()).toMatch(/^4 mots facturés/)
      expect(screen.getByText('45 s')).toBeInTheDocument()
    } finally {
      vi.useRealTimers()
    }
  })

  it('expédie tel quel quand l’horloge s’épuise, et compte la défaite', () => {
    vi.useFakeTimers()
    try {
      const onComplete = vi.fn()
      render(<TelegrammeGame content={CONTENU} onComplete={onComplete} />)
      expect(screen.getByText('50 s')).toBeInTheDocument()

      // Message 1 : le client attend, rien n'est posé, le télégramme part nu.
      act(() => void vi.advanceTimersByTime(50_000))
      expect(screen.getByText(/charrette/)).toBeInTheDocument()
      act(() => void vi.advanceTimersByTime(800))
      fireEvent.click(screen.getByRole('button', { name: 'Client suivant' }))

      // Message 2 : perdu aussi, donc la manche est perdue.
      act(() => void vi.advanceTimersByTime(45_000))
      act(() => void vi.advanceTimersByTime(800))
      fireEvent.click(screen.getByRole('button', { name: 'Fermer le guichet' }))
      act(() => void vi.advanceTimersByTime(1000))
      expect(onComplete).toHaveBeenCalledWith(
        expect.objectContaining({ correct: false, mistakes: 2 }),
      )
    } finally {
      vi.useRealTimers()
    }
  })
})
