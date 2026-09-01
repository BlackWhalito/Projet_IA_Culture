# Les jeux du Niveau 1 — état des lieux et plan de refonte

*Audit mené le 1er septembre 2026, manette en main : les cinq jeux ont été joués dans Chromium (viewport 420 × 860, le format visé), et chaque constat ci-dessous vient d'une capture, pas d'une lecture de code.*

Ce document est le pendant de [niveau-1.md](niveau-1.md). Celui-là traite de **ce que les jeux demandent** (le contenu, trop facile pour un adulte). Celui-ci traite de **comment ils le demandent, et de ce qu'ils rendent en échange**. Les deux sont nécessaires : du contenu piégeux dans une carte blanche posée sur du beige ne sera pas immersif, et une belle mise en scène qui interroge « la vue → les yeux » n'apprendra rien.

## Ce que j'ai vu, jeu par jeu

Le Niveau 1 enchaîne cinq jeux, chacun dans une carte blanche flottant sur un fond beige, sans décor, sans consigne, sans son. La session complète dure moins de trois minutes.

**1 · QCM — La Préhistoire.** « Qu'est-ce que les hommes préhistoriques ont appris à maîtriser ? » → *Le feu*. L'écran de récompense affiche alors : « Les hommes préhistoriques ont appris à maîtriser le feu il y a environ 400 000 ans. » **L'anecdote reformule la question.** On ne repart avec rien qu'on n'ait déjà tapé. Le tiers bas de l'écran est vide.

**2 · Cap sur — Paris.** Le constat le plus dur : **la carte de France ne ressemble pas à la France.** C'est une patate. Pas de Bretagne, pas de Cotentin, pas de côte méditerranéenne, pas de Corse. Or « Cap sur » est un jeu de repérage : sans silhouette reconnaissable, le joueur ne peut pas raisonner, il ne peut que deviner. Le contour est un enchaînement de courbes écrites à la main dans `src/content/maps/france.ts`, assumé « schématique » par son commentaire — mais schématique et méconnaissable sont deux choses. Les fleuves sont des traits violets fins qui ne se lisent pas. Le brouillard qui doit créer la tension est presque invisible. Et il n'y a **qu'une seule cible** : la manche dure six secondes.

**3 · Association — Les 5 sens.** Dix boutons en deux colonnes, **aucune consigne à l'écran**. Rien ne dit qu'il faut apparier. Quand on apparie juste, les deux cartes s'éteignent : aucun trait ne relie ce qu'on a construit, l'écran se vide au lieu de se remplir. Et sur le fond, « La vue → Les yeux » n'est pas une question, c'est un réflexe.

**4 · La Rivière — Voyelles et consonnes.** **La Rivière n'a pas de rivière.** C'est un rectangle gris vide dans lequel tombe une lettre, avec deux boutons en bas. Le nom de la mécanique promet un courant, des berges, quelque chose qui coule ; l'écran donne un tunnel. Un seul mot en jeu à la fois, donc jamais de choix à faire, jamais de coup d'œil à arbitrer — juste attendre puis taper. Le contenu (A, B, O, M, U) ne fait hésiter personne.

**5 · Frise du temps.** Trois emplacements en pointillés, trois étiquettes : *Le passé*, *Le présent*, *Le futur*. Il n'y a rien à ordonner : la réponse est dans les mots. Aucune date, aucun repère, aucune consigne.

**Le bilan de fin.** J'ai terminé à 3/5, une étoile, 432 points. L'écran ne dit **pas ce que j'ai raté**, ne redonne pas la notion manquée, ne propose pas de rejouer. Le moment où l'on apprendrait le plus est un cul-de-sac de trois lignes.

## Trois défauts sous les jeux

### 1. Aucun jeu n'a de lieu

C'est le vrai manque d'immersion, et il est transversal. Chaque mécanique est un composant nu posé dans une carte : pas de décor, pas de fiction, pas un mot pour dire qui l'on est ni ce qu'on fait là. Le projet possède pourtant déjà un moteur d'aquarelle capable de peindre de l'eau (`ripples`, `reflection`), du ciel (`gradedWash`, `cloud`), du grain de papier (`grain`, `granulation`) — il sert aujourd'hui uniquement l'accueil. Les jeux, eux, n'en voient rien.

L'immersion ici ne viendra ni de la 3D ni du son (absents, et hors de portée raisonnable). Elle viendra de trois choses peu coûteuses : **une fiction qui donne un sens au geste**, **un décor derrière la carte**, et **un retour qui parle au joueur** plutôt qu'un « Pas tout à fait… » générique.

### 2. Le savoir arrive au bon moment, mais il est creux

L'architecture est juste — `GameShell` a supprimé l'écran d'intro, le savoir est la récompense. Mais ce qu'elle récompense est presque toujours la reformulation de ce qu'on vient de taper, et c'est **le même bloc, à la même place, cinq fois de suite**. Surtout : le retour est identique qu'on ait eu juste ou faux. Quand on se trompe, on ne sait pas **pourquoi** on s'est trompé — c'est précisément là que l'apprentissage se joue, et c'est le seul instant que l'app laisse passer.

