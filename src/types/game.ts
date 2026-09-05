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
/**
 * « STOP » — l'employé du télégraphe.
 *
 * Le message du client coûte trop cher. Il faut le faire tenir dans un budget
 * de mots, et le destinataire, à l'autre bout, fera **exactement** ce que le
 * papier dira.
 *
 * Ce que la mécanique enseigne, et qu'un questionnaire sur la ponctuation ne
 * peut pas enseigner : quels mots portent une information et lesquels n'en
 * portent pas. On ne le découvre qu'en devant payer — et en voyant le
 * destinataire faire la bêtise.
 */
export interface TelegrammeContent extends AvecConsigne {
  bureau: { qui: string; lieu: string; annee: string; tarif: string }
  messages: {
    /** Le message du client, mot par mot. Les STOP ne sont pas dedans : on les pose. */
    mots: string[]
    /** Nombre de mots payés. Un STOP posé compte dedans. */
    budget: number
    /** Ce que le client veut obtenir. C'est la seule consigne du tour. */
    intention: string
    /** Mots dont la suppression casse le sens, et ce que le destinataire fait alors. */
    porteurs: { index: number; scene: string }[]
    /** Interstices où un STOP est indispensable — index du mot qui le précède. */
    stops: { apres: number; sansLui: string }[]
    /** STOP posés au mauvais endroit dont on connaît la conséquence exacte. */
    stopsFautifs?: { apres: number; scene: string }[]
    /** Servi quand tout est juste. */
    reception: string
    /** La leçon, servie dans tous les cas. */
    revelation: string
    secondes: number
  }[]
}

/**
 * « Maître Renard » — on est le renard, et on n'a que des mots.
 *
 * Deux jauges : la vanité du corbeau, qu'il faut remplir, et sa méfiance, qui
 * monte dès qu'un compliment sonne faux ou arrive trop tôt. Quand la vanité
 * est pleine, un dernier cartouche s'allume — et c'est celui qui gagne la
 * partie qui surprend tout le monde : **ne rien dire.**
 */
export interface FlatterieContent extends AvecConsigne {
  fable: { auteur: string; titre: string; annee: string }
  cible: { nom: string; possede: string; vaniteDepart: number; mefianceDepart: number }
  repliques: {
    id: string
    texte: string
    /** Vers de la fable, ou réplique écrite pour le jeu. Révélé à la fin. */
    authentique: boolean
    vanite: number
    mefiance: number
    /** Effet plein seulement si ces répliques ont déjà été dites. */
    exige?: string[]
    /** Effets dégradés et réaction quand la condition n'est pas remplie. */
    siPrecoce?: { vanite: number; mefiance: number; reaction: string }
    reaction: string
  }[]
  /** S'allume à vanité pleine. C'est ce qui fait ouvrir le bec. */
  declencheur: { texte: string; reaction: string }
  moraleReussite: string
  moraleEchec: string
  secondes: number
}

/**
 * « À rebours » — l'atelier du compositeur.
 *
 * On te demande une liste que tu récites depuis l'école, mais jamais dans le
 * sens où tu l'as apprise. Ce que ça enseigne, et qu'aucun QCM ne peut
 * enseigner : une liste sue par cœur est une **chaîne**, pas un ensemble. On
 * ne sait la parcourir que dans un sens, et l'automatisme répond avant la
 * lecture. Un questionnaire montre les propositions et laisse comparer ; ici
 * il faut **produire** l'ordre.
 *
 * La loyauté du piège tient à deux règles de code, pas de contenu — et c'est
 * la condition posée par le propriétaire : la consigne reste affichée en
 * entier pendant toute la demande, et **le chrono ne démarre qu'au premier
 * tap**. On a toujours le temps de lire, jamais l'excuse de ne pas l'avoir fait.
 */
export interface ARebourseContent extends AvecConsigne {
  atelier: { qui: string; lieu: string; annee: string }
  /**
   * La liste dans son ordre canonique — celui que tout le monde récite.
   * Règle de contenu non négociable : si le joueur ne la connaît pas par cœur,
   * ce n'est plus un piège, c'est une colle.
   */
  suite: { id: string; label: string; couleur?: string }[]
  demandes: {
    /** Affichée en entier, en permanence. Le piège est dans le réflexe. */
    consigne: string
    /** Le fragment de `consigne` à souligner. Doit en être une sous-chaîne exacte. */
    accent: string
    /** Les ids attendus, dans l'ordre. Sous-ensemble possible de `suite`. */
    attendu: string[]
    secondes: number
    /** Comment se dessine le résultat : bandes verticales, horizontales, ou liste. */
    rendu?: 'bandes' | 'bandesH' | 'liste'
    /** Conséquences nommées pour des ordres faux connus. Servies avant le verdict. */
    meprises?: { ordre: string[]; texte: string }[]
    /** Servi quand c'est juste. C'est la récompense. */
    verdict: string
  }[]
}

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

/**
 * « Douze pieds » — on est Hugo devant sa page : trois vers sont écrits, il
 * faut finir le quatrième, en douze pieds exactement et sur la bonne rime.
 *
 * Ce que ça enseigne, et qu'aucun QCM ne peut enseigner : le vers est un
 * **budget de syllabes qu'on dépense à l'unité près**, et le e muet ne se
 * compte qu'en fonction du mot suivant. « Demeure » vaut trois pieds devant
 * une consonne et deux devant une voyelle — la règle ne se constate qu'en
 * assemblant. C'est pour cela que le compteur se recalcule sous les doigts du
 * joueur : la mécanique EST la démonstration.
 */
export interface VersContent extends AvecConsigne {
  auteur: string
  oeuvre: string
  annee: string
  /** Chrono d'une strophe. Il ne tue pas la manche, il plafonne le score. */
  secondesParStrophe?: number
  strophes: {
    /** Les vers déjà écrits, affichés en italique au-dessus de la ligne vide. */
    amont: string[]
    piedsCible: number
    /** Clé de comparaison des rimes. Deux mots riment s'ils partagent la clé. */
    rimeCle: string
    /** Ce qu'on montre au joueur : « [ɑ̃] — comme « m’attends » ». */
    rimeAffichee: string
    /**
     * Les mots disponibles. Aucun ne porte son nombre de pieds à l'écran :
     * c'est au joueur de l'entendre, et c'est là qu'il apprend.
     */
    reserve: {
      mot: string
      pieds: number
      /** Se termine par un e muet : perd un pied devant une voyelle, et en fin de vers. */
      eFinal?: boolean
      /** Absent = ce mot ne peut pas clore le vers. */
      rimeCle?: string
    }[]
    versReel: string
    commentaire: string
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
