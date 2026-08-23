import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { MatchGame } from './MatchGame'
import type { MatchContent } from '../../types/game'

const CONTENU: MatchContent = {
  pairs: [
    { left: 'A', right: '1' },
    { left: 'B', right: '2' },
  ],
}

describe('MatchGame', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('réussit toujours une manche complétée, même avec des erreurs, et transmet le nombre de fautes', () => {
    const onComplete = vi.fn()
    render(<MatchGame content={CONTENU} onComplete={onComplete} />)

    // Une association fausse : A avec 2.
    fireEvent.click(screen.getByRole('button', { name: 'A' }))
    fireEvent.click(screen.getByRole('button', { name: '2' }))
    act(() => {
      vi.advanceTimersByTime(500)
    })

    // Les deux vraies paires, dans l'ordre.
    fireEvent.click(screen.getByRole('button', { name: 'A' }))
    fireEvent.click(screen.getByRole('button', { name: '1' }))
    fireEvent.click(screen.getByRole('button', { name: 'B' }))
    fireEvent.click(screen.getByRole('button', { name: '2' }))

    act(() => {
      vi.advanceTimersByTime(400)
    })

    expect(onComplete).toHaveBeenCalledWith({ correct: true, timeMs: expect.any(Number), mistakes: 1 })
  })

  it('transmet mistakes: 0 pour une manche sans aucune erreur', () => {
    const onComplete = vi.fn()
    render(<MatchGame content={CONTENU} onComplete={onComplete} />)

    fireEvent.click(screen.getByRole('button', { name: 'A' }))
    fireEvent.click(screen.getByRole('button', { name: '1' }))
    fireEvent.click(screen.getByRole('button', { name: 'B' }))
    fireEvent.click(screen.getByRole('button', { name: '2' }))

    act(() => {
      vi.advanceTimersByTime(400)
    })

    expect(onComplete).toHaveBeenCalledWith({ correct: true, timeMs: expect.any(Number), mistakes: 0 })
  })
})
