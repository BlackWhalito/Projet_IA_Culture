import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { RiviereGame } from './RiviereGame'
import type { RiviereContent } from '../../types/game'

const CONTENU: RiviereContent = {
  paniers: [
    { id: 'a', label: 'A' },
    { id: 'b', label: 'B' },
  ],
  flottants: [
    { label: 'Un', panierId: 'a' },
    { label: 'Deux', panierId: 'b' },
    { label: 'Trois', panierId: 'a' },
  ],
  vitesseInitialeSec: 4,
  accelerationParPalier: 0.15,
  objectif: 3,
}

/** L'ordre de la file est mélangé à chaque partie : on lit le mot affiché plutôt que de le supposer. */
function motActuel(): string {
  const panierLabels = new Set(CONTENU.paniers.map((p) => p.label))
  const bouton = screen.getAllByRole('button').find((b) => !panierLabels.has(b.textContent ?? ''))
  return bouton!.textContent!
}

function panierCorrectPour(mot: string): string {
  const flottant = CONTENU.flottants.find((f) => f.label === mot)!
  return CONTENU.paniers.find((p) => p.id === flottant.panierId)!.label
}

describe('RiviereGame', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('réussit la manche en classant les 3 mots, et transmet une erreur volontaire', () => {
    const onComplete = vi.fn()
    render(<RiviereGame content={CONTENU} onComplete={onComplete} />)

    // Premier mot : une erreur volontaire (mauvais panier), puis le bon.
    const premierMot = motActuel()
    const bonPanier = panierCorrectPour(premierMot)
    const mauvaisPanier = CONTENU.paniers.map((p) => p.label).find((l) => l !== bonPanier)!

    fireEvent.click(screen.getByRole('button', { name: premierMot }))
    fireEvent.click(screen.getByRole('button', { name: mauvaisPanier }))
    // Le rejet ne fait pas avancer la file : le même mot est toujours affiché.
    expect(motActuel()).toBe(premierMot)
    act(() => {
      vi.advanceTimersByTime(500)
    })

    fireEvent.click(screen.getByRole('button', { name: premierMot }))
    fireEvent.click(screen.getByRole('button', { name: bonPanier }))
    expect(screen.getByText('1 / 3 classés')).toBeInTheDocument()

    // Les deux mots restants, sans erreur.
    for (let i = 0; i < 2; i++) {
      const mot = motActuel()
      const panier = panierCorrectPour(mot)
      fireEvent.click(screen.getByRole('button', { name: mot }))
      fireEvent.click(screen.getByRole('button', { name: panier }))
    }

    expect(screen.getByText('3 / 3 classés')).toBeInTheDocument()
    act(() => {
      vi.advanceTimersByTime(400)
    })

    expect(onComplete).toHaveBeenCalledWith({ correct: true, timeMs: expect.any(Number), mistakes: 1 })
  })

  it("affiche la règle avant de jouer quand elle est fournie, et ne compte aucun raté tant qu'on ne l'a pas quittée", () => {
    const onComplete = vi.fn()
    const contenuAvecRegle: RiviereContent = { ...CONTENU, regle: 'Range chaque mot dans le bon panier.' }
    render(<RiviereGame content={contenuAvecRegle} onComplete={onComplete} />)

    expect(screen.getByText('Range chaque mot dans le bon panier.')).toBeInTheDocument()
    // Aucun mot ne tombe tant que la règle est affichée : un temps largement
    // supérieur à la durée de chute nominale ne doit provoquer aucun raté.
    act(() => {
      vi.advanceTimersByTime(10000)
    })
    expect(onComplete).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Commencer' }))
    expect(screen.queryByText('Range chaque mot dans le bon panier.')).not.toBeInTheDocument()

    const mot = motActuel()
    const panier = panierCorrectPour(mot)
    fireEvent.click(screen.getByRole('button', { name: mot }))
    fireEvent.click(screen.getByRole('button', { name: panier }))
    expect(screen.getByText('1 / 3 classés')).toBeInTheDocument()
  })

  it('échoue la manche après trois mots ratés (laissés filer sans réponse)', () => {
    const onComplete = vi.fn()
    render(<RiviereGame content={CONTENU} onComplete={onComplete} />)

    for (let i = 0; i < 3; i++) {
      act(() => {
        vi.advanceTimersByTime(4000)
      })
    }

    act(() => {
      vi.advanceTimersByTime(400)
    })

    expect(onComplete).toHaveBeenCalledWith({ correct: false, timeMs: expect.any(Number), mistakes: 3 })
  })
})
