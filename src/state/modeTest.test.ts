import { beforeEach, describe, expect, it } from 'vitest'
import { useModeTest } from './modeTest'

describe('modeTest', () => {
  beforeEach(() => {
    window.localStorage.clear()
    useModeTest.setState({ actif: false })
  })

  it('est éteint par défaut', () => {
    expect(useModeTest.getState().actif).toBe(false)
  })

  it('se souvient d’un tour à l’autre', () => {
    useModeTest.getState().basculer()
    expect(useModeTest.getState().actif).toBe(true)
    expect(window.localStorage.getItem('jeu-culture-mode-test-v1')).toBe('1')

    useModeTest.getState().basculer()
    expect(useModeTest.getState().actif).toBe(false)
    expect(window.localStorage.getItem('jeu-culture-mode-test-v1')).toBe('0')
  })
})
