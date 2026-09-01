import { describe, expect, it } from 'vitest'
import { ALL_NOTIONS, getNotionById } from './notions'
import { ALL_LEVELS } from './levels'
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
  function doublons(ids: string[]): string[] {
    const vus = new Map<string, number>()
    for (const id of ids) vus.set(id, (vus.get(id) ?? 0) + 1)
    return [...vus.entries()].filter(([, n]) => n > 1).map(([id]) => id)
  }

  it('deux notions ne portent jamais le même id', () => {
    const d = doublons(ALL_NOTIONS.map((n) => n.id))
    expect(d, `ids de notions en double : ${d.join(', ')}`).toEqual([])
  })

  it('deux niveaux ne portent jamais le même id', () => {
    // `getLevelById` fait un `find` — le premier gagne — mais la progression est
    // indexée par `levelId` : deux niveaux homonymes partageraient une seule
    // ligne de progression, donc les étoiles de l'un déverrouilleraient l'autre.
    const d = doublons(ALL_LEVELS.map((l) => l.id))
    expect(d, `ids de niveaux en double : ${d.join(', ')}`).toEqual([])
  })

  it('un même niveau ne joue jamais deux fois la même notion', () => {
    // `GameSessionScreen` identifie une entrée de file par sa position ET sa
    // notion. Ce test protège une autre chose : rejouer la même notion dans un
    // niveau la compte deux fois dans le score et la maîtrise, pour un seul
    // apprentissage. Si un jour c'est voulu (découverte puis révision), c'est ce
    // test qu'il faut assouplir sciemment, pas contourner.
    for (const level of ALL_LEVELS) {
      const d = doublons(level.notionIds.map((e) => e.notionId))
      expect(d, `${level.id} joue deux fois : ${d.join(', ')}`).toEqual([])
    }
  })

  it('chaque notionId épinglé dans un niveau existe réellement', () => {
    for (const level of ALL_LEVELS) {
      for (const entry of level.notionIds) {
        expect(getNotionById(entry.notionId), `${level.id} référence ${entry.notionId}`).toBeDefined()
      }
    }
  })

  it('chaque gameType épinglé dans un niveau existe bien dans les jeux de la notion', () => {
    for (const level of ALL_LEVELS) {
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

  it('chaque cible de « Cap sur » référence une zone existante sur sa carte', () => {
    for (const notion of ALL_NOTIONS) {
      const capsur = notion.games.capsur
      if (!capsur) continue
      const zones = ATLAS[capsur.carteId]
      expect(zones, `${notion.id} : carte non prise en charge par ce test ("${capsur.carteId}")`).toBeDefined()
      for (const cibleId of capsur.cibles) {
        expect(zones[cibleId], `${notion.id} : cible "${cibleId}" absente de la carte "${capsur.carteId}"`).toBeDefined()
      }
    }
  })

  it('chaque scénario du Fil des jours se termine par un épilogue filet de sécurité', () => {
    for (const notion of ALL_NOTIONS) {
      const fildesjours = notion.games.fildesjours
      if (!fildesjours) continue
      expect(fildesjours.epilogues.length, `${notion.id} : aucun épilogue`).toBeGreaterThan(0)
      const dernier = fildesjours.epilogues[fildesjours.epilogues.length - 1]
      expect(
        Object.keys(dernier.condition).length,
        `${notion.id} : le dernier épilogue devrait être un filet de sécurité à condition {}`,
      ).toBe(0)
    }
  })

  it('chaque option d\'un scénario du Fil des jours a un texte unique au sein de son étape', () => {
    for (const notion of ALL_NOTIONS) {
      const fildesjours = notion.games.fildesjours
      if (!fildesjours) continue
      fildesjours.etapes.forEach((etape, i) => {
        const textes = etape.options.map((o) => o.texte)
        expect(new Set(textes).size, `${notion.id}, étape ${i} ("${etape.titre}") : textes d'options dupliqués`).toBe(
          textes.length,
        )
      })
    }
  })

  /**
   * Une jauge inconnue se lit comme zéro.
   *
   * `resoudreEpilogue` fait `jauges[id] ?? 0` : une condition qui vise un
   * identifiant inexistant est donc toujours satisfaite, et l'épilogue
   * l'emporte sur tous les autres. C'est arrivé — un épilogue d'échec écrit
   * sur `distance` au lieu de `milles` a rendu les 2187 parties de Colomb
   * perdantes d'un coup, sans que rien ne le signale. Même famille que le
   * repli silencieux de `selectGameForNotion`.
   */
  it('ne fait référence, dans les épilogues, qu\'à des jauges qui existent', () => {
    for (const notion of ALL_NOTIONS) {
      const fildesjours = notion.games.fildesjours
      if (!fildesjours) continue
      const connues = new Set(fildesjours.jauges.map((j) => j.id))
      fildesjours.epilogues.forEach((epilogue, i) => {
        for (const id of Object.keys(epilogue.condition)) {
          expect(connues.has(id), `${notion.id}, épilogue ${i} : jauge inconnue "${id}"`).toBe(true)
        }
      })
    }
  })

  /**
   * Les effets des options souffrent du même défaut : un identifiant mal
   * orthographié crée silencieusement une jauge fantôme que rien n'affiche.
   */
  it('ne fait référence, dans les effets des options, qu\'à des jauges qui existent', () => {
    for (const notion of ALL_NOTIONS) {
      const fildesjours = notion.games.fildesjours
      if (!fildesjours) continue
      const connues = new Set(fildesjours.jauges.map((j) => j.id))
      fildesjours.etapes.forEach((etape, i) => {
        for (const option of etape.options) {
          for (const id of Object.keys(option.effets)) {
            expect(connues.has(id), `${notion.id}, étape ${i} : jauge inconnue "${id}"`).toBe(true)
          }
        }
      })
    }
  })

  /**
   * Un scénario dont aucune partie ne peut être perdue n'est pas un jeu.
   *
   * L'issue est décidée par l'épilogue atteint (champ `echec`) : il faut donc
   * qu'au moins un épilogue d'échec existe, et qu'il soit **atteignable**. Ce
   * test énumère toutes les parties possibles — 729 pour Louis XIV, 2187 pour
   * Colomb — et exige un taux de défaite compris entre 2 et 40 %. En dessous,
   * `correct` est un `true` déguisé ; au-dessus, le scénario punit plus qu'il
   * ne raconte.
   */
  it('laisse perdre entre 2 % et 40 % des parties du Fil des jours', () => {
    for (const notion of ALL_NOTIONS) {
      const contenu = notion.games.fildesjours
      if (!contenu) continue

      const depart: Record<string, number> = {}
      for (const jauge of contenu.jauges) depart[jauge.id] = jauge.depart

      let total = 0
      let perdues = 0
      const parcourir = (etapeIndex: number, jauges: Record<string, number>) => {
        if (etapeIndex === contenu.etapes.length) {
          total += 1
          const fin =
            contenu.epilogues.find((epilogue) =>
              Object.entries(epilogue.condition).every(([id, [min, max]]) => {
                const valeur = jauges[id] ?? 0
                return valeur >= min && valeur <= max
              }),
            ) ?? contenu.epilogues[contenu.epilogues.length - 1]
          if (fin.echec) perdues += 1
          return
        }
        for (const option of contenu.etapes[etapeIndex].options) {
          const suivant = { ...jauges }
          for (const [id, delta] of Object.entries(option.effets)) {
            suivant[id] = Math.min(100, Math.max(0, (suivant[id] ?? 0) + delta))
          }
          parcourir(etapeIndex + 1, suivant)
        }
      }
      parcourir(0, depart)

      const taux = perdues / total
      expect(taux, `${notion.id} : ${perdues} défaites sur ${total} parties`).toBeGreaterThanOrEqual(0.02)
      expect(taux, `${notion.id} : ${perdues} défaites sur ${total} parties`).toBeLessThanOrEqual(0.4)
    }
  })
})
