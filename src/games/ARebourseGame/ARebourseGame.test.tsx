import { describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { ARebourseGame } from './ARebourseGame'
import type { ARebourseContent } from '../../types/game'

const CONTENU: ARebourseContent = {
  consigne: 'Compose ce qu’on te demande.',
  atelier: { qui: 'Compositeur', lieu: 'Paris', annee: '1794' },
  suite: [
    { id: 'bleu', label: 'Bleu', couleur: '#2b4a8b' },
    { id: 'blanc', label: 'Blanc', couleur: '#f4f1e8' },
    { id: 'rouge', label: 'Rouge', couleur: '#b8332f' },
  ],
  demandes: [
    {
      consigne: 'Le même drapeau, mais nomme les couleurs de droite à gauche.',
      accent: 'de droite à gauche',
      attendu: ['rouge', 'blanc', 'bleu'],
      secondes: 6,
      rendu: 'bandes',
      meprises: [{ ordre: ['bleu', 'blanc', 'rouge'], texte: 'Tu as récité.' }],
      verdict: 'Rouge, blanc, bleu.',
    },
    {
      consigne: 'Le drapeau français, de la hampe au vent.',
      accent: 'de la hampe au vent',
      attendu: ['bleu', 'blanc', 'rouge'],
      secondes: 8,
      rendu: 'bandes',
      verdict: 'Décret du 15 février 1794.',
    },
  ],
}

const poser = (label: string) => fireEvent.click(screen.getByRole('button', { name: label }))
const chrono = () => screen.queryByText(/^\d+ s$/)

describe('ARebourseGame', () => {
  /**
   * La première des deux règles qui rendent le piège loyal : la consigne reste
   * affichée en entier pendant toute la demande, verdict compris. Sans elle,
   * le piège devient une devinette.
   */
  it('garde la consigne affichée, et souligne le fragment qui piège', () => {
    render(<ARebourseGame content={CONTENU} onComplete={vi.fn()} />)
    expect(screen.getByText(/Le même drapeau/)).toBeInTheDocument()
    expect(screen.getByText('de droite à gauche')).toBeInTheDocument()

    poser('Rouge')
    poser('Blanc')
    poser('Bleu')
    // Elle est toujours là après la validation.
    expect(screen.getByText('de droite à gauche')).toBeInTheDocument()
  })

  /**
   * La seconde règle : le chrono ne démarre qu'au premier tap. On ne peut pas
   * perdre pour n'avoir pas eu le temps de lire.
   */
  it('ne démarre le chrono qu’au premier tap', () => {
    vi.useFakeTimers()
    try {
      render(<ARebourseGame content={CONTENU} onComplete={vi.fn()} />)
      expect(chrono()).not.toBeInTheDocument()

      act(() => void vi.advanceTimersByTime(60_000))
      expect(chrono()).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Rouge' })).toBeInTheDocument()

      poser('Rouge')
      expect(screen.getByText('6 s')).toBeInTheDocument()
    } finally {
      vi.useRealTimers()
    }
  })

  it('valide dès le dernier emplacement rempli, sans bouton', () => {
    render(<ARebourseGame content={CONTENU} onComplete={vi.fn()} />)
    poser('Rouge')
    poser('Blanc')
    expect(screen.queryByText(CONTENU.demandes[0].verdict)).not.toBeInTheDocument()
    poser('Bleu')
    expect(screen.getByText(CONTENU.demandes[0].verdict)).toBeInTheDocument()
  })

  /**
   * Le cœur de la mécanique : réciter dans le sens appris n'est pas un
   * « raté », c'est une méprise nommée — on montre au joueur ce qu'il vient
   * de composer.
   */
  it('nomme la conséquence quand le joueur récite au lieu de lire', () => {
    render(<ARebourseGame content={CONTENU} onComplete={vi.fn()} />)
    poser('Bleu')
    poser('Blanc')
    poser('Rouge')
    expect(screen.getByText('Tu as récité.')).toBeInTheDocument()
  })

  it('donne l’ordre juste quand la méprise n’est pas prévue', () => {
    render(<ARebourseGame content={CONTENU} onComplete={vi.fn()} />)
    poser('Blanc')
    poser('Rouge')
    poser('Bleu')
    expect(screen.getByText(/L’ordre juste était : Rouge, Blanc, Bleu/)).toBeInTheDocument()
  })

  it('rend une tuile posée quand on tape dessus', () => {
    render(<ARebourseGame content={CONTENU} onComplete={vi.fn()} />)
    poser('Rouge')
    // Deux occurrences : celle du composteur, et celle du rack (éteinte).
    expect(screen.getAllByRole('button', { name: 'Rouge' })).toHaveLength(2)
    fireEvent.click(screen.getAllByRole('button', { name: 'Rouge' })[0])
    expect(screen.getByRole('button', { name: 'Rouge' })).toBeEnabled()
  })

  it('juge ce qui est posé quand le chrono expire, même incomplet', () => {
    vi.useFakeTimers()
    try {
      render(<ARebourseGame content={CONTENU} onComplete={vi.fn()} />)
      poser('Rouge')
      act(() => void vi.advanceTimersByTime(6000))
      expect(screen.getByText(CONTENU.demandes[0].verdict)).toBeInTheDocument()
      expect(screen.getByText(/L’ordre juste était/)).toBeInTheDocument()
    } finally {
      vi.useRealTimers()
    }
  })

  it('enchaîne les demandes en remettant le composteur à neuf', () => {
    vi.useFakeTimers()
    try {
      render(<ARebourseGame content={CONTENU} onComplete={vi.fn()} />)
      poser('Rouge')
      poser('Blanc')
      poser('Bleu')
      act(() => void vi.advanceTimersByTime(700))
      fireEvent.click(screen.getByRole('button', { name: 'Demande suivante' }))

      expect(screen.getByText('de la hampe au vent')).toBeInTheDocument()
      expect(chrono()).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Rouge' })).toBeEnabled()
    } finally {
      vi.useRealTimers()
    }
  })

  it('ne laisse pas un double tap sauter le verdict', () => {
    vi.useFakeTimers()
    try {
      render(<ARebourseGame content={CONTENU} onComplete={vi.fn()} />)
      poser('Rouge')
      poser('Blanc')
      poser('Bleu')
      fireEvent.click(screen.getByRole('button', { name: 'Demande suivante' }))
      expect(screen.getByText(CONTENU.demandes[0].verdict)).toBeInTheDocument()
    } finally {
      vi.useRealTimers()
    }
  })

  it('rend la manche gagnée quand on réussit plus qu’on ne gâche', () => {
    vi.useFakeTimers()
    try {
      const onComplete = vi.fn()
      render(<ARebourseGame content={CONTENU} onComplete={onComplete} />)
      poser('Rouge')
      poser('Blanc')
      poser('Bleu')
      act(() => void vi.advanceTimersByTime(700))
      fireEvent.click(screen.getByRole('button', { name: 'Demande suivante' }))
      poser('Bleu')
      poser('Blanc')
      poser('Rouge')
      act(() => void vi.advanceTimersByTime(700))
      fireEvent.click(screen.getByRole('button', { name: 'Rendre le composteur' }))
      act(() => void vi.advanceTimersByTime(600))
      expect(onComplete).toHaveBeenCalledWith(
        expect.objectContaining({ correct: true, mistakes: 0 }),
      )
    } finally {
      vi.useRealTimers()
    }
  })
})
