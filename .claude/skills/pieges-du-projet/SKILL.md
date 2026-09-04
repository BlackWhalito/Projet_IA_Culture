---
name: pieges-du-projet
description: Les pièges déjà rencontrés sur ce projet et leur contournement — règles oxlint qui bloquent sans raison apparente, faux bugs du navigateur, environnement Windows. À lire dès qu'un lint, un build ou une erreur console résiste plus de deux minutes, avant de partir en débogage.
---

Pièges réellement rencontrés sur ce projet, avec le contournement qui marche. À enrichir dès qu'un nouveau piège coûte du temps.

## oxlint `react(purity)` — le plus coûteux

**Symptôme.** oxlint refuse un `Date.now()` ou un `Math.random()` alors qu'il est dans un gestionnaire d'événement, jamais exécuté pendant le rendu. On croit à un faux positif, on perd du temps à discuter avec la règle.

**Cause.** La règle repère l'appel impur **textuellement** dans le corps de la fonction du composant. Elle ne raisonne pas sur le moment de l'exécution. Être dans un `onClick` ne sauve pas.

**Contournement.** Sortir l'appel impur dans une fonction au niveau module, hors de tout composant. C'est pour ça que ces deux fichiers existent — ce ne sont pas des helpers décoratifs :

- `src/engine/timing.ts` → `elapsedSince(startMs)` enveloppe `Date.now()`
- `src/engine/shuffle.ts` → `shuffle(array)` enveloppe `Math.random()`

Tout nouveau jeu qui chronomètre ou mélange **doit** passer par ces helpers. Ne réintroduis jamais l'appel directement dans un composant.

Cas voisin : `useRef(Date.now())` est un vrai appel impur au rendu, celui-là est légitimement signalé. Le corriger avec un `useEffect` qui pose la ref après le montage.

## Un updater de state qui en appelle un autre, sous StrictMode

**Symptôme.** Une mécanique à compteurs/paliers (ex. La Rivière) se comporte deux fois plus vite ou plus lentement que prévu en dev, ou saute/répète des éléments d'une file — alors que la logique semble correcte à la lecture.

**Cause.** `main.tsx` monte l'app en `StrictMode`, qui **invoque deux fois** chaque fonction d'updater passée à un setter (`setX((prev) => ...)`) en développement, pour détecter les impuretés. Si cet updater a un effet de bord (incrémenter un `ref` compteur, mélanger un tableau, appeler un autre `setState`), l'effet se produit deux fois pour un seul événement utilisateur.

