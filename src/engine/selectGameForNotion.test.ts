import { describe, expect, it } from 'vitest'
import type { Notion } from '../types/content'
import { selectGameForNotion } from './selectGameForNotion'

function makeNotion(games: Notion['games']): Notion {
  return {
    id: 'test-notion',
    gradeId: 'cp',
    domainId: 'sciences',
    difficulty: 1,
    title: 'Test',
    summary: 'Test summary',
    games,
  }
}

describe('selectGameForNotion', () => {
  it('uses the pinned game type when its content exists', () => {
    const notion = makeNotion({
      qcm: { question: 'Q?', choices: ['A', 'B'], correctIndex: 0 },
      match: { pairs: [{ left: 'A', right: 'B' }] },
    })
    const selected = selectGameForNotion(notion, 'qcm')
    expect(selected.gameType).toBe('qcm')
  })

  it('falls back to priority order when no pin is given', () => {
    const notion = makeNotion({
      qcm: { question: 'Q?', choices: ['A', 'B'], correctIndex: 0 },
      match: { pairs: [{ left: 'A', right: 'B' }] },
    })
    const selected = selectGameForNotion(notion)
    expect(selected.gameType).toBe('match')
  })

  it('falls back to an available game type when the pin has no content', () => {
    const notion = makeNotion({
      qcm: { question: 'Q?', choices: ['A', 'B'], correctIndex: 0 },
    })
    const selected = selectGameForNotion(notion, 'match')
    expect(selected.gameType).toBe('qcm')
  })

  it('throws when the notion has no game content at all', () => {
    const notion = makeNotion({})
    expect(() => selectGameForNotion(notion)).toThrow()
  })

  it('picks riviere over qcm when no pin is given', () => {
    const notion = makeNotion({
      qcm: { question: 'Q?', choices: ['A', 'B'], correctIndex: 0 },
      riviere: {
        paniers: [{ id: 'a', label: 'A' }],
        flottants: [{ label: 'x', panierId: 'a' }],
        dureeSec: 10,
        objectif: 1,
      },
    })
    const selected = selectGameForNotion(notion)
    expect(selected.gameType).toBe('riviere')
  })
})
