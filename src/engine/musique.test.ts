import { describe, expect, it } from 'vitest'
import { AMBIANCES, frequenceDuDegre, arreterMusique, demarrerMusique, musiqueEnCours } from './musique'
import { CP_LEVELS } from '../content/levels/cp-levels'

describe('les ambiances de niveau', () => {
  it('en définit une pour chacun des huit niveaux du CP', () => {
    for (const niveau of CP_LEVELS) {
      expect(AMBIANCES[niveau.id], `${niveau.id} sans ambiance`).toBeDefined()
    }
    expect(Object.keys(AMBIANCES)).toHaveLength(CP_LEVELS.length)
  })

  it('donne à chaque niveau une couleur musicale distincte', () => {
    // Deux niveaux qui partagent mode ET tonique sonneraient pareil : l'ambiance
    // ne dirait plus rien du niveau où l'on se trouve.
    const signatures = Object.values(AMBIANCES).map((a) => `${a.tonique}|${a.mode.join(',')}`)
    expect(new Set(signatures).size).toBe(signatures.length)
  })

  it('décale les longueurs de lignes, pour que la boucle ne s’entende pas', () => {
    for (const [id, a] of Object.entries(AMBIANCES)) {
      // Si la voix avait la même longueur que les accords, tout se répéterait
      // au bout de quatre temps. C'est le décalage qui fait durer la boucle.
      expect(a.voix.length, `${id} : voix et accords de même longueur`).not.toBe(a.accords.length)
      expect(a.voix.length, `${id} : voix trop courte`).toBeGreaterThan(a.accords.length)
    }
  })

  it('reste dans une plage de fréquences audibles et graves', () => {
    for (const [id, a] of Object.entries(AMBIANCES)) {
      expect(a.tonique, `${id}`).toBeGreaterThan(80)
      expect(a.tonique, `${id}`).toBeLessThan(260)
      const degres = [...a.basse, ...a.accords.flat(), ...a.voix.filter((v): v is number => v !== null)]
      for (const d of degres) {
        const f = frequenceDuDegre(a, d)
        expect(f, `${id} : degré ${d}`).toBeGreaterThan(40)
        expect(f * 2, `${id} : degré ${d} à la voix`).toBeLessThan(4200)
      }
    }
  })

  it('explique en une phrase le lien entre le niveau et sa couleur', () => {
    for (const [id, a] of Object.entries(AMBIANCES)) {
      expect(a.intention.length, `${id} : intention trop courte`).toBeGreaterThan(60)
    }
  })
})

describe('la lecture', () => {
  it('ne lève pas et ne démarre pas là où il n’y a pas de Web Audio', () => {
    // jsdom n'a pas d'AudioContext : l'appel doit être sans effet, pas fatal.
    expect(() => demarrerMusique('cp-level-1')).not.toThrow()
    expect(musiqueEnCours()).toBe(false)
    expect(() => arreterMusique()).not.toThrow()
  })

  it('ignore un niveau sans ambiance', () => {
    expect(() => demarrerMusique('niveau-inexistant')).not.toThrow()
    expect(musiqueEnCours()).toBe(false)
  })
})
