import { describe, expect, it } from 'vitest'
import { appliquerEffets, enEchec, jaugesInitiales, resoudreEpilogue } from './fildesjours'
import type { FilDesJoursContent } from '../types/game'

describe('jaugesInitiales', () => {
  it('initialise chaque jauge à sa valeur de départ', () => {
    const jauges: FilDesJoursContent['jauges'] = [
      { id: 'moral', label: 'Moral', depart: 60 },
      { id: 'vivres', label: 'Vivres', depart: 80 },
    ]
    expect(jaugesInitiales(jauges)).toEqual({ moral: 60, vivres: 80 })
  })
})

describe('appliquerEffets', () => {
  it('additionne les effets aux jauges existantes', () => {
    const suivant = appliquerEffets({ moral: 50 }, { moral: 10 })
    expect(suivant.moral).toBe(60)
  })

  it('plafonne à 100', () => {
    const suivant = appliquerEffets({ moral: 95 }, { moral: 20 })
    expect(suivant.moral).toBe(100)
  })

  it('plancher à 0', () => {
    const suivant = appliquerEffets({ moral: 5 }, { moral: -20 })
    expect(suivant.moral).toBe(0)
  })

  it("n'affecte pas les jauges absentes des effets", () => {
    const suivant = appliquerEffets({ moral: 50, vivres: 80 }, { moral: -10 })
    expect(suivant.vivres).toBe(80)
  })

  it("ne mute pas l'état reçu", () => {
    const initial = { moral: 50 }
    appliquerEffets(initial, { moral: 10 })
    expect(initial.moral).toBe(50)
  })
})

describe('enEchec', () => {
  const jauges: FilDesJoursContent['jauges'] = [
    { id: 'autorite', label: 'Autorité', depart: 60, critique: true },
    { id: 'milles', label: 'Distance parcourue', depart: 0 },
  ]

  it('signale un échec quand une jauge critique atteint 0', () => {
    expect(enEchec(jauges, { autorite: 0, milles: 40 })).toBe(true)
  })

  it("n'échoue pas tant que la jauge critique est au-dessus de 0", () => {
    expect(enEchec(jauges, { autorite: 1, milles: 40 })).toBe(false)
  })

  it("ignore une jauge à 0 qui n'est pas marquée critique", () => {
    expect(enEchec(jauges, { autorite: 60, milles: 0 })).toBe(false)
  })
})

describe('resoudreEpilogue', () => {
  const epilogues: FilDesJoursContent['epilogues'] = [
    { condition: { moral: [70, 100] }, texte: 'Triomphe' },
    { condition: { moral: [30, 69] }, texte: 'Fortune diverse' },
    { condition: {}, texte: 'Naufrage' },
  ]

  it('choisit le premier épilogue dont la condition correspond', () => {
    expect(resoudreEpilogue({ moral: 85 }, epilogues).texte).toBe('Triomphe')
  })

  it('choisit un épilogue intermédiaire', () => {
    expect(resoudreEpilogue({ moral: 50 }, epilogues).texte).toBe('Fortune diverse')
  })

  it('replie sur le dernier épilogue quand rien ne correspond', () => {
    expect(resoudreEpilogue({ moral: 10 }, epilogues).texte).toBe('Naufrage')
  })

  it('gère plusieurs jauges dans une même condition', () => {
    const multi: FilDesJoursContent['epilogues'] = [
      { condition: { moral: [50, 100], vivres: [50, 100] }, texte: 'Bien' },
      { condition: {}, texte: 'Replis' },
    ]
    expect(resoudreEpilogue({ moral: 90, vivres: 10 }, multi).texte).toBe('Replis')
    expect(resoudreEpilogue({ moral: 90, vivres: 90 }, multi).texte).toBe('Bien')
  })
})
