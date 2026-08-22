# Le Niveau 1 (CP) — plan de refonte

## Contexte

Le Niveau 1 est le premier écran de jeu que voit qui que ce soit. Il donne le ton de toute l'application, et il ne tient pas cette promesse.

Le diagnostic de départ (« ce ne sont que des QCM ») ne résiste pas à la vérification : le Niveau 1 utilise déjà cinq mécaniques différentes — c'est même le seul des huit dans ce cas. Deux défauts bien plus graves se cachaient derrière.

**Défaut 1 — les mécaniques sont réglées à leur minimum vital.**

| Créneau | Notion | Mécanique | Réglage réel |
|---|---|---|---|
| 1 | La Préhistoire | QCM | 1 question, bonne réponse toujours en 1er bouton, **aucun autre payload possible** |
| 2 | La France et sa capitale | Cap sur | **une seule cible** (Paris) → manche de 6 secondes |
| 3 | Les 5 sens | Association | 5 paires, sans chrono |
| 4 | Voyelles et consonnes | La Rivière | 5 lettres, objectif 5 |
| 5 | La frise du temps | Frise | **3 cartes** : passé / présent / futur |

**Défaut 2, découvert en cours de route et bien plus lourd — le contenu est vide pour son public.**

Le jeu s'adresse à un **adulte** qui refait le programme scolaire du CP à la 3e (voir `CLAUDE.md`). Or le Niveau 1 lui propose « la vue → les yeux », « A est une voyelle », « la capitale de la France est Paris ». Il n'apprend rien, ne ressent rien, et referme. Trois des cinq anecdotes — qui sont censées être sa récompense — sont creuses : *« Paris est traversée par un fleuve : la Seine »*, *« Le français compte 6 voyelles »*, *« Les historiens utilisent des frises chronologiques »*.

**Le sujet, lui, reste excellent.** Un niveau scolaire désigne la matière, pas le public. Les mêmes notions, prises par le bout qui surprend quelqu'un qui croit déjà savoir :

| Notion | Aujourd'hui | Pour son vrai public |
|---|---|---|
| Les 5 sens | La vue → les yeux | Nous en avons bien plus que cinq — l'équilibre, la position du corps, la température. Et la « carte des saveurs » de la langue vient d'une mauvaise traduction d'une thèse allemande de 1901. |
| Voyelles et consonnes | A est une voyelle | Le français **écrit** 6 voyelles mais en **prononce** environ 16. Le « y » s'appelle *i grec* parce qu'il a été importé pour transcrire le grec. |
| La France et sa capitale | Paris | Paris n'a pas toujours été capitale : Versailles l'a été de 1682 à 1789, et le gouvernement s'est replié à Bordeaux, à Tours, puis à Vichy. |
| La frise du temps | Passé / présent / futur | Le découpage en grandes périodes est une **convention du XIXᵉ siècle**, pas un fait : on a choisi 476 et 1492 après coup, et les historiens s'en disputent encore les bornes. |

Résultat visé : un Niveau 1 qu'un adulte finit en se disant qu'il a appris quatre choses qu'il ignorait, et dont il a envie de raconter au moins une le soir même.

## Décisions prises

1. **On conçoit pour l'adulte.** L'enfant est bienvenu, il ne dicte rien. *(Déjà appliqué : commit « Change de public cible ».)*
2. **Facile à jouer, surprenant à apprendre.** Le CP est la marche d'entrée : gestes simples, pression légère. Toute l'exigence passe dans le contenu.
3. **Les tableaux aquarelle sont liés au contenu** du niveau, pas décoratifs.
4. **Un seul tableau pour l'instant**, en modèle, pour juger la direction avant d'en peindre huit.
5. **La conception de la mécanique neuve passe par `game-designer`** — les fiches des mécaniques « en réserve » ont été perdues (voir Risques).
6. **Les 40 QCM sont hors périmètre** (reportés). La refonte retire de toute façon le QCM du Niveau 1.

## Le Niveau 1 cible

Cinq créneaux : quatre jeux courts et un temps fort, un domaine chacun.

