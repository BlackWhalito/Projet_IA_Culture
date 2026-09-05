import { describe, expect, it } from 'vitest'
import { chanceAuHasard, mepriseDe, memeOrdre } from './arebours'
import type { ARebourseContent } from '../types/game'

const CONTENU: ARebourseContent = {
  consigne: 'Compose ce qu’on te demande.',
  atelier: { qui: 'Compositeur', lieu: 'Paris', annee: '1794' },
  suite: [
    { id: 'bleu', label: 'Bleu', couleur: '#2b4a8b' },
    { id: 'blanc', label: 'Blanc', couleur: '#f4f1e8' },
    { id: 'rouge', label: 'Rouge', couleur: '#b8332f' },
  ],
  demandes: [
    {
      consigne: 'Le drapeau français, de droite à gauche.',
      accent: 'de droite à gauche',
      attendu: ['rouge', 'blanc', 'bleu'],
      secondes: 6,
      meprises: [{ ordre: ['bleu', 'blanc', 'rouge'], texte: 'Tu as récité.' }],
      verdict: 'Juste.',
    },
  ],
}

describe('memeOrdre', () => {
  it('exige le même ordre, pas les mêmes éléments', () => {
    expect(memeOrdre(['a', 'b'], ['a', 'b'])).toBe(true)
    expect(memeOrdre(['a', 'b'], ['b', 'a'])).toBe(false)
    expect(memeOrdre(['a'], ['a', 'b'])).toBe(false)
    expect(memeOrdre([], [])).toBe(true)
  })
})

describe('mepriseDe', () => {
  /**
   * Le cœur de la mécanique : réciter dans le sens appris n'est pas « faux »,
   * c'est une méprise NOMMÉE. Un « raté » n'apprend rien.
   */
  it('nomme la conséquence quand le joueur a récité au lieu de lire', () => {
    expect(mepriseDe(CONTENU.demandes[0], ['bleu', 'blanc', 'rouge'])).toBe('Tu as récité.')
  })

  it('ne dit rien pour un ordre faux sans conséquence connue', () => {
    expect(mepriseDe(CONTENU.demandes[0], ['blanc', 'rouge', 'bleu'])).toBeUndefined()
  })

  it('ne dit rien pour l’ordre juste', () => {
    expect(mepriseDe(CONTENU.demandes[0], ['rouge', 'blanc', 'bleu'])).toBeUndefined()
  })
})

describe('chanceAuHasard', () => {
  it('compte les arrangements, pas les combinaisons — l’ordre est le sujet', () => {
    // Trois tuiles au rack, trois attendues : 3 × 2 × 1 = 6.
    expect(chanceAuHasard(CONTENU, CONTENU.demandes[0])).toBeCloseTo(1 / 6)
  })

  it('s’effondre dès que la suite s’allonge', () => {
    const jours: ARebourseContent = {
      ...CONTENU,
      suite: Array.from({ length: 7 }, (_, i) => ({ id: `j${i}`, label: `J${i}` })),
      demandes: [{ ...CONTENU.demandes[0], attendu: Array.from({ length: 7 }, (_, i) => `j${i}`) }],
    }
    // 7! = 5040 : on ne gagne pas cette manche en tapant sans lire.
    expect(chanceAuHasard(jours, jours.demandes[0])).toBeCloseTo(1 / 5040)
  })
})
