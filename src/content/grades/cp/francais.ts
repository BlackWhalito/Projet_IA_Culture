import type { Notion } from '../../../types/content'

export const CP_FRANCAIS: Notion[] = [
  {
    id: 'cp-francais-voyelles-consonnes',
    gradeId: 'cp',
    domainId: 'francais',
    difficulty: 1,
    title: 'Voyelles et consonnes',
    summary: "L'alphabet français est composé de voyelles et de consonnes.",
    funFact: "Le français compte 6 voyelles (a, e, i, o, u, y) et 20 consonnes.",
    games: {
      riviere: {
        consigne: 'Envoie chaque lettre sur la bonne rive : voyelle ou consonne.',
        paniers: [
          { id: 'voyelle', label: 'Voyelle' },
          { id: 'consonne', label: 'Consonne' },
        ],
        flottants: [
          { label: 'A', panierId: 'voyelle' },
          { label: 'B', panierId: 'consonne' },
          { label: 'O', panierId: 'voyelle' },
          { label: 'M', panierId: 'consonne' },
          { label: 'U', panierId: 'voyelle' },
        ],
        vitesseInitialeSec: 4,
        accelerationParPalier: 0.15,
        objectif: 5,
      },
      qcm: {
        question: 'Laquelle de ces lettres est une voyelle ?',
        choices: ['O', 'T', 'R'],
        correctIndex: 0,
      },
    },
  },
  {
    id: 'cp-francais-nom-verbe',
    gradeId: 'cp',
    domainId: 'francais',
    difficulty: 2,
    title: 'Le nom et le verbe',
    summary: 'Le nom désigne une chose ou une personne ; le verbe exprime une action.',
    funFact: 'Dans une phrase simple, le verbe est le seul mot qui change quand on change le temps (hier / aujourd\'hui / demain).',
    games: {
      riviere: {
        paniers: [
          { id: 'nom', label: 'Nom' },
          { id: 'verbe', label: 'Verbe' },
        ],
        flottants: [
          { label: 'Chien', panierId: 'nom' },
          { label: 'Courir', panierId: 'verbe' },
          { label: 'Maison', panierId: 'nom' },
          { label: 'Manger', panierId: 'verbe' },
        ],
        vitesseInitialeSec: 4,
        accelerationParPalier: 0.15,
        objectif: 4,
      },
      qcm: {
        question: 'Lequel de ces mots est un verbe ?',
        choices: ['Manger', 'Chaise', 'Rouge'],
        correctIndex: 0,
      },
    },
  },
  {
    id: 'cp-francais-corbeau-renard',
    gradeId: 'cp',
    domainId: 'francais',
    difficulty: 3,
    title: 'Le Corbeau et le Renard',
    summary: 'Une célèbre fable de Jean de La Fontaine, avec une morale sur la flatterie.',
    funFact: "La morale de la fable est : « Tout flatteur vit aux dépens de celui qui l'écoute. »",
    games: {
      qcm: {
        question: 'Qui a écrit la fable Le Corbeau et le Renard ?',
        choices: ['Jean de La Fontaine', 'Victor Hugo', 'Charles Perrault'],
        correctIndex: 0,
      },
    },
  },
  {
    id: 'cp-francais-masculin-feminin',
    gradeId: 'cp',
    domainId: 'francais',
    difficulty: 1,
    title: 'Masculin et féminin',
    summary: 'En français, chaque nom est soit masculin (un/le), soit féminin (une/la).',
    funFact: "Certains mots changent complètement de sens selon leur genre : « un livre » (à lire) et « une livre » (un poids ou une monnaie) !",
    games: {
      riviere: {
        paniers: [
          { id: 'masculin', label: 'Masculin' },
          { id: 'feminin', label: 'Féminin' },
        ],
        flottants: [
          { label: 'Un chat', panierId: 'masculin' },
          { label: 'Une chaise', panierId: 'feminin' },
          { label: 'Un livre', panierId: 'masculin' },
          { label: 'Une pomme', panierId: 'feminin' },
          { label: 'Un stylo', panierId: 'masculin' },
          { label: 'Une fleur', panierId: 'feminin' },
        ],
        vitesseInitialeSec: 4,
        accelerationParPalier: 0.15,
        objectif: 6,
      },
      qcm: {
        question: 'Lequel de ces mots est féminin ?',
        choices: ['Une pomme', 'Un chat', 'Un stylo'],
        correctIndex: 0,
      },
    },
  },
  {
    id: 'cp-francais-singulier-pluriel',
    gradeId: 'cp',
    domainId: 'francais',
    difficulty: 1,
    title: 'Singulier et pluriel',
    summary: 'Le singulier désigne une seule chose, le pluriel en désigne plusieurs.',
    funFact: "La plupart des noms français prennent un « s » au pluriel, mais certains, comme « un chou » / « des choux », prennent un « x ».",
    games: {
      qcm: {
        question: 'Lequel de ces mots est écrit au pluriel ?',
        choices: ['Des chats', 'Un chat', 'Le chat'],
        correctIndex: 0,
      },
    },
  },
  {
    id: 'cp-francais-contes-classiques',
    gradeId: 'cp',
    domainId: 'francais',
    difficulty: 1,
    title: 'Les contes classiques',
    summary: 'Le Petit Chaperon Rouge, Cendrillon et Blanche-Neige sont des contes que tout le monde connaît.',
    funFact: 'Beaucoup de contes classiques, comme Cendrillon, existent depuis des siècles dans plusieurs pays, sous des formes un peu différentes.',
    games: {
      match: {
        pairs: [
          { left: 'Le Petit Chaperon Rouge', right: 'Le loup' },
          { left: 'Cendrillon', right: 'La pantoufle de verre' },
          { left: 'Blanche-Neige', right: 'Les sept nains' },
          { left: 'La Belle au Bois Dormant', right: 'Le fuseau qui pique le doigt' },
        ],
      },
      qcm: {
        question: 'Dans Cendrillon, que perd-elle à minuit en quittant le bal ?',
        choices: ['Sa pantoufle de verre', 'Sa couronne', 'Son manteau'],
        correctIndex: 0,
      },
    },
  },
  {
    id: 'cp-francais-ponctuation',
    gradeId: 'cp',
    domainId: 'francais',
    difficulty: 2,
    title: 'La ponctuation de base',
    summary: 'Le point, le point d\'interrogation et le point d\'exclamation terminent une phrase.',
    funFact: "Le point d'interrogation vient d'une abréviation du mot latin « quaestio », qui veut dire « question ».",
    games: {
      qcm: {
        question: 'Quel signe de ponctuation termine une phrase interrogative ?',
        choices: ['?', '!', '.'],
        correctIndex: 0,
      },
    },
  },
  {
    id: 'cp-francais-rimes',
    gradeId: 'cp',
    domainId: 'francais',
    difficulty: 2,
    title: 'Les rimes',
    summary: 'Deux mots riment quand ils se terminent par le même son.',
    funFact: 'Les poèmes et les chansons utilisent souvent des rimes pour être plus faciles à retenir.',
    games: {
      qcm: {
        question: "Quel mot rime avec « maison » ?",
        choices: ['Poisson', 'Table', 'Voiture'],
        correctIndex: 0,
      },
    },
  },
  {
    id: 'cp-francais-majuscule-point',
    gradeId: 'cp',
    domainId: 'francais',
    difficulty: 1,
    title: 'La majuscule et le point',
    summary: 'Une phrase commence par une majuscule et se termine par un point.',
    funFact: "Les noms propres, comme les prénoms ou les pays, prennent toujours une majuscule, même au milieu d'une phrase.",
    games: {
      qcm: {
        question: 'Par quoi commence toujours une phrase ?',
        choices: ['Une majuscule', 'Un point', 'Une virgule'],
        correctIndex: 0,
      },
    },
  },
  {
    id: 'cp-francais-expressions-imagees',
    gradeId: 'cp',
    domainId: 'francais',
    difficulty: 3,
    title: 'Les expressions imagées',
    summary: 'Certaines expressions ne veulent pas dire ce qu\'elles disent littéralement.',
    funFact: '« Il pleut des cordes » ne veut pas dire que des cordes tombent du ciel, mais qu\'il pleut très fort !',
    games: {
      qcm: {
        question: 'Que veut dire l\'expression « il pleut des cordes » ?',
        choices: ['Il pleut très fort', 'Il fait beau', 'Il neige'],
        correctIndex: 0,
      },
    },
  },
]
