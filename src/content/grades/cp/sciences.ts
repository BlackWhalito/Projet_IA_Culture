import type { Notion } from '../../../types/content'

export const CP_SCIENCES: Notion[] = [
  {
    id: 'cp-sciences-cinq-sens',
    gradeId: 'cp',
    domainId: 'sciences',
    difficulty: 1,
    title: 'Les 5 sens',
    /*
     * Le compte de cinq ne vient pas de la physiologie mais d'Aristote : les
     * physiologistes en distinguent aujourd'hui entre neuf et une vingtaine,
     * selon la façon de les découper (équilibre, proprioception, température,
     * douleur, intéroception). D'où le `summary` réécrit — l'ancien posait
     * « 5 sens » comme un fait mesuré.
     */
    summary:
      'Le compte de cinq sens vient d’Aristote, pas de la physiologie — et la carte des ' +
      'saveurs de la langue n’a jamais existé.',
    funFact:
      'La carte du goût, apprise par des générations d’écoliers, est née d’un malentendu. En ' +
      '1901, l’Allemand David Hänig mesure que la sensibilité aux quatre saveurs varie ' +
      'légèrement d’une zone de la langue à l’autre — légèrement. En 1942, le psychologue ' +
      'américain Edwin Boring reprend ses données brutes et les transforme en un graphique ' +
      'aux frontières nettes. Le dessin a fait le tour du monde ; la nuance, non. Il aura ' +
      'fallu les travaux de Virginia Collings en 1974 puis de Linda Bartoshuk pour le ' +
      'démonter — et il figure encore dans des manuels.',
    games: {
      /*
       * Ordre de perfidie croissante, jamais mélangé. Deux pièges posés une carte
       * à l'avance : 7 → 8 (la proprioception n'est pas le seul sens manquant) et
       * 11 → 12 (la thèse de 1901 est vraie, la carte qu'on en a tirée est fausse).
       *
       * Faits vérifiés par recherche : liste des cinq sens dans le De Anima
       * d'Aristote ; umami nommé par Kikunae Ikeda en 1908, récepteur confirmé
       * au début des années 2000 ; capsaïcine et récepteur TRPV1 de la chaleur
       * douloureuse, menthol et TRPM8 du froid, prix Nobel de médecine 2021 à
       * David Julius et Ardem Patapoutian ; McGann, « Poor human olfaction is a
       * 19th-century myth », Science, 2017, remontant à Paul Broca ; thèse de
       * David Hänig (1901) réinterprétée par Edwin Boring (1942), réfutée par
       * Virginia Collings (1974) et Linda Bartoshuk.
       */
      chaine: {
        consigne: 'Vrai ou faux ? Glisse à droite pour vrai, à gauche pour faux.',
        secondesParCarte: 8,
        affirmations: [
          {
            texte: 'Le plus grand organe du corps humain n’est pas interne : c’est la peau.',
            vrai: true,
            verdict:
              'Environ deux mètres carrés déployés, plusieurs kilos. C’est aussi le seul organe ' +
              'des sens qu’on ne peut pas fermer : on ferme les yeux, on se bouche le nez, on ' +
              'ne débranche pas sa peau.',
          },
          {
            texte: 'Une bonne part de ce qu’on appelle le goût est en réalité perçue par le nez.',
            vrai: true,
            verdict:
              'La langue ne distingue que quelques saveurs de base. Tout le reste — la fraise, ' +
              'le café, la truffe — remonte de la bouche vers le nez par l’arrière-gorge. ' +
              'Pincez-vous les narines et croquez un oignon : vous ne le reconnaîtrez pas.',
          },
          {
            texte: 'C’est Aristote qui a fixé la liste des cinq sens, il y a plus de 2 300 ans.',
            vrai: true,
            verdict:
              'Dans le De Anima, vers 350 avant notre ère. Vue, ouïe, toucher, goût, odorat : ' +
              'la physiologie a depuis longtemps allongé la liste, l’école non.',
          },
          {
            texte: 'Il existe une cinquième saveur de base à côté du sucré, salé, acide et amer.',
            vrai: true,
            verdict:
              'L’umami, « savoureux » en japonais. Le chimiste Kikunae Ikeda le nomme en 1908 ' +
              'après avoir isolé le glutamate d’une algue de bouillon. L’Occident a mis ' +
              'presque un siècle à l’admettre : le récepteur n’a été identifié qu’au début des ' +
              'années 2000.',
          },
          {
            texte: 'Le piquant du piment n’est pas une saveur, mais une sensation de brûlure.',
            vrai: true,
            verdict:
              'La capsaïcine ne se fixe pas sur des récepteurs du goût, mais sur ceux qui ' +
              'signalent la chaleur douloureuse. Votre bouche ne trouve pas le plat « fort » : ' +
              'elle croit sincèrement être en train de brûler.',
          },
          {
            texte: 'Chaque œil a une zone aveugle, et le cerveau bouche le trou sans prévenir.',
            vrai: true,
            verdict:
              'À l’endroit où le nerf optique quitte la rétine, il n’y a aucun capteur. Vous ' +
              'avez donc en permanence un trou dans chaque champ visuel — et vous ne l’avez ' +
              'jamais vu, parce que votre cerveau invente ce qui devrait s’y trouver.',
          },
          {
            texte: 'Nous avons un sens qui nous dit où sont nos membres, les yeux fermés.',
            vrai: true,
            verdict:
              'La proprioception. C’est elle qui vous permet de porter la main à votre nez dans ' +
              'le noir. Retiens-le : la carte suivante en dépend.',
          },
          {
            texte: 'C’est d’ailleurs le seul sens qu’Aristote avait oublié dans sa liste.',
            vrai: false,
            verdict:
              'Il en manque bien d’autres : l’équilibre, logé dans l’oreille interne ; la ' +
              'température ; la douleur, qui a ses propres capteurs ; la faim, la soif, la ' +
              'position du corps dans l’espace. Selon la façon de les découper, les ' +
              'physiologistes en comptent entre neuf et une vingtaine. Cinq est un héritage, ' +
              'pas un résultat.',
          },
          {
            texte: 'La fraîcheur de la menthe n’est pas une vraie baisse de température.',
            vrai: true,
            verdict:
              'Le menthol se fixe sur le récepteur du froid et l’allume sans qu’un seul degré ' +
              'ne bouge. Symétriquement, le piment allume celui du chaud. C’est en cherchant ' +
              'comment le piment brûle que David Julius a mis la main sur le capteur de ' +
              'température du corps — ce qui lui a valu le prix Nobel de médecine 2021.',
          },
          {
            texte: 'Comparé aux autres mammifères, l’odorat humain est un sens médiocre.',
            vrai: false,
            verdict:
              'Une revue parue dans Science en 2017 a retracé l’origine de cette idée : elle ne ' +
              'vient d’aucune mesure, mais d’une hypothèse du médecin Paul Broca au XIXe siècle, ' +
              'selon laquelle le libre arbitre humain aurait exigé un bulbe olfactif réduit. ' +
              'Notre bulbe olfactif contient en fait autant de neurones que celui des autres ' +
              'mammifères, et nous battons le chien sur certaines odeurs.',
          },
          {
            texte: 'Une thèse allemande de 1901 a bien mesuré des différences selon les zones de la langue.',
            vrai: true,
            verdict:
              'David Hänig a trouvé de légers écarts de sensibilité entre la pointe, les bords ' +
              'et le fond. Légers. Retiens-le : la carte suivante en dépend.',
          },
          {
            texte: 'D’où la carte du goût : le sucré à la pointe, l’amer tout au fond.',
            vrai: false,
            verdict:
              'Le piège, et il a tenu un siècle. En 1942, le psychologue américain Edwin Boring ' +
              'a converti les données de Hänig en un schéma aux zones découpées au couteau, ' +
              'là où l’original ne montrait que des nuances. Toutes les saveurs se perçoivent ' +
              'sur toute la langue. Vérifiez-le : posez du sucre au fond de votre langue, il ' +
              'sera sucré.',
          },
        ],
      },
      match: {
        consigne: "Relie chaque sens à l’organe qui le porte.",
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
        consigne: 'Place chaque étape entre celles qui y sont déjà.',
        cartesDeDepart: 1,
        secondesTotal: 45,
        events: [
          { label: 'L’œuf', sortValue: 1, repere: 'quelques jours' },
          { label: 'La chenille', sortValue: 2, repere: 'elle multiplie son poids par mille' },
          { label: 'La chrysalide', sortValue: 3, repere: 'presque tout se dissout' },
          { label: 'Le papillon', sortValue: 4, repere: 'quelques semaines à vivre' },
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
    summary: "L'eau peut être solide, liquide ou gazeuse.",
    funFact: "La vapeur d'eau est invisible : le nuage blanc qu'on voit au-dessus d'une casserole est déjà de la buée (de minuscules gouttes d'eau).",
    games: {
      riviere: {
        paniers: [
          { id: 'solide', label: 'Solide' },
          { id: 'liquide', label: 'Liquide' },
          { id: 'gaz', label: 'Gaz' },
        ],
        flottants: [
          { label: 'Glaçon', panierId: 'solide' },
          { label: 'Pluie', panierId: 'liquide' },
          { label: 'Vapeur', panierId: 'gaz' },
          { label: 'Neige', panierId: 'solide' },
          { label: 'Rivière', panierId: 'liquide' },
        ],
        vitesseInitialeSec: 4,
        accelerationParPalier: 0.15,
        objectif: 5,
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
        consigne: 'Place chaque étape entre celles qui y sont déjà.',
        cartesDeDepart: 1,
        secondesTotal: 45,
        events: [
          { label: 'La graine', sortValue: 1, repere: 'elle peut attendre des années' },
          { label: 'La pousse', sortValue: 2, repere: 'la racine sort avant la tige' },
          { label: 'La fleur', sortValue: 3, repere: 'elle attend les insectes' },
          { label: 'Le fruit', sortValue: 4, repere: 'il contient la graine suivante' },
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
    funFact: "Une seule abeille produit, à elle seule, à peine une cuillère à café de miel dans toute sa vie.",
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
