import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { GameSessionScreen } from './GameSessionScreen'
import { getLevelById } from '../../content/levels'
import { getNotionById } from '../../content/notions'
import { useProgressStore } from '../../state/progressStore'
import type { RiviereContent, CapSurContent } from '../../types/game'

/**
 * Le parcours réel du Niveau 1 refondu, joué de bout en bout avec le contenu
 * effectivement livré aux joueurs — pas un contenu de synthèse. C'est le
 * substitut du navigateur prescrit par `docs/niveau-1.md` : aucun outil de
 * preview n'existe dans cette session, donc ce test est la seule vérification
 * que les quatre mécaniques du niveau se déclenchent, se jouent et concluent
 * correctement une fois assemblées par `selectGameForNotion` et `GameRouter`.
 * Il ne prouve pas le rendu visuel (aquarelle, mise en page, tailles tactiles) :
 * ça reste non vérifié.
 */

const NIVEAU_1 = getLevelById('cp-level-1')!

describe('Niveau 1 — parcours complet avec le vrai contenu', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    useProgressStore.getState().resetProgress()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('se compose bien de 4 créneaux, sans QCM en découverte', () => {
    expect(NIVEAU_1.notionIds).toHaveLength(4)
    const mecaniques = NIVEAU_1.notionIds.map((n) => n.gameType)
    // Deux Rivières (masculin/féminin, états de l'eau) plutôt qu'une par
    // mécanique : le `match` qui portait les états de l'eau associait des
    // paires déjà résolues (« Glace → eau liquide ») sans rien à
    // comprendre, jugé pas fun par le propriétaire et remplacé par une
    // Rivière à scénarios. Ce n'est pas une règle du projet qu'un niveau
    // n'utilise jamais deux fois la même mécanique (les niveaux 2 et 3 le
    // font déjà) — seulement un hasard de la petite taille du Niveau 1.
    expect(mecaniques).toEqual(['riviere', 'riviere', 'capsur', 'fildesjours'])
  })

  it('joue le Niveau 1 en entier, une bonne et une mauvaise réponse par mécanique, et enregistre la progression', () => {
    render(
      <MemoryRouter>
        <GameSessionScreen
          gradeId="cp"
          levelId={NIVEAU_1.id}
          title={NIVEAU_1.title}
          queue={NIVEAU_1.notionIds}
        />
      </MemoryRouter>,
    )

    // ---- Créneau 1 : La Rivière — masculin/féminin ----
    const masculinFeminin = getNotionById('cp-francais-masculin-feminin')!
    const riviere = masculinFeminin.games.riviere as RiviereContent
    const panierLabels = new Set(riviere.paniers.map((p) => p.label))

    // Écran de règle avant le premier mot.
    expect(screen.getByText(riviere.regle!)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Commencer' }))

    // Le mot n'est plus un bouton : un seul tap suffit, directement sur le
    // panier. On le retrouve donc par son texte affiché dans la piste.
    function motActuel(): string {
      return riviere.flottants.map((f) => f.label).find((label) => screen.queryByText(label))!
    }
    function panierCorrectPour(mot: string): string {
      const flottant = riviere.flottants.find((f) => f.label === mot)!
      return riviere.paniers.find((p) => p.id === flottant.panierId)!.label
    }

    // Une mauvaise réponse volontaire, puis l'objectif atteint. Une erreur ne
    // bloque plus sur le même mot : elle coûte du temps et casse la série.
    const bonPanier = panierCorrectPour(motActuel())
    const mauvaisPanier = [...panierLabels].find((l) => l !== bonPanier)!
    fireEvent.click(screen.getByRole('button', { name: mauvaisPanier }))

    for (let i = 0; i < riviere.objectif; i++) {
      fireEvent.click(screen.getByRole('button', { name: panierCorrectPour(motActuel()) }))
    }
    act(() => {
      vi.advanceTimersByTime(400)
    })
    expect(screen.getByText(masculinFeminin.title)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Continuer' }))

    // ---- Créneau 2 : La Rivière — les états de l'eau ----
    const etatsEau = getNotionById('cp-sciences-etats-eau')!
    const riviereEtatsEau = etatsEau.games.riviere as RiviereContent
    const panierLabelsEtatsEau = new Set(riviereEtatsEau.paniers.map((p) => p.label))

    // Écran de règle avant la première scène : ce créneau en a un, contrairement
    // à masculin/féminin dans ce test — vérifie que « Commencer » le quitte bien.
    expect(screen.getByText(riviereEtatsEau.regle!)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Commencer' }))

    function sceneActuelle(): string {
      return riviereEtatsEau.flottants.map((f) => f.label).find((label) => screen.queryByText(label))!
    }
    function panierCorrectPourScene(scene: string): string {
      const flottant = riviereEtatsEau.flottants.find((f) => f.label === scene)!
      return riviereEtatsEau.paniers.find((p) => p.id === flottant.panierId)!.label
    }

    // Une mauvaise réponse volontaire, puis l'objectif atteint.
    const bonPanierScene = panierCorrectPourScene(sceneActuelle())
    const mauvaisPanierScene = [...panierLabelsEtatsEau].find((l) => l !== bonPanierScene)!
    fireEvent.click(screen.getByRole('button', { name: mauvaisPanierScene }))

    for (let i = 0; i < riviereEtatsEau.objectif; i++) {
      fireEvent.click(screen.getByRole('button', { name: panierCorrectPourScene(sceneActuelle()) }))
    }
    act(() => {
      vi.advanceTimersByTime(400)
    })
    expect(screen.getByText(etatsEau.title)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Continuer' }))

    // ---- Créneau 3 : Cap sur — les points cardinaux ----
    const pointsCardinaux = getNotionById('cp-geographie-points-cardinaux')!
    const capsur = pointsCardinaux.games.capsur as CapSurContent
    const clues = capsur.clues!
    // clueTexte -> id de zone, pour retrouver la bonne ville quelle que soit
    // la consigne affichée (les cibles sont mélangées à chaque partie).
    const zoneParClue = new Map(Object.entries(clues).map(([zoneId, clue]) => [clue, zoneId]))
    const labelParZoneId: Record<string, string> = {
      lille: 'Lille',
      marseille: 'Marseille',
      rennes: 'Rennes',
      strasbourg: 'Strasbourg',
    }

    function consigneActuelle(): string {
      return screen.getByText(new RegExp(`^(${[...zoneParClue.keys()].join('|')})$`)).textContent!
    }

    // Cible 1 : une mauvaise réponse volontaire.
    const premiereConsigne = consigneActuelle()
    const premiereZoneId = zoneParClue.get(premiereConsigne)!
    const mauvaiseVille = Object.values(labelParZoneId).find((label) => label !== labelParZoneId[premiereZoneId])!
    fireEvent.click(screen.getByRole('button', { name: mauvaiseVille }))
    fireEvent.click(screen.getByRole('button', { name: 'Continuer' }))

    // Les 3 cibles restantes, toutes correctes.
    for (let i = 1; i < capsur.cibles.length; i++) {
      const consigne = consigneActuelle()
      const zoneId = zoneParClue.get(consigne)!
      fireEvent.click(screen.getByRole('button', { name: labelParZoneId[zoneId] }))
      fireEvent.click(screen.getByRole('button', { name: 'Continuer' }))
    }
    expect(screen.getByText(pointsCardinaux.title)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Continuer' }))

    // ---- Créneau 4 : Le Fil des jours — Louis XIV ----
    const louisXIV = getNotionById('cp-histoire-louis-xiv')!
    fireEvent.click(screen.getByRole('button', { name: 'Commencer' }))

    // Un chemin qui garde les deux jauges au-dessus de 0 tout du long — vérifié
    // à la main sur les effets réels du contenu, pour atteindre l'épilogue
    // plutôt que l'échec (le chemin d'échec est déjà couvert par
    // FilDesJoursGame.test.tsx sur un scénario de synthèse).
    const choixSurs = [
      "Faire entrer d'abord les favoris, pour prendre des nouvelles en s'habillant",
      "Faire réciter l'office à voix haute, pour que la chambre entière l'entende",
      'Demander à un favori présent son avis sur la perruque à porter',
      'Choisir un courtisan fidèle depuis longtemps, sans faire de vagues',
      "Confier l'honneur au duc de Bourgogne, le petit-fils présent",
      "Se faire accompagner par les princes présents jusqu'à la sortie",
    ]
    for (const choix of choixSurs) {
      fireEvent.click(screen.getByRole('button', { name: choix }))
      fireEvent.click(screen.getByRole('button', { name: 'Continuer' }))
    }
    expect(screen.getByText('Épilogue')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Terminer' }))

    expect(screen.getByText(louisXIV.title)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Continuer' }))

    // ---- Fin de session : résumé, puis persistance ----
    expect(screen.getByText('4 / 4 bonnes réponses')).toBeInTheDocument()

    const progression = useProgressStore.getState()
    expect(progression.levels[NIVEAU_1.id].completed).toBe(true)
    expect(progression.notions['cp-francais-masculin-feminin'].timesPlayed).toBe(1)
    expect(progression.notions['cp-sciences-etats-eau'].timesPlayed).toBe(1)
    expect(progression.notions['cp-geographie-points-cardinaux'].timesPlayed).toBe(1)
    expect(progression.notions['cp-histoire-louis-xiv'].timesPlayed).toBe(1)
  })
})
