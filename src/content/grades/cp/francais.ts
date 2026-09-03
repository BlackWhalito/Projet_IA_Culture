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
