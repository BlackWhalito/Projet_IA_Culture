import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { LevelMapScreen } from './LevelMapScreen'
import { LEVEL_ART } from './levelArt'
import { getLevelsByGrade } from '../../content/levels'
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
const ART_NIVEAU_4 = LEVEL_ART['cp-level-4']

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

  it('rend chaque tableau du registre, y compris plus loin dans la carte', () => {
    useProgressStore.setState({
      levels: Object.fromEntries(
        ['cp-level-1', 'cp-level-2', 'cp-level-3'].map((levelId) => [
          levelId,
          {
            levelId,
            completed: true,
            bestScore: 3,
            starRating: 3,
            lastPlayedAt: new Date(0).toISOString(),
          },
        ]),
      ),
    })
    renderCarte()
    expect(screen.getByRole('img', { name: ART_NIVEAU_2.alt })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: ART_NIVEAU_4.alt })).toBeInTheDocument()
    // Les deux tableaux sont bien distincts : le fort au Niveau 2, le
    // palais au Niveau 4. Les intervertir passerait tous les autres tests.
    expect(ART_NIVEAU_2.paint).not.toBe(ART_NIVEAU_4.paint)
  })

  it('donne un tableau distinct à chaque niveau du CP', () => {
    const levels = getLevelsByGrade('cp')
    expect(levels.length).toBeGreaterThan(0)
    for (const level of levels) {
      expect(LEVEL_ART[level.id], `${level.id} n'a pas de tableau`).toBeDefined()
    }
    // Deux niveaux qui partagent une peinture, une graine ou une
    // description passeraient tous les autres tests sans qu'on le voie :
    // la carte afficherait simplement deux fois la même image.
    for (const champ of ['paint', 'seed', 'alt'] as const) {
      const valeurs = levels.map((level) => LEVEL_ART[level.id][champ])
      expect(new Set(valeurs).size, `deux niveaux partagent le même ${champ}`).toBe(levels.length)
    }
  })

  it("n'exige pas de tableau : un niveau absent du registre reste jouable", () => {
    // Le registre est volontairement facultatif — un niveau scolaire neuf
    // doit pouvoir arriver sans qu'on ait peint quoi que ce soit.
    expect(LEVEL_ART['ce1-level-1']).toBeUndefined()
    renderCarte()
    expect(screen.getByRole('link', { name: /Niveau 1/ })).toBeInTheDocument()
  })
})