### 3. Le score ne mesure rien — quatre défauts cumulés

- **Les 40 QCM ont `correctIndex: 0`, et `QcmGame` ne mélange pas les propositions.** La bonne réponse est **toujours le premier bouton**. Un joueur qui le remarque gagne tous les QCM sans lire. Correctif : cinq lignes.
- **`MatchGame` renvoie `correct: false` dès la première erreur et ne transmet pas `mistakes`.** Une hésitation coûte l'étoile, et l'information est perdue pour le score.
- **`FilDesJoursGame` renvoie `correct: true` en dur** (`FilDesJoursGame.tsx:50`) : on ne peut pas perdre.
- **`TimelineGame` est binaire** et ne transmet pas non plus `mistakes`.

Tant que ces quatre points tiennent, les étoiles et les points sont du bruit, et **aucune amélioration de contenu ne sera mesurable**.

*À noter au passage : seuls `CapSurGame` et `FilDesJoursGame` ont un test de composant. QCM, Association, Rivière et Frise n'en ont aucun.*

## Le plan

Six chantiers transversaux d'abord — ils profitent aux huit niveaux, pas seulement au premier — puis les refontes jeu par jeu. Chaque chantier porte une taille (S / M / L) et son critère de vérification.

### Phase 1 — Rendre le jeu mesurable *(à faire en premier, sans discussion)*

**C1 · Mélanger les propositions du QCM · S**
`QcmGame` mélange `choices` au montage via `engine/shuffle`, en gardant la trace de l'index d'origine pour comparer à `correctIndex`. Ne toucher à aucun fichier de contenu.
*Vérifié quand* : un test rend le même QCM vingt fois et constate que la bonne réponse n'est pas toujours en première position.

**C2 · Réparer les trois contrats de sortie cassés · S**
`MatchGame` transmet `mistakes` et cesse d'être binaire ; `TimelineGame` transmet `mistakes` ; `FilDesJoursGame` lie `correct` à l'issue réelle de la partie. Le contrat `GameCompleteResult` prévoit déjà tout cela — c'est du remplissage, pas une extension de type.
*Vérifié quand* : un test par mécanique vérifie qu'une partie avec deux erreurs remonte bien `mistakes: 2`.

**C3 · Un test de composant pour les quatre mécaniques qui n'en ont pas · S**
QCM, Association, Rivière, Frise. Une partie gagnée, une partie perdue, le résultat transmis. C'est le filet qui rend les phases 2 et 3 sûres.
*Vérifié quand* : `npm run test` couvre les six mécaniques.

### Phase 2 — Apprendre vraiment *(le cœur)*

**C4 · Le retour qui explique l'erreur · M**
Aujourd'hui, se tromper affiche « Pas tout à fait… » puis exactement le même bloc que gagner. Proposition : le contenu porte, **pour chaque mauvaise réponse possible**, une ligne qui dit pourquoi elle est tentante et pourquoi elle est fausse.

- QCM : un champ `explications?: string[]`, parallèle à `choices`.
- Rivière : un `piege?: string` optionnel sur chaque flottant, affiché quand il est mal classé.
- Association : un `piege?: string` sur la paire, affiché quand on l'a confondue avec une autre.

`GameShell` affiche alors, en cas d'échec, l'explication de **ce que le joueur a répondu** avant le résumé de la notion. C'est le levier d'apprentissage numéro un du projet, et il ne demande aucune nouvelle mécanique.
*Vérifié quand* : on se trompe volontairement sur les trois mécaniques et on lit trois explications différentes, spécifiques à la réponse donnée.

**C5 · Le bilan de fin qui récapitule · M**
L'écran final liste les notions jouées avec ✓/✗, redonne en une ligne ce qu'on a manqué, et propose **« Rejouer ce que j'ai raté »** — une session courte reconstruite avec les seules notions échouées. C'est le moment de rétention le plus rentable de tout le parcours, et il est aujourd'hui vide.
*Vérifié quand* : un test finit un niveau à 3/5 et vérifie que les deux notions ratées sont nommées et rejouables.

### Phase 3 — Donner un lieu à chaque jeu

**C6 · La consigne fictionnelle, en deux couches · S**
Chaque jeu s'ouvre sur une ligne de fiction et une ligne de règle. La séparation qui évite de tout réécrire quarante fois :

- **La fiction appartient à la mécanique** (dans le composant) : « Le fleuve charrie des mots. Deux rives, un courant, et il ne repasse pas. »
- **L'objectif appartient à la notion** (dans le contenu) : « Range chaque mot selon son genre. »

Ainsi une nouvelle notion n'écrit qu'une ligne, et la fiction reste cohérente d'un niveau à l'autre.
*Vérifié quand* : les six mécaniques affichent leur consigne, et une notion nouvelle n'a qu'une phrase à fournir.

