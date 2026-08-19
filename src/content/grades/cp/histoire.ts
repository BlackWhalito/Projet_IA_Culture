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
      incarnation: {
        personnage: { nom: 'Christophe Colomb', annee: '1492', role: 'Amiral de la mer Océane' },
        jauges: [
          { id: 'vivres', label: 'Vivres et eau douce', depart: 75 },
          { id: 'moral', label: "Moral de l'équipage", depart: 75 },
          { id: 'milles', label: 'Distance parcourue', depart: 0 },
        ],
        etapes: [
          {
            titre: 'Charger les cales, à Palos de la Frontera',
            scene: "3 août 1492. Sur le port de Palos de la Frontera, trois caravelles attendent : la Santa María, la Pinta et la Niña. Il faut décider, ce matin, ce qui remplira leurs cales avant de couper les amarres — personne ne sait combien de temps durera la traversée.",
            options: [
              {
                texte: "Remplir les cales d'eau douce et de biscuit de mer",
                effets: { vivres: 15 },
                consequence: "Les tonneaux d'eau et les caisses de biscuit s'entassent jusqu'au pont. Tu ne sais pas combien de semaines il faudra tenir en mer — alors autant partir large.",
                historique: "Aucune route vers l'ouest n'avait jamais été tentée sur une distance pareille : ni Colomb ni personne à bord ne savait vraiment combien de temps durerait la traversée, si elle devait un jour se terminer.",
              },
              {
                texte: 'Embarquer perles de verre et étoffes pour le Grand Khan',
                effets: { moral: 10, vivres: -10 },
                consequence: "Les hommes s'imaginent déjà débarquant à la cour du Grand Khan, couverts de soie et de bijoux. L'espoir des richesses gonfle les voiles avant même de quitter le port.",
              },
              {
                texte: "Compléter l'équipage à la dernière minute",
                effets: { moral: 5, vivres: -5 },
                consequence: "Quelques hommes de plus grimpent à bord en hâte. Plus de bras pour manœuvrer les voiles — mais aussi plus de bouches à nourrir chaque soir, jusqu'au bout du voyage.",
              },
            ],
          },
          {
            titre: 'Les Canaries, cap plein ouest',
            scene: "6 septembre 1492. Après plusieurs semaines de réparations, la flotte quitte les îles Canaries — la dernière terre connue avant l'inconnu. Au-delà, aucune carte européenne ne dit ce qui attend les trois caravelles.",
            options: [
              {
                texte: 'Laisser les hommes regarder la terre une dernière fois',
                effets: { moral: 10 },
                consequence: "Les marins fixent longuement les sommets des Canaries qui rapetissent à l'horizon. C'est la dernière terre qu'ils reverront avant longtemps — ils veulent s'en souvenir.",
              },
              {
                texte: "Virer plein ouest sans s'attarder",
                effets: { milles: 10, moral: -5 },
                consequence: "Tu donnes l'ordre de virer sans un regard en arrière. Le sillage efface vite les Canaries — trop vite pour certains, qui auraient aimé un dernier adieu à la terre.",
              },
              {
                texte: 'Vérifier une dernière fois le gouvernail réparé de la Pinta',
                effets: { vivres: -5, moral: 5 },
                consequence: "Le gouvernail de la Pinta, faussé depuis Palos, tient enfin bon. Un souci de moins pour affronter l'inconnu qui commence de l'autre côté de l'horizon.",
                historique: "La Pinta avait quitté Palos avec un gouvernail endommagé : la flotte avait dû relâcher aux Canaries dès le 9 août pour le réparer avant de reprendre la mer.",
              },
            ],
          },
          {
            titre: 'Les doutes du large',
            scene: "Semaine après semaine, l'horizon reste vide. Pas un oiseau, pas une branche, pas une terre. Dans les cales, des voix commencent à murmurer qu'on ne reverra peut-être jamais l'Espagne.",
            options: [
              {
                texte: 'Rappeler la récompense promise par les souverains',
                effets: { moral: 15, vivres: -5 },
                consequence: "Les regards se raniment. Chacun scrute l'horizon avec une attention nouvelle, guettant la terre — et la rente promise à qui la verra le premier.",
                historique: 'Isabelle et Ferdinand avaient promis une veste de soie et une rente de dix mille maravédis, versée à vie, au premier marin qui apercevrait la terre.',
              },
              {
                texte: 'Serrer la discipline et faire taire les murmures',
                effets: { moral: -10, milles: 5 },
                consequence: "Les récalcitrants se taisent, mais les regards qu'ils échangent en disent long. Le navire avance — mais quelque chose, à bord, vient de se durcir.",
              },
              {
                texte: 'Partager ta confiance, sans rien promettre',
                effets: { moral: 5 },
                consequence: "Tu parles calmement de la route étudiée, du cap tenu depuis les Canaries. Ça rassure un peu — pas assez pour effacer les regards tournés vers l'ouest, vers rien.",
              },
            ],
          },
          {
            titre: 'Deux comptes, une nuit',
            scene: "Chaque soir, tu calcules la distance parcourue depuis le matin. Ce soir-là, le navire a couvert soixante lieues. Dans ton livre secret, tu notes le vrai chiffre. À l'équipage, rassemblé sur le pont, tu t'apprêtes à annoncer un nombre.",
            options: [
              {
                texte: 'Annoncer une distance plus courte que la réalité',
                effets: { moral: 15, vivres: -5, milles: 18 },
                consequence: "L'équipage respire : quarante-huit lieues, ça semble raisonnable. Mais dans ton livre secret, le chiffre est différent — et depuis plusieurs nuits, il grandit un peu plus vite que celui que tu oses dire tout haut.",
                historique: "Ce double compte est rapporté par le moine Bartolomé de Las Casas, qui a recopié le journal de bord de Colomb : une distance vraie pour lui seul, une distance minorée pour rassurer l'équipage — presque chaque soir de la traversée.",
              },
              {
                texte: 'Annoncer ce soir-là la distance réelle',
                effets: { moral: -15, milles: 12 },
                consequence: "Les visages se ferment. Soixante lieues, c'est loin des côtes connues. Des murmures reprennent au fond du navire — mais cette nuit-là, personne ne pourra dire que tu as menti.",
              },
              {
                texte: 'Reporter les chiffres dans les deux livres, épuisé',
                effets: { vivres: -5, milles: 15 },
                consequence: "Après tant de nuits à jongler entre deux comptes, tu hésites un instant sur celui que tu viens de noter dans le livre secret. Le vrai chiffre, le faux chiffre — pendant un battement de cœur, tu ne sais plus lequel est lequel.",
              },
            ],
          },
          {
            titre: 'De faux espoirs',
            scene: "Des branches couvertes de feuilles fraîches flottent près des coques. Un cri de « Terre ! » retentit depuis la Pinta — puis se dément : ce n'était qu'un banc de nuages, bas sur l'horizon. Des oiseaux migrateurs traversent le ciel, filant vers le sud-ouest.",
            options: [
              {
                texte: 'Suivre le vol des oiseaux vers le sud-ouest',
                effets: { milles: 15, vivres: -5 },
                consequence: "Sur l'insistance du capitaine de la Pinta, tu infléchis la route. Les hommes reprennent espoir en regardant filer ces oiseaux qui, forcément, doivent bien se poser quelque part.",
                historique: "Le 7 octobre 1492, Colomb changea de cap vers le sud-ouest en suivant des vols d'oiseaux migrateurs, sur l'insistance de Martín Alonso Pinzón, capitaine de la Pinta — un choix qui rapprocha réellement la flotte des Bahamas.",
              },
              {
                texte: 'Garder le cap plein ouest',
                effets: { milles: 18, moral: -5 },
                consequence: "Tu tiens ta route sans dévier. Les oiseaux disparaissent au loin, vers le sud — et avec eux, pour certains à bord, un espoir de plus.",
              },
              {
                texte: 'Crier que la terre est proche, malgré le doute',
                effets: { moral: 10 },
                consequence: "Tu proclames que la terre ne peut plus être loin. Les regards s'éclairent — pour la troisième fois cette semaine. À l'horizon, il n'y a encore que de l'eau.",
              },
            ],
          },
          {
            titre: 'La nuit où tout a failli basculer',
            scene: "9 octobre 1492. L'eau douce et les vivres touchent au fond des tonneaux. L'équipage, à bout, se rassemble et gronde : cela fait trop de jours sans terre. Certains parlent tout haut de faire demi-tour, de force s'il le faut.",
            options: [
              {
                texte: 'Promettre de faire demi-tour si rien ne change sous trois jours',
                effets: { moral: 20 },
                consequence: "Les visages se détendent un peu. Tu as cédé du terrain — mais tu as gagné les quelques jours qu'il te fallait encore.",
                historique: "Le 10 octobre 1492, face au début de mutinerie, Colomb s'engagea à rebrousser chemin sous trois jours si aucune terre n'était trouvée. La mutinerie n'aura finalement jamais lieu : la terre fut en vue deux jours plus tard.",
              },
              {
                texte: "Réaffirmer ton autorité d'amiral sans céder",
                effets: { moral: -10, milles: 5 },
                consequence: "Tu tiens bon. Le navire avance, mais dans un silence pesant, où chaque regard croisé pèse aussi lourd qu'une menace.",
              },
              {
                texte: 'Partager les dernières réserves à parts égales',
                effets: { vivres: -15, moral: 10 },
                consequence: "Chacun reçoit sa part, sans faveur pour personne. Ça ne remplit pas les tonneaux vides, mais ça tient les hommes ensemble une nuit de plus.",
              },
            ],
          },
          {
            titre: 'Terre !',
            scene: "12 octobre 1492, deux heures du matin. Un cri traverse la nuit depuis la Pinta : « Terre ! Terre ! » Au matin, une île se dessine à l'horizon, couverte de verdure. Après plus d'un mois sans rien voir d'autre que l'eau, il faut décider comment aborder ce premier rivage.",
            options: [
              {
                texte: "Baptiser l'île San Salvador et remercier Dieu",
                effets: { moral: 20, milles: 25 },
                consequence: "Tu plantes l'étendard royal sur le sable. Les Indes, enfin, après tant de nuits à douter. Autour de toi, des hommes que tu n'avais encore jamais vus pleurer.",
                historique: "Rodrigo de Triana, marin de la Pinta, fut le premier à crier « Terre ! » cette nuit-là. Mais Colomb affirma avoir aperçu une lumière quelques heures plus tôt, et s'attribua la récompense des souverains : Triana, lui, ne toucha jamais un maravédi.",
              },
              {
                texte: 'Chercher aussitôt les signes des richesses des Indes',
                effets: { moral: 10, vivres: 10 },
                consequence: "Les habitants de l'île portent de petits ornements d'or à travers le nez. Pour toi, aucun doute : les Indes sont bien là, et leurs richesses avec elles.",
              },
              {
                texte: 'Noter la position exacte dans le journal, pour la Couronne',
                effets: { milles: 25, moral: 5 },
                consequence: "Tu inscris soigneusement latitude et route parcourue. Aux yeux de la Couronne d'Espagne, ce bout de terre vient de devenir la première étape des Indes occidentales.",
              },
            ],
          },
        ],
        epilogues: [
          {
            condition: { vivres: [0, 25] },
            texte: "Les tonneaux sonnent creux depuis plusieurs jours quand le cri tant attendu retentit enfin. On l'a appelée San Salvador — la première terre des Indes, croit-on à bord, atteinte de justesse, l'eau douce presque à sec.",
          },
          {
            condition: { moral: [0, 35] },
            texte: "Ils ont failli faire demi-tour à quelques jours de la terre. Quand San Salvador apparaît enfin, les rancunes ne s'effacent pas d'un coup — mais l'amiral, lui, n'a plus aucun doute : les Indes sont là, sous ses pieds.",
          },
          {
            condition: { moral: [70, 100] },
            texte: "L'équipage débarque en chantant sur le sable de San Salvador, convaincu d'avoir traversé la mer Océane jusqu'aux portes de l'Asie. Colomb plante l'étendard royal, certain, enfin, d'avoir eu raison depuis le premier jour.",
          },
          {
            condition: {},
            texte: "Après plus d'un mois sans voir la terre, la flotte touche enfin au but : une île que ses habitants appellent Guanahani, et que Colomb baptise San Salvador. Pour lui, aucun doute : ce sont les Indes. Il ne saura jamais qu'il vient de découvrir un monde qu'aucune carte européenne n'avait encore dessiné.",
          },
        ],
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
