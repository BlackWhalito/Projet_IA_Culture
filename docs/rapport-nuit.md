# Rapport de nuit — 19 août 2026

Session autonome sur le Jalon 1 de [feuille-de-route.md](feuille-de-route.md), sans supervision. Résumé : **le Jalon 1 est fini en entier**, plus les deux tâches bonus du Jalon 2 (2.4, 2.5). Un blocage d'environnement empêche cependant de pousser le travail sur GitHub — voir la section « Blocage critique » ci-dessous avant toute chose.

## Blocage critique — le travail n'a pas pu être poussé sur GitHub

**Symptôme.** `git push` échoue avec `403` sur chaque tentative (une dizaine cette nuit, à chaque tâche terminée). Diagnostic : aucune credential git n'est configurée dans cet environnement (ni `credential.helper`, ni jeton dans le remote), et l'intégration GitHub de la session (utilisée par les outils `mcp__github__*`) répond elle aussi `403 Resource not accessible by integration` dès qu'on tente une écriture (`push_files`, `create_or_update_file`) — alors que la lecture fonctionne. C'est un problème de permission de l'app GitHub connectée à ce compte, pas quelque chose de corrigible depuis la session.

**Conséquence.** Tout le travail de cette nuit est **commité localement** (13 commits, `git log` propre, tout vérifié) mais reste uniquement dans ce conteneur de session, qui est éphémère. Une notification a été envoyée sur le téléphone du propriétaire dès la détection du blocage, avec la marche à suivre (Paramètres claude.ai → Connectors → GitHub, ou accès en écriture à accorder par un administrateur d'organisation sur `BlackWhalito/Projet_IA_Culture`).

**À faire dès la lecture de ce rapport, avant toute autre chose** : si cette session est encore active, relancer `git push -u origin main` (ou demander à Claude de le refaire) une fois l'accès rétabli. Si la session a expiré, tout ce rapport décrit un travail qui n'existe peut-être plus que dans un conteneur recyclé — vérifier `git log` sur `origin/main` : si le dernier commit visible est `8e48a98 Ajoute la skill orchestration...`, rien de cette nuit n'est arrivé et il faudra relancer le travail (ce rapport reste utile comme plan, le contenu lui-même devra être régénéré ou récupéré si le conteneur est encore accessible).

## Tâches terminées et vérifiées

Chacune : `npm run build` (tsc + vite), `npm run lint` (oxlint), `npm run test` (vitest) passent, commit séparé. Détail du « vérifié comment » dans la section suivante.

- **1.1 — Moteur du Fil des jours.** Types d'incarnation, logique pure testée (`src/engine/fildesjours.ts`), composant `FilDesJoursGame`. *(Écrits cette nuit-là sous les noms `IncarnationContent` et `engine/incarnation.ts`, renommés depuis pour coller au nom de la mécanique.)* Scénario bidon de 3 étapes joué de bout en bout en test, deux embranchements d'épilogue différents.
- **1.2 — Scénario Christophe Colomb.** 7 étapes, faits vérifiés par recherche web (dates, double journal de bord, mutinerie, Rodrigo de Triana). Rédigé par l'agent `redacteur-contenu`, relu intégralement.
- **1.3 — Scénario Louis XIV.** 6 étapes (lever du roi), règle « jamais seul » vérifiée sur les 18 options. Même méthode que 1.2.
- **1.4 — Carte SVG de la France.** Contour + 4 fleuves + 10 villes + 5 pays voisins, chaque zone cliquable et identifiée (clic + clavier).
- **1.5 — Jeu Cap sur.** Brouillard minuté, feedback qui nomme la zone touchée en cas d'erreur, ordre des cibles mélangé à chaque partie.
- **1.6 — Géographie branchée sur la carte.** Paris, la Loire, les pays voisins migrés du QCM vers Cap sur. Continents laissé en l'état (voir décisions ci-dessous). Ajout de tests d'intégrité de contenu (`src/content/contentIntegrity.test.ts`) qui n'existaient pas avant.
- **1.7 — Carte SVG de l'Europe.** Même technique que 1.4, 8 pays + 5 continents. Complète l'item « continents » laissé en suspens par 1.6 en lui donnant un payload `mapclick` (non branché par défaut, voir décisions).
- **2.4 (bonus) — Mot à trous supprimé.** 4 notions migrées vers leur QCM de repli existant, composant et types retirés.
- **2.5 (bonus) — Code mort de Tri supprimé.** `SortGame` et `SortContent` n'étaient déjà plus accessibles depuis aucun contenu ; supprimés proprement.

**Total : 51 tests passent (35 nouveaux depuis le début de la nuit), build et lint propres sur l'état final du dépôt.**

## Ce qui a été vérifié, et comment — honnêteté sur les limites

**Aucun outil de navigateur n'était disponible dans cet environnement** (pas d'outil `Claude_Browser` ni équivalent dans cette session). Rien n'a donc été cliqué dans un vrai navigateur cette nuit — je le dis explicitement pour ne fabriquer aucune vérification.

