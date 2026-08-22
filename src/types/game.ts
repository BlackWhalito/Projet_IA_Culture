/**
 * Le contrat de sortie d'une mécanique, et les formes de contenu qui l'alimentent.
 *
 * Ce contrat vit ici, et pas dans `src/games/`, parce qu'il est lu par des
 * couches qui ne doivent rien savoir de l'interface : le moteur de score et le
 * magasin de progression. Quand il vivait à côté des composants,
 * `src/engine/scoring.ts` avait dû redéclarer sa propre copie de la même forme
 * pour éviter de dépendre du dossier des jeux — deux vérités pour un seul
 * contrat, exactement ce que ce déplacement supprime.
 */
export interface GameCompleteResult {
  correct: boolean
  timeMs: number
  /** Erreurs commises avant d'aboutir, pour les mécaniques qui laissent réessayer. */
  mistakes?: number
  /** Meilleure série de bonnes réponses consécutives dans la manche. */
  streak?: number
}

export interface NotionResult extends GameCompleteResult {
  notionId: string
}

export interface QcmContent {
  question: string
  choices: string[]
  correctIndex: number
  mode?: 'truefalse' | 'multi'
  timeLimitSec?: number
}

export interface MatchContent {
  pairs: { left: string; right: string; leftImage?: string }[]
}

export interface TimelineContent {
  events: { label: string; sortValue: number; image?: string }[]
}

export interface RiviereContent {
  paniers: { id: string; label: string }[]
  flottants: { label: string; panierId: string }[]
  /** Durée en secondes pour qu'un mot traverse l'écran de haut en bas au démarrage. */
  vitesseInitialeSec: number
  /** Réduction proportionnelle de la durée de chute tous les `PALIER` objets classés (ex: 0.15 = 15% plus rapide). */
  accelerationParPalier: number
  /** Nombre d'objets à classer correctement pour gagner la manche. */
  objectif: number
}

export interface CapSurContent {
  carteId: 'france' | 'europe' | 'monde'
  /** Ids de zones de la carte, dans l'ordre où elles sont demandées. */
  cibles: string[]
  /**
   * Consigne personnalisée par id de zone ciblée, pour poser une question de
   * raisonnement (« la ville la plus au nord ») plutôt que de mémorisation du
   * nom. Zone absente de la map = repli sur `Trouve : {label}`, le
   * comportement historique.
   */
  clues?: Record<string, string>
  secondesParCible: number
}

export interface FilDesJoursContent {
  personnage: { nom: string; annee: string; role: string }
  /**
   * Explique au joueur, avant de commencer, les forces en jeu — typiquement que
   * les jauges s'opposent et ne montent jamais ensemble. Sans cette règle, le
   * joueur cherche « la bonne réponse » d'un QCM, ne la trouve pas, et se sent
   * perdu : les options ne sont pas classées bonnes ou mauvaises, elles arbitrent.
   */
  regle: string
  jauges: {
    id: string
    label: string
    depart: number
    /** Si vrai, cette jauge tombée à 0 termine la partie en échec immédiat. */
    critique?: boolean
  }[]
  /** Scène affichée quand une jauge `critique` tombe à 0 — la partie s'arrête là. */
  echec: string
  etapes: {
    titre: string
    scene: string
    options: { texte: string; effets: Record<string, number>; consequence: string; historique?: string }[]
  }[]
  epilogues: { condition: Record<string, [number, number]>; texte: string }[]
}
