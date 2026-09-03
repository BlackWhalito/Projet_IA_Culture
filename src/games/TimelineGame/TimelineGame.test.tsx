import { describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { TimelineGame } from './TimelineGame'
import type { TimelineContent } from '../../types/game'

const CONTENU: TimelineContent = {
  consigne: 'Place chaque événement entre ceux qui y sont déjà.',
  cartesDeDepart: 1,
  events: [
    { label: 'Lascaux', sortValue: -15000, repere: 'il y a 17 000 ans' },
    { label: 'L’écriture', sortValue: -3300, repere: '3300 av. J.-C.' },
    { label: 'Colomb', sortValue: 1492, repere: '1492' },
    { label: 'La Bastille', sortValue: 1789, repere: '1789' },
    { label: 'La tour Eiffel', sortValue: 1889, repere: '1889' },
  ],
}

/** La carte actuellement en main, celle qu'il faut placer. */
function enMain(): string {
  const cartes = ['Lascaux', 'L’écriture', 'Colomb', 'La Bastille', 'La tour Eiffel']
  const el = screen.getByText((_, node) => {
    const t = node?.textContent?.trim() ?? ''
    return node?.className?.toString().includes('carteEnMain') === true && cartes.includes(t)
  })
  return el.textContent!.trim()
}

/** Les fentes ouvertes, de haut en bas. */
function fentes() {
  return screen.getAllByRole('button', { name: /Placer/ })
}

function attendre(ms: number) {
  act(() => {
    vi.advanceTimersByTime(ms)
  })
}

describe('TimelineGame — « Entre deux »', () => {
  it('ouvre toujours une fente de plus qu’il n’y a de cartes posées', () => {
    vi.useFakeTimers()
    render(<TimelineGame content={CONTENU} onComplete={vi.fn()} />)

    // Une carte de départ, donc deux fentes : avant elle, et après.
    expect(fentes()).toHaveLength(2)
    vi.useRealTimers()
  })

  /**
   * Le cœur de la mécanique : chaque réussite ouvre une fente de plus, donc la
   * chance au hasard s'effondre à mesure qu'on avance. C'est ce qui remplace
   * une difficulté ajoutée artificiellement.
   */
  it('ajoute une fente à chaque carte posée', () => {
    vi.useFakeTimers()
    render(<TimelineGame content={CONTENU} onComplete={vi.fn()} />)

    expect(fentes()).toHaveLength(2)
    fireEvent.click(fentes()[fentes().length - 1])
    attendre(1600)
    expect(fentes()).toHaveLength(3)
    vi.useRealTimers()
  })

  it('affiche le repère de la carte posée — c’est la récompense', () => {
    vi.useFakeTimers()
    render(<TimelineGame content={CONTENU} onComplete={vi.fn()} />)

    const carte = enMain()
    const attendu = CONTENU.events.find((e) => e.label === carte)!.repere!
    // On la pose quelque part ; juste ou non, son repère doit apparaître.
    fireEvent.click(fentes()[0])
    expect(screen.getAllByText(new RegExp(attendu.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))).length).toBeGreaterThan(0)
    vi.useRealTimers()
  })

  /**
   * Une erreur ne bloque jamais : la carte va quand même à sa vraie place, et
   * la frise avance. On perd une lanterne, jamais l'information.
   */
  it('place la carte au bon endroit même quand on se trompe', () => {
    vi.useFakeTimers()
    render(<TimelineGame content={CONTENU} onComplete={vi.fn()} />)

    const avant = fentes().length
    // La fente 0 est « avant Lascaux » : fausse pour toute autre carte que
    // Lascaux, qui est déjà posée en premier.
    fireEvent.click(fentes()[0])
    expect(screen.getByText(/Pas là/)).toBeInTheDocument()
    attendre(2500)
    // La frise a quand même grandi.
    expect(fentes()).toHaveLength(avant + 1)
    vi.useRealTimers()
  })

  it('perd la manche après trois erreurs', () => {
    vi.useFakeTimers()
    const onComplete = vi.fn()
    render(<TimelineGame content={CONTENU} onComplete={onComplete} />)

    for (let i = 0; i < 3; i++) {
      fireEvent.click(fentes()[0])
      attendre(2500)
    }
    attendre(600)

    expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({ correct: false, mistakes: 3 }))
    vi.useRealTimers()
  })

  it('gagne la manche quand toutes les cartes sont posées', () => {
    vi.useFakeTimers()
    const onComplete = vi.fn()
    render(<TimelineGame content={CONTENU} onComplete={onComplete} />)

    // La pioche est MÉLANGÉE : « toujours la dernière fente » ne marche pas, et
    // c'est précisément ce qui fait qu'une même notion donne une frise
    // différente à chaque partie. On calcule donc la fente juste, comme le
    // ferait un joueur qui sait.
    for (let i = 0; i < CONTENU.events.length - 1; i++) {
      const carte = enMain()
      const valeur = CONTENU.events.find((e) => e.label === carte)!.sortValue
      const posees = screen
        .getAllByRole('button', { name: /Placer après/ })
        .map((b) => b.getAttribute('aria-label')!.replace(/^Placer après « (.*) »$/, '$1'))
        .map((label) => CONTENU.events.find((e) => e.label === label)!.sortValue)
      const attendue = posees.filter((v) => v < valeur).length
      fireEvent.click(fentes()[attendue])
      attendre(1600)
    }
    attendre(600)

    expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({ correct: true, mistakes: 0 }))
    vi.useRealTimers()
  })

  /** Le chrono court sur toute la manche : hésiter mange le temps des suivantes. */
  it('perd la manche quand le chrono global s’épuise', () => {
    vi.useFakeTimers()
    const onComplete = vi.fn()
    render(<TimelineGame content={{ ...CONTENU, secondesTotal: 3 }} onComplete={onComplete} />)

    // Seconde par seconde : chaque décrément est un nouveau `setTimeout`, posé
    // par l'effet APRÈS le rendu. Tout avancer d'un coup ne laisse pas React
    // reprogrammer la suite de la chaîne.
    for (let i = 0; i < 5; i++) attendre(1000)
    attendre(600)

    expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({ correct: false }))
    vi.useRealTimers()
  })
})
