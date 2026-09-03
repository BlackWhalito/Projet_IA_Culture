import { describe, expect, it } from 'vitest'
import { compterPieds, versRecevable, type Tuile } from './metrique'

const t = (mot: string, pieds: number, eFinal?: boolean): Tuile => ({ mot, pieds, eFinal })

describe('compterPieds', () => {
  it('additionne simplement des groupes sans e final', () => {
    expect(compterPieds([t('Je ne puis', 3), t('loin de toi', 3)])).toBe(6)
  })

  /**
   * Le cas qui justifie tout ce module, et que le jeu fait constater : le e
   * final de « demeure » vaut un pied devant une consonne, et zéro devant une
   * voyelle. La même tuile ne vaut donc pas le même nombre de pieds selon ce
   * qu'on pose après elle.
   */
  it('compte le e final devant une consonne, et l’élide devant une voyelle', () => {
    const demeure = t('demeure', 3, true)
    expect(compterPieds([demeure, t('loin de toi', 3)])).toBe(6)
    expect(compterPieds([demeure, t('à jamais', 3)])).toBe(5)
  })

  it('ne compte jamais le e final en fin de vers', () => {
    expect(compterPieds([t('Je ne puis', 3), t('demeure', 3, true)])).toBe(5)
  })

  it('reconstitue l’alexandrin de Hugo, exactement douze', () => {
    // « Je ne puis demeurer loin de toi plus longtemps. »
    const vers = [t('Je ne puis', 3), t('demeure', 3, true), t('loin de toi', 3), t('plus longtemps', 3)]
    expect(compterPieds(vers)).toBe(12)
  })

  it('élide aussi devant un h muet, mais pas devant un h aspiré', () => {
    const encore = t('encore', 3, true)
    // « heure » : h muet, le e s'élide.
    expect(compterPieds([encore, t('heure', 1)])).toBe(3)
    // « haut » : h aspiré, le e tient.
    expect(compterPieds([encore, t('haut', 1)])).toBe(4)
  })

  /**
   * Les h muets les plus courants commencent par les mêmes lettres que des h
   * aspirés — « ho » ouvre « honneur » (muet) comme « houx » (aspiré). Une
   * liste de préfixes se trompait donc sur la moitié du vocabulaire, sans
   * jamais le dire.
   */
  it('ne classe pas « homme », « honneur » ni « heure » parmi les h aspirés', () => {
    const de = t('Un bouquet de', 4, true)
    for (const muet of ['homme', 'honneur', 'heure', 'histoire']) {
      expect(compterPieds([de, t(muet, 2)]), muet).toBe(5)
    }
    for (const aspire of ['houx vert', 'haut', 'honte']) {
      expect(compterPieds([de, t(aspire, 2)]), aspire).toBe(6)
    }
  })

  it('rend zéro sur un vers vide', () => {
    expect(compterPieds([])).toBe(0)
  })
})

describe('versRecevable', () => {
  const rimeDe = (tuile: Tuile) => (tuile.mot === 'plus longtemps' ? 'ɑ̃' : undefined)

  it('accepte un vers du bon compte et de la bonne rime', () => {
    const vers = [t('Je ne puis', 3), t('demeure', 3, true), t('loin de toi', 3), t('plus longtemps', 3)]
    expect(versRecevable(vers, 12, 'ɑ̃', rimeDe)).toBe(true)
  })

  it('refuse un vers de douze pieds qui ne rime pas', () => {
    // Douze pieds exactement, mais le dernier mot ne porte pas la rime : ce
    // n'est pas un vers du quatrain, c'est une phrase de douze pieds.
    const vers = [t('Je ne puis', 3), t('demeure', 3, true), t('loin de toi', 3), t('sans te voir', 3)]
    expect(compterPieds(vers)).toBe(12)
    expect(versRecevable(vers, 12, 'ɑ̃', rimeDe)).toBe(false)
  })

  it('refuse un vers qui rime mais boite', () => {
    const vers = [t('Je ne puis', 3), t('plus longtemps', 3)]
    expect(versRecevable(vers, 12, 'ɑ̃', rimeDe)).toBe(false)
  })

  it('refuse un vers vide', () => {
    expect(versRecevable([], 12, 'ɑ̃', rimeDe)).toBe(false)
  })
})
