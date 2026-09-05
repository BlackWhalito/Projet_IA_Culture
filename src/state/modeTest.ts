import { create } from 'zustand'

/**
 * Le mode bac à sable.
 *
 * **Ce n'est pas une fonctionnalité de jeu.** C'est un outil pour essayer
 * l'app : il déverrouille tous les niveaux et ajoute un bouton pour passer un
 * jeu sans y répondre, afin d'atteindre en trois taps la mécanique qu'on veut
 * regarder. Sans lui, voir le sixième jeu du niveau 8 demande de gagner
 * trente-huit manches.
 *
 * Deux garde-fous, pour qu'il ne contamine pas le vrai jeu :
 *
 * - il est **éteint par défaut** et se rallume explicitement depuis l'accueil,
 *   jamais par un geste caché qu'on déclencherait sans le vouloir ;
 * - **passer un jeu n'écrit aucune progression.** La manche sautée n'entre pas
 *   dans les résultats du niveau, donc ni le score, ni les étoiles, ni la
 *   maîtrise des notions ne gardent la trace d'un test.
 */
const CLE = 'jeu-culture-mode-test-v1'

function lire(): boolean {
  try {
    return typeof window !== 'undefined' && window.localStorage.getItem(CLE) === '1'
  } catch {
    // Navigation privée, stockage refusé : le mode reste simplement éteint.
    return false
  }
}

function ecrire(actif: boolean): void {
  try {
    window.localStorage.setItem(CLE, actif ? '1' : '0')
  } catch {
    // Sans stockage, le mode vaut pour la session en cours et c'est assez.
  }
}

interface ModeTestState {
  actif: boolean
  basculer: () => void
}

export const useModeTest = create<ModeTestState>((set) => ({
  actif: lire(),
  basculer: () =>
    set((etat) => {
      const suivant = !etat.actif
      ecrire(suivant)
      return { actif: suivant }
    }),
}))
