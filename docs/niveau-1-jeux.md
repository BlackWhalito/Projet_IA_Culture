# Les jeux du Niveau 1 — état des lieux et plan d'immersion

Ce document complète [niveau-1.md](niveau-1.md), qui traite **le contenu** du Niveau 1 (quelles notions, quels pièges, quels textes). Celui-ci traite **les jeux eux-mêmes** : ce qu'on y fait avec ses doigts, ce qu'on y voit, ce qu'on y risque. Les deux se lisent ensemble ; ils ne se recouvrent que sur deux tâches, signalées à leur place.

## Point de départ

`npm run test` (79 tests, 11 fichiers), `npm run lint` et `npm run build` passent tous les trois. **Rien de ce qui suit n'est un bug de code.** Les six mécaniques fonctionnent, elles sont testées, l'architecture tient. Ce qui suit est un diagnostic de conception : ce que les jeux demandent au joueur, et ce qu'ils lui donnent en retour.

---

## Les cinq créneaux du Niveau 1, un par un

Composition actuelle, dans `src/content/levels/cp-levels.ts` :

| # | Notion | Mécanique | Ce qu'on fait vraiment | Verdict |
|---|---|---|---|---|
| 1 | La Préhistoire | QCM | Taper le premier bouton | **Cassé** |
| 2 | La France et sa capitale | Cap sur | Taper Paris, une fois | **Vide** |
| 3 | Les 5 sens | Association | Relier « la vue » aux « yeux » | **Trivial** |
| 4 | Voyelles et consonnes | La Rivière | Trier A, B, O, M, U | **Trivial** |
| 5 | La frise du temps | Frise | Ranger passé, présent, futur | **Trivial** |

### 1 · Préhistoire (QCM) — le défaut le plus grave de l'app

`QcmGame` affiche `content.choices` **dans l'ordre du contenu**, sans jamais mélanger. Or les **40 QCM du CP** portent tous `correctIndex: 0`.

**Conséquence : dans toute l'application, la bonne réponse est toujours le premier bouton.** Un joueur qui le remarque au troisième écran finit le CP sans lire une seule question, avec trois étoiles partout. Le score, les étoiles et le déverrouillage des niveaux sont tous faussés par cette seule ligne.

C'est signalé comme « hors périmètre » en fin de [niveau-1.md](niveau-1.md). **Je ne suis pas d'accord** : c'est une demi-journée de travail au plus, et tant que ce n'est pas corrigé, aucune mesure de progression ne veut rien dire.

### 2 · Paris (Cap sur) — une manche de six secondes

