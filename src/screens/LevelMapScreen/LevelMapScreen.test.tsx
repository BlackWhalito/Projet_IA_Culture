import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { LevelMapScreen } from './LevelMapScreen'
import { LEVEL_ART } from './levelArt'
import { useProgressStore } from '../../state/progressStore'

/**
 * Le point à protéger : la carte affiche le tableau d'un niveau, et le
 * verrouillage change ce que le tableau raconte à un lecteur d'écran —
 * décrit quand on peut y jouer, muet (donc décoratif) sous le cadenas.
 *
 * `WatercolorScene` se rend sans erreur ici parce qu'il abandonne quand
 * `getContext('2d')` rend `null`, ce que fait jsdom. Le test couvre donc
 * l'intégration, jamais la peinture elle-même — une image ne se vérifie
 * qu'en la regardant.
 */
function renderCarte() {
  return render(
    <MemoryRouter initialEntries={['/cp']}>
      <Routes>
        <Route path="/:gradeId" element={<LevelMapScreen />} />
      </Routes>
    </MemoryRouter>,
  )
}

const ART_NIVEAU_2 = LEVEL_ART['cp-level-2']

describe('LevelMapScreen', () => {
  beforeEach(() => {
    useProgressStore.getState().resetProgress()
  })

  it('affiche un lien par niveau déverrouillé et un cadenas sur les autres', () => {
    renderCarte()
    expect(screen.getByRole('link', { name: /Niveau 1/ })).toBeInTheDocument()
    expect(screen.getByLabelText('Niveau 2 (verrouillé)')).toBeInTheDocument()
  })

  it('voile le tableau du niveau verrouillé : il ne se décrit plus', () => {
    renderCarte()
    expect(screen.queryByRole('img', { name: ART_NIVEAU_2.alt })).not.toBeInTheDocument()
  })

  it('décrit le tableau dès que le niveau se déverrouille', () => {
    useProgressStore.setState({
      levels: {
        'cp-level-1': {
          levelId: 'cp-level-1',
          completed: true,
          bestScore: 3,
          starRating: 3,
          lastPlayedAt: new Date(0).toISOString(),
        },
      },
    })
    renderCarte()
    expect(screen.getByRole('link', { name: /Niveau 2/ })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: ART_NIVEAU_2.alt })).toBeInTheDocument()
  })

  it("n'exige pas de tableau : un niveau absent du registre s'affiche quand même", () => {
    expect(LEVEL_ART['cp-level-3']).toBeUndefined()
    renderCarte()
    expect(screen.getByLabelText('Niveau 3 (verrouillé)')).toBeInTheDocument()
  })
})