| # | Notion | Mécanique | Ce qui change |
|---|---|---|---|
| 1 | Voyelles et consonnes | **La Rivière** | 5 → 9 lettres, objectif 8. Ouverture par le geste et la tension. |
| 2 | La France et sa capitale | **Cap sur** | 1 → 4 cibles. Chaque erreur enseigne un second fait. |
| 3 | Les 5 sens | **Association** | Contenu réécrit, calcul de score corrigé (T6). |
| 4 | La frise du temps | **Frise** | Réécrite **sur place** en vraie chronologie, avec retour immédiat après chaque pose. |
| 5 | La Préhistoire | **« Garder le feu »** *(neuf)* | Le temps fort. |

**Les cinq contenus sont réécrits pour un adulte.** C'est le cœur du chantier, pas un ajustement.

Deux choix à expliciter :

- **La Préhistoire passe du créneau 1 au créneau 5.** C'est aujourd'hui le seul créneau sans mécanique alternative possible, et c'est le tout premier écran de jeu de l'app. En faire le final le transforme d'un point faible en point d'orgue.
- **La frise est réécrite sur place, pas remplacée.** Une version antérieure de ce plan créait une notion neuve et sortait l'ancienne, ce qui la laissait orpheline et injouable — les 40 notions occupent exactement 40 créneaux, en bijection. Réécrire au même emplacement ne fait de trou nulle part et ne touche aucun autre niveau.

Le QCM disparaît du niveau, conforme à la tâche 4.1 qui veut en faire une mécanique de révision, jamais de découverte.

## Le tableau du Niveau 1

**« La veille du feu »** — une bouche de grotte dans la nuit, un feu, une silhouette accroupie.

Trois raisons, dont une purement technique et décisive :

1. Il est lié au temps fort du niveau.
2. **Il est lisible à très petite taille.** La vignette fera ~240 × 110 px, moins sur mobile. Le piège n° 1 documenté du moteur de peinture est de juger une image à sa résolution interne et de la découvrir illisible à sa taille réelle. Une masse sombre percée d'un point chaud est exactement ce qui survit à cette réduction.
3. Il est franchement différent des tableaux existants, tous en ville d'eau méditerranéenne.

Coût réel : le moteur ne sait peindre aujourd'hui ni terrain, ni feu, ni végétation. Deux primitives neuves sont nécessaires, qui amorcent le module `terrain.ts` manquant et resserviront pour les sept autres tableaux.

## Les tâches

Ordonnées par risque décroissant : le plus incertain d'abord, pour le découvrir en une heure et non après trois jours bâtis dessus.

### Phase A — Concevoir avant de coder

