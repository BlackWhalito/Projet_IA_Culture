import { describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { FlatterieGame } from './FlatterieGame'
import type { FlatterieContent } from '../../types/game'

const CONTENU: FlatterieContent = {
  consigne: 'Fais-lui ouvrir le bec.',
  fable: { auteur: 'Jean de La Fontaine', titre: 'Le Corbeau et le Renard', annee: '1668' },
  cible: { nom: 'Maître Corbeau', possede: 'un fromage', vaniteDepart: 0, mefianceDepart: 20 },
  repliques: [
    { id: 'monsieur', texte: 'Monsieur du Corbeau.', authentique: true, vanite: 20, mefiance: 0, reaction: 'Il ne s’est pas envolé.' },
    { id: 'plumage', texte: 'Que vous êtes joli !', authentique: true, vanite: 25, mefiance: 5, reaction: 'Il gonfle son plumage.' },
    {
      id: 'ramage', texte: 'Si votre ramage…', authentique: true, vanite: 35, mefiance: 10,
      exige: ['plumage'],
      siPrecoce: { vanite: 5, mefiance: 30, reaction: 'Il n’a rien dit de mes plumes.' },
      reaction: 'Il penche la tête.',
    },
    {
      id: 'phenix', texte: 'Le Phénix de ces bois.', authentique: true, vanite: 20, mefiance: 15,
      exige: ['ramage'],
      siPrecoce: { vanite: 0, mefiance: 35, reaction: 'Le Phénix ? D’un coup ?' },
      reaction: 'Il ne se sent plus de joie.',
    },
    { id: 'fromage', texte: 'Beau fromage.', authentique: false, vanite: 0, mefiance: 55, reaction: 'Il referme le bec d’un cran.' },
    { id: 'chante', texte: 'Chantez-moi quelque chose.', authentique: false, vanite: 0, mefiance: 60, reaction: 'Pourquoi demandes-tu ?' },
  ],
  declencheur: { texte: '(Ne rien dire. Attendre.)', reaction: 'Il ouvre un large bec, laisse tomber sa proie.' },
  moraleReussite: 'Tu n’as rien demandé.',
  moraleEchec: 'Le renard ne demande jamais au corbeau de chanter.',
  secondes: 60,
}

const dire = (t: string) => fireEvent.click(screen.getByRole('button', { name: t }))
const vanite = () => screen.getByLabelText(/^Vanité/).getAttribute('aria-valuenow')
const mefiance = () => screen.getByLabelText(/^Méfiance/).getAttribute('aria-valuenow')
const declencheur = () => screen.queryByRole('button', { name: /Ne rien dire/ })

/** Les quatre vers de La Fontaine, dans son ordre. */
function flatterCommeLaFontaine() {
  dire('Monsieur du Corbeau.')
  dire('Que vous êtes joli !')
  dire('Si votre ramage…')
  dire('Le Phénix de ces bois.')
}

describe('FlatterieGame', () => {
  it('monte la vanité à chaque compliment, et ne répète pas un compliment dit', () => {
    render(<FlatterieGame content={CONTENU} onComplete={vi.fn()} />)
    expect(vanite()).toBe('0')
    expect(mefiance()).toBe('20')

    dire('Monsieur du Corbeau.')
    expect(vanite()).toBe('20')
    expect(screen.getByRole('button', { name: 'Monsieur du Corbeau.' })).toBeDisabled()
  })

  /**
   * Le cœur de la mécanique : la même phrase, dite trop tôt, se retourne
   * contre le renard — et la réaction le dit, sinon le joueur ne comprend pas
   * pourquoi il perd.
   */
  it('fait retomber à plat une réplique conditionnelle dite trop tôt, et le dit', () => {
    render(<FlatterieGame content={CONTENU} onComplete={vi.fn()} />)
    dire('Si votre ramage…')
    expect(vanite()).toBe('5')
    expect(mefiance()).toBe('50')
    expect(screen.getByText(/rien dit de mes plumes/)).toBeInTheDocument()
  })

  it('n’allume le déclencheur qu’une fois la vanité pleine', () => {
    render(<FlatterieGame content={CONTENU} onComplete={vi.fn()} />)
    expect(declencheur()).not.toBeInTheDocument()

    dire('Monsieur du Corbeau.')
    dire('Que vous êtes joli !')
    dire('Si votre ramage…')
    expect(vanite()).toBe('80')
    expect(declencheur()).not.toBeInTheDocument()

    dire('Le Phénix de ces bois.')
    expect(vanite()).toBe('100')
    expect(declencheur()).toBeInTheDocument()
  })

  it('gagne en se taisant, et sert le vers de La Fontaine', () => {
    vi.useFakeTimers()
    try {
      const onComplete = vi.fn()
      render(<FlatterieGame content={CONTENU} onComplete={onComplete} />)
      flatterCommeLaFontaine()
      fireEvent.click(declencheur()!)

      expect(screen.getByText(/laisse tomber sa proie/)).toBeInTheDocument()
      expect(screen.getByText(CONTENU.moraleReussite)).toBeInTheDocument()

      act(() => void vi.advanceTimersByTime(800))
      fireEvent.click(screen.getByRole('button', { name: 'Ramasser le fromage' }))
      act(() => void vi.advanceTimersByTime(1000))
      expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({ correct: true, mistakes: 0 }))
    } finally {
      vi.useRealTimers()
    }
  })

  it('fait fuir le corbeau dès que la méfiance déborde', () => {
    render(<FlatterieGame content={CONTENU} onComplete={vi.fn()} />)
    dire('Beau fromage.')
    expect(mefiance()).toBe('75')
    dire('Chantez-moi quelque chose.')
    expect(screen.getByText(CONTENU.moraleEchec)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Beau fromage.' })).not.toBeInTheDocument()
  })

  /**
   * Ce que le joueur découvre à la fin : deux des six phrases ne sont pas de La
   * Fontaine, et ce sont exactement celles qui font tout rater.
   */
  it('révèle lesquelles des phrases dites étaient vraiment de La Fontaine', () => {
    render(<FlatterieGame content={CONTENU} onComplete={vi.fn()} />)
    dire('Que vous êtes joli !')
    dire('Beau fromage.')
    dire('Chantez-moi quelque chose.')

    expect(screen.getAllByText('La Fontaine')).toHaveLength(1)
    expect(screen.getAllByText('de ton cru')).toHaveLength(2)
  })

  it('laisse le corbeau s’envoler quand le temps s’épuise', () => {
    vi.useFakeTimers()
    try {
      const onComplete = vi.fn()
      render(<FlatterieGame content={CONTENU} onComplete={onComplete} />)
      expect(screen.getByText('60 s')).toBeInTheDocument()

      act(() => void vi.advanceTimersByTime(60_000))
      expect(screen.getByText(/s’envole avec son fromage/)).toBeInTheDocument()

      act(() => void vi.advanceTimersByTime(800))
      fireEvent.click(screen.getByRole('button', { name: 'Ramasser le fromage' }))
      act(() => void vi.advanceTimersByTime(1000))
      expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({ correct: false }))
    } finally {
      vi.useRealTimers()
    }
  })

  it('ne laisse pas un double tap sur le déclencheur sauter l’épilogue', () => {
    vi.useFakeTimers()
    try {
      const onComplete = vi.fn()
      render(<FlatterieGame content={CONTENU} onComplete={onComplete} />)
      flatterCommeLaFontaine()
      fireEvent.click(declencheur()!)
      fireEvent.click(screen.getByRole('button', { name: 'Ramasser le fromage' }))

      expect(onComplete).not.toHaveBeenCalled()
      expect(screen.getByText(CONTENU.moraleReussite)).toBeInTheDocument()
    } finally {
      vi.useRealTimers()
    }
  })
})
