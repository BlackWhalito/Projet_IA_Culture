import { describe, expect, it } from 'vitest'
import {
  clampStarRating,
  computeNextMastery,
  computeSessionScore,
  computeStarRating,
} from './scoring'

describe('computeNextMastery', () => {
  it('increases mastery on a correct answer', () => {
    expect(computeNextMastery(50, true)).toBe(70)
  })

  it('decreases mastery on an incorrect answer', () => {
    expect(computeNextMastery(50, false)).toBe(40)
  })

  it('clamps mastery at 100', () => {
    expect(computeNextMastery(90, true)).toBe(100)
  })

  it('clamps mastery at 0', () => {
    expect(computeNextMastery(5, false)).toBe(0)
  })
})

describe('computeStarRating', () => {
  it('returns 0 stars for an empty session', () => {
    expect(computeStarRating(0, 0)).toBe(0)
  })

  it('returns 3 stars at 90% or above', () => {
    expect(computeStarRating(9, 10)).toBe(3)
  })

  it('returns 2 stars at 70% up to 90%', () => {
    expect(computeStarRating(7, 10)).toBe(2)
  })

  it('returns 1 star at 40% up to 70%', () => {
    expect(computeStarRating(4, 10)).toBe(1)
  })

  it('returns 0 stars below 40%', () => {
    expect(computeStarRating(1, 10)).toBe(0)
  })
})

describe('computeSessionScore', () => {
  it('scores nothing for an empty session', () => {
    expect(computeSessionScore([])).toBe(0)
  })

  it('ignores wrong answers entirely', () => {
    expect(computeSessionScore([{ correct: false, timeMs: 100 }])).toBe(0)
  })

  it('awards the full speed bonus for an instant answer', () => {
    expect(computeSessionScore([{ correct: true, timeMs: 0 }])).toBe(150)
  })

  it('awards no speed bonus past the ceiling', () => {
    expect(computeSessionScore([{ correct: true, timeMs: 30_000 }])).toBe(100)
  })

  it('rewards the faster of two identical sessions', () => {
    const fast = computeSessionScore([{ correct: true, timeMs: 2_000 }])
    const slow = computeSessionScore([{ correct: true, timeMs: 9_000 }])
    expect(fast).toBeGreaterThan(slow)
  })

  it('penalises mistakes made along the way', () => {
    const clean = computeSessionScore([{ correct: true, timeMs: 5_000 }])
    const messy = computeSessionScore([{ correct: true, timeMs: 5_000, mistakes: 2 }])
    expect(clean - messy).toBe(30)
  })

  it('never returns a negative score', () => {
    expect(computeSessionScore([{ correct: true, timeMs: 15_000, mistakes: 50 }])).toBe(0)
  })
})

describe('clampStarRating', () => {
  it('leaves a valid rating untouched', () => {
    expect(clampStarRating(0)).toBe(0)
    expect(clampStarRating(2)).toBe(2)
    expect(clampStarRating(3)).toBe(3)
  })

  it('caps a rating above three', () => {
    expect(clampStarRating(99)).toBe(3)
  })

  it('floors a negative rating', () => {
    expect(clampStarRating(-5)).toBe(0)
  })

  it('falls back to zero on anything that is not a number', () => {
    expect(clampStarRating(undefined)).toBe(0)
    expect(clampStarRating(null)).toBe(0)
    expect(clampStarRating('trois')).toBe(0)
    expect(clampStarRating({})).toBe(0)
    expect(clampStarRating(Number.NaN)).toBe(0)
    expect(clampStarRating(Number.POSITIVE_INFINITY)).toBe(0)
  })

  it('keeps the result usable by String.repeat, which is what crashed', () => {
    for (const trafique of [99, -5, 'nope', null]) {
      const stars = clampStarRating(trafique)
      expect(() => '*'.repeat(stars) + '.'.repeat(3 - stars)).not.toThrow()
    }
  })
})
