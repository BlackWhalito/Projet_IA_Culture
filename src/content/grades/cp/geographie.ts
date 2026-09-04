import type { Notion } from '../../../types/content'

export const CP_GEOGRAPHIE: Notion[] = [
  {
    id: 'cp-geographie-continents',
    gradeId: 'cp',
    domainId: 'geographie',
    difficulty: 2,
    title: 'Combien de continents ?',
    /*
     * Le `summary` posait « la Terre est divisée en 5 grands continents » comme
     * un fait. C'en est un de convention : cinq compte les continents habités,
     * six y ajoute l'Antarctique (Espagne, Italie, Portugal, Grèce, Amérique
     * latine), sept sépare les deux Amériques (États-Unis, Royaume-Uni,
     * Canada, Australie, Chine, Inde). Vérifié par recherche ; aucun modèle n'est
     * faux, parce que « continent » n'a pas de définition qui trancherait.
     *
     * Restent deux incohérences que ce champ ne peut pas corriger seul, et qui
     * demandent un arbitrage : le `title` et le `qcm` ci-dessous, qui traitent
     * encore « 5 » comme la bonne réponse et « 7 » comme une erreur.
     */
    summary:
      'Le nombre de continents n’est pas une donnée de la nature : il change selon le pays ' +
      'où l’on est allé à l’école.',
    funFact:
      'Demandez à un Américain combien il y a de continents, il répondra sept ; à un ' +
      'Espagnol, six ; à un Français, cinq. Aucun ne se trompe. Cinq compte les continents ' +
      'habités, six y ajoute l’Antarctique, sept sépare les deux Amériques. Et l’Europe ne ' +
      'doit son rang de continent qu’à une ligne tracée le long de l’Oural par un officier ' +
      'suédois prisonnier de guerre en Sibérie, publiée en 1730.',
    games: {
      /*
       * Ordre de perfidie croissante, jamais mélangé. Deux pièges posés une carte
       * à l'avance : 5 → 6 (l'Afrique est immense, donc le Groenland aussi) et
       * 9 → 10 (les anneaux valent bien pour les continents, mais aucun n'a de
       * couleur attribuée).
       *
       * Faits vérifiés par recherche : Antarctique, 14,2 millions de km² et
       * moins de 50 mm de précipitations par an ; Afrique, 54 États membres de
       * l'ONU et environ 30 millions de km² ; Groenland 14 fois plus petit,
       * distorsion de la projection de Mercator (1569) ; dérive de 2 à 4 cm par
       * an entre Europe et Amérique ; Zealandia, 4,9 millions de km² immergés à
       * 94 %, GSA Today, 2017 ; livret vert du CIO de 1949-1950 attribuant une
       * couleur par continent, annulé dès 1951 faute de preuve ; ligne de
       * Strahlenberg publiée à Stockholm en 1730 ; modèles à cinq, six et sept
       * continents selon les pays.
       */
      chaine: {
        consigne: 'Vrai ou faux ? Glisse à droite pour vrai, à gauche pour faux.',
        secondesParCarte: 8,
        affirmations: [
          {
            texte: 'L’Antarctique est un continent, et personne n’y vit de façon permanente.',
            vrai: true,
            verdict:
              'Quelques milliers de scientifiques l’été, environ un millier l’hiver, tous en ' +
              'rotation. Aucun État n’y exerce sa souveraineté : le traité sur l’Antarctique, ' +
              'signé en 1959, a mis les revendications territoriales en sommeil.',
          },
          {
            texte: 'L’Europe et l’Asie forment une seule et même masse de terre continue.',
            vrai: true,
            verdict:
              'L’Eurasie. On peut marcher de Brest à Vladivostok sans jamais traverser un bras ' +
              'de mer. Les séparer en deux continents est un choix, pas une observation.',
          },
          {
            texte: 'L’Afrique est le continent qui compte le plus grand nombre de pays.',
            vrai: true,
            verdict:
              '54 États membres de l’ONU, soit plus du quart de l’assemblée générale. La ' +
              'plupart sont devenus indépendants au cours des années 1950 à 1970.',
          },
          {
            texte: 'Le plus grand désert de la planète n’est pas le Sahara, mais l’Antarctique.',
            vrai: true,
            verdict:
              'Un désert se définit par ce qui n’y tombe pas, non par la chaleur : moins de ' +
              '250 mm de précipitations par an. L’Antarctique en reçoit environ 50, sur ' +
              '14 millions de kilomètres carrés. Dans les vallées sèches de McMurdo, il n’a ' +
              'pas plu depuis deux millions d’années.',
          },
          {
            texte: 'L’Afrique est plus vaste que la Chine, l’Inde, les États-Unis et l’Europe réunis.',
            vrai: true,
            verdict:
              '30 millions de kilomètres carrés, et il resterait de la place. Retiens-le : la ' +
              'carte suivante en dépend.',
          },
          {
            texte: 'Le Groenland, lui, fait à peu de chose près la taille de l’Afrique.',
            vrai: false,
            verdict:
              'Le piège vient de la carte accrochée au mur de la classe. La projection de ' +
              'Mercator, dessinée en 1569 pour les navigateurs, étire tout ce qui approche des ' +
              'pôles. Dans la réalité, quatorze Groenland tiennent dans l’Afrique.',
          },
          {
            texte: 'Les continents se déplacent encore aujourd’hui, de quelques centimètres par an.',
            vrai: true,
            verdict:
              'L’Atlantique s’élargit de deux à quatre centimètres par an entre l’Europe et ' +
              'l’Amérique — la vitesse à laquelle poussent vos ongles. En quarante ans, New ' +
              'York s’éloigne de Lisbonne d’environ un mètre.',
          },
          {
            texte: 'Un continent presque entièrement immergé a été décrit par des géologues en 2017.',
            vrai: true,
            verdict:
              'La Zealandia : 4,9 millions de kilomètres carrés de croûte continentale, sous le ' +
              'Pacifique sud. Elle est submergée à 94 % — la Nouvelle-Zélande et la ' +
              'Nouvelle-Calédonie sont ses sommets.',
          },
          {
            texte: 'Les anneaux olympiques représentent les cinq continents habités.',
            vrai: true,
            verdict:
              'C’est bien ce que Coubertin avait en tête en 1913, et ce que dit le Comité ' +
              'international olympique. Retiens-le : la carte suivante en dépend.',
          },
          {
            texte: 'Chaque anneau porte la couleur de son continent : le noir pour l’Afrique.',
            vrai: false,
            verdict:
              'Aucune couleur n’est attribuée à aucun continent. Les six couleurs, blanc du ' +
              'fond compris, avaient été choisies parce qu’au moins l’une d’elles figurait sur ' +
              'chaque drapeau national de 1913. Un livret du CIO a bien publié la ' +
              'correspondance en 1949 — elle a été annulée deux ans plus tard, faute de la ' +
              'moindre preuve.',
          },
          {
            texte: 'La limite entre l’Europe et l’Asie est une frontière naturelle incontestée.',
            vrai: false,
            verdict:
              'Elle a un auteur et une date. Philip Johan von Strahlenberg, officier suédois ' +
              'fait prisonnier par les Russes et déporté en Sibérie, propose de faire passer la ' +
              'frontière par l’Oural ; il publie sa carte à Stockholm en 1730. Le tracé exact ' +
              'du côté du Caucase se discute encore.',
          },
          {
            texte: 'Cela dit, tout le monde s’accorde au moins sur un point : il y a cinq continents.',
            vrai: false,
            verdict:
              'Personne ne s’accorde. Cinq est le compte des continents habités, appris en ' +
              'France ; six ajoute l’Antarctique, et c’est le modèle de l’Espagne, de l’Italie ' +
              'et de toute l’Amérique latine ; sept sépare les deux Amériques, et c’est celui ' +
              'des États-Unis, du Royaume-Uni, de la Chine et de l’Inde. Aucun n’est faux : ' +
              '« continent » n’a pas de définition scientifique qui trancherait.',
          },
        ],
      },
      qcm: {
        /*
         * L'ancien QCM demandait « combien y a-t-il de continents ? » et comptait
         * « 7 » comme une erreur — alors que c'est le modèle enseigné aux
         * États-Unis. Il contredisait donc le résumé de sa propre notion, qui
         * dit que le compte est une convention. La question porte désormais sur
         * ce qui, lui, ne se discute pas.
         */
        question: 'Quel continent n’a aucune population permanente ?',
        choices: ["L'Antarctique", "L'Océanie", "L'Amérique du Sud"],
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
    /*
     * Le `funFact` annonçait « environ 5 océans » comme un fait de nature. C'en
     * est un de convention : le nom « océan Austral » n'a été accepté par
     * l'Organisation hydrographique internationale qu'en 2000, et la 4e édition
     * de la publication S-23 qui l'officialiserait n'a toujours pas été
     * ratifiée (fr.wikipedia « Océan Austral », résolution OHI A3 2023).
     * D'où le nouveau `summary`, qui dit que le compte est une convention.
     */
    summary:
      'Compter les océans n’est pas une observation, c’est une convention — et plusieurs ' +
      '« mers » du globe n’en sont pas.',
    funFact:
      'Il y a près de six millions d’années, le détroit de Gibraltar s’est refermé et la ' +
      'Méditerranée s’est presque entièrement évaporée : à sa place, un désert de sel à des ' +
      'centaines de mètres sous le niveau de la mer, pendant plus de 600 000 ans. Puis ' +
      'l’Atlantique a forcé le passage. Selon les modèles publiés dans Nature en 2009 par ' +
      'l’équipe de Daniel Garcia-Castellanos, le bassin s’est rempli à 90 % en quelques mois ' +
      'à deux ans — la plus grande inondation que la Terre ait connue.',
    games: {
      /*
       * Ordre de perfidie croissante, jamais mélangé. Deux pièges posés une carte
       * à l'avance : 7 → 8 (la mer Morte est un lac, donc la Caspienne aussi) et
       * 9 → 10 (le nom accepté en 2000 n'est pas un compte officiel).
       *
       * Faits vérifiés par recherche : Pacifique 165 millions de km² contre
       * 148 millions de terres émergées ; Challenger Deep à 10 935 ± 6 m
       * (Vescovo, 2020) contre 8 849 m pour l'Everest ; crise de salinité
       * messinienne de 5,96 à 5,33 Ma ; mer des Sargasses délimitée par quatre
       * courants ; Caspienne, plus grand lac du monde, statut hybride fixé en
       * 2018 par les cinq riverains ; S-23 4e édition jamais ratifiée et
       * National Geographic ralliée seulement en juin 2021 ; définition
       * française du fleuve (Larousse, Wikipédia « Fleuve ») ; Seager et al.,
       * Quarterly Journal of the Royal Meteorological Society, 2002, sur le
       * Gulf Stream.
       */
      chaine: {
        consigne: 'Vrai ou faux ? Glisse à droite pour vrai, à gauche pour faux.',
        secondesParCarte: 8,
        affirmations: [
          {
            texte: 'L’eau des océans est salée, celle des rivières et des fleuves ne l’est pas.',
            vrai: true,
            verdict:
              'Les rivières charrient pourtant bien du sel, arraché aux roches — quelques ' +
              'centaines de fois trop dilué pour se goûter. Elles le déposent dans la mer, où ' +
              'l’eau s’évapore et le sel, lui, reste. La mer est salée parce qu’elle est un ' +
              'cul-de-sac.',
          },
          {
            texte: 'L’océan Pacifique est le plus vaste des océans de la planète.',
            vrai: true,
            verdict:
              '165 millions de kilomètres carrés. À lui seul, il est plus grand que toutes les ' +
              'terres émergées réunies, qui n’en font que 148 millions.',
          },
          {
            texte: 'Les océans couvrent un peu plus de 70 % de la surface de la Terre.',
            vrai: true,
            verdict:
              '71 %, pour une profondeur moyenne d’environ 3 700 mètres. Sur un globe de bureau ' +
              'de trente centimètres, toute cette eau ne ferait pas l’épaisseur d’une couche de ' +
              'vernis.',
          },
          {
            texte: 'L’endroit le plus profond de l’océan est plus creux que l’Everest n’est haut.',
            vrai: true,
            verdict:
              'Le Challenger Deep, dans la fosse des Mariannes : 10 935 mètres, mesurés à six ' +
              'mètres près lors des plongées de 2020. Posez l’Everest au fond, il resterait ' +
              'deux kilomètres d’eau au-dessus du sommet.',
          },
          {
            texte: 'La mer Méditerranée s’est déjà retrouvée presque entièrement à sec.',
            vrai: true,
            verdict:
              'La crise de salinité messinienne, de 5,96 à 5,33 millions d’années avant nous. ' +
              'Gibraltar s’étant refermé, l’évaporation a gagné : la Méditerranée est devenue ' +
              'un désert de sel. Les géologues s’en servent pour borner la fin du Miocène.',
          },
          {
            texte: 'Il existe une mer qui n’a aucune côte, bordée seulement par des courants.',
            vrai: true,
            verdict:
              'La mer des Sargasses, en plein Atlantique, cernée par quatre courants dont le Gulf ' +
              'Stream. Les anguilles d’Europe traversent l’océan pour venir s’y reproduire — un ' +
              'voyage dont personne n’a jamais observé la fin.',
          },
          {
            texte: 'Malgré son nom, la mer Morte n’est pas une mer : c’est un lac salé.',
            vrai: true,
            verdict:
              'Aucune sortie vers l’océan, et une eau dix fois plus salée que la mer : rien n’y ' +
              'vit, d’où le nom. Retiens-le : la carte suivante en dépend.',
          },
          {
            texte: 'La mer Caspienne, en revanche, est bien une mer et non un lac.',
            vrai: false,
            verdict:
              'Le piège. C’est le plus grand lac du monde : 371 000 kilomètres carrés d’eau ' +
              'fermée, sans aucune communication naturelle avec l’océan. Le mot n’est pas ' +
              'anodin — si c’est une mer, le droit international de la mer s’applique et le ' +
              'pétrole se partage autrement. Les cinq pays riverains ont dû lui inventer un ' +
              'statut à part, en 2018.',
          },
          {
            texte: 'Le nom « océan Austral » n’a été accepté par les hydrographes qu’en 2000.',
            vrai: true,
            verdict:
              'Avant, les eaux qui entourent l’Antarctique étaient rattachées aux trois océans ' +
              'voisins. Retiens-le : la carte suivante en dépend.',
          },
          {
            texte: 'Depuis, la Terre compte officiellement cinq océans, partout dans le monde.',
            vrai: false,
            verdict:
              'Le texte qui l’officialiserait n’a jamais été ratifié : on ne s’accorde pas sur ' +
              'sa limite nord. En 2000, sur 68 États consultés, 28 seulement ont répondu. ' +
              'National Geographic n’a ajouté l’océan Austral à ses cartes qu’en juin 2021, et ' +
              'beaucoup d’atlas en comptent encore quatre. Le nombre d’océans est une décision, ' +
              'pas une mesure.',
          },
          {
            texte: 'Un fleuve, c’est simplement un cours d’eau plus grand qu’une rivière.',
            vrai: false,
            verdict:
              'La taille n’a rien à voir. Un fleuve se jette dans la mer, une rivière dans un ' +
              'autre cours d’eau. Le Missouri, trois fois long comme la Loire, n’est qu’une ' +
              'rivière : il finit dans le Mississippi. Et un ruisseau côtier de quelques ' +
              'kilomètres qui rejoint directement la mer est un fleuve.',
          },
          {
            texte: 'Sans le Gulf Stream, la France aurait le climat glacé du Canada.',
            vrai: false,
            verdict:
              'L’image est dans tous les manuels, et les climatologues la démontent depuis 2002. ' +
              'Ce qui réchauffe l’Europe, ce sont surtout les vents d’ouest, qui poussent vers ' +
              'nous l’air d’un océan encore tiède de l’été précédent, pendant que les mêmes ' +
              'latitudes américaines reçoivent de l’air continental. Le courant y contribue, ' +
              'mais il n’explique qu’une petite part de l’écart.',
          },
        ],
      },
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
