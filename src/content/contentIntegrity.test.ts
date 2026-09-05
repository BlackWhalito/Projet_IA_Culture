import { describe, expect, it } from 'vitest'
import { compterPieds, versRecevable, type Tuile } from '../engine/metrique'
import { compterMots, evaluerMessage } from '../engine/telegramme'
import { dire, issue, type EtatFlatterie } from '../engine/flatterie'
import { chanceAuHasard, memeOrdre } from '../engine/arebours'
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

  /**
   * « Douze pieds » : chaque quatrain doit être gagnable, et le vers de Hugo
   * doit se trouver DANS la réserve.
   *
   * Ce n'est pas une précaution théorique. Une réserve où rien ne tombe sur
   * douze pieds rimés laisse le bouton « Écrire » éteint pour toujours : le
   * joueur cherche jusqu'à ce que la bougie s'éteigne, sans jamais savoir que
   * c'était impossible. Et une réserve soluble d'où le vers réel est absent
   * ment à la révélation, qui affirme « Hugo, lui, a écrit… » à côté de mots
   * qu'on ne pouvait pas assembler.
   *
   * On énumère donc tous les arrangements — les réserves font moins de dix
   * tuiles, c'est instantané — et on vérifie les deux bouts.
   */
  it('rend chaque quatrain de « Douze pieds » gagnable, avec le vers réel dedans', () => {
    /** « Triste, et le jour… » et « triste et le jour » doivent se comparer. */
    const nu = (texte: string) =>
      texte
        .toLowerCase()
        .replace(/[.,;:!?«»…]/g, '')
        .replace(/\s+/g, ' ')
        .trim()

    for (const notion of ALL_NOTIONS) {
      const contenu = notion.games.vers
      if (!contenu) continue

      contenu.strophes.forEach((strophe, rang) => {
        const ou = `${notion.id}, quatrain ${rang + 1}`
        const solutions: string[] = []

        const explorer = (choisis: number[]) => {
          const tuiles = choisis.map((i) => strophe.reserve[i]) as Tuile[]
          if (compterPieds(tuiles) > strophe.piedsCible) return
          if (
            versRecevable(tuiles, strophe.piedsCible, strophe.rimeCle, (tuile) =>
              strophe.reserve.find((mot) => mot.mot === tuile.mot)?.rimeCle,
            )
          ) {
            solutions.push(nu(tuiles.map((tuile) => tuile.mot).join(' ')))
          }
          for (let i = 0; i < strophe.reserve.length; i++) {
            if (choisis.includes(i)) continue
            explorer([...choisis, i])
          }
        }
        explorer([])

        expect(solutions.length, `${ou} : aucune combinaison ne fait ${strophe.piedsCible} pieds sur la rime`).toBeGreaterThan(0)
        expect(solutions, `${ou} : « ${strophe.versReel} » ne s'assemble pas avec cette réserve`).toContain(nu(strophe.versReel))

        // Une réserve trop permissive se gagne par accident, et le peigne
        // n'apprend plus rien. Le seuil est empirique : au-delà, c'est que les
        // tuiles ont toutes la même taille.
        expect(new Set(solutions).size, `${ou} : réserve trop lâche, on tombe sur ${strophe.piedsCible} pieds par hasard`).toBeLessThanOrEqual(60)
      })
    }
  })

  /**
   * « STOP » : chaque message doit être expédiable, et il doit y avoir une
   * décision à prendre.
   *
   * Le premier point n'est pas théorique. Le bouton « Expédier » reste éteint
   * tant que le compte dépasse le tarif : un message dont les mots porteurs et
   * les STOP obligatoires coûtent déjà plus que le budget ne peut **jamais**
   * partir. Le joueur barrerait des mots jusqu'à ce que l'horloge s'épuise,
   * sans savoir que c'était impossible — et le jeu lui compterait une défaite.
   *
   * Le second point attrape l'inverse : un message qu'on gagne en n'y touchant
   * pas. Une décision existe s'il faut couper (le tarif est plus petit que le
   * message complet, STOP compris) ou s'il faut choisir où poser un STOP.
   */
  it('rend chaque message de « STOP » expédiable, et jamais gagnable sans rien faire', () => {
    for (const notion of ALL_NOTIONS) {
      const contenu = notion.games.telegramme
      if (!contenu) continue

      contenu.messages.forEach((message, rang) => {
        const ou = `${notion.id}, message ${rang + 1}`

        for (const p of message.porteurs) {
          expect(p.index, `${ou} : porteur hors du message`).toBeLessThan(message.mots.length)
        }
        const porteurs = message.porteurs.map((p) => p.index)
        for (const s of message.stops) {
          expect(s.apres, `${ou} : STOP attendu hors du message`).toBeLessThan(message.mots.length - 1)
          // Une frontière obligatoire doit se poser derrière un mot qu'on ne
          // peut pas barrer : l'interstice qui suit un mot barré est éteint,
          // donc un STOP attendu derrière un mot sacrifiable serait
          // impossible à poser dès que le joueur barre ce mot-là.
          expect(porteurs, `${ou} : STOP attendu derrière « ${message.mots[s.apres]} », qui n'est pas porteur`)
            .toContain(s.apres)
        }

        // Le message le moins cher qui puisse partir : on garde les porteurs,
        // on pose les STOP obligatoires, on sacrifie tout le reste.
        const gardes = message.porteurs.map((p) => p.index)
        const barres = message.mots.map((_, i) => i).filter((i) => !gardes.includes(i))
        const stops = message.stops.map((s) => s.apres)

        const cout = compterMots(message, barres, stops)
        expect(cout, `${ou} : le message le moins cher coûte ${cout} pour un tarif de ${message.budget}`)
          .toBeLessThanOrEqual(message.budget)
        expect(evaluerMessage(message, barres, stops).recu, `${ou} : refusé alors qu'il est minimal`).toBe(true)

        const complet = message.mots.length + message.stops.length
        const decision = message.budget < complet || (message.stopsFautifs ?? []).length > 0
        expect(decision, `${ou} : rien à couper et aucun STOP à placer, le tour se gagne tout seul`).toBe(true)
      })
    }
  })

  /**
   * « Maître Renard » : la scène doit être gagnable, elle ne doit pas se gagner
   * au hasard, et surtout — c'est la leçon même — **aucune partie gagnante ne
   * doit contenir une phrase que La Fontaine n'a pas écrite.**
   *
   * Cette dernière assertion est le contenu de la fable, pas une préférence de
   * game design : le renard ne nomme jamais le fromage et ne demande jamais au
   * corbeau de chanter. Si un joueur pouvait gagner en le faisant, le jeu
   * enseignerait le contraire de ce qu'il prétend enseigner.
   *
   * On énumère toutes les suites ordonnées de répliques — six répliques, moins
   * de deux mille suites, c'est instantané.
   */
  it('rend « Maître Renard » gagnable, rare, et jamais gagnant sur une phrase apocryphe', () => {
    for (const notion of ALL_NOTIONS) {
      const contenu = notion.games.flatterie
      if (!contenu) continue

      let total = 0
      let gagnantes = 0
      const apocryphes: string[][] = []

      const explorer = (etat: EtatFlatterie, suite: string[]) => {
        total += 1
        if (issue(etat) === 'pret') {
          gagnantes += 1
          const inventees = suite.filter(
            (id) => !contenu.repliques.find((r) => r.id === id)?.authentique,
          )
          if (inventees.length > 0) apocryphes.push(suite)
          return
        }
        if (issue(etat) === 'perdu') return
        for (const replique of contenu.repliques) {
          if (suite.includes(replique.id)) continue
          explorer(dire(etat, replique), [...suite, replique.id])
        }
      }
      explorer(
        {
          vanite: contenu.cible.vaniteDepart,
          mefiance: contenu.cible.mefianceDepart,
          dites: [],
        },
        [],
      )

      expect(gagnantes, `${notion.id} : aucune suite de répliques ne fait ouvrir le bec`).toBeGreaterThan(0)
      expect(gagnantes / total, `${notion.id} : ${gagnantes} suites gagnantes sur ${total}, on gagne au hasard`)
        .toBeLessThan(0.1)
      expect(apocryphes, `${notion.id} : on peut gagner en disant une phrase qui n'est pas de La Fontaine`)
        .toEqual([])
    }
  })

  /**
   * « À rebours » : le piège doit rester loyal, et la manche ingagnable au
   * hasard.
   *
   * Trois vérifications, et chacune répare une façon précise de rendre le jeu
   * malhonnête sans que rien ne casse à l'exécution :
   *
   * - l'`accent` souligné doit être une sous-chaîne EXACTE de la consigne,
   *   sinon le fragment qui porte le piège n'est pas mis en évidence et le
   *   joueur n'a aucun moyen de le voir ;
   * - une « méprise » identique à l'ordre attendu ne se déclencherait jamais,
   *   et signale une erreur de saisie qui prive le joueur de sa conséquence ;
   * - une demande gagnable plus d'une fois sur cinq au hasard ne teste rien.
   */
  it('garde les demandes d’« À rebours » loyales et ingagnables au hasard', () => {
    for (const notion of ALL_NOTIONS) {
      const contenu = notion.games.arebours
      if (!contenu) continue
      const connus = contenu.suite.map((t) => t.id)

      contenu.demandes.forEach((demande, rang) => {
        const ou = `${notion.id}, demande ${rang + 1}`

        expect(demande.consigne, `${ou} : « ${demande.accent} » n'est pas dans la consigne`)
          .toContain(demande.accent)

        for (const id of demande.attendu) {
          expect(connus, `${ou} : « ${id} » attendu mais absent de la suite`).toContain(id)
        }

        for (const meprise of demande.meprises ?? []) {
          expect(meprise.ordre.length, `${ou} : méprise de longueur différente de l'attendu`)
            .toBe(demande.attendu.length)
          for (const id of meprise.ordre) {
            expect(connus, `${ou} : « ${id} » dans une méprise mais absent de la suite`).toContain(id)
          }
          expect(
            memeOrdre(meprise.ordre, demande.attendu),
            `${ou} : une méprise est identique à l'ordre juste, elle ne se déclenchera jamais`,
          ).toBe(false)
        }

        expect(chanceAuHasard(contenu, demande), `${ou} : gagnable au hasard`).toBeLessThan(0.2)
      })
    }
  })
})
