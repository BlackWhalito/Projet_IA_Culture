import { describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { QcmGame } from './QcmGame'
import type { QcmContent } from '../../types/game'

const CONTENU: QcmContent = {
  question: 'Quelle est la capitale de la France ?',
  choices: ['Paris', 'Lyon', 'Marseille'],
  correctIndex: 0,
}

describe('QcmGame', () => {
  /**
   * Le test qui justifie le mélange.
   *
   * Les 40 QCM du projet ont `correctIndex: 0`. Sans mélange, « Paris » serait
   * le premier bouton à chaque partie, et le jeu se gagnerait sans lire la
   * question. Vingt rendus suffisent très largement à faire tomber ce cas : la
   * probabilité que le hasard place la bonne réponse en tête vingt fois de
   * suite est de (1/3)^20, soit une chance sur trois milliards et demi.
   */
  it('ne place pas toujours la bonne réponse en premier', () => {
    const positions = new Set<number>()

    for (let i = 0; i < 20; i++) {
      render(<QcmGame content={CONTENU} onComplete={vi.fn()} />)
      const libelles = screen.getAllByRole('button').map((b) => b.textContent)
      positions.add(libelles.indexOf('Paris'))
      cleanup()
    }

    expect(positions.size).toBeGreaterThan(1)
    expect(positions.has(0)).toBe(true)
  })

  it('affiche les trois propositions, quel que soit le mélange', () => {
    render(<QcmGame content={CONTENU} onComplete={vi.fn()} />)
    const libelles = screen.getAllByRole('button').map((b) => b.textContent)
    expect([...libelles].sort()).toEqual(['Lyon', 'Marseille', 'Paris'])
  })

  it('conclut juste, sans erreur, quand on choisit la bonne réponse', () => {
    vi.useFakeTimers()
    const onComplete = vi.fn()
    render(<QcmGame content={CONTENU} onComplete={onComplete} />)

    fireEvent.click(screen.getByRole('button', { name: 'Paris' }))
    act(() => {
      vi.advanceTimersByTime(600)
    })

    expect(onComplete).toHaveBeenCalledWith({ correct: true, timeMs: expect.any(Number), mistakes: 0 })
    vi.useRealTimers()
  })

  it('conclut faux et compte une erreur quand on se trompe', () => {
    vi.useFakeTimers()
    const onComplete = vi.fn()
    render(<QcmGame content={CONTENU} onComplete={onComplete} />)

    fireEvent.click(screen.getByRole('button', { name: 'Lyon' }))
    act(() => {
      vi.advanceTimersByTime(600)
    })

    expect(onComplete).toHaveBeenCalledWith({ correct: false, timeMs: expect.any(Number), mistakes: 1 })
    vi.useRealTimers()
  })

  it('ignore un second clic : on ne répond qu\'une fois', () => {
    vi.useFakeTimers()
    const onComplete = vi.fn()
    render(<QcmGame content={CONTENU} onComplete={onComplete} />)

    fireEvent.click(screen.getByRole('button', { name: 'Lyon' }))
    fireEvent.click(screen.getByRole('button', { name: 'Paris' }))
    act(() => {
      vi.advanceTimersByTime(600)
    })

    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({ correct: false }))
    vi.useRealTimers()
  })
})
