import { describe, expect, it } from 'vitest'
import { courbeOuverte, semer } from './courbe'

describe('courbeOuverte', () => {
  it('rend un chemin vide sans point', () => {
    expect(courbeOuverte([])).toBe('')
  })

  it('passe exactement par chacun des points donnés', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 50, y: 40 },
      { x: 100, y: 10 },
    ]
    const d = courbeOuverte(points)
    // Chaque segment cubique se termine sur le point suivant : c'est la
    // garantie qui manque quand on écrit les Béziers à la main.
    expect(d.startsWith('M0,0')).toBe(true)
    expect(d).toContain('50,40')
    expect(d.endsWith('100,10')).toBe(true)
  })

  it('produit un segment cubique de moins qu’il n’y a de points', () => {
    const points = Array.from({ length: 6 }, (_, i) => ({ x: i * 10, y: i % 2 ? 20 : 0 }))
    expect(courbeOuverte(points).split(' C').length - 1).toBe(5)
  })
})

describe('semer', () => {
  it('rend la même suite pour la même graine', () => {
    const a = semer(7)
    const b = semer(7)
    expect([a(), a(), a()]).toEqual([b(), b(), b()])
  })

  it('rend des suites différentes pour des graines différentes', () => {
    expect(semer(1)()).not.toBe(semer(2)())
  })

  it('reste dans [0, 1[', () => {
    const tirer = semer(42)
    for (let i = 0; i < 500; i++) {
      const v = tirer()
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })
})
