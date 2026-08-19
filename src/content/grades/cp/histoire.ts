import type { Notion } from '../../../types/content'

export const CP_HISTOIRE: Notion[] = [
  {
    id: 'cp-histoire-prehistoire',
    gradeId: 'cp',
    domainId: 'histoire',
    difficulty: 1,
    title: 'La Préhistoire',
    summary: "La Préhistoire est la période avant l'invention de l'écriture.",
    funFact: 'Les hommes préhistoriques ont appris à maîtriser le feu il y a environ 400 000 ans.',
    games: {
      qcm: {
        question: "Qu'est-ce que les hommes préhistoriques ont appris à maîtriser ?",
        choices: ['Le feu', "L'électricité", 'Le moteur'],
        correctIndex: 0,
      },
    },
  },
  {
    id: 'cp-histoire-lascaux',
    gradeId: 'cp',
    domainId: 'histoire',
    difficulty: 2,
    title: 'Les grottes de Lascaux',
    summary: 'Des hommes préhistoriques ont peint des animaux sur les murs de cette grotte, en France.',
    funFact: 'La grotte de Lascaux a été découverte en 1940, par hasard, par des adolescents.',
    games: {
      qcm: {
        question: "Que représentent surtout les peintures de la grotte de Lascaux ?",
        choices: ['Des animaux', 'Des maisons', 'Des voitures'],
        correctIndex: 0,
      },
    },
  },
  {
    id: 'cp-histoire-louis-xiv',
    gradeId: 'cp',
    domainId: 'histoire',
    difficulty: 2,
    title: 'Louis XIV, le Roi Soleil',
    summary: 'Louis XIV a été roi de France et a fait construire le château de Versailles.',
    funFact: "Louis XIV est le roi qui a régné le plus longtemps dans l'histoire de France : 72 ans !",
    games: {
      qcm: {
        question: 'Quel célèbre château Louis XIV a-t-il fait construire ?',
        choices: ['Versailles', 'Le Louvre', 'Chambord'],
        correctIndex: 0,
      },
    },
  },
  {
    id: 'cp-histoire-frise-temps',
    gradeId: 'cp',
    domainId: 'histoire',
    difficulty: 1,
    title: 'La frise du temps',
    summary: "Le temps se découpe en trois grandes périodes : le passé, le présent et le futur.",
    funFact: "Les historiens utilisent des frises chronologiques pour ranger les événements du plus ancien au plus récent.",
    games: {
      timeline: {
        events: [
          { label: 'Le passé', sortValue: 1 },
          { label: 'Le présent', sortValue: 2 },
          { label: 'Le futur', sortValue: 3 },
        ],
      },
      qcm: {
        question: "Comment appelle-t-on ce qui s'est déjà passé ?",
        choices: ['Le passé', 'Le futur', 'Le présent'],
        correctIndex: 0,
      },
    },
  },
  {
    id: 'cp-histoire-grandes-inventions',
    gradeId: 'cp',
    domainId: 'histoire',
    difficulty: 2,
    title: 'Les grandes inventions de la Préhistoire',
    summary: "Le feu, la roue, l'écriture et l'agriculture ont transformé la vie des humains.",
    funFact: "L'écriture est apparue il y a environ 5000 ans, bien après la maîtrise du feu.",
    games: {
      match: {
        pairs: [
          { left: 'La roue', right: 'Se déplacer plus facilement' },
          { left: "L'écriture", right: 'Garder une trace de ce que l\'on pense' },
          { left: 'Le feu', right: 'Se chauffer et cuisiner' },
          { left: "L'agriculture", right: 'Cultiver la terre pour se nourrir' },
        ],
      },
      qcm: {
        question: 'À quoi sert la roue ?',
        choices: ['À se déplacer plus facilement', 'À écrire', 'À cuisiner'],
        correctIndex: 0,
      },
    },
  },
  {
    id: 'cp-histoire-chateaux-chevaliers',
    gradeId: 'cp',
    domainId: 'histoire',
    difficulty: 1,
    title: 'Les châteaux forts et les chevaliers',
    summary: 'Au Moyen Âge, les châteaux forts protégeaient les habitants des attaques.',
    funFact: "L'armure d'un chevalier pouvait peser plus de 25 kg !",
    games: {
      qcm: {
        question: 'À quoi servaient surtout les châteaux forts ?',
        choices: ['À se protéger des attaques', 'À cultiver la terre', 'À faire du commerce'],
        correctIndex: 0,
      },
    },
  },
  {
    id: 'cp-histoire-symboles-france',
    gradeId: 'cp',
    domainId: 'histoire',
    difficulty: 2,
    title: 'Les symboles de la France',
    summary: 'La Marianne, La Marseillaise et le coq gaulois sont des symboles de la France.',
    funFact: "Le coq est devenu un symbole de la France à cause d'un jeu de mots en latin : « gallus » veut dire à la fois « coq » et « Gaulois ».",
    games: {
      match: {
        pairs: [
          { left: 'Marianne', right: 'Figure de la République' },
          { left: 'La Marseillaise', right: 'Hymne national' },
          { left: 'Liberté, Égalité, Fraternité', right: 'Devise de la France' },
          { left: 'Le coq', right: 'Symbole animal de la France' },
        ],
      },
      qcm: {
        question: 'Quelle est la devise de la France ?',
        choices: ['Liberté, Égalité, Fraternité', 'Paix, Amour, Joie', 'Travail, Famille, Patrie'],
        correctIndex: 0,
      },
    },
  },
  {
    id: 'cp-histoire-christophe-colomb',
    gradeId: 'cp',
    domainId: 'histoire',
    difficulty: 2,
    title: 'Christophe Colomb',
    summary: "Christophe Colomb a traversé l'océan Atlantique en 1492 et a découvert l'Amérique pour les Européens.",
    funFact: 'Christophe Colomb pensait avoir atteint les Indes : c\'est pour cela que les habitants d\'Amérique ont longtemps été appelés « Indiens ».',
    games: {
      qcm: {
        question: 'Quel continent Christophe Colomb a-t-il découvert pour les Européens, en 1492 ?',
        choices: ["L'Amérique", "L'Afrique", "L'Australie"],
        correctIndex: 0,
      },
    },
  },
  {
    id: 'cp-histoire-jours-semaine',
    gradeId: 'cp',
    domainId: 'histoire',
    difficulty: 3,
    title: "L'origine des jours de la semaine",
    summary: 'Les noms des jours de la semaine viennent des astres et des dieux romains.',
    funFact: 'Lundi vient de la Lune, et vendredi vient de Vénus : les jours de la semaine gardent la trace des astres observés par les Romains.',
    games: {
      match: {
        pairs: [
          { left: 'Lundi', right: 'La Lune' },
          { left: 'Mardi', right: 'Mars' },
          { left: 'Mercredi', right: 'Mercure' },
          { left: 'Jeudi', right: 'Jupiter' },
          { left: 'Vendredi', right: 'Vénus' },
        ],
      },
      qcm: {
        question: 'De quel astre vient le nom du jour « lundi » ?',
        choices: ['La Lune', 'Mars', 'Vénus'],
        correctIndex: 0,
      },
    },
  },
  {
    id: 'cp-histoire-revolution-francaise',
    gradeId: 'cp',
    domainId: 'histoire',
    difficulty: 3,
    title: 'La Révolution française',
    summary: 'Le 14 juillet 1789, les Parisiens ont pris la prison de la Bastille, symbole du pouvoir du roi.',
    funFact: 'Le 14 juillet est aujourd\'hui la fête nationale française, en souvenir de la prise de la Bastille.',
    games: {
      qcm: {
        question: "Que s'est-il passé le 14 juillet 1789 ?",
        choices: ['La prise de la Bastille', "L'élection d'un président", 'La construction de la tour Eiffel'],
        correctIndex: 0,
      },
    },
  },
]
