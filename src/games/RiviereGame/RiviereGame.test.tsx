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
  dureeSec: 20,
  objectif: 3,
}

/** L'ordre de la file est mélangé à chaque partie : on lit le mot affiché plutôt que de le supposer. */
function motActuel(): string {
  const panierLabels = new Set(CONTENU.paniers.map((p) => p.label))
  const boutons = screen.getAllByRole('button').filter((b) => panierLabels.has(b.textContent ?? ''))
  expect(boutons).toHaveLength(CONTENU.paniers.length)
  // Le mot n'est plus un bouton (un seul tap suffit, sur le panier) : on le
  // retrouve via le flottant affiché dans la piste.
  const mot = CONTENU.flottants.map((f) => f.label).find((label) => screen.queryByText(label))
  return mot!
}

function panierCorrectPour(mot: string): string {
  const flottant = CONTENU.flottants.find((f) => f.label === mot)!
  return CONTENU.paniers.find((p) => p.id === flottant.panierId)!.label
}

function repondre(juste: boolean): string {
  const mot = motActuel()
  const bon = panierCorrectPour(mot)
  const cible = juste ? bon : CONTENU.paniers.map((p) => p.label).find((l) => l !== bon)!
  fireEvent.click(screen.getByRole('button', { name: cible }))
  return mot
}

describe('RiviereGame', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('se joue en un seul tap sur le panier, sans avoir à sélectionner le mot d’abord', () => {
    const onComplete = vi.fn()
    render(<RiviereGame content={CONTENU} onComplete={onComplete} />)

    const premierMot = motActuel()
    fireEvent.click(screen.getByRole('button', { name: panierCorrectPour(premierMot) }))
    expect(screen.getByText('1 / 3')).toBeInTheDocument()
    // Le mot suivant est déjà là : aucune attente entre deux objets.
    expect(motActuel()).not.toBe(premierMot)
  })

  it('réussit la manche en classant les 3 objets, et transmet une erreur volontaire', () => {
    const onComplete = vi.fn()
    render(<RiviereGame content={CONTENU} onComplete={onComplete} />)

    // Une erreur volontaire : elle ne compte pas dans l'objectif et casse la série.
    repondre(false)
    expect(screen.getByText('0 / 3')).toBeInTheDocument()

    for (let i = 0; i < 3; i++) repondre(true)

    expect(screen.getByText('3 / 3')).toBeInTheDocument()
    act(() => {
      vi.advanceTimersByTime(400)
    })
    expect(onComplete).toHaveBeenCalledWith({ correct: true, timeMs: expect.any(Number), mistakes: 1 })
  })

  it('échoue la manche quand le chrono de la manche arrive à zéro', () => {
    const onComplete = vi.fn()
    render(<RiviereGame content={CONTENU} onComplete={onComplete} />)

    repondre(true)
    act(() => {
      vi.advanceTimersByTime(CONTENU.dureeSec * 1000)
    })
    act(() => {
      vi.advanceTimersByTime(400)
    })

    expect(onComplete).toHaveBeenCalledWith({ correct: false, timeMs: expect.any(Number), mistakes: 0 })
  })

  it('affiche la série à partir de deux bonnes réponses d’affilée, et la casse à l’erreur', () => {
    const onComplete = vi.fn()
    render(<RiviereGame content={{ ...CONTENU, objectif: 10 }} onComplete={onComplete} />)

    repondre(true)
    expect(screen.queryByText(/série/)).not.toBeInTheDocument()
    repondre(true)
    expect(screen.getByText('série ×2')).toBeInTheDocument()
    repondre(false)
    expect(screen.queryByText(/série/)).not.toBeInTheDocument()
  })

  it("n'écoule pas le chrono tant que l'écran de règle est affiché", () => {
    const onComplete = vi.fn()
    const avecRegle: RiviereContent = { ...CONTENU, regle: 'Range chaque mot dans le bon panier.' }
    render(<RiviereGame content={avecRegle} onComplete={onComplete} />)

    expect(screen.getByText('Range chaque mot dans le bon panier.')).toBeInTheDocument()
    act(() => {
      vi.advanceTimersByTime(CONTENU.dureeSec * 2000)
    })
    expect(onComplete).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Commencer' }))
    expect(screen.getByText(`${CONTENU.dureeSec}s`)).toBeInTheDocument()
  })
})
