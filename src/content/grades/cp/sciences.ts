import type { Notion } from '../../../types/content'

export const CP_SCIENCES: Notion[] = [
  {
    id: 'cp-sciences-cinq-sens',
    gradeId: 'cp',
    domainId: 'sciences',
    difficulty: 1,
    title: 'Les 5 sens',
    summary: 'Le corps humain perçoit le monde grâce à 5 sens.',
    funFact: 'La peau, organe du toucher, est le plus grand organe du corps humain.',
    games: {
      match: {
        pairs: [
          { left: 'La vue', right: 'Les yeux' },
          { left: "L'ouïe", right: 'Les oreilles' },
          { left: "L'odorat", right: 'Le nez' },
          { left: 'Le goût', right: 'La langue' },
          { left: 'Le toucher', right: 'La peau' },
        ],
      },
      qcm: {
        question: 'Avec quel organe sent-on les odeurs ?',
        choices: ['Le nez', 'La langue', 'La peau'],
        correctIndex: 0,
      },
    },
  },
  {
    id: 'cp-sciences-cycle-papillon',
    gradeId: 'cp',
    domainId: 'sciences',
    difficulty: 2,
    title: 'Le cycle de vie du papillon',
    summary: 'Le papillon se transforme plusieurs fois avant de voler.',
    funFact: "À l'intérieur de la chrysalide, la chenille se transforme presque entièrement.",
    games: {
      timeline: {
        events: [
          { label: 'Œuf', sortValue: 1 },
          { label: 'Chenille', sortValue: 2 },
          { label: 'Chrysalide', sortValue: 3 },
          { label: 'Papillon', sortValue: 4 },
        ],
      },
      qcm: {
        question: 'Que devient la chenille avant de devenir papillon ?',
        choices: ['Une chrysalide', 'Un œuf', 'Une fourmi'],
        correctIndex: 0,
      },
    },
  },
  {
    id: 'cp-sciences-etats-eau',
    gradeId: 'cp',
    domainId: 'sciences',
    difficulty: 1,
    title: "Les 3 états de l'eau",
    summary: "L'eau peut être solide, liquide ou gazeuse — et chaque passage d'un état à l'autre porte un nom savant précis, pas seulement « ça fond » ou « ça s'évapore ».",
    funFact:
      "La vapeur d'eau est invisible : le nuage blanc qu'on voit au-dessus d'une casserole est déjà de la buée, c'est-à-dire de l'eau redevenue liquide — la liquéfaction. Ce mot est justement celui qu'on confond avec « condensation », que les scientifiques réservent au passage direct du gaz au solide, l'inverse exact de la sublimation : c'est elle qui sèche le linge étendu dehors par grand froid, la glace des fibres se changeant directement en vapeur sans jamais redevenir liquide.",
    games: {
      riviere: {
        // Le `match` qui portait cette notion faisait deviner un mot savant à
        // partir d'une flèche déjà résolue (« Glace → eau liquide ») : une
        // recherche visuelle sans compréhension, jugée pas fun par le
        // propriétaire. Ici, chaque étiquette est une scène brute — le
        // joueur reconstruit lui-même quel changement d'état est en train de
        // se produire, sous le chrono de la Rivière. Fiche du game-designer,
        // deux scènes de linge volontairement en miroir (mouillé qui sèche
        // au vent vs gelé qui sèche sans fondre) pour forcer la vraie
        // distinction vaporisation/sublimation du `funFact`, pas la
        // reconnaissance d'un mot-clé.
        regle:
          "Chaque phrase raconte une scène avec de l'eau : devine vite quel changement d'état est en train de se produire.",
        paniers: [
          { id: 'fusion', label: 'Fusion' },
          { id: 'solidification', label: 'Solidification' },
          { id: 'vaporisation', label: 'Vaporisation' },
          { id: 'liquefaction', label: 'Liquéfaction' },
          { id: 'sublimation', label: 'Sublimation' },
        ],
        flottants: [
          { label: 'Le glaçon fond', panierId: 'fusion' },
          { label: 'La glace devient eau', panierId: 'fusion' },
          { label: "L'eau gèle", panierId: 'solidification' },
          { label: 'La flaque gèle la nuit', panierId: 'solidification' },
          { label: "L'eau bout", panierId: 'vaporisation' },
          { label: 'Le linge sèche au vent', panierId: 'vaporisation' },
          { label: 'La buée sur la vitre', panierId: 'liquefaction' },
          { label: "Les lunettes s'embuent", panierId: 'liquefaction' },
          { label: 'Le linge gelé sèche dehors', panierId: 'sublimation' },
          { label: 'Le givre sèche sans fondre', panierId: 'sublimation' },
        ],
        vitesseInitialeSec: 5.5,
        accelerationParPalier: 0.15,
        objectif: 10,
      },
      qcm: {
        question: "Comment s'appelle l'eau à l'état solide ?",
        choices: ['La glace', 'La vapeur', 'La pluie'],
        correctIndex: 0,
      },
    },
  },
  {
    id: 'cp-sciences-cycle-plante',
    gradeId: 'cp',
    domainId: 'sciences',
    difficulty: 2,
    title: "Le cycle de vie d'une plante",
    summary: "Une plante passe par plusieurs étapes, de la graine au fruit.",
    funFact: "Certaines graines peuvent attendre des dizaines d'années dans le sol avant de germer.",
    games: {
      timeline: {
        events: [
          { label: 'Graine', sortValue: 1 },
          { label: 'Pousse', sortValue: 2 },
          { label: 'Fleur', sortValue: 3 },
          { label: 'Fruit', sortValue: 4 },
        ],
      },
      qcm: {
        question: "Qu'est-ce qui vient juste après la graine dans la vie d'une plante ?",
        choices: ['La pousse', 'Le fruit', 'La fleur'],
        correctIndex: 0,
      },
    },
  },
  {
    id: 'cp-sciences-jour-nuit',
    gradeId: 'cp',
    domainId: 'sciences',
    difficulty: 2,
    title: 'Le jour et la nuit',
    summary: "Le jour et la nuit alternent à cause du mouvement de la Terre.",
    funFact: "La Terre fait un tour complet sur elle-même en environ 24 heures : c'est ce qui crée le jour et la nuit.",
    games: {
      qcm: {
        question: 'Pourquoi fait-il tour à tour jour puis nuit ?',
        choices: ['La Terre tourne sur elle-même', 'Le Soleil se déplace autour de la Terre', 'La Lune cache le Soleil'],
        correctIndex: 0,
      },
    },
  },
  {
    id: 'cp-sciences-quatre-saisons',
    gradeId: 'cp',
    domainId: 'sciences',
    difficulty: 1,
    title: 'Les 4 saisons',
    summary: "L'année est découpée en 4 saisons : printemps, été, automne, hiver.",
    funFact: 'Les saisons sont inversées entre le Nord et le Sud de la planète : quand il fait hiver en France, on est en été en Australie.',
    games: {
      riviere: {
        paniers: [
          { id: 'printemps', label: 'Printemps' },
          { id: 'ete', label: 'Été' },
          { id: 'automne', label: 'Automne' },
          { id: 'hiver', label: 'Hiver' },
        ],
        flottants: [
          { label: 'Les fleurs poussent', panierId: 'printemps' },
          { label: 'On va à la plage', panierId: 'ete' },
          { label: 'Les feuilles tombent', panierId: 'automne' },
          { label: 'Il neige', panierId: 'hiver' },
          { label: 'Les oiseaux reviennent', panierId: 'printemps' },
          { label: 'Il fait très chaud', panierId: 'ete' },
          { label: 'On rentre à l\'école', panierId: 'automne' },
          { label: 'Les arbres sont nus', panierId: 'hiver' },
        ],
        vitesseInitialeSec: 4,
        accelerationParPalier: 0.15,
        objectif: 8,
      },
      qcm: {
        question: 'Combien y a-t-il de saisons dans une année ?',
        choices: ['4', '3', '6'],
        correctIndex: 0,
      },
    },
  },
  {
    id: 'cp-sciences-vivipares-ovipares',
    gradeId: 'cp',
    domainId: 'sciences',
    difficulty: 2,
    title: 'Vivipares et ovipares',
    summary: 'Certains animaux naissent du ventre de leur mère, d\'autres sortent d\'un œuf.',
    funFact: "L'ornithorynque est un mammifère, mais c'est l'un des rares à pondre des œufs !",
    games: {
      riviere: {
        paniers: [
          { id: 'vivipare', label: 'Vivipare' },
          { id: 'ovipare', label: 'Ovipare' },
        ],
        flottants: [
          { label: 'Chat', panierId: 'vivipare' },
          { label: 'Poule', panierId: 'ovipare' },
          { label: 'Chien', panierId: 'vivipare' },
          { label: 'Tortue', panierId: 'ovipare' },
          { label: 'Vache', panierId: 'vivipare' },
          { label: 'Serpent', panierId: 'ovipare' },
        ],
        vitesseInitialeSec: 4,
        accelerationParPalier: 0.15,
        objectif: 6,
      },
      qcm: {
        question: 'Comment appelle-t-on un animal qui naît directement du ventre de sa mère ?',
        choices: ['Vivipare', 'Ovipare', 'Herbivore'],
        correctIndex: 0,
      },
    },
  },
  {
    id: 'cp-sciences-vivant-non-vivant',
    gradeId: 'cp',
    domainId: 'sciences',
    difficulty: 1,
    title: 'Vivant ou non-vivant',
    summary: 'Un être vivant naît, grandit, se nourrit et se reproduit.',
    funFact: 'Un champignon n\'est ni une plante ni un animal : il appartient à sa propre grande famille du vivant.',
    games: {
      riviere: {
        paniers: [
          { id: 'vivant', label: 'Vivant' },
          { id: 'non-vivant', label: 'Non-vivant' },
        ],
        flottants: [
          { label: 'Un arbre', panierId: 'vivant' },
          { label: 'Un caillou', panierId: 'non-vivant' },
          { label: 'Un chat', panierId: 'vivant' },
          { label: 'Une table', panierId: 'non-vivant' },
          { label: 'Un champignon', panierId: 'vivant' },
          { label: 'Une voiture', panierId: 'non-vivant' },
        ],
        vitesseInitialeSec: 4,
        accelerationParPalier: 0.15,
        objectif: 6,
      },
      qcm: {
        question: "Lequel de ces éléments est vivant ?",
        choices: ['Un champignon', 'Un caillou', 'Une table'],
        correctIndex: 0,
      },
    },
  },
  {
    id: 'cp-sciences-origine-aliments',
    gradeId: 'cp',
    domainId: 'sciences',
    difficulty: 1,
    title: "D'où viennent nos aliments",
    summary: 'Le lait, le miel, les œufs et la laine viennent tous des animaux.',
    funFact:
      "Une seule abeille ne produit, dans toute sa vie, qu'environ un douzième de cuillère à café de miel — il faut le travail de centaines d'entre elles pour remplir un seul petit pot.",
    games: {
      match: {
        pairs: [
          { left: 'Le lait', right: 'La vache' },
          { left: 'Le miel', right: "L'abeille" },
          { left: 'Les œufs', right: 'La poule' },
          { left: 'La laine', right: 'Le mouton' },
        ],
      },
      qcm: {
        question: 'Quel animal produit le miel ?',
        choices: ["L'abeille", 'La vache', 'La poule'],
        correctIndex: 0,
      },
    },
  },
  {
    id: 'cp-sciences-squelette',
    gradeId: 'cp',
    domainId: 'sciences',
    difficulty: 3,
    title: 'Le squelette humain',
    summary: 'Le squelette soutient le corps et protège les organes.',
    funFact: "Un bébé naît avec environ 300 os. En grandissant, certains fusionnent, pour arriver à 206 os chez l'adulte.",
    games: {
      qcm: {
        question: "Environ combien d'os compte le squelette d'un adulte ?",
        choices: ['206', '100', '300'],
        correctIndex: 0,
      },
    },
  },
]