`cibles: ['paris']`. Une seule cible, `secondesParCible: 6`. Le créneau dure moins longtemps que son écran de résultat. La mécanique est pourtant la meilleure de l'app : le brouillard qui se referme crée une vraie tension, et le retour d'erreur (« Ça, c'est la Seine ») est le seul de l'application qui enseigne quelque chose au moment où l'on se trompe.

Deuxième problème, mineur mais réel : le seuil de réussite est `correctCount >= Math.ceil(cibles.length / 2)`. À une cible il faut 100 % ; à cinq cibles, 60 % suffisent. La difficulté dépend d'un nombre que l'auteur de contenu choisit sans savoir qu'il règle aussi le seuil.

### 3 · Les 5 sens (Association) — et un score binaire

« La vue → les yeux » n'apprend rien à un adulte. Et `MatchGame` renvoie `correct: mistakes === 0` : **une seule hésitation coûte l'étoile**, alors même que la mécanique laisse réessayer indéfiniment. Elle ne transmet pas non plus `mistakes`, contrairement à la Rivière et à Cap sur, donc la pénalité de score n'est jamais appliquée. Deux règles contradictoires cohabitent : le jeu pardonne, le score ne pardonne pas.

### 4 · Voyelles et consonnes (La Rivière) — et une erreur gratuite

Trier A, B, O, M, U ne fait hésiter personne. Mais il y a plus gênant, et ça vaut pour **les huit Rivières du CP** :

Dans `handlePanierTap`, un tap sur le mauvais panier incrémente le compteur d'erreurs, secoue le panier, et **laisse le mot en jeu**. Avec deux paniers, taper au hasard donne la bonne réponse en deux essais, à chaque fois. La manche est ingagnable seulement si on laisse trois mots tomber. **Une mécanique de tri binaire qui autorise le second essai n'est plus un tri, c'est un bouton.**

Petit défaut supplémentaire : il faut **deux tapes** (le mot, puis le panier) alors qu'un seul mot est en jeu à la fois. Le premier tap ne décide de rien, il coûte juste du temps sur un mot qui tombe.

### 5 · La frise du temps (Frise) — la notion ne va pas avec la mécanique

Passé, présent, futur ne sont pas trois événements à ranger, ce sont trois définitions. La frise chronologique enseigne l'ordre ; ici il n'y a pas d'ordre à trouver, seulement un mot à reconnaître. Et la mécanique elle-même ne donne **aucun retour avant la fin** : on pose trois cartes à l'aveugle, sans pouvoir revenir en arrière, et on apprend d'un coup que tout est faux, sans savoir où.

---

## Les trois défauts communs — le vrai diagnostic

Créneau par créneau on voit cinq problèmes différents. Vus ensemble, il n'y en a que trois, et ils touchent les six mécaniques.

### Aucun jeu n'a de lieu

`src/components/watercolor/` contient un moteur de peinture complet (architecture, figures, lumière, atmosphère, testé). Il est appelé **exactement deux fois** dans toute l'app : le bandeau de l'accueil et les vignettes latérales. **Pas une seule fois dans `src/games/`.**

Ce que la feuille de route appelle « aquarelle appliquée à la coquille de jeu » est en réalité une carte blanche à coins arrondis, posée sur un grain de papier global, avec des bordures teintées à la couleur du domaine. C'est propre. Ce n'est pas un lieu.

Le jeu s'appelle « La Rivière » et il n'y a pas d'eau. « Cap sur » se joue sur du blanc cassé. Le Fil des jours raconte le lever du Roi Soleil dans la même carte blanche que le QCM sur les voyelles.

### Aucun jeu n'a de voix

`GameShell` affiche « **Bonne réponse !** » ou « **Pas tout à fait…** ». C'est la voix d'un logiciel d'exercices, et elle recouvre tout, y compris ce qui n'est pas une question :

- Après une Rivière gagnée 8 sur 10 : « Bonne réponse ! »
- Après une matinée entière à Versailles : « Bonne réponse ! » — et toujours, puisque `FilDesJoursGame` renvoie `correct: true` en dur.

Une seule mécanique parle déjà dans sa fiction : Cap sur, avec « Ça, c'est la Seine ». C'est le modèle à généraliser, pas l'exception.

### Aucun jeu n'a d'enjeu

- **Rivière** : l'erreur est gratuite (voir plus haut).
- **Association** : on retape jusqu'à trouver, sans coût visible.
- **Frise** : verdict à la fin, aucun retour, aucun retour arrière.
- **Fil des jours** : les deux jauges montent et descendent en silence entre deux écrans, aucune ne déclenche quoi que ce soit, et l'issue est écrite d'avance.
- **QCM** : voir plus haut.

Seul **Cap sur** met vraiment quelque chose en jeu, parce que le brouillard, lui, ne pardonne pas.

---

## Ce que j'en pense

**Les mécaniques sont bonnes.** Le diagnostic « ce ne sont que des QCM » était faux et l'est resté : cinq mécaniques distinctes dans un seul niveau, dont deux (Cap sur, le Fil des jours) qu'on ne trouve pas ailleurs dans l'edtech française. Il ne faut en jeter aucune.

**Le Niveau 1 est la pire vitrine possible du projet.** Il aligne les cinq notions les plus triviales du catalogue, et sa première question se répond sans la lire. Un adulte qui essaie l'app conclut en quatre minutes que c'est un jeu pour enfants — exactement la conclusion que le changement de public cible visait à empêcher.

**L'immersion n'est pas un problème de peinture.** On pourrait peindre les six jeux ce soir et ils resteraient froids, parce qu'il leur manque d'abord une voix et un enjeu. Un fond aquarelle derrière un « Pas tout à fait… » ne fait pas une expérience. C'est pour ça que le plan ci-dessous fait les trois dans l'ordre lieu / voix / enjeu **inversé** : l'enjeu d'abord, la peinture en dernier.

**Là où je m'écarte du plan existant.** [niveau-1.md](niveau-1.md) traite l'immersion en Phase D, et cette phase concerne la **vignette de la carte des niveaux** — donc l'écran qu'on voit *avant* de jouer, pas les jeux. L'intérieur des jeux n'y figure pas du tout. Or c'est là que le joueur passe 95 % de son temps, et c'est la seule phase que sa propre note déclare bloquée faute de navigateur. Ma recommandation : garder Phase D pour plus tard, et traiter d'abord les jeux.

**Et un point où je le suis sans réserve** : réparer le Fil des jours *avant* de le déplacer au Niveau 1. Faire du temps fort le climax du tout premier niveau est le bon pari, mais pas tant qu'on ne comprend pas le jeu en y jouant.

---

## La doctrine : trois règles pour tous les jeux

Ces trois règles sont le critère de relecture de toute nouvelle mécanique. Elles valent aussi rétroactivement.

**1. Un jeu se passe quelque part.** Chaque mécanique a un décor peint, constante de module, très pâle sous le contenu. Pas une illustration décorative : un lieu qui explique la règle sans texte. Deux rives disent « choisis un bord » mieux qu'une consigne.

**2. Le jeu parle sa propre langue.** Aucun écran ne dit « Bonne réponse ». Le retour est écrit par la mécanique, dans sa fiction, et il nomme la chose qu'on a ratée. Cap sur montre déjà comment.

**3. Une erreur coûte, et elle enseigne, au même instant.** Si se tromper ne retire rien, il n'y a pas de jeu. Si se tromper n'apprend rien, il n'y a pas de leçon. Les deux, ensemble, ou ce n'est pas fini.

---

## Le plan

Ordonné par rapport valeur / effort décroissant. Les phases 1 et 2 sont indépendantes l'une de l'autre et peuvent se croiser ; la phase 4 est le plan de contenu existant et se mène en parallèle.

### Phase 0 — Les trois réparations qui ne se discutent pas

Tout le reste repose dessus. Aucune ne dépasse la demi-journée.

**J0.1 · Mélanger les choix du QCM · S — à faire en premier, avant tout le reste**
`QcmGame` mélange ses choix au montage et retrouve la bonne réponse par son libellé, pas par son rang.
*Piège du projet* : `shuffle` appelle `Math.random`, que `react(purity)` interdit dans le corps d'un composant. Initialiser par `useState(() => …)`, comme le font déjà `MatchGame` et `CapSurGame`.
*Vérifié quand* : un test joue le QCM plusieurs fois de suite, clique à chaque fois le bouton portant le libellé attendu, et obtient `correct: true` quel que soit l'ordre affiché. Un second test vérifie qu'un clic sur le premier bouton n'est **pas** systématiquement juste.

**J0.2 · La Rivière : l'erreur fait couler le mot · S**
Un tap sur le mauvais panier envoie le mot au fond : il compte comme raté et la manche avance. Dans la foulée, supprimer le double tap — un seul mot est en jeu, taper un panier suffit à trancher.
*Effet de bord voulu* : les huit Rivières du CP deviennent nettement plus dures. Il faudra relire leurs objectifs (`objectif`, `RATES_MAX`) une fois le contenu du créneau 1 réécrit.
*Vérifié quand* : `RiviereGame` a un test qui perd une manche uniquement par mauvais taps, sans laisser tomber un seul mot.

**J0.3 · Association : rendre le score non binaire · S** *(= T5 de [niveau-1.md](niveau-1.md))*
Transmettre `mistakes` dans `onComplete`, et ne plus faire dépendre `correct` d'un sans-faute. Le créneau 2 cible repose sur cette mécanique avec du contenu volontairement piégeux : il faut pouvoir se tromper sans tout perdre.
*Vérifié quand* : un test vérifie qu'une partie gagnée avec deux erreurs remonte `correct: true` et `mistakes: 2`.

### Phase 1 — Donner un enjeu

**J1.1 · Rendre le Fil des jours jouable · M** *(= T1 de [niveau-1.md](niveau-1.md), avec un ajout)*
Les trois correctifs du plan existant : la règle écrite en ouverture, les deltas visibles au moment du choix, une jauge à zéro qui déclenche vraiment un échec, et `correct` lié à l'épilogue atteint au lieu de `true` en dur. La logique va dans `src/engine/fildesjours.ts` (déjà testé), pas dans le composant.

**Mon ajout, et je crois que c'est le plus important** : les deux jauges ne disent pas la leçon. « Autorité » contre « Attention de la Cour » se lit comme un curseur de jeu de gestion. La leçon réelle de la scène est ailleurs, et elle est écrite noir sur blanc dans l'épilogue par défaut : *« pas un instant, du réveil à la sortie, le roi de France n'a été seul. »*

Alors affichons-le. Un troisième indicateur, permanent, en haut de l'écran : **« Dans la chambre : 14 personnes »**. Il monte à chaque étape, quelle que soit l'option choisie, et il ne redescend jamais. Aucun texte n'a besoin d'expliquer que Versailles est une machine à tenir la noblesse : un compteur qui n'a pas de bouton pour descendre le dit tout seul. C'est peu de code (un champ `presents` par option, une ligne d'affichage) et ça transforme la scène en démonstration.

*Vérifié quand* : un test de composant joue une partie gagnée **et** une partie perdue par jauge à zéro ; et surtout, tu comprends le jeu sans qu'on te l'explique.

**J1.2 · Frise : un retour après chaque pose · S** *(= 2.3 de la feuille de route)*
La carte posée au bon rang s'ancre, la carte mal posée revient au plateau en disant pourquoi. On arrête de jouer trois coups à l'aveugle pour un verdict final.

**J1.3 · Cap sur : le seuil de réussite passe dans le contenu · S**
Remplacer `Math.ceil(cibles.length / 2)` par un champ explicite, avec une valeur par défaut. L'auteur de contenu décide de la difficulté au lieu de la subir.

### Phase 2 — Donner une voix

**J2.1 · Le verdict est écrit par la mécanique · S**
Ajouter un champ optionnel à `GameCompleteResult` (`src/types/game.ts`), rempli par chaque jeu et affiché par `GameShell` à la place de « Bonne réponse ! ». Optionnel, donc aucune mécanique ne casse le jour où on le pose. Exemples visés : « Huit mots triés, deux noyés. » — « Deux capitales sur quatre retrouvées avant le brouillard. » — « Dix heures sonnent. Le roi sort de sa chambre, et la Cour ne l'a pas quitté des yeux. »
*Vérifié quand* : `GameShell` n'affiche plus jamais « Bonne réponse ! » sur une mécanique qui a fourni son verdict, et l'affiche encore sur celles qui n'en fournissent pas.

**J2.2 · Association : dire pourquoi la paire est fausse · S**
Un champ optionnel par paire, affiché quand c'est *cette* carte-là qu'on a mal reliée. Sur les états de l'eau : *« Non — la liquéfaction, c'est le gaz qui redevient liquide. Tu as pris le chemin inverse. »* L'erreur devient le meilleur moment du jeu.

**J2.3 · Cap sur : la consigne devient une question · S**
Aujourd'hui l'écran affiche `Trouve : {cible.label}`, donc littéralement le nom de la zone. On ne peut demander que ce qu'on nomme. Faire passer `cibles` d'une liste d'identifiants à une liste d'objets portant une consigne et une révélation facultatives débloque tout un registre : *« la ville la plus à l'est »*, *« le fleuve qui ne se jette pas dans l'Atlantique »*, *« le seul pays voisin qu'on rejoint sans traverser de montagne »*.
Trois payloads existants à migrer (Paris, pays voisins, la Loire), et `contentIntegrity.test.ts` à ajuster — il vérifie déjà que chaque cible existe sur sa carte.
*Pourquoi ça compte* : sans ça, le créneau « points cardinaux » prévu par le plan de contenu n'est pas rédigeable. C'est une dépendance, pas un confort.

### Phase 3 — Donner un lieu

À faire après les phases 1 et 2, et jamais avant : peindre un jeu sans voix ni enjeu, c'est repeindre une pièce vide. Invoquer la skill `aquarelle` avant la première ligne.

**J3.1 · Un décor peint par mécanique · M**
Un `scene.ts` par dossier de jeu, exportant une constante de module (`WatercolorScene` garde `paint` dans ses dépendances d'effet — une scène recalculée à chaque rendu repeindrait en boucle). Contrainte de lisibilité : le décor passe **sous** le contenu, en lavis très pâle, et le contraste du texte se vérifie après, pas avant.

**J3.2 · La Rivière devient une rivière · S**
Les deux paniers deviennent les deux **rives**, à gauche et à droite ; l'eau descend entre elles ; le mot raté coule avec une onde. La disposition actuelle (paniers en bas, mot qui tombe dessus) enseigne « fais tomber dans la bonne boîte » ; deux rives enseignent « choisis un bord ». C'est la même mécanique, et ce n'est plus la même leçon.

**J3.3 · Le Fil des jours : la chambre s'éclaire · M**
L'heure avance en haut de l'écran, de huit heures à dix heures, et la lumière du décor se réchauffe d'étape en étape. Le moteur sait déjà faire la lumière (`src/components/watercolor/light.ts`) et l'architecture. C'est le meilleur rapport immersion / effort de toute la liste : le temps qui passe est le sujet même du jeu.

**J3.4 · Cap sur : la table du cartographe · S**
Fond parchemin, la zone trouvée se révèle comme une tache d'encre qui s'étale. Le brouillard existant reste tel quel, il fonctionne.

### Phase 4 — Le contenu

Menée en parallèle, elle est déjà écrite : T3, T4 et T6 de [niveau-1.md](niveau-1.md). Rien à ajouter ici, sauf deux notes venues du diagnostic ci-dessus.

- **T3 dépend de J2.3** pour les points cardinaux : la consigne d'une cible n'existe pas encore.
- **Après J0.2**, relire les réglages des huit Rivières : avec une erreur qui coûte le mot et des mots devenus piégeux, `vitesseInitialeSec: 4` est trop court. On ne lit pas « échappatoire » et on ne décide pas de son genre en quatre secondes. Viser six à sept secondes et une accélération plus douce : la tension doit venir du doute, pas de la vitesse de lecture — c'est la décision n° 2 du plan de contenu.

---

## Le Niveau 1 après tout ça

| # | Notion | Mécanique | Ce qu'on y risque |
|---|---|---|---|
| 1 | Masculin et féminin | La Rivière | Les mots sans article, deux rives, une erreur et le mot coule |
| 2 | Les 3 états de l'eau | Association | Les noms savants, et l'erreur qui explique le chemin inverse |
| 3 | Les points cardinaux | Cap sur | Des consignes-devinettes sur une table de cartographe |
| 4 | Louis XIV | Le Fil des jours | Une matinée qu'on peut perdre, et un compteur qui ne redescend jamais |

Quatre créneaux, quatre mécaniques, quatre domaines — la règle 4.2 de la feuille de route. **Le QCM sort du Niveau 1** : ce n'est pas ainsi qu'on ouvre.

## Ce que je ne recommande pas

**Le tracé au doigt pour Association** (2.1 de la feuille de route). L'idée est belle, mais c'est un chantier de gestes tactiles, et J2.2 apporte l'essentiel du gain — l'erreur qui enseigne — pour un dixième du coût. À reprendre quand le reste sera fait.

**Le son.** C'est le levier d'immersion le moins cher au monde et le plus dangereux : sur mobile, un jeu qui parle sans prévenir se ferme. À reposer une fois qu'il y aura des réglages.

**Peindre avant J2.1.** Deux fois dans ce document, pour une seule raison : un décor qui habille un « Pas tout à fait… » rend le décalage plus visible, pas moins.

## Risques

**J0.2 rend le CP plus dur d'un coup, sur huit notions.** C'est voulu, mais ça se constate en jouant, pas en lisant. Ne pas enchaîner sur la réécriture des Rivières sans avoir joué la version corrigée.

**J2.3 change la forme d'un payload de contenu.** `selectGameForNotion` retombe silencieusement sur une autre mécanique quand un `gameType` épinglé manque : lancer `contentIntegrity.test.ts` après chaque passe.

**Le rendu visuel ne se vérifie pas sans navigateur.** En session cloud, toute la Phase 3 se classe « non vérifiée » : le repli est un test de composant, et le jugement esthétique attend une session qui peut voir l'écran. C'est le même piège que la vignette de la Phase D du plan de contenu.
