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
        consigne: 'Trouve ce que ces hommes ont su faire avant tout le monde.',
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
      fildesjours: {
        personnage: { nom: 'Louis XIV', annee: '1685', role: 'Roi de France, à Versailles' },
        jauges: [
          { id: 'autorite', label: 'Autorité', depart: 60 },
          { id: 'attentionCour', label: 'Attention de la Cour', depart: 40 },
        ],
        etapes: [
          {
            titre: "Huit heures, la chambre s'ouvre",
            scene: "8h. Le premier valet de chambre tire les courtines du lit à baldaquin. Derrière la porte, un petit groupe patiente déjà : le premier médecin, le premier chirurgien, et deux ou trois favoris qui ont reçu ce privilège rarissime, les « grandes entrées » — le droit d'assister aux tout premiers instants du jour du roi, avant même le reste de la Cour. Il faut décider qui franchit la porte en premier.",
            options: [
              {
                texte: "Faire entrer d'abord le médecin, pour l'examen du matin",
                effets: { autorite: 8, attentionCour: -5 },
                consequence: "Le premier médecin s'approche, prend le pouls, interroge sur la nuit passée. Derrière lui, les favoris des grandes entrées patientent en silence, un peu déçus de ne pas passer les premiers.",
                historique: "Les « grandes entrées » n'étaient accordées qu'à une poignée de personnes à la fois : quelques princes, quelques favoris, les médecins du roi. Ce tout petit cercle avait seul le droit d'assister au tout début du Petit Lever.",
              },
              {
                texte: "Faire entrer d'abord les favoris, pour prendre des nouvelles en s'habillant",
                effets: { attentionCour: 10, autorite: -5 },
                consequence: "Les favoris s'approchent du lit, glissent une nouvelle, une remarque flatteuse. Le médecin patiente à son tour, un peu vexé de ne pas passer en premier ce matin.",
              },
              {
                texte: 'Faire entrer tout le monde en même temps, sans distinction de rang',
                effets: { autorite: -10, attentionCour: 6 },
                consequence: "Le petit groupe se presse dans la chambre sans ordre établi. Certains s'amusent du désordre ; d'autres, plus attachés à leur rang, s'en offusquent visiblement.",
              },
            ],
          },
          {
            titre: 'La prière, depuis le lit',
            scene: "Le roi ne se lève pas encore. Assis contre ses oreillers, il suit l'office récité par son aumônier, debout à son chevet. Dans la chambre, ceux déjà admis se tiennent debout, immobiles, pendant que résonne sa voix.",
            options: [
              {
                texte: 'Suivre l\'office sans rien précipiter',
                effets: { attentionCour: 8, autorite: -5 },
                consequence: "L'aumônier égrène les prières à son rythme habituel. Dans la chambre, chacun observe le roi prier — un roi pieux devant témoins vaut, aux yeux de la Cour, autant qu'un roi puissant.",
              },
              {
                texte: "Demander à l'aumônier d'abréger, la journée presse",
                effets: { autorite: 6, attentionCour: -8 },
                consequence: "L'office se referme plus vite qu'à l'accoutumée. Quelques regards se croisent dans la chambre : le roi presse le pas, ce matin — la Cour retiendra qu'il n'avait pas de temps à lui donner.",
              },
              {
                texte: "Faire réciter l'office à voix haute, pour que la chambre entière l'entende",
                effets: { autorite: 10, attentionCour: 4 },
                consequence: "La voix de l'aumônier emplit la pièce. Chacun baisse la tête. Un roi qui prie devant sa Cour, à voix haute, rappelle sans un mot d'où vient son pouvoir.",
                historique: "L'office du matin durait un bon quart d'heure ; le roi le suivait depuis son lit, entouré de ceux déjà admis dans la chambre — la prière elle-même se faisait devant témoins.",
              },
            ],
          },
          {
            titre: 'Rasage et choix de la perruque',
            scene: "Le roi se lève enfin. Un jour sur deux, c'est jour de rasage : le barbier attend, rasoir en main. À côté, le valet de la garde-robe présente plusieurs perruques sur leurs supports de bois, pour que le roi choisisse celle qu'il portera. Un message urgent, apporté par un secrétaire, attend aussi une réponse.",
            options: [
              {
                texte: 'Laisser le barbier raser pendant que le valet peigne la perruque choisie',
                effets: { autorite: 6 },
                consequence: "Le rasoir glisse avec soin sous l'œil attentif du valet, qui brosse déjà la perruque élue. Un geste réglé depuis des années, sans un mot de trop.",
              },
              {
                texte: 'Demander à un favori présent son avis sur la perruque à porter',
                effets: { attentionCour: 12, autorite: -4 },
                consequence: "Le favori consulté rosit de plaisir — on lui a demandé son avis, à lui, devant tous les autres. La nouvelle circulera dans les couloirs de Versailles avant midi.",
              },
              {
                texte: 'Faire attendre le barbier pour écouter le message du secrétaire',
                effets: { autorite: 10, attentionCour: -6 },
                consequence: "Le barbier range son rasoir sans un mot. Le secrétaire chuchote son rapport à l'oreille du roi, pendant que dans la pièce, l'attente se fait un peu pesante pour tous les autres.",
              },
            ],
          },
          {
            titre: 'Le bougeoir',
            scene: "C'est l'heure d'un tout petit rituel que toute la Cour surveille de près : désigner qui, ce jour, aura l'honneur de tenir le bougeoir pendant que le roi achève sa toilette. Plusieurs courtisans se tiennent un peu trop près de la lumière, dans l'espoir silencieux d'être choisis.",
            options: [
              {
                texte: 'Choisir un courtisan fidèle depuis longtemps, sans faire de vagues',
                effets: { autorite: 8, attentionCour: 2 },
                consequence: "Le vieux courtisan s'avance, bougeoir en main, presque ému. Personne ne s'étonne du choix — la fidélité a payé, une fois de plus.",
              },
              {
                texte: 'Choisir un tout jeune arrivant à la Cour, pour le distinguer',
                effets: { attentionCour: 14, autorite: -6 },
                consequence: "Le jeune homme s'avance, rouge de fierté, sous les regards surpris des plus anciens. D'ici ce soir, toute la Cour saura son nom — et se demandera pourquoi lui.",
                historique: "Tenir le bougeoir du roi ne demandait aucun talent particulier, mais c'était l'un des honneurs les plus recherchés de Versailles : être vu, quelques minutes, dans la lumière la plus proche du roi.",
              },
              {
                texte: 'Ne désigner personne tout de suite, et laisser la Cour deviner',
                effets: { attentionCour: -8, autorite: 10 },
                consequence: "Les courtisans échangent des regards inquiets, sans oser bouger ni parler. Le silence, ce matin, en dit plus long que n'importe quel nom prononcé.",
              },
            ],
          },
          {
            titre: 'La chemise, honneur suprême',
            scene: "Le Grand Lever commence : la porte de la chambre s'ouvre plus largement, et cette fois toute une partie de la Cour entre pour de bon. Le maître de la garde-robe et le premier valet s'apprêtent à ôter la chemise de nuit, une manche après l'autre. Reste à savoir qui, dans la pièce, aura l'honneur suprême de présenter la chemise neuve : le privilège est réservé au dauphin — mais ce matin, il n'est pas là.",
            options: [
              {
                texte: 'Confier l\'honneur au duc de Bourgogne, le petit-fils présent',
                effets: { autorite: 6, attentionCour: 10 },
                consequence: "Le jeune duc s'avance, la chemise pliée sur les bras, sous le regard de toute la chambre. La lignée est respectée : à défaut du dauphin, c'est son propre sang qui s'approche le plus près du roi.",
                historique: "En l'absence du dauphin, ce sont en principe les ducs de Bourgogne, de Berry ou d'Orléans — les princes du sang les plus proches — qui présentaient la chemise neuve au roi.",
              },
              {
                texte: "Confier l'honneur au grand chambellan, en l'absence d'un prince",
                effets: { autorite: 10, attentionCour: -4 },
                consequence: "Le grand chambellan s'avance avec la solennité de sa charge. L'ordre est respecté à la lettre — mais dans la pièce, plus d'un prince du sang aurait aimé qu'on pense à lui d'abord.",
              },
              {
                texte: "Faire attendre un instant, le temps qu'un prince du sang arrive",
                effets: { attentionCour: 8, autorite: -6 },
                consequence: "Toute la chambre patiente, chemise en main, pendant qu'on va chercher un prince du sang dans l'antichambre. Personne ne s'assoit, personne ne parle fort : on attend, ensemble, que l'honneur trouve son destinataire.",
              },
            ],
          },
          {
            titre: 'Vers dix heures, le départ',
            scene: "Il est presque dix heures. Le roi est habillé, coiffé, chaussé. Dans la galerie, une file de courtisans et de quémandeurs attend déjà son passage vers la messe, chapeau, canne et gants prêts à être saisis au moment de sortir.",
            options: [
              {
                texte: "Traverser la galerie d'un pas rapide, sans s'arrêter",
                effets: { autorite: 10, attentionCour: -10 },
                consequence: "Le roi avance sans ralentir. Les courtisans s'inclinent au passage, chapeau bas — mais aucun n'a pu placer un mot, et certains repartiront ce matin sans la faveur espérée.",
              },
              {
                texte: 'S\'arrêter un instant pour écouter une requête, en marchant',
                effets: { attentionCour: 12, autorite: -4 },
                consequence: "Un gentilhomme profite de l'instant pour glisser sa demande. Le roi l'écoute deux pas durant, sans rien promettre — mais dans la galerie, on retiendra surtout qu'il a été écouté.",
              },
              {
                texte: 'Se faire accompagner par les princes présents jusqu\'à la sortie',
                effets: { autorite: 8, attentionCour: 6 },
                consequence: "Le roi sort entouré des princes du sang, chapeau, canne et gants déjà en main. La petite troupe traverse la galerie où les courtisans s'inclinent en rangs, comme chaque matin depuis toujours.",
              },
            ],
          },
        ],
        epilogues: [
          // Les épilogues d'échec passent en premier : `resoudreEpilogue` retient
          // le premier dont toutes les conditions sont satisfaites.
          //
          // Les seuils viennent d'une énumération exhaustive des 729 parties
          // possibles, pas d'une intuition : la Cour finit à 30 ou moins dans
          // 8 % des chemins, et l'autorité dans 0,3 %. C'est peu, et c'est
          // assumé — le vrai rééquilibrage du scénario est la tâche T1 de
          // docs/niveau-1.md. Mais on peut désormais perdre pour de bon, alors
          // qu'avant un seul chemin sur 729 échouait, et il affichait un
          // épilogue triomphal.
          {
            condition: { attentionCour: [0, 30] },
            echec: true,
            texte: "Dix heures sonnent dans une galerie à moitié vide. À force de trancher seul et de ne rien laisser à quiconque, le roi s'est levé ce matin devant des courtisans qui n'avaient plus rien à y gagner — et un Versailles où l'on ne se dispute plus le privilège de tendre la chemise est un Versailles qui a cessé de fonctionner. Toute la mécanique du lever tenait là : occuper la noblesse à se disputer des riens, pour qu'elle ne se dispute pas le royaume.",
          },
          {
            condition: { autorite: [0, 30] },
            echec: true,
            texte: "Dix heures sonnent, et personne ne s'en aperçoit vraiment. Le lever s'est dissous en conversations, en familiarités, en petits arrangements ; le roi est sorti de sa chambre comme un homme parmi d'autres. C'est précisément ce que le cérémonial existait pour empêcher : à Versailles, un roi qu'on approche sans protocole est un roi qu'on finit par ne plus craindre.",
          },
          {
            condition: { autorite: [75, 100] },
            texte: "Dix heures sonnent. Le roi sort enfin de sa chambre, chapeau, canne et gants en main, et la galerie s'incline tout entière sur son passage, sans un murmure. Ce matin encore, une trentaine de mains ont participé à habiller un seul homme — et pas une seule fois il n'est resté seul avec lui-même.",
          },
          {
            condition: { autorite: [0, 30] },
            texte: "Dix heures sonnent, un peu tard. Le roi sort enfin de sa chambre parmi les rires et les apartés qui ne se sont jamais vraiment tus. Rien de grave ne s'est produit — mais dans les couloirs de Versailles, on retient surtout, ce matin, qu'un roi qui rit avec sa Cour est un roi qu'on croit pouvoir approcher d'un peu trop près.",
          },
          {
            condition: { attentionCour: [75, 100] },
            texte: "Dix heures sonnent. Le roi sort enfin de sa chambre, et la galerie bruisse de sourires, de saluts appuyés, de noms qu'on se répète déjà d'une oreille à l'autre — celui qui a tenu le bougeoir, celui qui a présenté la chemise. Versailles a de nouveau trouvé, ce matin, cent bonnes raisons de rester à portée du roi.",
          },
          {
            condition: {},
            texte: "Dix heures sonnent. Le roi quitte enfin sa chambre, chapeau, canne et gants en main, pour rejoindre la messe. Médecin, aumônier, barbier, valets, princes, courtisans : ce matin encore, une trentaine de personnes se sont relayées autour de lui pour l'habiller, le peigner, lui tendre sa chemise — et pas un instant, du réveil à la sortie, le roi de France n'a été seul.",
          },
        ],
      },
    },
  },
  {
    id: 'cp-histoire-frise-temps',
    gradeId: 'cp',
    domainId: 'histoire',
    difficulty: 1,
    title: 'La frise du temps',
    summary:
      'Une frise ne sert pas à retenir des dates, mais à voir les écarts : ce qui ' +
      'paraît « ancien » l’est rarement autant qu’on le croit.',
    funFact:
      'Entre les peintures de Lascaux et les premières écritures, il s’écoule plus de ' +
      'temps qu’entre les premières écritures et nous. Et Lascaux a été retrouvée en ' +
      '1940 par quatre adolescents qui cherchaient leur chien.',
    games: {
      timeline: {
        consigne: 'Place chaque événement entre ceux qui y sont déjà.',
        /*
         * L'ancienne version faisait ordonner « Le passé », « Le présent » et
         * « Le futur » : la réponse était dans les mots, il n'y avait rien à
         * trouver. C'était la mécanique la plus creuse du projet.
         *
         * Une vraie frise ne demande pas de connaître les dates : elle demande
         * de situer les choses les unes par rapport aux autres. Les repères
         * sont choisis pour que l'écart soit la leçon — entre Lascaux et
         * l'écriture, il s'écoule plus de temps qu'entre l'écriture et nous.
         *
         * Dates arrondies et vérifiables : Lascaux ~17 000 ans avant nous,
         * premières tablettes d'Uruk vers 3300 av. n. è., Versailles cour
         * installée en 1682, Colomb 1492, Bastille 1789, tour Eiffel 1889,
         * redécouverte de Lascaux 1940.
         */
        cartesDeDepart: 1,
        secondesTotal: 75,
        events: [
          { label: 'Les peintures de Lascaux', sortValue: -15000, repere: 'il y a 17 000 ans' },
          { label: 'Les premières écritures', sortValue: -3300, repere: '3300 av. J.-C.' },
          { label: 'Christophe Colomb atteint l’Amérique', sortValue: 1492, repere: '1492' },
          { label: 'Louis XIV installe sa cour à Versailles', sortValue: 1682, repere: '1682' },
          { label: 'La prise de la Bastille', sortValue: 1789, repere: '1789' },
          { label: 'La tour Eiffel', sortValue: 1889, repere: '1889' },
          { label: 'Quatre enfants redécouvrent Lascaux', sortValue: 1940, repere: '1940' },
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
    /*
     * Le `summary` rangeait l'écriture parmi les inventions de la Préhistoire,
     * ce qui contredit frontalement `cp-histoire-prehistoire` : « la période
     * avant l'invention de l'écriture ». L'écriture n'est pas la dernière
     * invention de la Préhistoire, c'est sa borne — le premier document de
     * l'Histoire. Corrigé ici, et c'est la carte 12 de la chaîne.
     *
     * Le `match` ci-dessous garde l'écriture dans la même liste que le feu et
     * l'agriculture ; il faudrait un arbitrage sur le titre et sur ce payload
     * pour lever complètement la contradiction.
     */
    summary:
      'Le feu, l’agriculture et la roue appartiennent à la Préhistoire. L’écriture, non : ' +
      'c’est elle qui y met fin.',
    funFact:
      'Les plus anciens textes du monde ne racontent rien. Les milliers de tablettes d’argile ' +
      'retrouvées à Uruk, en Mésopotamie, autour de 3300 avant notre ère, sont des ' +
      'inventaires : tant de moutons, tant de mesures d’orge, tant de jarres d’huile. ' +
      'L’humanité n’a pas inventé l’écriture pour prier ni pour raconter des histoires, mais ' +
      'pour tenir ses comptes. Et c’est cette invention de comptable qui referme la ' +
      'Préhistoire : l’Histoire commence, par définition, là où apparaissent des sources ' +
      'écrites.',
    games: {
      /*
       * Ordre de perfidie croissante, jamais mélangé. Deux pièges posés une carte
       * à l'avance : 8 → 9 (connaître la roue ne suffit pas à s'en servir) et
       * 11 → 12 (l'écriture date bien de 5 000 ans, mais elle n'est pas une
       * invention de la Préhistoire — elle en marque la fin).
       *
       * Faits vérifiés par recherche : usage régulier du feu attesté depuis
       * environ 400 000 ans ; néolithisation vers 10 000 avant notre ère dans
       * au moins sept ou huit foyers indépendants ; premiers agriculteurs
       * européens environ 4 cm plus petits et en moins bonne santé ; roue vers
       * 3500 avant notre ère ; aucune roue parmi le million d'objets
       * inventoriés à Gizeh, char introduit en Égypte vers 1600 avant notre
       * ère ; jouets à roulettes de Mésoamérique (Tres Zapotes) sans animaux de
       * trait disponibles ; tablettes comptables d'Uruk vers 3300 avant notre
       * ère ; écriture inventée indépendamment à Sumer, en Chine et en
       * Mésoamérique, l'Égypte étant très probablement un quatrième foyer.
       */
      chaine: {
        consigne: 'Vrai ou faux ? Glisse à droite pour vrai, à gauche pour faux.',
        secondesParCarte: 8,
        affirmations: [
          {
            texte: 'Le feu est de très loin la plus ancienne de ces grandes inventions.',
            vrai: true,
            verdict:
              'Son usage régulier est attesté depuis environ 400 000 ans, et certains sites ' +
              'suggèrent bien plus tôt encore. Entre le feu et les premiers champs, il s’écoule ' +
              'quarante fois plus de temps qu’entre les premiers champs et vous.',
          },
          {
            texte: 'L’agriculture est apparue il y a environ dix mille ans, à la fin de la Préhistoire.',
            vrai: true,
            verdict:
              'Le Néolithique. On l’appelle « révolution », mais elle a pris près de quatre ' +
              'mille ans au Proche-Orient : on a récolté du blé sauvage bien avant de le semer.',
          },
          {
            texte: 'La roue est une invention bien plus récente que l’agriculture.',
            vrai: true,
            verdict:
              'Vers 3500 avant notre ère, soit six mille ans après les premières cultures. On ' +
              'sait cuire le pain, tisser et bâtir des villages bien avant de savoir faire ' +
              'tourner quoi que ce soit sur un axe.',
          },
          {
            texte: 'Les premiers agriculteurs étaient plus petits et moins bien portants que les chasseurs.',
            vrai: true,
            verdict:
              'Environ quatre centimètres de moins, plus de caries, plus de carences, plus ' +
              'd’épidémies — un régime concentré sur deux ou trois céréales, des villages ' +
              'denses, des animaux à demeure. L’agriculture n’a pas amélioré les vies : elle a ' +
              'permis d’en nourrir beaucoup plus.',
          },
          {
            texte: 'L’agriculture a été inventée plusieurs fois, séparément, sur plusieurs continents.',
            vrai: true,
            verdict:
              'Au moins sept ou huit foyers indépendants : le Proche-Orient, la Chine du Nord ' +
              'et celle du Sud, la Nouvelle-Guinée, l’Afrique, les Andes, la Mésoamérique. ' +
              'Personne n’a copié personne — la même idée est venue à des gens qui ignoraient ' +
              'jusqu’à l’existence les uns des autres.',
          },
          {
            texte: 'Les plus anciens textes du monde ne sont ni des poèmes ni des lois, mais des comptes.',
            vrai: true,
            verdict:
              'Des milliers de tablettes d’argile à Uruk : tant de moutons, tant d’orge, tant ' +
              'de jarres d’huile. La littérature viendra des siècles plus tard. L’écriture est ' +
              'née dans un entrepôt.',
          },
          {
            texte: 'Les Égyptiens ont bâti les grandes pyramides en faisant rouler les blocs sur des roues.',
            vrai: false,
            verdict:
              'Plus d’un million d’objets inventoriés à Gizeh, et pas un fragment de roue, pas ' +
              'une représentation. On tirait les charges sur des traîneaux — une peinture de ' +
              'tombe montre même un homme qui verse de l’eau devant le patin, et l’expérience ' +
              'a confirmé que mouiller le sable divise le frottement par deux. La roue n’arrive ' +
              'en Égypte qu’avec le char, vers 1600 avant notre ère : près de mille ans après ' +
              'Khéops.',
          },
          {
            texte: 'Les peuples d’Amérique connaissaient la roue avant l’arrivée des Européens.',
            vrai: true,
            verdict:
              'On a retrouvé en Mésoamérique de petits animaux de terre cuite montés sur ' +
              'essieux, considérés comme des jouets d’enfants. Retiens-le : la carte suivante ' +
              'en dépend.',
          },
          {
            texte: 'Ils s’en servaient donc pour transporter marchandises et matériaux.',
            vrai: false,
            verdict:
              'Jamais. Il leur manquait ce qui tire : ni cheval, ni bœuf, ni âne sur le ' +
              'continent — le lama porte, il ne tracte pas. Une roue qu’aucune bête n’attelle, ' +
              'sur des sentiers de montagne et de forêt, ne sert à rien. L’invention ne suffit ' +
              'pas : il faut aussi le monde qui la rend utile.',
          },
          {
            texte: 'L’écriture a été inventée une seule fois, puis s’est répandue de proche en proche.',
            vrai: false,
            verdict:
              'C’est ce qu’on a longtemps cru, et c’est faux. Sumer vers 3300 avant notre ère, ' +
              'la Chine sur des os divinatoires vers le XIIIe siècle avant notre ère, la ' +
              'Mésoamérique quelques siècles avant notre ère — et très probablement l’Égypte, ' +
              'de son côté. Aucun de ces peuples n’avait entendu parler des autres.',
          },
          {
            texte: 'L’écriture est apparue il y a un peu plus de cinq mille ans, en Mésopotamie.',
            vrai: true,
            verdict:
              'Vers 3300 avant notre ère, dans la cité d’Uruk. Retiens-le : la carte suivante ' +
              'en dépend.',
          },
          {
            texte: 'C’est donc la dernière des grandes inventions de la Préhistoire.',
            vrai: false,
            verdict:
              'Le piège, et il tient à un mot. La Préhistoire n’est pas une époque qui ' +
              'contiendrait l’écriture parmi ses trouvailles : c’est, par définition, le temps ' +
              'sans sources écrites. L’écriture n’en est pas la dernière invention, elle en est ' +
              'la borne, et le premier document de l’Histoire. La borne se déplace d’ailleurs ' +
              'd’une région à l’autre : quand on grave les premières tablettes à Uruk, ' +
              'l’Europe de l’Ouest a encore des millénaires de Préhistoire devant elle.',
          },
        ],
      },
      match: {
        pairs: [
          { left: 'La roue', right: 'Se déplacer plus facilement' },
          // L'écriture est SORTIE de cette liste : elle ne fait pas partie des
          // inventions de la Préhistoire, elle en marque la fin. La laisser ici
          // contredisait la notion `cp-histoire-prehistoire` du même fichier.
          { left: 'La poterie', right: 'Conserver et transporter les récoltes' },
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
      fildesjours: {
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
          // Même logique que pour Louis XIV : l'échec d'abord, avec un seuil
          // atteignable. Sur les 2187 parties possibles, la distance reste à 25
          // ou moins dans 8 % des chemins — et aucune, avant ce correctif, ne
          // pouvait être perdue.
          {
            condition: { milles: [0, 25] },
            echec: true,
            texte: "Les semaines passent sans que rien change à l'horizon. Trop de jours à louvoyer, trop de caps repris, trop de prudence : les vivres s'épuisent avant que la terre n'apparaisse, et il faut virer de bord. L'Asie, de toute façon, n'était pas là où Colomb la croyait — il avait sous-estimé la circonférence de la Terre d'environ un quart, et seul un continent qu'il n'attendait pas pouvait le sauver de son erreur de calcul.",
          },
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
    summary:
      'Cinq jours sur sept portent le nom d’un astre romain. Les deux derniers, non : ' +
      'le week-end français a été rebaptisé par les religions.',
    funFact:
      'L’anglais a gardé Saturday, le jour de Saturne, et Sunday, le jour du Soleil. ' +
      'Le français les a remplacés : samedi vient de l’hébreu shabbat — le m vient du ' +
      'grec, qui avait nasalisé le mot — et dimanche du latin chrétien dies dominicus, ' +
      '« le jour du Seigneur ». Deux religions ont effacé deux dieux romains, et ' +
      'seulement de ce côté-ci de la Manche.',
    games: {
      /*
       * Les affirmations sont dans l'ordre de perfidie croissante, jamais
       * mélangées : c'est cet ordre qui fait la courbe de la manche. Les six
       * premières installent la confiance, la huitième pose le piège, et les
       * deux suivantes le referment.
       *
       * Étymologies vérifiées par recherche (Wikipédia « Noms des jours de la
       * semaine » et « Dimanche »), pas de mémoire — c'est la règle du projet,
       * et le `summary` précédent était justement faux : il affirmait que les
       * sept jours venaient des dieux romains.
       */
      chaine: {
        consigne: 'Vrai ou faux ? Glisse à droite pour vrai, à gauche pour faux.',
        secondesParCarte: 8,
        affirmations: [
          {
            texte: 'Lundi vient de la Lune.',
            vrai: true,
            verdict: 'Dies Lunae, « le jour de la Lune ». Celui-là est resté intact.',
          },
          {
            texte: 'Mercredi vient de Mercure.',
            vrai: true,
            verdict: 'Dies Mercurii. Le dieu des marchands et des voyageurs.',
          },
          {
            texte: 'Vendredi vient de Vénus.',
            vrai: true,
            verdict: 'Dies Veneris. Rien à voir avec le vendredi de la Passion.',
          },
          {
            texte: 'Le mot « semaine » vient d’un mot latin qui veut dire « sept ».',
            vrai: true,
            verdict: 'Septimana, de septem. Une semaine, c’est littéralement « la septaine ».',
          },
          {
            texte: 'Les sept jours viennent des sept astres que les Anciens appelaient planètes.',
            vrai: true,
            verdict:
              'Le Soleil, la Lune, Mars, Mercure, Jupiter, Vénus et Saturne. Sept astres ' +
              'mobiles dans le ciel : sept jours. La Terre n’en faisait pas partie.',
          },
          {
            texte: 'Jeudi vient de Jupiter.',
            vrai: true,
            verdict: 'Jovis dies, le jour de Jove — l’autre nom de Jupiter.',
          },
          {
            texte: 'Selon la norme internationale, la semaine commence le lundi.',
            vrai: true,
            verdict:
              'Norme ISO 8601. Beaucoup de calendriers, notamment américains, la font ' +
              'commencer le dimanche : la question a une réponse, mais elle est récente.',
          },
          {
            texte: 'En anglais, « Saturday » vient bien de Saturne.',
            vrai: true,
            verdict: 'Saturn’s day. Retiens-le : la carte suivante en dépend.',
          },
          {
            texte: 'Samedi vient de Saturne.',
            vrai: false,
            verdict:
              'Le piège. L’anglais dit Saturday, mais le français vient de l’hébreu ' +
              'shabbat, passé par le grec — d’où le m — puis par le latin sambati dies. ' +
              'La semaine française n’est romaine qu’aux cinq septièmes.',
          },
          {
            texte: 'Dimanche vient du Soleil.',
            vrai: false,
            verdict:
              'Encore l’anglais qui trompe : Sunday, oui ; dimanche, non. Du latin ' +
              'chrétien dies dominicus, « le jour du Seigneur ».',
          },
          {
            texte: 'Chez les Romains, le dimanche était pourtant bien le jour du Soleil.',
            vrai: true,
            verdict:
              'Dies Solis. Il l’était — et c’est justement ce que le christianisme a ' +
              'recouvert. Le Soleil n’a pas disparu du calendrier par hasard.',
          },
        ],
      },
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
