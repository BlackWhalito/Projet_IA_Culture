import { describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { MatchGame } from './MatchGame'
import type { MatchContent } from '../../types/game'

const CONTENU: MatchContent = {
  pairs: [
    { left: 'La fusion', right: 'Solide → liquide' },
    { left: 'La vaporisation', right: 'Liquide → gaz' },
    { left: 'La solidification', right: 'Liquide → solide' },
    { left: 'La liquéfaction', right: 'Gaz → liquide' },
  ],
}

/** Apparie une paire par son libellé de gauche puis celui de droite. */
function apparier(gauche: string, droite: string) {
  fireEvent.click(screen.getByRole('button', { name: gauche }))
  fireEvent.click(screen.getByRole('button', { name: droite }))
}

describe('MatchGame', () => {
  it('conclut juste et sans erreur quand tout est apparié du premier coup', () => {
    vi.useFakeTimers()
    const onComplete = vi.fn()
    render(<MatchGame content={CONTENU} onComplete={onComplete} />)

    for (const paire of CONTENU.pairs) apparier(paire.left, paire.right)
    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(onComplete).toHaveBeenCalledWith({ correct: true, timeMs: expect.any(Number), mistakes: 0 })
    vi.useRealTimers()
  })

  /**
   * Le test qui justifie le correctif.
   *
   * Ce jeu renvoyait `correct: false` dès la première erreur et ne transmettait
   * pas `mistakes` du tout : une hésitation coûtait l'étoile, et le score
   * n'apprenait jamais combien de fois on s'était trompé. Or la mécanique est
   * faite pour porter du contenu piégeux — il faut pouvoir se tromper.
   */
  it('remonte le nombre d\'erreurs et reste gagnable après deux hésitations', () => {
    vi.useFakeTimers()
    const onComplete = vi.fn()
    render(<MatchGame content={CONTENU} onComplete={onComplete} />)

    // Deux confusions plausibles : fusion/vaporisation, puis solidification/liquéfaction.
    apparier('La fusion', 'Liquide → gaz')
    act(() => {
      vi.advanceTimersByTime(600)
    })
    apparier('La solidification', 'Gaz → liquide')
    act(() => {
      vi.advanceTimersByTime(600)
    })

    for (const paire of CONTENU.pairs) apparier(paire.left, paire.right)
    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(onComplete).toHaveBeenCalledWith({ correct: true, timeMs: expect.any(Number), mistakes: 2 })
    vi.useRealTimers()
  })

  it('déclare la manche perdue au-delà de la tolérance', () => {
    vi.useFakeTimers()
    const onComplete = vi.fn()
    render(<MatchGame content={CONTENU} onComplete={onComplete} />)

    // Trois erreurs sur quatre paires : au-dessus de la tolérance de 50 %.
    const fautes: [string, string][] = [
      ['La fusion', 'Liquide → gaz'],
      ['La fusion', 'Gaz → liquide'],
      ['La fusion', 'Liquide → solide'],
    ]
    for (const [g, d] of fautes) {
      apparier(g, d)
      act(() => {
        vi.advanceTimersByTime(600)
      })
    }

    for (const paire of CONTENU.pairs) apparier(paire.left, paire.right)
    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(onComplete).toHaveBeenCalledWith({ correct: false, timeMs: expect.any(Number), mistakes: 3 })
    vi.useRealTimers()
  })
})
