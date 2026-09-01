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

/**
 * La consigne propre à une notion : ce que le joueur doit faire dans **cette**
 * manche, en une phrase impérative.
 *
 * Elle est séparée en deux couches, et c'est ce qui évite de la réécrire
 * quarante fois. Le cadre narratif appartient à la **mécanique** (« Le fleuve
 * charrie des mots. Deux rives, un courant, et il ne repasse pas. ») et vit
 * dans `src/games/consignes.ts` ; seul l'objectif du jour appartient à la
 * **notion** (« Range chaque mot selon son genre. ») et vit dans le contenu.
 *
 * Le champ s'appelle `consigne` et non `objectif` : `RiviereContent` a déjà un
 * `objectif`, qui est un nombre d'objets à classer.
 */
export interface AvecConsigne {
  consigne?: string
}

export interface QcmContent extends AvecConsigne {
  question: string
  choices: string[]
  correctIndex: number
  mode?: 'truefalse' | 'multi'
  timeLimitSec?: number
}

export interface MatchContent extends AvecConsigne {
  pairs: { left: string; right: string; leftImage?: string }[]
}

export interface TimelineContent extends AvecConsigne {
  events: { label: string; sortValue: number; image?: string }[]
}

export interface RiviereContent extends AvecConsigne {
  paniers: { id: string; label: string }[]
  flottants: { label: string; panierId: string }[]
  /** Durée en secondes pour qu'un mot traverse l'écran de haut en bas au démarrage. */
  vitesseInitialeSec: number
  /** Réduction proportionnelle de la durée de chute tous les `PALIER` objets classés (ex: 0.15 = 15% plus rapide). */
  accelerationParPalier: number
  /** Nombre d'objets à classer correctement pour gagner la manche. */
  objectif: number
}

export interface CapSurContent extends AvecConsigne {
  carteId: 'france' | 'europe' | 'monde'
  /** Ids de zones de la carte, dans l'ordre où elles sont demandées. */
  cibles: string[]
  secondesParCible: number
}

export interface FilDesJoursContent extends AvecConsigne {
  personnage: { nom: string; annee: string; role: string }
  jauges: { id: string; label: string; depart: number }[]
  etapes: {
    titre: string
    scene: string
    options: { texte: string; effets: Record<string, number>; consequence: string; historique?: string }[]
  }[]
  epilogues: {
    condition: Record<string, [number, number]>
    texte: string
    /**
     * Marque un dénouement comme une défaite.
     *
     * C'est **l'épilogue** qui décide de l'issue, pas un seuil calculé à côté :
     * sinon le récit et le score se contredisent. C'est exactement ce qui
     * arrivait — le seul chemin perdant de Louis XIV affichait « la galerie
     * s'incline tout entière sur son passage », puis « Pas tout à fait… ».
     */
    echec?: boolean
  }[]
}