**Contournement.** Un updater de state ne doit jamais appeler un autre setter, et tout effet de bord qu'il déclenche (mélange, compteur) doit être conçu pour tolérer un double appel sans casser — ou mieux, être dérivé du state existant au lieu d'être stocké séparément (voir `RiviereGame.tsx` : la vitesse de chute est calculée à chaque rendu à partir de `correctCount`, elle n'est pas gardée dans son propre `useState`).

## oxlint `react(only-export-components)`

**Symptôme.** Avertissement sur un fichier qui exporte un composant *et* autre chose (un objet de config, une constante).

**Cause.** La règle protège le Fast Refresh de Vite.

**Contournement.** Un fichier = soit des composants, soit autre chose. C'est pourquoi `RouteError` vit dans `src/screens/RouteError.tsx` et pas dans `src/router.tsx`, qui exporte l'objet `router`.

## Fausses erreurs console dans le navigateur

**Symptôme.** Une erreur alarmante — typiquement `Invalid hook call` ou `Cannot read properties of null (reading 'useCallback')` — apparaît dans la console, survit à un redémarrage du serveur de dev, et ne correspond à aucun comportement cassé.

**Cause.** C'est un reliquat historique dans le tampon de la console de cet onglet, laissé par un rechargement HMR pendant une session d'édition intensive.

**Contournement.** Fermer l'onglet (`tabs_close`), en ouvrir un neuf (`preview_start` avec une `url` explicite), refaire le parcours. Si l'erreur ne revient pas, il n'y avait pas de bug. **Ne jamais déboguer une erreur console sans l'avoir d'abord reproduite dans un onglet neuf.**

## Serveur de dev en double

**Symptôme.** L'app tourne sur 5175 au lieu de 5173, on ne sait plus quelle instance on regarde.

**Cause.** Avoir lancé `npm run dev` alors qu'un serveur tournait déjà via le panneau navigateur.

**Contournement.** Toujours `preview_list` avant de démarrer quoi que ce soit. **Quand le panneau navigateur existe**, ne jamais lancer un serveur de dev via Bash ou PowerShell — uniquement `preview_start`.

La restriction s'arrête là : sur une session distante Linux, il n'y a pas de panneau, donc `npm run dev` en tâche de fond est la seule voie, et c'est celle qu'attend la section « Regarder un rendu ». Vérifie d'abord qu'aucun serveur ne tourne déjà (`lsof -i :5173`, ou une requête sur le port).

## Agents et skills créés en cours de session

**Ce piège n'en est plus tout à fait un — vérifier avant de contourner.**

Il était vrai que le registre était chargé une fois pour toutes au démarrage, et qu'un `.claude/agents/mon-agent.md` écrit après coup donnait `Agent type 'mon-agent' not found`. **Constaté le 21 août 2026 : ce n'est plus le cas pour les agents.** L'agent `avocat-du-diable`, créé en cours de session, a été annoncé comme disponible et invoqué par son nom dans la même session, sans redémarrage.

**Le réflexe correct est donc inversé** : tente d'abord l'invocation par le nom. Ce n'est qu'en cas d'échec que le contournement s'applique — lancer `general-purpose` en recopiant le contenu du fichier d'agent dans le prompt.

Non vérifié à cette date : le cas d'une **skill** fraîchement écrite. Jusqu'à preuve du contraire, en appliquer le contenu à la main plutôt que de compter sur son invocation.

## Piloter le navigateur : les cinq pièges

**Les `ref_N` deviennent obsolètes dès que le DOM change.** Après un clic qui fait avancer le jeu, les références lues précédemment pointent dans le vide (`ref is stale`). Refais un `read_page` après chaque changement d'écran plutôt que de réutiliser une liste de refs.

**`tabId` change après certaines navigations.** Un `navigate` peut répondre « denied or failed » simplement parce que l'onglet visé n'existe plus. Réflexe : `tabs_context` pour relire les identifiants réels, puis recommencer.

**`javascript_tool` expire au bout de 30 s.** Une boucle longue qui enchaîne des clics avec des attentes dépasse facilement ce plafond et ne rend rien. Découpe en scripts courts (moins de 10 actions), ou clique via l'outil `computer`.

Note utile : `element.click()` en JS fonctionne bien sur React (délégation d'événements native), c'est le moyen le plus rapide de traverser plusieurs écrans — tant que le script reste court.

**Un clic réel via `computer` peut silencieusement ne rien déclencher**, sans erreur, sans lien mort, avec une cible confirmée correcte par `elementFromPoint`. Constaté sur des cartes de `MatchGame` : le même bouton, au même endroit, marchait une fois sur deux. Avant de conclure à un bug applicatif, revérifie l'état après coup (`get_page_text` ou une lecture de classe séparée) — si rien n'a bougé, retente une fois. Si ça persiste, un `element.click()` en JS confirme si le gestionnaire lui-même fonctionne.

**Deux clics qui dépendent l'un de l'autre, tirés dans le même script, peuvent se rater.** `setState` est asynchrone : le second `handlePick` peut encore lire l'état d'avant le premier si rien ne force React à re-rendre entre les deux. Toujours séparer par un appel d'outil distinct (ou une lecture d'état) quand un clic dépend du résultat du précédent — jamais deux `.click()` liés dans le même `javascript_exec`.

## `pkill -f` tue le shell qui le lance

**Symptôme.** Une commande qui commence par `pkill -f "mon-script.mjs"` s'arrête net avec le code 144, et rien de ce qui suivait ne s'exécute — y compris l'écriture du fichier qu'on voulait ensuite relancer.

**Cause.** `-f` compare le motif à la **ligne de commande entière** de chaque processus. La commande shell en cours contient le motif, puisqu'elle l'écrit ; `pkill` se tue donc lui-même, et emporte tout le reste de la ligne. Rencontré deux fois dans la même session.

**Contournement.** Ne pas tuer : **changer de port**. Un `sed 's/5199/5201/'` sur le script de serveur coûte une seconde et ne risque rien. Si un arrêt est vraiment nécessaire, viser le PID (`lsof -t -i :5199 | xargs -r kill`) plutôt qu'un motif de ligne de commande.

## Vérifier l'audio sans se mentir

**Symptôme.** On lance Chromium avec `--autoplay-policy=no-user-gesture-required` pour tester du son, tout marche, et on annonce que ça marche. Mais l'utilisateur, lui, n'a pas ce drapeau.

**La règle.** Ce drapeau sert à **isoler** une question (« les bonnes notes partent-elles ? ») en supprimant la politique d'autoplay. Il ne prouve pas que le son démarre chez le joueur. Toute annonce du type « la musique se lance » demande une seconde vérification **sans le drapeau**, avec de vrais clics : on compte les oscillateurs créés et on lit `new AudioContext().state`, qui doit valoir `running`.

Dans cette app, le déblocage vient tout seul : on ne peut pas atteindre un niveau sans avoir cliqué deux liens. Mais c'est une propriété du parcours, pas une garantie — elle se vérifie, elle ne se suppose pas.

## Une forme dessinée à la main qui reste fausse — et le filtre accusé à tort

**Symptôme.** Une forme SVG écrite à la main (une carte, une silhouette) ne ressemble pas à ce qu'elle devrait, on corrige les coordonnées, on recapture — et elle reste fausse. Comme le projet couvre tout de filtres aquarelle, on finit par soupçonner le filtre.

**Ce qui a coûté trois itérations sur la carte de France.** Redessiner à l'estime donne des proportions fausses : on ne juge pas de mémoire la largeur de la Normandie. Poser ensuite les bons sommets, tirés de vraies coordonnées, ne suffit pas non plus — les **points de contrôle des courbes de Bézier entre les sommets** sont choisis à l'aveugle, et ce sont eux qui déforment. À ce stade on a accusé `aq-bord-1` de manger les presqu'îles, ce qui était plausible (il déplace de ±15 unités, la Bretagne en fait 36). C'était faux.

**Les deux règles.**

1. **Rendre la forme nue avant de soupçonner quoi que ce soit.** Un fichier HTML de dix lignes, le chemin sans aucun filtre à côté du chemin filtré, une capture, et le doute est tranché en une minute. Sans ça on débogue le mauvais étage. C'est l'application directe de la règle « instrumenter avant de conclure » plus bas.
2. **Ne pas écrire de points de contrôle à la main.** Poser une liste de points réels et les relier par une spline (Catmull-Rom convertie en Béziers, une quinzaine de lignes) donne une forme juste par construction. Voir `src/content/maps/france.ts` : 72 points en longitude/latitude et une tension de 0,85. Corriger la carte, c'est corriger un point — jamais une courbe.

**Le corollaire pour les projections.** Une projection linéaire lon/lat a besoin de **deux facteurs différents** : aux latitudes françaises un degré de longitude vaut environ 77 km contre 111 pour un degré de latitude. Un facteur unique donne une France étirée en largeur.

## Un identifiant inconnu qui se lit comme zéro

**Symptôme.** Une condition de contenu se déclenche sur *toutes* les parties au lieu de quelques-unes, sans erreur ni avertissement.

**Cause.** `resoudreEpilogue` (et tout code du même genre) lit `jauges[id] ?? 0`. Une condition qui vise une jauge **qui n'existe pas** est donc toujours satisfaite. Écrire `distance` au lieu de `milles` a rendu perdantes les 2187 parties de Christophe Colomb d'un coup.

**Contournement.** C'est la même famille que le repli silencieux de `selectGameForNotion` : la seule défense est un test d'intégrité du contenu. `contentIntegrity.test.ts` vérifie maintenant que toute jauge citée dans un épilogue ou dans les effets d'une option existe bien, et que le taux de défaite d'un scénario reste entre 2 et 40 %. **Quand tu ajoutes un garde-fou de ce type, réintroduis le bug une fois pour vérifier qu'il l'attrape** — un test qui ne peut pas échouer ne vaut rien.

## `min-height` l'emporte sur `max-height`

**Symptôme.** Une zone de jeu plafonnée par `max-height` s'étire quand même, ou pousse les commandes hors de l'écran sur téléphone.

**Cause.** En CSS, `min-height` gagne toujours contre `max-height`. `min-height: 55vh; max-height: 420px` vaut donc 55vh sur un grand écran, et le plafond ne sert à rien.

**Contournement.** Un seul `height: clamp(...)`. Et **mesurer sur un viewport court** (390 × 664 est un téléphone courant, barres du navigateur comprises), pas seulement sur le format de référence : les rives de La Rivière tombaient toutes sous la ligne de flottaison, et le format 420 × 860 ne le montrait pas.

## Regarder un rendu — la voie directe

**À essayer en premier, avant le contournement de la section suivante.**

Les sessions distantes Linux n'ont pas de panneau navigateur, ce qui a longtemps fait croire qu'elles n'avaient pas de navigateur du tout. Faux : **Chromium et Playwright y sont installés**, et on peut donc capturer un rendu en trois lignes, sans passer par le compositeur ni par un aller-retour base64.

- Binaire : `/opt/pw-browsers/chromium-<version>/chrome-linux/chrome`. Le chemin porte le numéro de build — le résoudre avec `find /opt/pw-browsers -maxdepth 3 -name chrome`, ne jamais l'écrire en dur.
- Playwright est global : importer depuis `/opt/node22/lib/node_modules/playwright/index.mjs`.

Un script d'une vingtaine de lignes suffit : `chromium.launch({ executablePath })`, `newPage({ viewport })`, `goto`, `screenshot({ path })`. Écouter aussi `pageerror` et `console` — c'est ce qui distingue « ma page est moche » de « ma page est cassée ». Puis lire le PNG avec l'outil `Read`, qui affiche réellement les images.

**Deux pièges rencontrés le 28 août 2026.**

Pour l'app elle-même, lancer `npm run dev` en tâche de fond et viser `http://127.0.0.1:5173`. Pour un fichier HTML isolé, servir le dossier par un petit serveur local plutôt que d'ouvrir en `file://` : les ressources relatives et la CSP se comportent autrement.

**Traverser plusieurs jeux d'un niveau : ne jamais conclure « bloqué » au
premier échec de clic.** Les mécaniques à verdict (Entre deux, Je te crois pas)
éteignent toutes leurs cibles pendant l'animation de correction, une seconde
environ. Un parcours automatique qui cherche « le dernier bouton actif » tombe
alors sur zéro candidat et s'arrête — deux fois de suite dans la même session,
avant qu'un simple `for (essai < 6) { attendre 700 ms ; réessayer }` ne
débloque tout. Prévois cette reprise dès le premier script de parcours.

Un fichier pensé pour un runtime absent ne s'ouvre pas nu. Une planche de maquette Claude Design (`.dc.html`) référence `./support.js`, injecté seulement par l'éditeur : ouverte seule, elle échoue sur `DCLogic is not defined` et ne rend rien. Poser à côté un bouchon de trois lignes — `window.DCLogic = class {}`, plus une règle `x-dc { display: block }` — rend la planche en taille réelle, ce que le canevas ne permet pas (il la réduit à environ un tiers, illisible pour juger un dessin).

## Voir réellement ce qu'on dessine, quand la capture d'écran refuse

**Repli, quand seul le panneau navigateur existe** (session Windows locale) et qu'il refuse de composer. Sur une session Linux, prendre la voie directe ci-dessus.

**Symptôme.** `computer{action:"screenshot"}` échoue en boucle avec « the Browser pane is not displayed, so the page is not compositing frames », quel que soit l'onglet, le `tabs_select` ou le redimensionnement. Conséquence grave sur un travail visuel : on code des formes à l'aveugle, on livre, l'utilisateur renvoie « c'est moche », et on recommence sans jamais avoir vu.

**Contournement.** Ne pas passer par le compositeur : rendre le SVG dans un `<canvas>` depuis la page elle-même, puis lire l'image.

1. Pour un SVG : récupérer le `innerHTML` du `<svg>` des filtres (`svg[width="0"]`) **et** celui de la forme à voir — sans les filtres, le rendu autonome sort des aplats plats. Pour un `<canvas>` déjà peint (moteur aquarelle génératif, voir `src/components/watercolor/`), pas besoin de ce détour : `drawImage` le canvas source directement.
2. Remplacer chaque `var(--x)` par sa valeur résolue via `getComputedStyle(document.documentElement)` — une image autonome n'a pas accès aux variables CSS du document. Toujours peindre sur un fond `--papier` explicite avant de dessiner par-dessus : exporter en JPEG sur un canvas resté transparent noircit tout le vide, ce qui ressemble à s'y méprendre à un vrai bug de rendu.
3. Composer dans un `<canvas>` (taille de sortie modeste, on regarde une composition, pas un pixel) via `drawImage`/`fillText`, en reprenant si besoin les vraies dimensions avec `getBoundingClientRect()` plutôt que des tailles inventées.
4. **Ne pas faire transiter le base64 par le contexte de conversation** — un aller-retour tourne vite à 30-40 ko juste pour une vignette, et une session d'itération en enchaîne des dizaines. Démarrer un petit serveur HTTP local (`node`, une douzaine de lignes) qui écoute sur un port du scratchpad et écrit le `POST` reçu dans un fichier ; la page fait `fetch('http://localhost:PORT/', { method: 'POST', body: canvas.toDataURL(...) })`. Puis lire ce fichier avec l'outil `Read`, qui affiche réellement les images — c'est la seule étape qui consomme du contexte, une seule fois, à la toute fin.
5. Le serveur de capture ne survit pas à un redémarrage de session (processus arrière-plan perdu) : le relancer avant la première capture d'une nouvelle session, avec le dev server, plutôt que de découvrir la connexion refusée au milieu d'un test.

Sans ce contournement, on code des formes à l'aveugle, on livre, l'utilisateur renvoie « c'est moche », et on recommence sans jamais avoir vu ce qu'il a vu.

## Deux boutons à la même place de part et d'autre d'un changement de phase

**Symptôme.** Un double tap — ou simplement un joueur impatient — saute une
phase entière du jeu, sans erreur ni trace. Trouvé sur « Douze pieds » : le
second tap sur « Écrire » atterrissait sur « Vers suivant », qui venait
d'apparaître exactement au même endroit, et le joueur passait au quatrain
suivant sans jamais voir le vers de Hugo — la seule récompense de la manche.

**Cause.** Une mécanique à phases (`ecriture` → `revelation` → suivant) rend
souvent un bouton unique en bas de carte, avec le même style et donc la même
position. Le changement de phase est synchrone : le nouveau bouton est sous le
doigt avant la fin du double clic.

**Contournement.** Le bouton qui ouvre la phase suivante reste `disabled`
pendant 600 à 700 ms après l'arrivée dans la phase. C'est aussi un gain de
lecture : une révélation qu'on peut fermer instantanément ne se lit pas.

**Portée.** Ce n'est pas une bizarrerie de ce jeu-là : toute mécanique à phases
du projet est concernée. À vérifier sur chaque nouvelle mécanique, en jouant le
double clic dans le navigateur — un test unitaire seul ne le trouve pas, parce
qu'on n'écrit pas spontanément deux clics d'affilée sur deux boutons différents.

## `window.matchMedia` absent en test

**Symptôme.** Un composant qui lit `prefers-reduced-motion` au montage (`window.matchMedia(...)` dans un `useState(() => ...)`, voir la skill `aquarelle`) fait planter tout test qui le rend : `TypeError: window.matchMedia is not a function`.

**Cause.** jsdom (l'environnement de test de vitest) n'implémente pas `matchMedia`.

**Contournement.** Un polyfill minimal est posé une fois pour toutes dans `src/test/setup.ts` — rien à faire dans les composants ni dans chaque fichier de test. Si un test touche encore cette erreur, c'est que `src/test/setup.ts` n'a pas été rechargé ou a été modifié par erreur.

## Switch exhaustif sur une union discriminée + `default` qui référence la valeur

**Symptôme.** `tsc` échoue avec `Property 'x' does not exist on type 'never'` sur un `default:` qui lisait une propriété de la variable discriminante (ex. `` `pas implémenté : ${selected.gameType}` ``), après avoir ajouté le dernier `case` manquant.

**Cause.** Une fois tous les cas couverts, TypeScript réduit le type restant à `never` dans le `default` — un `default` qui accède encore à une propriété de cette valeur ne compile plus, alors que le code semblait n'avoir rien à voir avec le changement.

**Contournement.** Un `switch` sur une union discriminée dont tous les cas retournent n'a pas besoin de `default` : supprime-le plutôt que de le corriger. C'est aussi plus sûr — un futur cas non traité redevient une vraie erreur de compilation (`selected` ne serait plus jamais `never`), au lieu d'un throw silencieux à l'exécution. Voir `GameRouter.tsx`.

## Timer factice (`vi.useFakeTimers`) + assertion sur un `setState` déclenché par le timer

**Symptôme.** Un test qui avance des timers factices (`vi.advanceTimersByTime(...)`) puis vérifie un texte apparu suite à un `setTimeout` interne au composant échoue avec « élément introuvable », alors que le même composant fonctionne bien manuellement.

**Cause.** Le `setState` déclenché à l'intérieur du timer s'exécute hors du rendu React suivi par Testing Library : le DOM n'est pas re-synchronisé avant l'assertion.

**Contournement.** Envelopper l'avancée du temps dans `act()` : `act(() => { vi.advanceTimersByTime(6000) })`, import depuis `@testing-library/react`.

## Un correctif qui "ne marche pas" alors que le jeu de test est faux

Rencontré en vérifiant un garde-fou sur la progression : l'écran refusait
obstinément d'afficher la progression injectée dans `localStorage`, et le
correctif semblait donc inopérant. Il l'était en réalité depuis le début — le
jeu de test utilisait des identifiants de niveaux **inventés** (`cp-01`) au lieu
des vrais (`cp-level-1`). L'app lisait fidèlement une progression qui ne
correspondait à aucun niveau existant.

**La règle** : quand un correctif paraît sans effet, soupçonne le jeu de test
avant de soupçonner le code. Un `grep` sur les identifiants réels coûte dix
secondes ; défaire un correctif juste coûte bien plus.

Et n'en conclus rien avant d'avoir instrumenté : un `console.log` temporaire à
l'entrée **et** à la sortie de la fonction suspecte tranche en un rechargement
si elle reçoit les bonnes données, et si elle rend ce qu'on croit. Retire-le
ensuite, et vérifie par `grep` qu'il ne reste rien.

> **Piège dans le piège**, rencontré en écrivant cette entrée même : les
> backticks de ce texte, passés au shell dans une chaîne, ont été interprétés
> comme des substitutions de commande et **tous les termes entre backticks ont
> disparu du fichier**, silencieusement. Pour écrire du Markdown contenant du
> code, passe par l'outil d'édition, jamais par un script shell. Le même piège
> est décrit côté `grep` dans la skill `audit-des-skills`.

## Environnement Windows

- Le shell principal est **PowerShell**, pas bash. `&&` n'existe pas en PowerShell 5.1 : utiliser `;` ou `if ($?) { }`.
- `npm create vite@latest .` échoue si le dossier n'est pas vide (le prompt interactif d'écrasement ne peut pas recevoir de réponse). Contournement : générer dans un sous-dossier temporaire puis remonter les fichiers.