Ce qui a servi de substitut, systématiquement : des **tests de composants** (`@testing-library/react`) qui rejouent le vrai parcours utilisateur — clics (`fireEvent`), clavier, minuteurs factices (`vi.useFakeTimers` + `act()`) — jusqu'au bout, avec une bonne réponse **et** une mauvaise à chaque fois que la mécanique le permettait. C'est plus fort qu'un test de logique isolée (voir `FilDesJoursGame.test.tsx`, `FranceMap.test.tsx`, `CapSurGame.test.tsx`, `EuropeMap.test.tsx`), et ça a réellement attrapé un bug (`window.matchMedia` absent de jsdom). Mais ce n'est **pas équivalent** à un humain qui clique : la mise en page réelle, le rendu aquarelle (courbes, filtres SVG, couches), la taille tactile réelle sur un écran, et la sensation générale des nouvelles mécaniques **n'ont pas été vus**.

**À tester visuellement demain matin, en priorité :**
1. Le Fil des jours (Colomb et Louis XIV) : lisibilité des jauges, rythme des étapes, est-ce que ça se sent vraiment « incarné » et pas comme un QCM déguisé.
2. Les cartes de France et d'Europe : le contour est-il reconnaissable, les zones sont-elles repérables et pas trop serrées (Suisse/Allemagne/Europe sont proches sur la carte d'Europe), la taille tactile est-elle vraiment confortable au doigt sur mobile.
3. Cap sur : le brouillard est-il perceptible et pas juste décoratif, le tempo de 6 secondes est-il le bon (jamais testé en conditions réelles).
4. Toute la palette de couleurs et respect de la charte aquarelle (je m'y suis tenu au mieux à la lecture de la skill, mais rien n'a été vu rendu).

## Décisions produit prises cette nuit — à valider

Aucune ne bloquait le travail, toutes sont réversibles et documentées dans le code au moment où elles ont été prises :

1. **Le Fil des jours ne connaît pas l'échec.** `onComplete` renvoie toujours `correct: true`, quel que soit l'état final des jauges — cohérent avec la doctrine « aucune bonne réponse » de `plan-jeux.md`, mais ça veut dire que jouer Colomb ou Louis XIV fait toujours progresser la maîtrise de la notion, même si le joueur a fait des choix qui mènent à l'épilogue le plus amer. Semblait le choix le plus prudent (pas de sanction sur une mécanique narrative), mais mérite un avis produit.
2. **La carte de France n'affiche que 5 pays voisins sur les 8 réels** (Espagne, Belgique, Allemagne, Suisse, Italie — Monaco, l'Andorre et le Luxembourg sont omis, trop petits pour rester des zones distinctes lisibles à l'échelle CP). Le funFact existant continue de mentionner les 8 pays comme fait ; seule la carte simplifie.
3. **La notion « continents » n'a pas basculé vers Cap sur**, contrairement à ce que suggérait l'intitulé de la tâche 1.6. Elle garde son mécanisme `match` actuel : cliquer un point unique représente mal une aire aussi vaste qu'un continent, alors que `match` fait déjà correctement associer un continent à des pays. Le payload `mapclick` existe côté contenu (carte d'Europe, 5 continents) si le propriétaire préfère basculer malgré tout — un seul mot à changer dans `cp-levels.ts`.
4. **Seuil de réussite de Cap sur** : une manche est « correcte » (fait progresser la maîtrise) à partir de la majorité des cibles trouvées, pas 100 %. Choix pragmatique, jamais testé en jeu réel.
5. **Le QCM de repli de deux notions migrées hors de Mot à trous** (`cp-geographie-oceans-mers`, `cp-geographie-ile`) reste, comme l'ancien fillblank, très proche du résumé recopié — un problème de **contenu**, pas de mécanique. Volontairement non retouché cette nuit : relève du Jalon 4 (« Rétrograder le QCM » / « Relire tout le contenu CP »), hors périmètre.

