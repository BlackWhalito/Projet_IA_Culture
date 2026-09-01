import type { Notion } from '../../../types/content'

export const CP_GEOGRAPHIE: Notion[] = [
  {
    id: 'cp-geographie-continents',
    gradeId: 'cp',
    domainId: 'geographie',
    difficulty: 2,
    title: 'Les 5 continents',
    summary: 'La Terre est divisée en 5 grands continents.',
    funFact: "L'Europe et l'Asie forment en réalité une seule et même masse de terre, souvent appelée l'Eurasie.",
    games: {
      match: {
        pairs: [
          { left: 'Europe', right: 'France, Espagne...' },
          { left: 'Afrique', right: 'Égypte, Kenya...' },
          { left: 'Asie', right: 'Chine, Japon...' },
          { left: 'Amérique', right: 'Canada, Brésil...' },
          { left: 'Océanie', right: 'Australie...' },
        ],
      },
      qcm: {
        question: 'Combien y a-t-il de continents ?',
        choices: ['5', '3', '7'],
        correctIndex: 0,
      },
      capsur: {
        carteId: 'europe',
        cibles: ['europe', 'afrique', 'asie', 'amerique', 'oceanie'],
        secondesParCible: 6,
      },
    },
  },
  {
    id: 'cp-geographie-france-paris',
    gradeId: 'cp',
    domainId: 'geographie',
    difficulty: 1,
    title: 'La France et sa capitale',
    summary: 'Paris est la capitale de la France.',
    funFact: 'Paris est traversée par un fleuve : la Seine.',
    games: {
      qcm: {
        question: 'Quelle est la capitale de la France ?',
        choices: ['Paris', 'Lyon', 'Marseille'],
        correctIndex: 0,
      },
      capsur: {
        // Ne jamais promettre d'ordre ici : `CapSurGame` mélange `cibles` à
        // chaque partie. La consigne annonçait « en commençant par la capitale »
        // et la première ville demandée était Marseille.
        consigne: 'Repère quatre villes françaises sur la carte, dont la capitale.',
        carteId: 'france',
        // Quatre cibles, pas une. Avec une seule ville, la manche durait six
        // secondes et ne laissait pas le temps de regarder la carte — donc pas
        // le temps de se repérer, qui est pourtant tout ce que ce jeu demande.
        // Paris d'abord parce que c'est la notion, les trois autres pour que
        // la carte se remplisse et qu'on situe la capitale par rapport au reste.
        cibles: ['paris', 'marseille', 'bordeaux', 'strasbourg'],
        secondesParCible: 8,
      },
    },
  },
  {
    id: 'cp-geographie-points-cardinaux',
    gradeId: 'cp',
    domainId: 'geographie',
    difficulty: 2,
    title: 'Les points cardinaux',
    summary: 'Nord, Sud, Est, Ouest permettent de se repérer sur une carte.',
    funFact: 'Le Soleil se lève à l\'Est et se couche à l\'Ouest.',
    games: {
      qcm: {
        question: 'De quel côté le Soleil se lève-t-il ?',
        choices: ["L'Est", "L'Ouest", 'Le Sud'],
        correctIndex: 0,
      },
    },
  },
  {
    id: 'cp-geographie-oceans-mers',
    gradeId: 'cp',
    domainId: 'geographie',
    difficulty: 1,
    title: 'Les océans et les mers',
    summary: "L'eau des océans et des mers est salée, contrairement à celle des rivières.",
    funFact: 'Il y a environ 5 océans sur Terre : le Pacifique, l\'Atlantique, l\'Indien, l\'Arctique et l\'Austral.',
    games: {
      qcm: {
        question: 'Comment est l\'eau de la mer ?',
        choices: ['Salée', 'Sucrée', 'Gazeuse'],
        correctIndex: 0,
      },
    },
  },
  {
    id: 'cp-geographie-paysages',
    gradeId: 'cp',
    domainId: 'geographie',
    difficulty: 1,
    title: 'Les paysages',
    summary: 'La montagne, la mer, la campagne et la ville sont des paysages très différents.',
    funFact: 'Le mont Blanc, le plus haut sommet de France, culmine à plus de 4800 mètres.',
    games: {
      riviere: {
        paniers: [
          { id: 'montagne', label: 'Montagne' },
          { id: 'mer', label: 'Mer' },
          { id: 'campagne', label: 'Campagne' },
          { id: 'ville', label: 'Ville' },
        ],
        flottants: [
          { label: 'Un sommet enneigé', panierId: 'montagne' },
          { label: 'Un phare', panierId: 'mer' },
          { label: 'Un tracteur', panierId: 'campagne' },
          { label: 'Un gratte-ciel', panierId: 'ville' },
          { label: 'Un refuge', panierId: 'montagne' },
          { label: 'Une vague', panierId: 'mer' },
          { label: 'Une vache', panierId: 'campagne' },
          { label: 'Un feu tricolore', panierId: 'ville' },
        ],
        vitesseInitialeSec: 4,
        accelerationParPalier: 0.15,
        objectif: 8,
      },
      qcm: {
        question: 'Où trouve-t-on le plus souvent des vaches et des tracteurs ?',
        choices: ['À la campagne', 'En ville', 'En montagne'],
        correctIndex: 0,
      },
    },
  },
  {
    id: 'cp-geographie-drapeau-france',
    gradeId: 'cp',
    domainId: 'geographie',
    difficulty: 1,
    title: 'Le drapeau français',
    summary: 'Le drapeau français porte trois couleurs : bleu, blanc, rouge.',
    funFact: 'Le bleu et le rouge étaient les couleurs de Paris, et le blanc était la couleur du roi : ensemble, elles ont formé le drapeau tricolore.',
    games: {
      qcm: {
        question: 'Dans quel ordre sont les couleurs du drapeau français, de gauche à droite ?',
        choices: ['Bleu, blanc, rouge', 'Rouge, blanc, bleu', 'Blanc, bleu, rouge'],
        correctIndex: 0,
      },
    },
  },
  {
    id: 'cp-geographie-pays-voisins',
    gradeId: 'cp',
    domainId: 'geographie',
    difficulty: 2,
    title: 'Les pays voisins de la France',
    summary: 'La France partage ses frontières avec plusieurs pays européens, comme l\'Espagne, l\'Allemagne ou l\'Italie.',
    funFact: 'La France a des frontières terrestres avec 8 pays, dont deux tout petits : Monaco et Andorre.',
    games: {
      qcm: {
        question: 'Lequel de ces pays partage une frontière avec la France ?',
        choices: ['Espagne', 'Portugal', 'Pays-Bas'],
        correctIndex: 0,
      },
      capsur: {
        carteId: 'france',
        cibles: ['espagne', 'belgique', 'allemagne', 'suisse', 'italie'],
        secondesParCible: 6,
      },
    },
  },
  {
    id: 'cp-geographie-tour-eiffel-monuments',
    gradeId: 'cp',
    domainId: 'geographie',
    difficulty: 2,
    title: 'La tour Eiffel et les monuments',
    summary: 'La tour Eiffel, à Paris, est l\'un des monuments les plus connus au monde.',
    funFact: "La tour Eiffel a été construite pour l'Exposition universelle de 1889 : elle ne devait rester que 20 ans, mais elle est toujours là !",
    games: {
      qcm: {
        question: 'Qui a fait construire la tour Eiffel ?',
        choices: ['Gustave Eiffel', 'Napoléon', 'Louis XIV'],
        correctIndex: 0,
      },
    },
  },
  {
    id: 'cp-geographie-ile',
    gradeId: 'cp',
    domainId: 'geographie',
    difficulty: 1,
    title: "Qu'est-ce qu'une île",
    summary: 'Une île est un morceau de terre entouré d\'eau de tous les côtés.',
    funFact: 'La Corse est une île française, mais la plus grande île du monde est le Groenland.',
    games: {
      qcm: {
        question: "Qu'est-ce qui entoure une île ?",
        choices: ["De l'eau", 'Du sable', 'Une forêt'],
        correctIndex: 0,
      },
    },
  },
  {
    id: 'cp-geographie-loire',
    gradeId: 'cp',
    domainId: 'geographie',
    difficulty: 2,
    title: 'Le plus long fleuve de France',
    summary: 'La Loire est le plus long fleuve de France.',
    funFact: 'La Loire mesure environ 1000 kilomètres de long, et de nombreux châteaux célèbres bordent ses rives.',
    games: {
      qcm: {
        question: 'Quel est le plus long fleuve de France ?',
        choices: ['La Loire', 'La Seine', 'Le Rhône'],
        correctIndex: 0,
      },
      capsur: {
        carteId: 'france',
        cibles: ['loire'],
        secondesParCible: 6,
      },
    },
  },
]
