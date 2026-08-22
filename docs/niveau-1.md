# Le Niveau 1 (CP) — refonte pour un public adulte

## Contexte

Le jeu s'adresse désormais à un **adulte** qui refait le programme scolaire du CP à la 3e (décision actée, commit « Change de public cible »). Le Niveau 1 est le premier écran qu'il voit. Il ne tient pas la promesse, et l'exploration a montré pourquoi.

**Le jeu ne teste rien, et l'anecdote enseigne tout.** C'est à l'envers : on devrait buter, puis recevoir l'explication en récompense. Aujourd'hui les anecdotes sont parfois bonnes, mais ce que les jeux font manipuler est systématiquement trivial.

| Jeu actuel | Ce qu'on trie / associe | Pour un adulte |
|---|---|---|
| Rivière — voyelle/consonne | A, B, O, M, U | aucune hésitation |
| Rivière — masculin/féminin | « **Un** chat », « **Une** chaise » | l'article donne la réponse |
| Rivière — vivant/non-vivant | arbre, caillou, chat, table | aucune hésitation |
| Association — les 5 sens | la vue → les yeux | aucune hésitation |
| Cap sur — Paris | **une seule cible** | manche de 6 secondes |

**Le diagnostic de départ (« ce ne sont que des QCM ») était faux** — le Niveau 1 est le seul des huit à utiliser cinq mécaniques distinctes. Les mécaniques ne sont pas le problème. **Le contenu qu'on leur donne l'est.**

Deux découvertes de l'exploration du programme officiel s'ajoutent :

- **`histoire.ts` n'est pas du CP.** 8 notions sur 10 relèvent du **CM1-CM2** (Préhistoire, Lascaux, Moyen Âge, Louis XIV, Colomb, Révolution). Au cycle 2 il n'y a **pas d'histoire chronologique** : on travaille « se repérer dans le temps » — jour, semaine, mois, saisons, les générations.
- **Six erreurs factuelles** sont en production (détail en fin de plan).

Résultat visé : un Niveau 1 dont un adulte cultivé sort en s'étant trompé au moins deux fois, en ayant appris pourquoi, et avec au moins une chose à raconter le soir même.

## Décisions prises

1. **On conçoit pour l'adulte** ; l'enfant est bienvenu, il ne dicte rien.
2. **La difficulté vient du contenu, pas du chrono.** On se trompe parce qu'on croyait savoir, pas parce qu'on a manqué de temps.
3. **Le cadre est le vrai programme du CP.** Le niveau désigne la matière, jamais le public.
4. **Le temps fort est « Le Fil des jours » (Louis XIV), déplacé au Niveau 1 et retravaillé** — le propriétaire ne comprend pas ce jeu aujourd'hui.
5. **On peut désormais perdre** une matinée de Louis XIV : une jauge à zéro déclenche un échec.
6. **Les tableaux aquarelle sont liés au contenu**, un seul peint pour l'instant, en modèle.

## Le Niveau 1 cible

**Quatre créneaux : trois jeux courts et un temps fort**, un domaine chacun, quatre mécaniques différentes. C'est la règle de la feuille de route (tâche 4.2), et elle tombe juste ici.

| # | Notion | Domaine | Mécanique | Le piège pour un adulte |
|---|---|---|---|---|
| 1 | **Masculin et féminin** | français | **La Rivière** | Les mots présentés **sans article** : *oasis, pétale, apogée, échappatoire, tentacule, haltère, astérisque, autoroute*. Le club des « -ée masculins » (apogée, périgée, trophée) fait tomber tout le monde. |
| 2 | **Les 3 états de l'eau** | sciences | **Association** | Associer chaque changement à **son nom savant** : fusion, solidification, vaporisation, **liquéfaction**, sublimation. Personne ne sait que « condensation » est ambigu ni que la sublimation existe. |
| 3 | **Les points cardinaux** | géographie | **Cap sur** | Le Soleil ne se lève exactement à l'est que **deux jours par an**. La boussole indique le nord **magnétique**, pas géographique. « S'orienter » vient d'« orient » : sur les cartes médiévales, **l'est était en haut**. |
| 4 | **Louis XIV** | histoire | **Le Fil des jours** *(retravaillé)* | Versailles était le **pavillon de chasse de Louis XIII**. « L'État, c'est moi » est **apocryphe**. Roi à 4 ans, mais règne personnel seulement à **22 ans**. |

