import { describe, expect, it } from 'vitest'
import { ALL_NOTIONS, getNotionById } from './notions'
import { CP_LEVELS } from './levels/cp-levels'
import { FRANCE_ZONES_BY_ID } from './maps/france'
import { EUROPE_ZONES_BY_ID } from './maps/europe'
import type { MapZone } from '../types/maps'

const ATLAS: Record<string, Record<string, MapZone>> = {
  france: FRANCE_ZONES_BY_ID,
  europe: EUROPE_ZONES_BY_ID,
}

/**
 * Garde-fous sur le contenu, pas sur le moteur (déjà testé dans `src/engine/`). Ces
 * invariants ne cassent pas la compilation s'ils sont violés — seule une relecture
 * attentive ou ce test les attrape avant qu'ils ne produisent un écran cassé ou une
 * mécanique qui retombe silencieusement sur une autre (voir la skill `nouvelle-mecanique`).
 */
describe('intégrité du contenu', () => {
  it('chaque notionId épinglé dans un niveau existe réellement', () => {
    for (const level of CP_LEVELS) {
      for (const entry of level.notionIds) {
        expect(getNotionById(entry.notionId), `${level.id} référence ${entry.notionId}`).toBeDefined()
      }
    }
  })

  it('chaque gameType épinglé dans un niveau existe bien dans les jeux de la notion', () => {
    for (const level of CP_LEVELS) {
      for (const entry of level.notionIds) {
        if (!entry.gameType) continue
        const notion = getNotionById(entry.notionId)
        expect(
          notion?.games[entry.gameType],
          `${level.id} épingle ${entry.gameType} sur ${entry.notionId}, absent de ses jeux`,
        ).toBeDefined()
      }
    }
  })

  it('chaque cible mapclick référence une zone existante sur sa carte', () => {
    for (const notion of ALL_NOTIONS) {
      const mapclick = notion.games.mapclick
      if (!mapclick) continue
      const zones = ATLAS[mapclick.carteId]
      expect(zones, `${notion.id} : carte non prise en charge par ce test ("${mapclick.carteId}")`).toBeDefined()
      for (const cibleId of mapclick.cibles) {
        expect(zones[cibleId], `${notion.id} : cible "${cibleId}" absente de la carte "${mapclick.carteId}"`).toBeDefined()
      }
    }
  })

  it('chaque scénario incarnation se termine par un épilogue filet de sécurité', () => {
    for (const notion of ALL_NOTIONS) {
      const incarnation = notion.games.incarnation
      if (!incarnation) continue
      expect(incarnation.epilogues.length, `${notion.id} : aucun épilogue`).toBeGreaterThan(0)
      const dernier = incarnation.epilogues[incarnation.epilogues.length - 1]
      expect(
        Object.keys(dernier.condition).length,
        `${notion.id} : le dernier épilogue devrait être un filet de sécurité à condition {}`,
      ).toBe(0)
    }
  })

  it('chaque option d\'un scénario incarnation a un texte unique au sein de son étape', () => {
    for (const notion of ALL_NOTIONS) {
      const incarnation = notion.games.incarnation
      if (!incarnation) continue
      incarnation.etapes.forEach((etape, i) => {
        const textes = etape.options.map((o) => o.texte)
        expect(new Set(textes).size, `${notion.id}, étape ${i} ("${etape.titre}") : textes d'options dupliqués`).toBe(
          textes.length,
        )
      })
    }
  })
})
