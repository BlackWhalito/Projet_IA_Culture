import { describe, expect, it } from 'vitest'
import { mergePersistedProgress, useProgressStore } from './progressStore'

/**
 * Le contenu du `localStorage` est éditable par le joueur et peut venir d'une
 * version antérieure de l'app. Ces cas ont réellement fait planter la carte des
 * niveaux : `levels` à `null` provoquait un `TypeError` à chaque visite, sans
 * aucun moyen de s'en sortir depuis l'interface.
 */
describe('mergePersistedProgress', () => {
  const current = useProgressStore.getState()

  it('keeps a well-formed persisted progress', () => {
    const persisted = {
      version: 1,
      gradeProgress: { cp: { currentLevelId: 'cp-02' } },
      levels: { 'cp-01': { levelId: 'cp-01', completed: true, starRating: 3, bestScore: 420 } },
      notions: {},
    }

    const merged = mergePersistedProgress(persisted, current)

    expect(merged.levels['cp-01'].bestScore).toBe(420)
    expect(merged.gradeProgress.cp?.currentLevelId).toBe('cp-02')
  })

  it('replaces a null branch with an empty one instead of trusting it', () => {
    const merged = mergePersistedProgress(
      { version: 1, gradeProgress: null, levels: null, notions: null },
      current,
    )

    expect(merged.levels).toEqual({})
    expect(merged.notions).toEqual({})
    expect(merged.gradeProgress).toEqual({})
  })

  it('rejects a branch of the wrong type', () => {
    for (const garbage of ['texte', 42, [], true]) {
      const merged = mergePersistedProgress({ levels: garbage }, current)
      expect(merged.levels).toEqual({})
    }
  })

  it('falls back to the current state when the stored value is not an object', () => {
    for (const garbage of [null, undefined, 'corrompu', 7, []]) {
      expect(mergePersistedProgress(garbage, current)).toBe(current)
    }
  })

  it('keeps the actions callable after a corrupted rehydration', () => {
    const merged = mergePersistedProgress({ levels: null }, current)

    expect(typeof merged.completeLevel).toBe('function')
    expect(typeof merged.resetProgress).toBe('function')
  })
})