**C7 · Un décor aquarelle par domaine · M**
Quatre scènes peintes par le moteur existant, derrière la carte de jeu, en valeurs basses pour ne jamais gêner la lecture : français, sciences, géographie, histoire. Contraintes déjà documentées, à ne pas redécouvrir : la scène doit être une **constante de module** (`WatercolorScene` a `paint` dans ses dépendances d'effet), le canvas doit être en `pointer-events: none`, et le rendu se juge **à la taille réelle**, dans un navigateur, jamais sur la résolution interne.
*Vérifié quand* : les quatre décors ont été **regardés** en capture à 420 px de large, et le texte reste lisible par-dessus.

### Phase 4 — Les refontes, une par une

Par ordre de rendement décroissant. Chacune est un chantier autonome : on peut s'arrêter après n'importe laquelle.

**C8 · Cap sur : une France qui ressemble à la France · M**
Remplacer le contour manuscrit par une silhouette simplifiée mais **reconnaissable** — Bretagne, Cotentin, golfe du Lion, Corse. Le style aquarelle n'est pas en cause, la forme l'est. Épaissir les fleuves, rendre le brouillard visible, et porter la manche à **quatre cibles minimum** (six secondes de jeu ne font pas une manche). Les villes trouvées restent affichées : la carte se remplit à mesure qu'on joue.
*Vérifié quand* : la carte est capturée et **reconnue comme la France sans légende**.

**C9 · La Rivière : lui donner sa rivière · M**
Un courant peint horizontalement, les mots portés dessus, deux berges en guise de paniers. Passer de un à **deux ou trois mots simultanés**, pour qu'il y ait un arbitrage à faire et pas seulement une attente.
*Risque à connaître* : le « un seul mot à la fois » protège aujourd'hui d'un piège StrictMode documenté (un updater de state à effet de bord). Passer à plusieurs mots demande de dériver la file, pas de la muter — à traiter comme un point de conception, pas comme un détail.
*Vérifié quand* : la scène est capturée et **on voit de l'eau**, et un test joue une manche à trois mots simultanés.

**C10 · Association : tracer le lien au doigt · M**
Remplacer les deux taps par un glissé qui **laisse un trait visible**. Les liens déjà faits restent tracés : l'écran se remplit au lieu de s'éteindre. C'est ce qui sépare « je tape » de « je construis ».
*Vérifié quand* : le tracé fonctionne à la souris **et** au doigt (`pointer events`), et les traits survivent jusqu'à la fin de la manche.

**C11 · La Frise : de vraies dates, à la bonne distance · M**
Une frise proportionnelle plutôt que trois cases : placer un événement enseigne alors **de combien** il est éloigné du suivant. Suppose du contenu daté — à croiser avec la réécriture prévue dans [niveau-1.md](niveau-1.md).
*Vérifié quand* : deux événements séparés de 2 000 ans sont visiblement plus éloignés que deux événements séparés de 50 ans.

**C12 · Le Fil des jours : les trois correctifs déjà spécifiés · M**
La règle du jeu écrite en trois lignes à l'ouverture, les deltas de jauge affichés au moment du choix, et une vraie défaite quand une jauge tombe à zéro. Le détail est dans [niveau-1.md](niveau-1.md), tâche T1 — il n'est pas repris ici pour ne pas créer deux vérités.
*Vérifié quand* : le propriétaire comprend le jeu **sans explication**.

## Ce que ce plan ne fait pas

- **Pas de son.** C'est le levier d'immersion le plus puissant et le moins cher par minute de travail, et il est absent du projet. À trancher séparément : une nappe discrète et trois bruitages changeraient plus l'expérience que n'importe quel décor.
- **Pas de contenu réécrit.** C'est le chantier de [niveau-1.md](niveau-1.md), et il reste indispensable : une Rivière magnifique qui fait trier A et B restera insultante pour un adulte.
- **Pas de nouvelle mécanique.** Les six existantes sont bonnes ; c'est leur mise en scène et leur retour qui manquent.

## Un arbitrage à rendre

**L'immersion et la vitesse tirent en sens contraire.** Une consigne fictionnelle, un décor et un retour explicatif coûtent chacun quelques secondes, cinq fois par niveau. Ou bien le niveau s'allonge, ou bien il porte moins de jeux mais plus longs.

[niveau-1.md](niveau-1.md) a déjà tranché : **quatre créneaux, trois jeux courts et un temps fort**. C'est la bonne structure, et c'est la seule où l'immersion soit finançable — mieux vaut quatre jeux dont on se souvient que cinq qu'on traverse.

## Ordre recommandé

Phase 1 (C1-C3) d'abord : sans elle, rien de ce qui suit n'est mesurable, et c'est une journée de travail au plus. Puis **C4** — c'est le chantier qui transforme le plus l'app par unité d'effort. Ensuite C6, puis C8 et C9, qui sont les deux jeux dont l'écart entre la promesse et l'écran est le plus grand.
