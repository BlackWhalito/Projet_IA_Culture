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

/**
 * « Entre deux » — on reçoit une carte à la fois et on tape la fente où elle
 * va, parmi celles déjà posées.
 *
 * La forme est restée `timeline`, mais le jeu n'est plus le même. L'ancien
 * demandait d'ordonner trois cartes toutes visibles — et sur la notion de la
 * frise du temps, ces trois cartes étaient « Le passé », « Le présent » et
 * « Le futur » : la réponse était dans les mots.
 *
 * Ici on ne voit jamais la suite, et l'on n'a pas besoin de connaître la date :
 * il suffit de connaître **un voisin**. C'est de la chronologie relative, ce
 * que fait réellement un historien. Et chaque insertion réussie ouvre une fente
 * de plus, donc la chance au hasard s'effondre à mesure qu'on avance : de une
 * sur deux au départ à une sur sept en fin de manche.
 */
export interface TimelineContent extends AvecConsigne {
  events: {
    label: string
    sortValue: number
    image?: string
    /** Affiché quand la carte se pose définitivement. C'est la récompense. */
    repere?: string
  }[]
  /** Cartes déjà en place au départ. 1 par défaut : il faut un premier voisin. */
  cartesDeDepart?: number
  /**
   * Chrono de toute la manche, jamais réinitialisé entre deux cartes : chaque
   * hésitation mange le temps des suivantes. Absent = pas de chrono.
   */
  secondesTotal?: number
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

/**
 * « Je te crois pas » — des affirmations qu'on balaye vrai ou faux, une mise
 * qui double, et le droit d'encaisser avant de tout perdre.
 *
 * Cette mécanique remplace le QCM, et c'est le point : un QCM annonce qu'une
 * des trois propositions est vraie, donc il fait **comparer**. Ici il faut
 * **désavouer** une phrase qui ressemble à ce qu'on dirait soi-même à un dîner.
 * C'est le seul format qui attaque une idée reçue installée.
 */
export interface ChaineContent extends AvecConsigne {
  /**
   * Les affirmations, **dans l'ordre de perfidie croissante** — jamais
   * mélangées. C'est cet ordre qui fait la courbe de la manche : les évidences
   * du début installent la confiance, et la tentation d'encaisser devient
   * maximale exactement au moment où les vrais pièges arrivent.
   */
  affirmations: {
    texte: string
    vrai: boolean
    /**
     * Servi après la réponse, juste ou fausse. Doit dire **pourquoi c'était
     * tentant**, pas seulement ce qui est vrai : c'est là que loge tout
     * l'apprentissage de cette mécanique.
     */
    verdict: string
  }[]
  /** Temps de réflexion par carte. Au-delà, la carte compte comme ratée. */
  secondesParCarte: number
}

/**
 * « La virgule qui sauve » — on pose la ponctuation qui donne à une phrase le
 * sens qu'on nous commande, sachant que la même suite de mots peut dire
 * l'inverse.
 *
 * La ponctuation n'est pas de la décoration de fin de phrase : c'est un
 * **opérateur de sens**. Le QCM que cette mécanique remplace demandait « quel
 * signe termine une phrase interrogative ? » — question à laquelle personne
 * n'a jamais répondu faux. Ce qu'un adulte a réellement oublié, c'est que la
 * virgule décide **qui fait quoi à qui**, et qu'un signe final change l'acte de
 * langage : on informe, on demande, ou on ordonne.
 *
 * Un QCM ne peut pas l'enseigner, parce qu'il faudrait voir la phrase
 * basculer. Ici c'est le geste même : on pose la virgule, et la paraphrase du
 * sens se réécrit sous les yeux **avant** toute validation.
 */
export interface PonctuationContent extends AvecConsigne {
  atelier: { qui: string; lieu: string; annee?: string }
  cas: {
    mots: string[]
    /** Indices des mots après lesquels une fente s'ouvre. */
    fentes: number[]
    /** Le cycle proposé, dans l'ordre. Un tap avance d'un cran, et `null` boucle. */
    signes: string[]
    /** Le sens qu'on demande au joueur de produire. */
    commande: string
    /** La configuration attendue, de même longueur que `fentes`. */
    attendu: (string | null)[]
    /**
     * Les paraphrases affichées **en direct**, dès que la configuration
     * courante correspond. C'est le cœur du plaisir : on voit le sens basculer
     * avant de valider.
     */
    lectures: { config: (string | null)[]; texte: string }[]
    /** Ce qu'on aurait obtenu à une virgule près. Servi après la validation. */
    adverse: string
    secondes: number
  }[]
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
