import { describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { ChaineGame } from './ChaineGame'
import type { ChaineContent } from '../../types/game'

const CONTENU: ChaineContent = {
  consigne: 'Vrai ou faux ?',
  secondesParCarte: 8,
  affirmations: [
    { texte: 'Une évidence.', vrai: true, verdict: 'Oui, évidemment.' },
    { texte: 'Une deuxième évidence.', vrai: true, verdict: 'Encore oui.' },
    { texte: 'Un piège.', vrai: false, verdict: 'Non, et voici pourquoi.' },
    { texte: 'Un autre piège.', vrai: false, verdict: 'Non plus.' },
    { texte: 'Le dernier.', vrai: true, verdict: 'Oui.' },
  ],
}

/** Répond à la carte courante et laisse passer le verdict. */
function repondre(vrai: boolean) {
  fireEvent.click(screen.getByRole('button', { name: vrai ? 'C’est vrai' : 'Je te crois pas' }))
  act(() => {
    vi.advanceTimersByTime(2700)
  })
}

describe('ChaineGame', () => {
  it('double la mise à chaque bonne réponse', () => {
    vi.useFakeTimers()
    render(<ChaineGame content={CONTENU} onComplete={vi.fn()} />)

    expect(screen.getByText('100')).toBeInTheDocument()
    repondre(true)
    expect(screen.getByText('200')).toBeInTheDocument()
    repondre(true)
    expect(screen.getByText('400')).toBeInTheDocument()
    vi.useRealTimers()
  })

  it('remet la mise à zéro à la première erreur', () => {
    vi.useFakeTimers()
    render(<ChaineGame content={CONTENU} onComplete={vi.fn()} />)

    repondre(true)
    expect(screen.getByText('200')).toBeInTheDocument()
    repondre(true) // carte 2 juste
    expect(screen.getByText('400')).toBeInTheDocument()
    repondre(true) // carte 3 est FAUSSE : erreur
    expect(screen.getByText('100')).toBeInTheDocument()
    vi.useRealTimers()
  })

  it('affiche le verdict, juste ou faux — c’est là que loge l’apprentissage', () => {
    vi.useFakeTimers()
    render(<ChaineGame content={CONTENU} onComplete={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: 'C’est vrai' }))
    expect(screen.getByText('Bien vu.')).toBeInTheDocument()
    expect(screen.getByText('Oui, évidemment.')).toBeInTheDocument()
    act(() => {
      vi.advanceTimersByTime(2700)
    })

    // Une erreur donne aussi son verdict : on n'apprend jamais moins en ratant.
    fireEvent.click(screen.getByRole('button', { name: 'Je te crois pas' }))
    expect(screen.getByText('Raté.')).toBeInTheDocument()
    expect(screen.getByText('Encore oui.')).toBeInTheDocument()
    vi.useRealTimers()
  })

  /** L'encaissement est la seule décision du jeu : il doit s'arrêter là, et payer. */
  it('encaisse la mise et termine la manche sur demande', () => {
    vi.useFakeTimers()
    const onComplete = vi.fn()
    render(<ChaineGame content={CONTENU} onComplete={onComplete} />)

    repondre(true) // mise à 200
    repondre(true) // mise à 400
    fireEvent.click(screen.getByRole('button', { name: /J’encaisse/ }))

    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({ correct: true, mistakes: 0, streak: 400 }),
    )
    vi.useRealTimers()
  })

  it('arrête la manche après trois erreurs', () => {
    vi.useFakeTimers()
    const onComplete = vi.fn()
    render(<ChaineGame content={CONTENU} onComplete={onComplete} />)

    repondre(false) // carte 1 vraie → erreur
    repondre(false) // carte 2 vraie → erreur
    repondre(true) // carte 3 fausse → erreur
    act(() => {
      vi.advanceTimersByTime(200)
    })

    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({ correct: false, mistakes: 3, streak: 0 }),
    )
    vi.useRealTimers()
  })

  /**
   * Le chrono ne se réinitialise pas au milieu d'une carte : hésiter coûte.
   * Une expiration compte comme une erreur, et sert quand même son verdict.
   */
  it('compte une carte expirée comme une erreur', () => {
    vi.useFakeTimers()
    render(<ChaineGame content={CONTENU} onComplete={vi.fn()} />)

    act(() => {
      vi.advanceTimersByTime(8100)
    })
    expect(screen.getByText('Trop tard.')).toBeInTheDocument()
    expect(screen.getByText('Oui, évidemment.')).toBeInTheDocument()
    expect(screen.getByText('100')).toBeInTheDocument()
    vi.useRealTimers()
  })

  it('présente les affirmations dans l’ordre du contenu, jamais mélangées', () => {
    vi.useFakeTimers()
    render(<ChaineGame content={CONTENU} onComplete={vi.fn()} />)

    // L'ordre EST la courbe de difficulté : le mélanger la détruirait.
    expect(screen.getByText('Une évidence.')).toBeInTheDocument()
    repondre(true)
    expect(screen.getByText('Une deuxième évidence.')).toBeInTheDocument()
    repondre(true)
    expect(screen.getByText('Un piège.')).toBeInTheDocument()
    vi.useRealTimers()
  })
})