## Frictions rencontrées, et où elles ont été rangées

- **`window.matchMedia` absent de jsdom** → polyfill dans `src/test/setup.ts`, documenté dans `pieges-du-projet`.
- **Switch exhaustif sur une union discriminée + `default` qui référence encore la valeur narrowée à `never`** → cassait `tsc` sur du code qui n'avait pourtant pas changé (`GameRouter.tsx`). Documenté dans `pieges-du-projet`.
- **Timer factice (`vi.useFakeTimers`) sans `act()`** → faux négatif de test. Documenté dans `pieges-du-projet`.
- **`WebFetch` bloqué par le proxy réseau** vers Wikipédia et un blog spécialisé, pendant la recherche factuelle sur Louis XIV (agent `redacteur-contenu`). Contournement : recoupement de plusieurs résultats `WebSearch` indépendants au lieu d'une lecture de source primaire complète. Pas documenté en skill (c'est une contrainte d'infrastructure de session, pas un piège du projet) — signalé ici pour information.
- **Accès en écriture GitHub totalement absent** (git CLI et intégration API) — voir la section « Blocage critique ». Pas documenté en skill non plus, même raison.

## Amélioration apportée à la skill `apex`

**Avant.** La phase eXaminer (`references/4-examiner.md`) ne mentionnait que la vérification dans le navigateur, sans aucun repli si l'outil n'est pas disponible.

**Après.** Ajout d'une sous-section « Si le navigateur n'est pas disponible » : substituer un test de composant qui rejoue le vrai parcours (clics, clavier, timers) plutôt qu'un test de logique isolée, et le dire explicitement dans le rapport final plutôt que de fabriquer un « testé dans le navigateur ».

**Gain observé.** C'est très exactement ce qui s'est produit cette nuit sur 4 composants (`FilDesJoursGame`, `FranceMap`, `CapSurGame`, `EuropeMap`) : sans cette méthode, j'aurais soit menti sur une vérification navigateur jamais faite, soit dû me contenter de `tsc`/lint qui n'auraient jamais vu qu'un jeu est injouable — et n'auraient pas attrapé le bug `matchMedia`. Un seul commit séparé (`f01e547`), fichier resté à 51 lignes (largement sous le seuil de 150).

Aucune autre modification d'apex cette nuit : le déroulé Analyser → Planifier → Exécuter → eXaminer a fonctionné sans autre friction réelle sur les 9 tâches. Je n'ai pas cherché à en inventer pour respecter le quota — la consigne du propriétaire était explicite là-dessus.

## Tâches non commencées

Tout le reste de la feuille de route (Jalon 2 restant : 2.1, 2.2, 2.3 ; Jalons 3, 4, 5) — hors périmètre de cette nuit, non touché, comme demandé.

## État final du dépôt

`npm run build`, `npm run lint`, `npm run test` passent tous sur le dernier commit local (`115254d`). 13 commits cette nuit, aucun poussé sur `origin/main` — voir « Blocage critique ».
