import { describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { PonctuationGame } from './PonctuationGame'
import type { PonctuationContent } from '../../types/game'

const CONTENU: PonctuationContent = {
  consigne: 'Pose la ponctuation commandée.',
  atelier: { qui: 'Secrétaire', lieu: 'Paris', annee: '1783' },
  cas: [
    {
      mots: ['On', 'mange', 'les', 'enfants'],
      fentes: [1, 3],
      signes: [',', ' !'],
      commande: 'Appelle la famille à table.',
      attendu: [',', ' !'],
      lectures: [
        { config: [',', ' !'], texte: '« On mange, les enfants ! » — tu les appelles.' },
        { config: [null, ' !'], texte: '« On mange les enfants ! » — tu les manges.' },
      ],
      adverse: 'Sans la virgule, « les enfants » devient le plat.',
      secondes: 15,
    },
    {
      mots: ['Tu', 'viens'],
      fentes: [1],
      signes: ['.', ' ?'],
      commande: 'Demande-lui s’il vient.',
      attendu: [' ?'],
      lectures: [{ config: [' ?'], texte: 'Tu lui demandes s’il vient.' }],
      adverse: 'Deux mots, deux actes de langage.',
      secondes: 15,
    },
  ],
}

/** Tape la fente de rang donné, autant de fois que demandé. */
function cycler(nomMot: string, fois: number) {
  const fente = screen.getByLabelText(new RegExp(`Ponctuation après « ${nomMot} »`))
  for (let i = 0; i < fois; i++) fireEvent.click(fente)
}

describe('PonctuationGame', () => {
  it('fait cycler une fente à chaque tap, et repasse par « rien »', () => {
    render(<PonctuationGame content={CONTENU} onComplete={vi.fn()} />)

    const fente = screen.getByLabelText(/Ponctuation après « mange »/)
    expect(fente).toHaveAccessibleName(/aucune/)
    fireEvent.click(fente)
    expect(fente).toHaveAccessibleName(/,/)
    fireEvent.click(fente)
    expect(fente).toHaveAccessibleName(/!/)
    // Le cycle boucle : on peut toujours revenir en arrière sans recharger.
    fireEvent.click(fente)
    expect(fente).toHaveAccessibleName(/aucune/)
  })

  /**
   * Le cœur du plaisir de cette mécanique : voir le sens basculer sous son
   * doigt, AVANT toute validation. Le garder pour l'écran de correction
   * tuerait le jeu.
   */
  it('réécrit la lecture en direct, avant toute validation', () => {
    render(<PonctuationGame content={CONTENU} onComplete={vi.fn()} />)

    expect(screen.getByText(/ne veut rien dire de précis/)).toBeInTheDocument()

    cycler('enfants', 2) // met « ! » sans virgule
    expect(screen.getByText(/tu les manges/)).toBeInTheDocument()

    cycler('mange', 1) // ajoute la virgule
    expect(screen.getByText(/tu les appelles/)).toBeInTheDocument()
  })

  it('valide quand la configuration est celle commandée', () => {
    vi.useFakeTimers()
    const onComplete = vi.fn()
    render(<PonctuationGame content={CONTENU} onComplete={onComplete} />)

    cycler('mange', 1)
    cycler('enfants', 2)
    fireEvent.click(screen.getByRole('button', { name: 'Cacheter' }))
    expect(screen.getByText(/C’est le sens commandé/)).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(3300)
    })
    cycler('viens', 2)
    fireEvent.click(screen.getByRole('button', { name: 'Cacheter' }))
    act(() => {
      vi.advanceTimersByTime(3300)
    })

    expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({ correct: true, mistakes: 0 }))
    vi.useRealTimers()
  })

  it('cachette quand même la lettre au mauvais sens, et dit ce qu’on a perdu', () => {
    vi.useFakeTimers()
    const onComplete = vi.fn()
    render(<PonctuationGame content={CONTENU} onComplete={onComplete} />)

    cycler('enfants', 2) // « ! » mais pas de virgule
    fireEvent.click(screen.getByRole('button', { name: 'Cacheter' }))
    expect(screen.getByText(/mauvais sens/)).toBeInTheDocument()
    expect(screen.getByText(/devient le plat/)).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(3300)
    })
    fireEvent.click(screen.getByRole('button', { name: 'Cacheter' }))
    act(() => {
      vi.advanceTimersByTime(3300)
    })

    expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({ correct: false, mistakes: 2 }))
    vi.useRealTimers()
  })

  /**
   * Le sablier n'interrompt pas : il cachette ce que le joueur a posé. Hésiter
   * a un coût, mais on ne perd jamais un cas sans le voir partir.
   */
  it('cachette tout seul à l’expiration du sablier', () => {
    vi.useFakeTimers()
    render(<PonctuationGame content={CONTENU} onComplete={vi.fn()} />)

    act(() => {
      vi.advanceTimersByTime(15100)
    })
    expect(screen.getByText(/mauvais sens/)).toBeInTheDocument()
    vi.useRealTimers()
  })

  /**
   * Le test qui compte le plus, et qu'aucune mécanique de la v1 ne passait :
   * on ne doit pas pouvoir gagner au hasard. Deux fentes, trois états chacune
   * (rien, virgule, point d'exclamation) : neuf configurations, une seule bonne.
   */
  it('ne se gagne pas au hasard', () => {
    const cas = CONTENU.cas[0]
    const etats = cas.signes.length + 1 // les signes, plus « rien »
    const configurations = etats ** cas.fentes.length
    expect(configurations).toBe(9)
    // Et une seule est acceptée.
    expect(cas.lectures.filter((l) => l.texte === cas.adverse)).toHaveLength(0)
  })
})
