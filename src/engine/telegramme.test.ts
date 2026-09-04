import { describe, expect, it } from 'vitest'
import { compterMots, evaluerMessage } from './telegramme'
import type { TelegrammeContent } from '../types/game'

const MESSAGE: TelegrammeContent['messages'][number] = {
  mots: ['GRACIER', 'IMPOSSIBLE', 'ENVOYER', 'AU', 'BAGNE'],
  budget: 6,
  intention: 'Le condamné doit être gracié.',
  porteurs: [
    { index: 0, scene: 'Sans « GRACIER », il ne reste qu’un ordre : au bagne.' },
    { index: 4, scene: 'Au bagne où ? Le greffier attend.' },
  ],
  stops: [{ apres: 0, sansLui: 'Sans le STOP, les deux ordres se soudent.' }],
  stopsFautifs: [
    { apres: 1, scene: 'Le STOP après « IMPOSSIBLE » dit l’inverse : il part au bagne.' },
  ],
  reception: 'Le condamné est gracié.',
  revelation: 'Cinq mots, deux ordres opposés. Seule la place du STOP les sépare.',
  secondes: 45,
}

describe('compterMots', () => {
  it('facture les mots gardés et chaque STOP posé', () => {
    expect(compterMots(MESSAGE, [], [])).toBe(5)
    expect(compterMots(MESSAGE, [], [0])).toBe(6)
    expect(compterMots(MESSAGE, [3], [0])).toBe(5)
  })
})

describe('evaluerMessage', () => {
  it('reçoit le message quand tout est juste', () => {
    expect(evaluerMessage(MESSAGE, [], [0])).toEqual({ recu: true, scene: MESSAGE.reception })
  })

  it('refuse quand un mot porteur a été sacrifié, et dit ce que ça fait', () => {
    const v = evaluerMessage(MESSAGE, [0], [0])
    expect(v.recu).toBe(false)
    expect(v.scene).toMatch(/au bagne/)
  })

  it('refuse quand la frontière entre deux ordres n’est pas marquée', () => {
    expect(evaluerMessage(MESSAGE, [], [])).toEqual({
      recu: false,
      scene: 'Sans le STOP, les deux ordres se soudent.',
    })
  })

  /**
   * Le cœur de la mécanique : les mêmes cinq mots, le même prix, et le STOP
   * déplacé d'un cran donne l'ordre inverse. C'est ce qu'aucun questionnaire
   * sur le point ne peut faire ressentir.
   */
  it('refuse un STOP posé là où il inverse le sens', () => {
    const v = evaluerMessage(MESSAGE, [], [1])
    expect(v.recu).toBe(false)
    expect(v.scene).toMatch(/l’inverse/)
  })

  /**
   * Un STOP de plus à un endroit anodin ne casse rien : il coûte un mot, et
   * c'est là toute sa punition. Encore faut-il l'avoir payé — ici en
   * sacrifiant « AU », qui n'est pas porteur.
   */
  it('tolère un STOP surnuméraire inoffensif, s’il tient dans le tarif', () => {
    expect(compterMots(MESSAGE, [3], [0, 2])).toBe(6)
    expect(evaluerMessage(MESSAGE, [3], [0, 2]).recu).toBe(true)

    // Le même STOP, sans avoir fait de place : refusé pour son prix, pas pour
    // son sens.
    const trop = evaluerMessage(MESSAGE, [], [0, 2])
    expect(trop.recu).toBe(false)
    expect(trop.scene).toMatch(/tarif/)
  })

  it('signale le mot porteur avant la ponctuation : c’est ce qu’on voit en premier', () => {
    const v = evaluerMessage(MESSAGE, [4], [])
    expect(v.scene).toMatch(/Au bagne où/)
  })

  /**
   * Le trou trouvé en écrivant les tests du composant : à l'expiration de
   * l'horloge la dépêche part sans passer par le bouton « Expédier ». Sans ce
   * contrôle, on gagnait la manche en ne touchant à rien et en attendant — le
   * message du client était intact, donc juste.
   */
  it('refuse une dépêche qui dépasse le tarif, même intacte', () => {
    const v = evaluerMessage(MESSAGE, [], [0, 2, 3])
    expect(v.recu).toBe(false)
    expect(v.scene).toMatch(/8 mots pour un tarif de 6/)
  })
})
