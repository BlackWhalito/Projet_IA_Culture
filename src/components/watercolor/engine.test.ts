import { describe, expect, it } from 'vitest'
import { deform, makeRng, polygon, resample } from './engine'

describe('makeRng', () => {
  it('is deterministic for a given seed', () => {
    const a = makeRng(42)
    const b = makeRng(42)
    const seqA = Array.from({ length: 10 }, () => a())
    const seqB = Array.from({ length: 10 }, () => b())
    expect(seqA).toEqual(seqB)
  })

  it('produces different sequences for different seeds', () => {
    const a = makeRng(1)
    const b = makeRng(2)
    expect(a()).not.toBe(b())
  })

  it('stays within [0, 1)', () => {
    const rng = makeRng(7)
    for (let i = 0; i < 200; i += 1) {
      const n = rng()
      expect(n).toBeGreaterThanOrEqual(0)
      expect(n).toBeLessThan(1)
    }
  })
})

describe('polygon', () => {
  it('returns the requested number of points', () => {
    expect(polygon(50, 50, 20, 10, 8)).toHaveLength(8)
  })

  it('without rng, sits exactly on the ellipse', () => {
    const points = polygon(0, 0, 10, 10, 4)
    for (const [x, y] of points) {
      expect(Math.hypot(x, y)).toBeCloseTo(10, 5)
    }
  })

  it('with rng, stays close to the ellipse (jitter is bounded)', () => {
    const rng = makeRng(3)
    const points = polygon(0, 0, 10, 10, 12, 0, rng)
    for (const [x, y] of points) {
      const radius = Math.hypot(x, y)
      expect(radius).toBeGreaterThan(5)
      expect(radius).toBeLessThan(15)
    }
  })

  it('is deterministic for a given seed', () => {
    expect(polygon(0, 0, 10, 10, 6, 0, makeRng(9))).toEqual(polygon(0, 0, 10, 10, 6, 0, makeRng(9)))
  })
})

describe('resample', () => {
  it('leaves a path alone once it already has enough points', () => {
    const path: Array<[number, number]> = [[0, 0], [1, 1], [2, 2], [3, 3]]
    expect(resample(path, 4)).toEqual(path)
  })

  it('pads a 2-point path so a midpoint exists — regression for dryStroke rendering near-invisible straight strokes (mast, hull edge)', () => {
    const path: Array<[number, number]> = [[0, 0], [10, 0]]
    const out = resample(path, 7)
    expect(out).toHaveLength(7)
    expect(out[0]).toEqual([0, 0])
    expect(out[out.length - 1]).toEqual([10, 0])
    // Un point proche du milieu du chemin doit exister : c'est lui qui donne
    // à dryStroke un taper proche de 1 (pleine largeur) au centre du trait.
    const mid = out[3]
    expect(mid[0]).toBeCloseTo(5, 1)
  })

  it('preserves the shape of a bent path (interpolates along segments, not straight across)', () => {
    const path: Array<[number, number]> = [[0, 0], [10, 0], [10, 10]]
    const out = resample(path, 9)
    for (const [x, y] of out) {
      // Chaque point interpolé reste sur l'un des deux segments d'origine.
      const onFirstSegment = y === 0 && x >= 0 && x <= 10
      const onSecondSegment = x === 10 && y >= 0 && y <= 10
      expect(onFirstSegment || onSecondSegment).toBe(true)
    }
  })
})

describe('deform', () => {
  it('subdivides a closed loop: each pass roughly doubles the point count', () => {
    const base = polygon(0, 0, 10, 10, 6)
    const rng = makeRng(5)
    expect(deform(base, 1, 0.1, rng)).toHaveLength(12)
    expect(deform(base, 2, 0.1, rng)).toHaveLength(24)
  })

  it('is deterministic for a given seed', () => {
    const base = polygon(0, 0, 10, 10, 8)
    expect(deform(base, 3, 0.15, makeRng(11))).toEqual(deform(base, 3, 0.15, makeRng(11)))
  })

  it('never produces NaN or infinite coordinates', () => {
    const base = polygon(0, 0, 10, 10, 8)
    const result = deform(base, 4, 0.2, makeRng(13))
    for (const [x, y] of result) {
      expect(Number.isFinite(x)).toBe(true)
      expect(Number.isFinite(y)).toBe(true)
    }
  })
})
