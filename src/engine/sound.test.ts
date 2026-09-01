import { afterEach, describe, expect, it } from 'vitest'
import { VOIX, definirActif, estActif, jouerSon, type SonId } from './sound'

const TOUS: SonId[] = ['tap', 'juste', 'faux', 'depot', 'rate', 'apparition', 'victoire', 'defaite']

/**
 * La table `VOIX` est testable sans navigateur : c'est tout l'intérêt d'avoir
 * séparé la description des sons de leur restitution. Ce que jsdom ne peut pas
 * dire, c'est comment ça sonne — seule une oreille humaine tranche ça.
 */
describe('la table des voix', () => {
  it('définit les huit sons du jeu', () => {
    for (const id of TOUS) {
      expect(VOIX[id], id).toBeDefined()
      expect(VOIX[id].notes.length, id).toBeGreaterThan(0)
    }
  })

  it('ne contient que des notes audibles et de durée positive', () => {
    for (const id of TOUS) {
      for (const note of VOIX[id].notes) {
        expect(note.freq, `${id} : fréquence`).toBeGreaterThan(20)
        expect(note.freq, `${id} : fréquence`).toBeLessThan(20_000)
        expect(note.duree, `${id} : durée`).toBeGreaterThan(0)
        expect(note.delai, `${id} : délai`).toBeGreaterThanOrEqual(0)
        expect(note.gain, `${id} : gain`).toBeGreaterThan(0)
        expect(note.gain, `${id} : gain`).toBeLessThanOrEqual(1)
      }
    }
  })

  it('reste dans la pentatonique de do : ni fa ni si, à un demi-ton près', () => {
    // Les cinq degrés retenus, sur trois octaves. Deux sons qui se chevauchent
    // dans La Rivière doivent rester consonants — c'est la raison de la règle.
    const degres = [261.63, 293.66, 329.63, 392, 440]
    const autorisees = degres.flatMap((f) => [f / 2, f, f * 2, f * 4])
    // Le seul écart assumé : le `faux` descend sur un fa grave, volontairement
    // hors gamme, parce que c'est ce qui le fait entendre comme une erreur.
    const horsGamme = [174.61]

    for (const id of TOUS) {
      for (const note of VOIX[id].notes) {
        for (const f of [note.freq, note.glissandoVers].filter((v): v is number => v !== undefined)) {
          const proche = [...autorisees, ...horsGamme].some((ref) => Math.abs(ref - f) < ref * 0.03)
          expect(proche, `${id} : ${f} Hz hors pentatonique`).toBe(true)
        }
      }
    }
  })

  it('dose la réverbération entre 0 et 1', () => {
    for (const id of TOUS) {
      expect(VOIX[id].reverb, id).toBeGreaterThanOrEqual(0)
      expect(VOIX[id].reverb, id).toBeLessThanOrEqual(1)
    }
  })
})

describe('le réglage du son', () => {
  afterEach(() => {
    window.localStorage.clear()
  })

  it('est actif par défaut, sans rien avoir stocké', () => {
    expect(estActif()).toBe(true)
  })

  it('se coupe et se rallume, et le réglage survit à la relecture', () => {
    definirActif(false)
    expect(estActif()).toBe(false)
    definirActif(true)
    expect(estActif()).toBe(true)
  })
})

describe('jouerSon', () => {
  it("ne lève pas là où le navigateur n'a pas de Web Audio", () => {
    // jsdom n'implémente pas `AudioContext`. Les six mécaniques appellent
    // `jouerSon` sans garde : si cet appel levait, tous leurs tests casseraient.
    expect(() => jouerSon('juste')).not.toThrow()
    expect(() => jouerSon('defaite')).not.toThrow()
  })

  it('ne lève pas non plus quand le son est coupé', () => {
    definirActif(false)
    expect(() => jouerSon('juste')).not.toThrow()
    window.localStorage.clear()
  })
})