Ces trois premières notions sont **des piliers du programme du CP** (le genre du nom, les états de la matière, l'orientation). Elles existent déjà dans l'app : **on ne crée aucune notion, on réécrit leur contenu.**

**Sur Louis XIV et le programme.** Le CM1 est son vrai niveau, et le CP n'enseigne pas d'histoire chronologique. Mais le programme du cycle 2 prévoit explicitement « quelques événements et personnages historiques **socialement partagés**, repérés sur une frise, sans étude chronologique ». Louis XIV entre par cette porte — comme repère, pas comme chapitre. C'est défendable, et c'est à toi de valider cette lecture.

**Les trois notions qui sortent du Niveau 1** (voyelles/consonnes, les 5 sens, la frise du temps) ne disparaissent pas : elles retournent au catalogue et seront replacées quand on traitera les niveaux suivants. Attention, **les 40 notions occupent aujourd'hui exactement 40 créneaux en bijection** — une notion retirée d'un niveau devient injouable tant qu'elle n'est pas replacée.

## La refonte du « Fil des jours »

Le fond est bon : incarner Louis XIV pour comprendre que Versailles est une machine à tenir la noblesse. **C'est la mise en jeu qui manque.** Trois défauts, dans l'ordre où ils se corrigent.

**1. La règle du jeu n'est écrite nulle part.** J'ai relevé tous les effets chiffrés du scénario : *chaque* option fait monter une jauge et descendre l'autre (`+8 autorité / −5 Cour`, `+10 / −5`, `+12 / −4`…). **C'est un jeu d'équilibre entre deux forces opposées, et le joueur ne l'apprend jamais.** Il cherche « la bonne réponse », ne la trouve pas, et se sent perdu. → Un écran d'ouverture de trois lignes : qui tu es, quelles sont les deux forces, et qu'elles ne montent jamais ensemble.

**2. On ne voit pas les jauges bouger.** Les barres changent en silence entre deux écrans. → Afficher le delta au moment du choix (`+8 Autorité`, `−5 Cour`), animé sur la barre.

**3. Rien n'est en jeu.** Une jauge à zéro ne déclenche rien, et `onComplete` renvoie `correct: true` en dur (`FilDesJoursGame.tsx:50`). → Seuil d'alerte sous 25, scène d'échec immédiate à zéro, et `correct` lié à l'issue réelle.

Fichiers : `src/games/FilDesJoursGame/FilDesJoursGame.tsx` (113 lignes), `src/engine/fildesjours.ts` (40 lignes, testé), `src/types/game.ts` pour le champ de règle.

## Les tâches

Ordonnées par risque décroissant.

### Phase A — Rendre le temps fort jouable

**T1 · Retravailler « Le Fil des jours » · M**
Les trois correctifs ci-dessus. Ajouter à `FilDesJoursContent` un champ `regle` (le texte d'ouverture) et des seuils. Étendre `src/engine/fildesjours.ts` (déjà testé) plutôt que de mettre la logique dans le composant.
*Vérifié quand* : un test de composant joue une partie gagnée **et** une partie perdue par jauge à zéro ; et surtout, **tu comprends le jeu sans explication** — c'est le vrai critère.

**T2 · Déplacer Louis XIV au Niveau 1 · S**
Permuter avec le Niveau 4, qui le porte aujourd'hui. Réécrire son texte pour un adulte, avec les pièges (Versailles pavillon de chasse, la phrase apocryphe, le règne personnel à 22 ans).
*Vérifié quand* : `contentIntegrity.test.ts` passe — il attrape un `gameType` épinglé absent de la notion, qui ferait retomber le jeu silencieusement sur une autre mécanique.

### Phase B — Le contenu des trois jeux courts *(le cœur du chantier)*

**T3 · Réécrire les trois notions pour un adulte · M — agent `redacteur-contenu`**
Cantonné à `src/content/`. Invoquer la skill `nouvelle-notion`, dont le critère de tri est désormais explicite.
- **Masculin/féminin** : retirer les articles des flottants, porter à 9 mots pièges, objectif 9. *(Livré : 9 flottants, objectif 9 — le plan prescrivait un pool légèrement plus large que l'objectif, ce qui n'a pas été jugé nécessaire.)*
- **États de l'eau** : payload `match` neuf (changement → nom savant), et garder l'excellent *funFact* existant sur la vapeur invisible.
- **Points cardinaux** : payload `capsur` neuf, 4 cibles. Réécrire le *summary* et le *funFact* autour du piège du lever de Soleil.
**Exactitude non négociable** : chaque fait vérifié par recherche, jamais de mémoire. Plusieurs pièges collectés sont signalés « non revérifiés » par l'exploration.
*Vérifié quand* : chaque notion passe le test « un adulte cultivé lit et ressent quelque chose », et `contentIntegrity.test.ts` passe.

**T4 · Recomposer le Niveau 1 et replacer les sortants · S**
`src/content/levels/cp-levels.ts` : le Niveau 1 passe à 4 créneaux. Replacer voyelles/consonnes, les 5 sens et la frise du temps dans un autre niveau, ou acter qu'ils attendent.
*Vérifié quand* : aucune notion orpheline, `contentIntegrity.test.ts` vert.

### Phase C — Réparer les mécaniques du niveau

**T5 · Association : corriger le score · S**
`MatchGame` renvoie `correct: false` dès la première erreur et **ne transmet pas `mistakes`** — contrairement à la Rivière et à Cap sur. L'information est perdue pour le score, et une hésitation coûte l'étoile. Or le créneau 2 repose sur cette mécanique, avec du contenu volontairement piégeux : il faut pouvoir se tromper.
*Vérifié quand* : un test vérifie que `mistakes` remonte et que le résultat n'est pas binaire.

**T6 · Corriger les six erreurs factuelles en production · S — indépendant**
Ponctuation (l'étymologie « quaestio » est **rejetée par les paléographes**) ; jours de la semaine (samedi vient de l'hébreu *Shabbat*, dimanche de *dies dominicus* — **pas des dieux romains**) ; grandes inventions (l'écriture y est rangée dans la Préhistoire, ce qui **contredit** la notion Préhistoire) ; pays voisins (le QCM donne « Pays-Bas » comme fausse réponse, **or ils sont frontaliers** via Saint-Martin) ; 5 continents (présenté comme un fait, c'est une **convention**) ; le miel par abeille (chiffre surestimé d'environ ×12).
*Peut être fait tout de suite, sans attendre le reste.*

### Phase D — L'habillage aquarelle *(indépendant, parallélisable)*

**T7 · Peindre le tableau du Niveau 1 · M**
Sujet à arrêter une fois les notions figées — le tableau doit évoquer le niveau. Le moteur ne sait peindre aujourd'hui ni terrain, ni feu, ni végétation : prévoir une à deux primitives neuves dans un `src/components/watercolor/terrain.ts`.
**Contrainte décisive** : la vignette fera ~240 × 110 px. Le piège n° 1 documenté du moteur est de juger une image à sa résolution interne et de la découvrir illisible à sa taille réelle. Concevoir en **silhouettes larges et contrastées**, pas en scène détaillée réduite.
*Vérifié quand* : **tu l'as vue à sa taille réelle.** Sans navigateur dans la session, cette tâche est bloquée — un tableau ne se juge pas sans être vu.

**T8 · Intégrer la vignette à la carte des niveaux · S**
Registre `src/screens/LevelMapScreen/levelArt.ts` : un `Record<string, PaintScene>` indexé par `level.id`, sur le modèle de `GRADE_ART`. **Ne pas mettre le décoratif dans `src/content/`** ni étendre `LevelDef`. La scène doit être une **constante de module** (`WatercolorScene` a `paint` dans ses dépendances d'effet). Niveau verrouillé : tableau voilé sous le cadenas.
*Vérifié quand* : `LevelMapScreen.test.tsx` (aucun test n'existe) couvre déverrouillé et verrouillé. `WatercolorScene` garde déjà contre un contexte 2D absent — **vérifié**, jsdom ne cassera pas.

## Vérification de bout en bout

```bash
npm run build      # tsc -b + vite build
npm run lint       # oxlint
npm run test       # vitest
```

Puis le parcours réel : accueil → carte CP → **Niveau 1 joué en entier**, avec pour chaque mécanique **une bonne réponse et une mauvaise**. Recharger la page, confirmer que la progression tient.

Enfin : l'agent `verificateur`, puis l'`avocat-du-diable` (chantier structurel).

**Sans navigateur** (session cloud), ne rien inventer : le repli est un test de composant qui rejoue le vrai parcours, et le rendu visuel se classe « non vérifié ».

## Risques

**⚠️ La recherche sur le programme officiel est de seconde main.** Le proxy réseau bloque `education.gouv.fr`, `eduscol` et `legifrance` : l'exploration a reconstitué le programme à partir des **résumés de moteur de recherche**, sans jamais ouvrir le Bulletin officiel. C'est solide sur l'architecture générale, fragile sur les formulations. **Avant de figer le contenu, faire rouvrir le BO du 31 octobre 2024 depuis un réseau qui y accède.**

**Plusieurs pièges collectés sont marqués « non revérifiés »** par l'exploration — notamment les listes de genres et de pluriels irréguliers, et les anecdotes sur Louis XIV. Le `redacteur-contenu` doit les vérifier, pas les recopier.

**Le repli silencieux de `selectGameForNotion`** : un `gameType` épinglé absent des `games` de la notion ne lève aucune erreur, c'est simplement le mauvais jeu qui s'affiche. Lancer `contentIntegrity.test.ts` après chaque modification de `cp-levels.ts`.

**Bijection 40 notions / 40 créneaux** : toute notion retirée d'un niveau devient injouable tant qu'elle n'est pas replacée.

## Hors périmètre, assumé — mais à trancher un jour

**`histoire.ts` est un CM1 déguisé.** Huit de ses dix notions relèvent du cycle 3. Si la promesse est « rejouer le programme du CP », ce domaine ne la tient pas. Deux issues : déplacer ces notions vers CM1-CM2 quand ces niveaux existeront, ou assumer que le domaine s'appelle « culture historique » et non « histoire du CP ». **C'est une décision produit, pas technique.**

**Des piliers du programme du CP sont absents de l'app** : la correspondance graphème-phonème (*la* priorité déclarée du CP), la syllabe, le déterminant (terme que l'adulte n'a jamais appris — il a appris « article »), la relation sujet-verbe, le plan et la vue de dessus, le calendrier et les mois, l'air comme matière, les régimes alimentaires. Matière pour les niveaux 2 à 8.

Également hors périmètre : les 40 QCM (bonne réponse toujours en premier bouton, `QcmGame` ne mélange pas) ; la refonte d'« Association » en tracé au doigt ; la Roue de la vie ; les tableaux des niveaux 2 à 8.
