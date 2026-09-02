import { describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { RiviereGame } from './RiviereGame'
import type { RiviereContent } from '../../types/game'

const CONTENU: RiviereContent = {
  paniers: [
    { id: 'masculin', label: 'Masculin' },
    { id: 'feminin', label: 'Féminin' },
  ],
  flottants: [
    { label: 'oasis', panierId: 'feminin' },
    { label: 'pétale', panierId: 'masculin' },
    { label: 'apogée', panierId: 'masculin' },
    { label: 'échappatoire', panierId: 'feminin' },
  ],
  vitesseInitialeSec: 4,
  accelerationParPalier: 0.15,
  objectif: 4,
}

/** Le mot en jeu : un seul à la fois, et l'ordre est mélangé à chaque partie. */
function motCourant(): string {
  const paniers = ['Masculin', 'Féminin']
  const bouton = screen
    .getAllByRole('button')
    .find((b) => b.textContent && !paniers.includes(b.textContent))
  return bouton!.textContent!
}

function genreAttendu(mot: string): string {
  const flottant = CONTENU.flottants.find((f) => f.label === mot)!
  return flottant.panierId === 'masculin' ? 'Masculin' : 'Féminin'
}

function classer(mot: string, panier: string) {
  fireEvent.click(screen.getByRole('button', { name: mot }))
  fireEvent.click(screen.getByRole('button', { name: panier }))
}

describe('RiviereGame', () => {
  it('gagne la manche quand l\'objectif est atteint', () => {
    vi.useFakeTimers()
    const onComplete = vi.fn()
    render(<RiviereGame content={CONTENU} onComplete={onComplete} />)

    for (let i = 0; i < CONTENU.objectif; i++) {
      const mot = motCourant()
      classer(mot, genreAttendu(mot))
    }
    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(onComplete).toHaveBeenCalledWith({
      correct: true,
      timeMs: expect.any(Number),
      mistakes: 0,
    })
    vi.useRealTimers()
  })

  /**
   * Le test qui verrouille le correctif le plus important de cette mécanique.
   *
   * Avant, un mauvais dépôt ne consommait pas le mot et ne le désélectionnait
   * pas : avec deux rives — le cas de cinq des huit Rivières du CP — taper
   * l'une puis l'autre garantissait la bonne réponse. Une partie réelle a été
   * gagnée 5/5 sans lire un seul mot. Le mot échoué doit donc disparaître.
   */
  it('fait échouer le mot sur la mauvaise rive, sans seconde chance', () => {
    vi.useFakeTimers()
    const onComplete = vi.fn()
    render(<RiviereGame content={CONTENU} onComplete={onComplete} />)

    const mot = motCourant()
    const faux = genreAttendu(mot) === 'Masculin' ? 'Féminin' : 'Masculin'
    classer(mot, faux)
    act(() => {
      vi.advanceTimersByTime(600)
    })
    // Le mot suivant est en jeu : celui d'avant s'est échoué.
    expect(motCourant()).not.toBe(mot)

    for (let i = 0; i < CONTENU.objectif; i++) {
      const m = motCourant()
      classer(m, genreAttendu(m))
    }
    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({ correct: true, mistakes: 1 }))
    vi.useRealTimers()
  })

  /** Trois mauvaises rives suffisent à perdre : la stratégie du tricheur meurt ici. */
  it('perd la manche après trois mots échoués sur la mauvaise rive', () => {
    vi.useFakeTimers()
    const onComplete = vi.fn()
    render(<RiviereGame content={CONTENU} onComplete={onComplete} />)

    for (let i = 0; i < 3; i++) {
      const m = motCourant()
      classer(m, genreAttendu(m) === 'Masculin' ? 'Féminin' : 'Masculin')
      act(() => {
        vi.advanceTimersByTime(600)
      })
    }
    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({ correct: false, mistakes: 3 }))
    vi.useRealTimers()
  })

  /** Trois mots laissés filer mettent fin à la manche, perdue. */
  it('perd la manche après trois mots ratés', () => {
    vi.useFakeTimers()
    const onComplete = vi.fn()
    render(<RiviereGame content={CONTENU} onComplete={onComplete} />)

    for (let i = 0; i < 3; i++) {
      act(() => {
        vi.advanceTimersByTime(CONTENU.vitesseInitialeSec * 1000 + 50)
      })
    }
    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({ correct: false, mistakes: 3 }))
    vi.useRealTimers()
  })
})