**T1 · Faire régénérer la fiche de « Garder le feu » · S**
Lancer `game-designer` sur la notion `cp-histoire-prehistoire`. Rendu attendu : pitch, ce que ça enseigne, déroulé seconde par seconde, ressorts activés, forme du contenu, traitement de l'échec, coût.
Contraintes à transmettre : conçu **pour un adulte** ; geste simple et pression légère (marche d'entrée) mais contenu qui apprend quelque chose ; mobile d'abord, cibles ≥ 44px ; pas de glisser-déposer ; l'échec doit enseigner.
*Vérifié quand* : la fiche est codable sans reposer de question, et survit au test « aurait-on envie d'y rejouer en connaissant la réponse ? ».

**T2 · Arbitrer la fiche · S**
Décision produit, elle revient au propriétaire. Si la mécanique ne convainc pas, on s'arrête ici et on se rabat sur « approfondir seulement », sans avoir écrit une ligne de code.

### Phase B — Le contenu *(le vrai cœur du chantier)*

**T3 · Réécrire les cinq notions pour un adulte · M — agent `redacteur-contenu`**
Cantonné à `src/content/`. Invoquer la skill `nouvelle-notion`, dont le critère de tri est désormais explicite. Pour chacune : `summary`, `funFact` et les payloads de jeu.
- **Voyelles et consonnes** : porter les flottants de 5 à 9, objectif 8.
- **La France et sa capitale** : porter les cibles de `['paris']` à 4 cibles réelles (`src/content/maps/france.ts` propose 10 villes, 4 fleuves, 5 pays voisins).
- **Les 5 sens** : réécrire, payload `match` conservé.
- **La frise du temps** : réécrire en vraie chronologie, 5 cartes.
- **La Préhistoire** : réécrire, et **corriger la contradiction** relevée par le `verificateur` — `histoire.ts` affirme « la Préhistoire est la période avant l'invention de l'écriture » puis range « l'écriture » parmi les inventions **de la Préhistoire**.
Exactitude non négociable : chaque date et chaque attribution vérifiée par recherche web, pas de mémoire.
*Vérifié quand* : `contentIntegrity.test.ts` passe, et chaque notion passe le test « un adulte cultivé lit et ressent quelque chose ».

### Phase C — Le temps fort

**T4 · Construire « Garder le feu » · M**
Les cinq points de la skill `nouvelle-mecanique` : types (`GarderLeFeuContent`, `GameTypeId`, `NotionGames`) → composant `src/games/GarderLeFeuGame/` → `case` dans `GameRouter` → `GAME_PRIORITY` (après `fildesjours`, avant `match` ; `qcm` reste dernier).
**Le nom du dossier doit correspondre à l'identifiant** (règle née d'un vrai incident, cf. l'ancien `mapclick`/`CapSurGame`). Chrono via `elapsedSince`, aléatoire via `shuffle` — jamais `Date.now()` ni `Math.random()` dans un composant (oxlint `react(purity)`). Logique calculable en isolation extraite dans `src/engine/garderlefeu.ts`, comme pour `fildesjours`.
*Vérifié quand* : `npm run build`, et un test de composant qui joue une manche gagnée **et** une manche perdue.

**T5 · Écrire le contenu de « Garder le feu » et l'épingler · S**
Payload sur `cp-histoire-prehistoire`, puis épinglage dans `cp-level-1`.
*Vérifié quand* : `contentIntegrity.test.ts` passe — il attrape un `gameType` épinglé absent de la notion, qui ferait retomber le jeu silencieusement sur une autre mécanique.

### Phase D — Réparer deux mécaniques

**T6 · Frise : retour immédiat après chaque pose · S**
Tâche 2.3 de la feuille de route, prérequis du créneau 4. `TimelineGame` rend aujourd'hui un verdict binaire tout à la fin, sans retour intermédiaire, sans retour arrière, sans montrer le bon ordre — le pire traitement de l'échec du projet.
*Vérifié quand* : un test de composant montre le retour après chaque pose, en juste et en faux.

**T7 · Association : corriger le score · S**
`MatchGame` renvoie `correct: false` dès la première erreur et **ne transmet pas `mistakes`** — contrairement à la Rivière et à Cap sur. L'information est perdue pour le score, et une hésitation coûte l'étoile.
*Vérifié quand* : un test vérifie que `mistakes` remonte et que le résultat n'est pas binaire à la première erreur.

### Phase E — L'habillage *(indépendant : aucun fichier commun avec B, C et D, peut avancer en parallèle)*

**T8 · Deux primitives de peinture · M**
Créer `src/components/watercolor/terrain.ts` : `rockMass(...)` (silhouette en **plateaux**, jamais en pente — une diagonale reprise par le flou fractal se lit comme un cristal) et `fire(...)` (flammes + halo chaud). Un `LightPlan` unique passé à tous les éléments ; `dryStroke` au ratio minimum 10:1 ; les petits noirs sur une poignée de pixels ; garder du papier presque nu quelque part, sinon pas de vrai sombre.
*Vérifié quand* : couvertes par `engine.test.ts` (déterminisme, absence de NaN) — le canvas 2D n'existe pas sous jsdom, on teste la géométrie, pas le rendu.

**T9 · Peindre « La veille du feu » · M**
Une `PaintScene` dans un registre neuf `src/screens/LevelMapScreen/levelArt.ts`, sur le modèle de `GRADE_ART` : un `Record<string, PaintScene>` indexé par `level.id`. **Ne pas mettre le décoratif dans `src/content/`** ni étendre `LevelDef` — ça entraînerait `contentIntegrity.test.ts`. La scène doit être une **constante de module** : `WatercolorScene` a `paint` dans ses dépendances d'effet, une lambda en ligne repeindrait à chaque rendu.
*Vérifié quand* : **le propriétaire l'a vue à sa taille d'affichage réelle**, pas sur une capture zoomée — piège documenté qui a déjà coûté une itération. Méthode de capture dans la skill `pieges-du-projet`.

**T10 · Intégrer la vignette à la carte des niveaux · S**
`LevelMapScreen.tsx` + son `.module.css`. Insérer `<WatercolorScene>` dans `.node` avant le titre (le nœud est déjà un `flex-direction: column`). Ajouter `overflow: hidden` et un `border-radius` sur `.node`. Niveau verrouillé : tableau voilé (`opacity` ~0.35) sous le cadenas — c'est une promesse, pas une information à protéger. Ne monter le composant que pour les niveaux qui ont un tableau. Tableau décoratif : pas d'`alt`, il reste `aria-hidden`.
*Vérifié quand* : `LevelMapScreen.test.tsx` (aucun test n'existe) couvre déverrouillé et verrouillé. `WatercolorScene` garde déjà contre un contexte 2D absent (`if (!ctx) return`) — **vérifié**, jsdom ne cassera pas.

**T11 · Donner un vrai titre au Niveau 1 · XS**
`LevelDef.title` vaut « Niveau 1 ». Optionnel, à faire seulement si T9 convainc.

## Vérification de bout en bout

```bash
npm run build      # tsc -b + vite build
npm run lint       # oxlint
npm run test       # vitest
```

Puis le parcours réel : accueil → carte CP → **Niveau 1 joué en entier** jusqu'au résumé, avec pour chaque mécanique **une bonne réponse et une mauvaise**. Recharger la page, confirmer que la progression tient.

Enfin, avant de déclarer quoi que ce soit fini : l'agent `verificateur`, puis l'`avocat-du-diable` (chantier structurel : mécanique neuve, types neufs, contenu réécrit).

**Si le navigateur n'est pas disponible** (session cloud), ne rien inventer : le repli est un test de composant qui rejoue le vrai parcours, et le rendu visuel se classe « non vérifié ». Pour T9 cette limite est bloquante — un tableau ne se juge pas sans être vu.

## Risques et points de vigilance

**Les fiches des mécaniques en réserve sont perdues.** `plan-jeux.md` et `feuille-de-route.md` annoncent six mécaniques « écrites et documentées » ; il ne subsiste qu'une phrase les nommant, et les deux documents ne listent pas les mêmes six (l'un cite *La Roue de la vie*, l'autre *La Boussole*, décrite nulle part). D'où T1. À corriger dans les deux documents une fois les fiches régénérées.

**Le repli silencieux de `selectGameForNotion`.** Un `gameType` épinglé absent des `games` de la notion ne lève aucune erreur : c'est simplement le mauvais jeu qui s'affiche. Lancer `contentIntegrity.test.ts` après chaque modification de `cp-levels.ts`.

**Bijection 40 notions / 40 créneaux.** Toute notion retirée d'un niveau devient injouable. C'est la raison pour laquelle la frise est réécrite sur place plutôt que remplacée.

**Le grain du canvas est le poste de coût dominant**, facturé une fois par tableau. Sans conséquence pour un seul ; à traiter (cache par `level.id`, ou grain optionnel) le jour où on passera aux huit.

**La règle des trois couleurs par écran** vaudra pour la carte entière quand huit tableaux y cohabiteront. Le violet ne compte pas (c'est le liant). Arbitrage à prévoir alors, pas maintenant.

## Hors périmètre, assumé

- Les 40 QCM (bonne réponse toujours en premier bouton, `QcmGame` ne mélange pas) — reporté explicitement.
- La refonte d'« Association » en tracé au doigt (2.1) et la Roue de la vie (2.2).
- Les niveaux 2 à 8, leur contenu et leurs tableaux — mais **leur contenu est désormais lui aussi hors cible** (écrit pour des enfants) : la relecture des 40 notions (4.3) devient plus lourde qu'annoncée.
- Les quatre défauts de contenu relevés hors Niveau 1 (laine parmi les aliments, « La Marianne », résumé des contes).
