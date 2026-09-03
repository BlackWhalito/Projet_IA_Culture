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
      /*
       * Ordre de perfidie croissante, jamais mélangé. Le piège posé une carte à
       * l'avance est le couple 10 → 11 : le « vair » existe bel et bien comme
       * fourrure (vrai), mais Perrault a écrit « verre » (faux).
       *
       * Faits vérifiés par recherche, ce domaine étant un nid à légendes
       * recopiées : manuscrit de 1695 et édition de 1697 portent tous deux
       * « verre », l'hypothèse du vair vient de Balzac (Sur Catherine de
       * Médicis, 1841) puis de Littré et n'est appuyée par aucun texte ancien
       * (Académie française, Wikipédia « Controverse sur la composition des
       * pantoufles de Cendrillon ») ; Perrault meurt en 1703, Jacob Grimm naît
       * en 1785 ; privilège et épître signés P. Darmancour, du nom du plus
       * jeune fils de Perrault ; Petit Chaperon rouge dévoré sans secours chez
       * Perrault, chasseur ajouté par les Grimm ; orteil et talon tranchés puis
       * yeux crevés par les colombes dans Aschenputtel ; Dorothea Viehmann,
       * principale conteuse des Grimm, veuve d'un maître tailleur et
       * descendante de huguenots messins, présentée à tort en paysanne ; loi de
       * Grimm publiée dans la Deutsche Grammatik en 1822 ; Deutsches Wörterbuch
       * commencé en 1838 et achevé seulement en 1961 ; chez Perrault la
       * princesse s'éveille seule à la fin de l'enchantement, et le conte
       * continue sur la belle-mère ogresse.
       */
      chaine: {
        consigne: 'Vrai ou faux ? Glisse à droite pour vrai, à gauche pour faux.',
        secondesParCarte: 8,
        affirmations: [
          {
            texte: 'Dans Le Petit Chaperon rouge, le loup dévore la grand-mère avant la fillette.',
            vrai: true,
            verdict:
              'Dans toutes les versions écrites, oui. Mais le conte circulait de bouche à ' +
              'oreille bien avant d’être imprimé, et les versions orales relevées au XIXe siècle ' +
              'dans les campagnes françaises sont autrement plus rudes : le loup y fait manger ' +
              'à la fillette un morceau de sa propre grand-mère.',
          },
          {
            texte: 'Cendrillon, La Belle au bois dormant et Le Chat botté sont des contes de Perrault.',
            vrai: true,
            verdict:
              'Les trois figurent dans le même mince recueil de 1697, avec Le Petit Chaperon ' +
              'rouge, Barbe bleue, Le Petit Poucet et deux autres. Huit contes en tout : ' +
              'presque tout ce que la France sait des contes tient dans ce seul livre.',
          },
          {
            texte: 'Perrault et les frères Grimm n’ont jamais pu se croiser, même de loin.',
            vrai: true,
            verdict:
              'Perrault meurt en 1703 ; Jacob Grimm naît en 1785. Plus de quatre-vingts ans ' +
              'de vide entre les deux — et pourtant on les cite toujours dans la même phrase, ' +
              'comme s’ils avaient travaillé côte à côte.',
          },
          {
            texte: 'Perrault a fait paraître ses contes sous le nom de son plus jeune fils.',
            vrai: true,
            verdict:
              'L’épître et le privilège de 1697 sont signés P. Darmancour, du nom de Pierre. ' +
              'Perrault approchait des soixante-dix ans, siégeait à l’Académie française, et ' +
              'un académicien ne signait pas des histoires de fées.',
          },
          {
            texte: 'Les frères Grimm étaient d’abord des savants, pas des conteurs.',
            vrai: true,
            verdict:
              'Des philologues. Jacob a laissé son nom à une loi de linguistique, publiée en ' +
              '1822, qui décrit comment les consonnes indo-européennes se sont déplacées en ' +
              'germanique. Leur grande œuvre à leurs propres yeux n’était pas les contes, ' +
              'mais un dictionnaire de l’allemand, commencé en 1838 — et terminé en 1961, un ' +
              'siècle après leur mort.',
          },
          {
            texte: 'Chez Perrault, personne ne sauve le Petit Chaperon rouge : elle meurt.',
            vrai: true,
            verdict:
              'Le conte s’arrête sur le loup rassasié, puis sur une morale qui prévient les ' +
              'jeunes filles contre les « loups doucereux ». Ce n’est pas une histoire pour ' +
              'endormir un enfant : c’est un avertissement adressé à la cour de Versailles.',
          },
          {
            texte: 'Le chasseur qui ouvre le ventre du loup n’apparaît que chez les Grimm.',
            vrai: true,
            verdict:
              'Un siècle plus tard, et la fin change du tout au tout : on fend le loup, la ' +
              'grand-mère et la fillette en sortent vivantes, on remplit la panse de pierres. ' +
              'La version que tout le monde raconte n’est pas la française.',
          },
          {
            texte: 'Chez les Grimm, les sœurs de Cendrillon se taillent le pied pour la pantoufle.',
            vrai: true,
            verdict:
              'L’une se coupe un orteil, l’autre un morceau de talon ; le sang qui déborde de ' +
              'la chaussure les trahit. Et le jour des noces, deux colombes leur crèvent les ' +
              'yeux. Chez Perrault, à l’inverse, Cendrillon pardonne à ses sœurs et les marie ' +
              'à deux seigneurs de la cour.',
          },
          {
            texte: 'Les conteuses des frères Grimm étaient des paysannes de Hesse sans instruction.',
            vrai: false,
            verdict:
              'C’est l’image que les Grimm ont eux-mêmes entretenue, et elle arrangeait leur ' +
              'projet : recueillir la voix pure du peuple allemand. Leur principale conteuse, ' +
              'Dorothea Viehmann, était la veuve cultivée d’un maître tailleur, descendante de ' +
              'huguenots français. Beaucoup de leurs informatrices étaient des bourgeoises ' +
              'lisant le français — ce qui explique que certains contes « bien allemands » ' +
              'ressemblent tant à ceux de Perrault.',
          },
          {
            texte: 'En ancien français, le « vair » désigne bien une fourrure d’écureuil.',
            vrai: true,
            verdict:
              'Le petit-gris, gris dessus et blanc dessous, cousu en damier sur les manteaux ' +
              'de la noblesse médiévale. Le mot existe, il est même en héraldique. Retiens-le : ' +
              'la carte suivante en dépend.',
          },
          {
            texte: 'La pantoufle était donc de vair, et « verre » n’est qu’une faute d’impression.',
            vrai: false,
            verdict:
              'Le piège, et il est vieux de deux siècles. Le manuscrit de 1695, de la main ' +
              'même de Perrault, et l’édition de 1697 portent tous deux « verre ». C’est ' +
              'Balzac qui lance le vair en 1841, dans un roman, par la bouche d’un pelletier ; ' +
              'Littré reprend l’idée et la range parmi les absurdités corrigées. Aucun texte ' +
              'ancien ne l’appuie. Le verre était le point du conte : une chaussure qui ne ' +
              's’étire pas, donc qui ne va qu’à un seul pied.',
          },
          {
            texte: 'Chez Perrault, le conte de la Belle au bois dormant s’achève sur le baiser.',
            vrai: false,
            verdict:
              'Deux erreurs d’un coup. Le prince ne l’embrasse pas : il s’agenouille, et elle ' +
              's’éveille d’elle-même parce que les cent ans sont écoulés — le baiser vient des ' +
              'Grimm. Et le mariage n’est que la moitié du conte : il reste une belle-mère ' +
              'ogresse qui réclame les deux petits-enfants à la sauce Robert, un maître ' +
              'd’hôtel qui les cache, et une cuve pleine de vipères. Disney a coupé au ' +
              'meilleur moment.',
          },
        ],
      },
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
    /*
     * Le `funFact` affirmait jusqu'ici que le point d'interrogation venait d'une
     * abréviation de « quaestio ». C'est une légende : l'hypothèse du « q » posé
     * sur un « o » n'a aucune preuve historique et n'est retenue par aucun
     * paléographe (Wikipédia « Point d'interrogation », Grammarphobia). Le signe
     * descend du punctus interrogativus carolingien.
     */
    funFact:
      'Le point d’interrogation ne vient pas du latin quaestio, contrairement à ce ' +
      'qu’on répète partout : l’histoire du « q » écrit au-dessus d’un « o » n’a aucune ' +
      'preuve et n’est retenue par aucun paléographe. Le signe descend du punctus ' +
      'interrogativus des copistes carolingiens, vers le VIIIe siècle — et il n’annonçait ' +
      'pas une question : il disait au lecteur de monter la voix en fin de phrase.',
    games: {
      /*
       * Ordre de perfidie croissante, jamais mélangé. Deux pièges posés une carte
       * à l'avance : 9 → 10 (l'anglais ne met pas d'espace, le français si) et
       * 11 → 12 (le vrai punctus interrogativus, puis la fausse étymologie).
       *
       * Faits vérifiés par recherche : scriptio continua et moines irlandais du
       * VIIe siècle ; « point d'admiration » chez l'Académie avant 1798 ; point-virgule
       * chez Alde Manuce (De Aetna, Venise, vers 1495) ; ¿ imposé par la Real
       * Academia en 1754 ; point-virgule grec = point d'interrogation ; posituræ
       * carolingiennes destinées à la lecture à voix haute ; espace insécable
       * française devant les signes doubles.
       */
      /*
       * « La virgule qui sauve ».
       *
       * Aucune de ces phrases n'est une anecdote historique : ce sont des
       * constructions linguistiques assumées comme telles. C'est délibéré —
       * l'histoire du tsar qui déplace une virgule pour gracier un condamné
       * circule sous cinq versions contradictoires et n'est attestée nulle
       * part. Une mécanique qui enseigne la rigueur ne peut pas s'ouvrir sur
       * une légende.
       */
      ponctuation: {
        consigne: 'Pose la ponctuation qui donne à la phrase le sens qu’on te commande.',
        atelier: { qui: 'Secrétaire du collège', lieu: 'Paris', annee: '1783' },
        cas: [
          {
            mots: ['On', 'mange', 'les', 'enfants'],
            fentes: [1, 3],
            signes: [',', ' !'],
            commande: 'Appelle la famille à table.',
            attendu: [',', ' !'],
            lectures: [
              { config: [',', ' !'], texte: '« On mange, les enfants ! » — tu les appelles.' },
              { config: [null, ' !'], texte: '« On mange les enfants ! » — tu les manges.' },
              { config: [',', null], texte: 'La virgule est là, mais rien ne dit que tu appelles.' },
            ],
            adverse:
              'La virgule sépare l’apostrophe du reste de la phrase. Sans elle, ' +
              '« les enfants » cesse d’être ceux à qui tu parles et devient le plat.',
            secondes: 20,
          },
          {
            mots: ['Le', 'professeur', 'dit', 'l’élève', 'est', 'un', 'imbécile'],
            fentes: [1, 2],
            signes: [',', ' :'],
            commande: 'Fais dire à la phrase que c’est l’élève qui a insulté le professeur.',
            attendu: [',', ','],
            lectures: [
              { config: [',', ','], texte: 'L’élève parle. C’est lui qui insulte le professeur.' },
              { config: [null, ' :'], texte: 'Le professeur parle. C’est lui qui insulte l’élève.' },
              { config: [null, null], texte: 'Pour l’instant, on ne sait pas qui parle.' },
              { config: [',', ' :'], texte: 'Ça ne se lit pas : une incise ne s’ouvre pas pour se fermer par deux points.' },
            ],
            adverse:
              'Deux virgules encadrent une incise : « dit l’élève » devient une ' +
              'indication de qui parle. Deux points, et c’est le professeur qu’on ' +
              'cite — donc lui qu’on renvoie.',
            secondes: 25,
          },
          {
            mots: ['Tu', 'viens'],
            fentes: [1],
            signes: ['.', ' ?', ' !'],
            commande: 'Ordonne-lui de venir. Ne lui laisse pas le choix.',
            attendu: [' !'],
            lectures: [
              { config: ['.'], texte: 'Tu constates qu’il vient.' },
              { config: [' ?'], texte: 'Tu lui demandes s’il vient. Il peut dire non.' },
              { config: [' !'], texte: 'Tu le lui ordonnes.' },
            ],
            adverse:
              'Deux mots, trois actes de langage. Seul le signe final les sépare : ' +
              'on informe, on demande, ou on ordonne.',
            secondes: 15,
          },
        ],
      },
      chaine: {
        consigne: 'Vrai ou faux ? Glisse à droite pour vrai, à gauche pour faux.',
        secondesParCarte: 8,
        affirmations: [
          {
            texte: 'Une phrase qui pose une question se termine par un point d’interrogation.',
            vrai: true,
            verdict:
              'On commence facile. Le mot « ponctuation » vient du latin punctum, ' +
              '« le point » : tout le système est né d’un point posé plus ou moins haut ' +
              'sur la ligne.',
          },
          {
            texte: 'Les points de suspension vont toujours par trois, jamais deux ni quatre.',
            vrai: true,
            verdict:
              'Trois, toujours. En typographie, ils ne forment même qu’un seul caractère, ' +
              'et non trois points alignés à la main.',
          },
          {
            texte: 'Dans les manuscrits de l’Antiquité, les mots s’écrivaient collés, sans espaces.',
            vrai: true,
            verdict:
              'La scriptio continua. Il fallait lire à voix haute pour s’y retrouver — ' +
              'Cicéron répétait ses textes avant de les lire en public. Ce sont des moines ' +
              'irlandais qui, au VIIe siècle, ont commencé à séparer les mots.',
          },
          {
            texte: 'Le point d’exclamation s’est longtemps appelé « point d’admiration ».',
            vrai: true,
            verdict:
              'C’est le nom que lui donnait Geoffroy Tory à la Renaissance. ' +
              '« Point d’exclamation » n’apparaît qu’en 1747, et l’Académie française ne ' +
              'l’officialise qu’en 1798.',
          },
          {
            texte: 'Le point-virgule a été mis au point par un imprimeur vénitien de la Renaissance.',
            vrai: true,
            verdict:
              'Alde Manuce, à Venise, autour de 1495. Le petit livre qui l’inaugure est un ' +
              'récit d’ascension de l’Etna, le De Aetna de Pietro Bembo.',
          },
          {
            texte: 'En espagnol, une question s’ouvre par un point d’interrogation à l’envers.',
            vrai: true,
            verdict:
              '¿Qué tal ? L’Académie royale espagnole l’impose en 1754, pour prévenir le ' +
              'lecteur dès le premier mot qu’il faudra monter la voix. Le français, lui, ne ' +
              'prévient jamais.',
          },
          {
            texte: 'En grec moderne, le point-virgule sert de point d’interrogation.',
            vrai: true,
            verdict:
              'Un texte grec qui se termine par « ; » pose une question. Unicode a dû créer ' +
              'un caractère distinct pour ne pas confondre les deux signes, pourtant ' +
              'identiques à l’œil.',
          },
          {
            texte: 'La ponctuation a été inventée pour rendre la lecture silencieuse plus commode.',
            vrai: false,
            verdict:
              'L’inverse exactement. Les premiers signes, les posituræ des copistes ' +
              'carolingiens, indiquaient où respirer et comment placer la voix pour lire à ' +
              'haute voix devant une assemblée. La ponctuation est née pour l’oreille, pas ' +
              'pour l’œil.',
          },
          {
            texte: 'En anglais, on n’écrit jamais d’espace avant un point d’interrogation.',
            vrai: true,
            verdict: 'Jamais. Retiens-le : la carte suivante en dépend.',
          },
          {
            texte: 'En français non plus : le point d’interrogation se colle au dernier mot.',
            vrai: false,
            verdict:
              'Le piège. La typographie française met une espace — insécable — devant les ' +
              'quatre signes doubles : ? ! ; et :. C’est la règle la plus massacrée du ' +
              'clavier, et l’une des rares où le français et l’anglais divergent vraiment.',
          },
          {
            texte: 'Le point d’interrogation vient d’un signe qui disait de monter la voix.',
            vrai: true,
            verdict:
              'Le punctus interrogativus des scriptoria carolingiens, vers le VIIIe siècle. ' +
              'Le paléographe Albert Derolez y voit un signe de notation musicale : la voix ' +
              'monte, le trait monte.',
          },
          {
            texte: 'C’est l’abréviation du latin quaestio : un « q » écrit au-dessus d’un « o ».',
            vrai: false,
            verdict:
              'L’explication est partout : manuels scolaires, sites de culture générale, ' +
              'réseaux. Elle n’a pourtant aucune preuve historique et aucun paléographe ne ' +
              'la retient. Une étymologie trop jolie est rarement une étymologie.',
          },
        ],
      },
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
    /*
     * Ces deux champs sont la récompense servie APRÈS la manche. « Deux mots
     * riment quand ils se terminent par le même son » n'apprenait rien à
     * personne, et surtout pas à quelqu'un qui venait de passer trois quatrains
     * à découvrir que le e muet compte ou non selon la lettre suivante.
     */
    summary:
      'Rimer, ce n’est pas seulement finir par le même son : en vers classiques, il faut aussi finir par la même lettre.',
    funFact:
      'Un singulier ne rime pas avec un pluriel, même quand l’oreille n’entend aucune différence : ' +
      '« chemin » et « chemins » sont interdits ensemble. Les rimes de Hugo s’accordent toujours — ' +
      '« m’attends » avec « longtemps », « pensées » avec « croisées ».',
    games: {
      /*
       * « Douze pieds ». Les trois quatrains sont ceux de Hugo, « Demain, dès
       * l'aube… », publiés dans Les Contemplations en 1856 — domaine public,
       * donc lus pour de bon plutôt que paraphrasés. Le poème est daté du
       * 3 septembre 1847, veille de l'anniversaire de la noyade de Léopoldine ;
       * Hugo l'a en réalité écrit le 4 octobre. La date est une mise en scène.
       *
       * Chaque quatrain enseigne une règle DIFFÉRENTE, et chacune ne se
       * constate qu'en assemblant :
       *   1. le e muet en fin de vers ne compte pas (« attendre », « davantage ») ;
       *   2. le e muet s'élide devant une voyelle — « Triste, et » vaut 1 + 1,
       *      et sans cette élision le vers de Hugo ferait treize pieds, donc
       *      la manche est INGAGNABLE tant qu'on ne l'a pas comprise ;
       *   3. le h aspiré bloque l'élision comme une consonne : dans le même
       *      vers, « Un bouquet de » garde son e devant « houx » et le perd
       *      devant « en fleur ».
       *
       * Les réserves sont écrites pour que plusieurs assemblages tombent juste
       * et que plusieurs piègent : « attendre » a l'air de rimer avec
       * « m'attends » mais ferme sur [ɑ̃dʁ]. Sans ces pièges, le hasard
       * gagnerait et la manche ne vaudrait rien.
       *
       * Une limite assumée : le jeu compte les pieds et vérifie la rime, il ne
       * lit pas la grammaire. Un assemblage bancal de douze pieds rimés passe.
       * Les mots sont donc choisis pour que les lectures naturelles dominent —
       * et de toute façon la révélation remet le vers de Hugo à côté.
       */
      vers: {
        consigne: 'Finis le quatrain. Douze pieds, pas onze, pas treize.',
        auteur: 'Victor Hugo',
        oeuvre: 'Les Contemplations',
        annee: '1856',
        secondesParStrophe: 90,
        strophes: [
          {
            amont: [
              'Demain, dès l’aube, à l’heure où blanchit la campagne,',
              'Je partirai. Vois-tu, je sais que tu m’attends.',
              'J’irai par la forêt, j’irai par la montagne.',
            ],
            piedsCible: 12,
            rimeCle: 'ɑ̃',
            rimeAffichee: '[ɑ̃] — comme « m’attends »',
            reserve: [
              { mot: 'Je ne puis demeurer', pieds: 6 },
              { mot: 'loin de toi', pieds: 3 },
              { mot: 'plus longtemps', pieds: 3, rimeCle: 'ɑ̃' },
              { mot: 'un instant', pieds: 3, rimeCle: 'ɑ̃' },
              { mot: 'attendre', pieds: 3, eFinal: true, rimeCle: 'ɑ̃dʁ' },
              { mot: 'davantage', pieds: 4, eFinal: true, rimeCle: 'aʒ' },
            ],
            versReel: 'Je ne puis demeurer loin de toi plus longtemps.',
            commentaire:
              'Hugo écrit ce poème pour l’anniversaire de la mort de sa fille Léopoldine, ' +
              'noyée à dix-neuf ans dans la Seine à Villequier, le 4 septembre 1843. ' +
              'Son nom n’apparaît jamais : on ne comprend qu’au dernier vers du poème ' +
              'qu’il marche vers une tombe.',
          },
          {
            amont: [
              'Je marcherai les yeux fixés sur mes pensées,',
              'Sans rien voir au dehors, sans entendre aucun bruit,',
              'Seul, inconnu, le dos courbé, les mains croisées,',
            ],
            piedsCible: 12,
            rimeCle: 'ɥi',
            rimeAffichee: '[ɥi] — comme « bruit »',
            reserve: [
              { mot: 'Triste', pieds: 2, eFinal: true },
              { mot: 'et le jour', pieds: 3 },
              { mot: 'pour moi sera', pieds: 4 },
              { mot: 'comme la nuit', pieds: 4, rimeCle: 'ɥi' },
              { mot: 'Sombre', pieds: 2, eFinal: true },
              { mot: 'jusqu’à l’aube', pieds: 4, eFinal: true, rimeCle: 'ob' },
            ],
            versReel: 'Triste, et le jour pour moi sera comme la nuit.',
            commentaire:
              'Ce vers est ingagnable tant qu’on compte « Tris-te » pour deux pieds : ' +
              'devant « et », le e tombe, on dit « Trist’ et » et le vers retombe à douze. ' +
              'C’est la règle que tout le monde a oubliée, et c’est pour ça que les vers ' +
              'sonnent faux quand on les lit comme on parle.',
          },
          {
            amont: [
              'Je ne regarderai ni l’or du soir qui tombe,',
              'Ni les voiles au loin descendant vers Harfleur,',
              'Et quand j’arriverai, je mettrai sur ta tombe',
            ],
            piedsCible: 12,
            rimeCle: 'œʁ',
            rimeAffichee: '[œʁ] — comme « Harfleur »',
            reserve: [
              // « Un bouquet de » porte le e muet, et c'est ce qui rend le h
              // aspiré JOUABLE : devant « houx » le e tient (quatre pieds),
              // devant « en fleur » ou « et des roses » il tombe (trois). Le
              // joueur voit donc la différence entre « de houx » et « d'honneur »
              // sur le peigne, au lieu de la lire dans une leçon.
              { mot: 'Un bouquet de', pieds: 4, eFinal: true },
              { mot: 'houx vert', pieds: 2 },
              { mot: 'et de bruyère', pieds: 5, eFinal: true, rimeCle: 'ɛʁ' },
              { mot: 'en fleur', pieds: 2, rimeCle: 'œʁ' },
              { mot: 'et des roses', pieds: 4, eFinal: true, rimeCle: 'oz' },
              { mot: 'du soir qui meurt', pieds: 4, rimeCle: 'œʁ' },
            ],
            versReel: 'Un bouquet de houx vert et de bruyère en fleur.',
            commentaire:
              'Le h de « houx » est aspiré : il se comporte comme une consonne, on dit ' +
              '« de houx » et jamais « d’houx », et le e de « de » garde son pied. Le ' +
              'premier vers du poème, lui, dit « à l’heure » : ce h-là est muet. Rien ne ' +
              'les distingue à l’oreille, ça s’apprend mot par mot — et les poètes s’en ' +
              'servent pour gagner ou perdre un pied.',
          },
        ],
      },

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
      /*
       * Ordre de perfidie croissante. Le piège posé une carte à l'avance est le
       * couple 9 → 10 : « to take French leave » existe bien (vrai), mais c'est
       * l'anglais qui a commencé, pas nous.
       *
       * Étymologies vérifiées par recherche : Farce de maître Pathelin (vers 1460) ;
       * chandelle des joueurs au XVIe siècle ; vessies de porc séchées servant de
       * lanternes ; « au lac » ajouté à « il n'y a pas le feu » en visant le Léman ;
       * « poser un lapin » dans l'argot du XIXe (Larchey, 1889) ; « French leave »
       * attesté dès 1751 contre « filer à l'anglaise » au tournant des XIXe-XXe ;
       * exceptio probat regulam in casibus non exceptis (Cicéron, Pro Balbo).
       */
      chaine: {
        consigne: 'Vrai ou faux ? Glisse à droite pour vrai, à gauche pour faux.',
        secondesParCarte: 8,
        affirmations: [
          {
            texte: '« Il pleut des cordes » ne parle pas de vraies cordes tombant du ciel.',
            vrai: true,
            verdict:
              'Une averse si dense que les gouttes semblent former des fils continus. ' +
              'L’image est visuelle, pas littérale.',
          },
          {
            texte: 'Une expression imagée se traduit rarement mot à mot d’une langue à l’autre.',
            vrai: true,
            verdict:
              'Sous la même averse, un Anglais dit qu’il pleut des chats et des chiens. ' +
              'Traduire mot à mot, c’est perdre l’image.',
          },
          {
            texte: '« Revenons à nos moutons » vient d’une pièce de théâtre du Moyen Âge.',
            vrai: true,
            verdict:
              'La Farce de maître Pathelin, vers 1460. Au tribunal, deux affaires s’emmêlent ' +
              '— une histoire de drap et une histoire de moutons volés — et le juge, excédé, ' +
              'lance la phrase.',
          },
          {
            texte: '« Le jeu n’en vaut pas la chandelle » vient de joueurs qui payaient l’éclairage.',
            vrai: true,
            verdict:
              'Au XVIe siècle, jouer aux cartes le soir coûtait une chandelle, et l’usage ' +
              'voulait qu’on laisse une pièce sous le chandelier pour dédommager l’hôte. Si ' +
              'les gains ne couvraient pas la cire, la partie ne valait pas la peine.',
          },
          {
            texte: '« Prendre des vessies pour des lanternes » parle bien de vessies d’animaux.',
            vrai: true,
            verdict:
              'Séchée, une vessie de porc devient assez fine pour laisser passer la lumière : ' +
              'on y glissait une bougie et cela faisait une lanterne de pauvre. Faire passer ' +
              'l’une pour l’autre, c’était abuser un naïf.',
          },
          {
            texte: '« Il n’y a pas le feu au lac » se moque de la lenteur supposée des Suisses.',
            vrai: true,
            verdict:
              'Le lac, c’est le Léman. « Il n’y a pas le feu » existait déjà ; on lui a ajouté ' +
              '« au lac » pour railler nos voisins. Une variante dit même : il n’y a pas le feu ' +
              'dans les montres.',
          },
          {
            texte: '« Poser un lapin » a d’abord voulu dire tout autre chose.',
            vrai: true,
            verdict:
              'Dans l’argot du XIXe siècle, poser un lapin, c’était quitter une fille sans ' +
              'payer le prix convenu — Lorédan Larchey le consigne encore dans son dictionnaire ' +
              'd’argot en 1889. Le sens a glissé vers le rendez-vous manqué à la même époque, ' +
              'et seul celui-là a survécu.',
          },
          {
            texte: '« Ce n’est pas la mer à boire » veut dire que la tâche est immense.',
            vrai: false,
            verdict:
              'Exactement l’inverse : ce n’est pas si terrible, on va y arriver. La négation ' +
              'fait partie de l’expression, et c’est elle qu’on oublie. « La mer à boire » tout ' +
              'seul, lui, désigne bien l’impossible.',
          },
          {
            texte: 'En anglais, s’éclipser sans dire au revoir se dit « to take French leave ».',
            vrai: true,
            verdict:
              'Littéralement : « prendre un congé à la française ». Chacun met sa mauvaise ' +
              'éducation sur le dos du voisin. Retiens-le : la carte suivante en dépend.',
          },
          {
            texte: 'Les Anglais ont copié cette expression sur notre « filer à l’anglaise ».',
            vrai: false,
            verdict:
              'C’est l’anglais qui a commencé. « French leave » est attesté dès 1751 ; ' +
              '« filer à l’anglaise » n’apparaît qu’au tournant des XIXe et XXe siècles. Nous ' +
              'n’avons fait que renvoyer la politesse, cent cinquante ans plus tard.',
          },
          {
            texte: '« L’exception qui confirme la règle » veut dire qu’une exception la renforce.',
            vrai: false,
            verdict:
              'Contresens installé. La formule vient du latin juridique exceptio probat regulam ' +
              'in casibus non exceptis, plaidé par Cicéron : si l’on prend la peine d’écrire une ' +
              'exception, c’est qu’il existe une règle pour tous les cas restants. L’exception ' +
              'ne renforce rien — elle prouve que la règle est là.',
          },
          {
            texte: 'Toutes ces expressions ont une origine sûre, établie par les dictionnaires.',
            vrai: false,
            verdict:
              'Beaucoup n’ont que des hypothèses concurrentes. « Tomber dans les pommes » en est ' +
              'le cas d’école : on invoque l’ancien « se pâmer », sans la moindre preuve. ' +
              'Méfie-toi des étymologies trop bien tournées — elles ont souvent été inventées ' +
              'après coup, pour expliquer une expression qu’on ne comprenait plus.',
          },
        ],
      },
      qcm: {
        question: 'Que veut dire l\'expression « il pleut des cordes » ?',
        choices: ['Il pleut très fort', 'Il fait beau', 'Il neige'],
        correctIndex: 0,
      },
    },
  },
]
