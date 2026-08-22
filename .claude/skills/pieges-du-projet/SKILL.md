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

**Contournement.** Toujours `preview_list` avant de démarrer quoi que ce soit. Ne jamais lancer un serveur de dev via Bash ou PowerShell — uniquement `preview_start`.

## Agents et skills créés en cours de session

**Ce piège n'en est plus tout à fait un — vérifier avant de contourner.**

Il était vrai que le registre était chargé une fois pour toutes au démarrage, et qu'un `.claude/agents/mon-agent.md` écrit après coup donnait `Agent type 'mon-agent' not found`. **Constaté le 21 août 2026 : ce n'est plus le cas pour les agents.** L'agent `avocat-du-diable`, créé en cours de session, a été annoncé comme disponible et invoqué par son nom dans la même session, sans redémarrage.

**Le réflexe correct est donc inversé** : tente d'abord l'invocation par le nom. Ce n'est qu'en cas d'échec que le contournement s'applique — lancer `general-purpose` en recopiant le contenu du fichier d'agent dans le prompt.

Non vérifié à cette date : le cas d'une **skill** fraîchement écrite. Jusqu'à preuve du contraire, en appliquer le contenu à la main plutôt que de compter sur son invocation.

## Piloter le navigateur : les six pièges

**Les `ref_N` deviennent obsolètes dès que le DOM change.** Après un clic qui fait avancer le jeu, les références lues précédemment pointent dans le vide (`ref is stale`). Refais un `read_page` après chaque changement d'écran plutôt que de réutiliser une liste de refs.

**`tabId` change après certaines navigations.** Un `navigate` peut répondre « denied or failed » simplement parce que l'onglet visé n'existe plus. Réflexe : `tabs_context` pour relire les identifiants réels, puis recommencer.

**`javascript_tool` expire au bout de 30 s.** Une boucle longue qui enchaîne des clics avec des attentes dépasse facilement ce plafond et ne rend rien. Découpe en scripts courts (moins de 10 actions), ou clique via l'outil `computer`.

Note utile : `element.click()` en JS fonctionne bien sur React (délégation d'événements native), c'est le moyen le plus rapide de traverser plusieurs écrans — tant que le script reste court.

**Un clic réel via `computer` peut silencieusement ne rien déclencher**, sans erreur, sans lien mort, avec une cible confirmée correcte par `elementFromPoint`. Constaté sur des cartes de `MatchGame` : le même bouton, au même endroit, marchait une fois sur deux. Avant de conclure à un bug applicatif, revérifie l'état après coup (`get_page_text` ou une lecture de classe séparée) — si rien n'a bougé, retente une fois. Si ça persiste, un `element.click()` en JS confirme si le gestionnaire lui-même fonctionne.

**Deux clics qui dépendent l'un de l'autre, tirés dans le même script, peuvent se rater.** `setState` est asynchrone : le second `handlePick` peut encore lire l'état d'avant le premier si rien ne force React à re-rendre entre les deux. Toujours séparer par un appel d'outil distinct (ou une lecture d'état) quand un clic dépend du résultat du précédent — jamais deux `.click()` liés dans le même `javascript_exec`. Constaté à nouveau le 22 août 2026 avec un script Playwright autonome (voir plus bas) sur `RiviereGame` : un clic sur le mot puis sur le panier, sans attendre entre les deux que l'état ait réellement changé, rate silencieusement une capture sur plusieurs — même symptôme, outil différent. Le contournement qui marche : après le second clic, `page.waitForFunction` sur le changement du compteur affiché, avant de lire le mot suivant.

**Un élément qui anime en continu (la Rivière) fait planter l'attente de stabilité par défaut d'un clic automatisé, avec un symptôme trompeur.** `RiviereGame` fait tomber le mot en jeu via une animation CSS continue tant qu'il n'est pas attrapé. Un `.click()` Playwright standard attend que sa cible cesse de bouger avant de cliquer (« actionability : stable ») — un mot qui ne s'arrête jamais viole cette attente, le clic se bloque en interne, et pendant ce temps le vrai minuteur de chute (indépendant du clic) peut expirer plusieurs fois de suite en arrière-plan. Symptôme observé : un unique clic sur le mot semblait faire sauter toute la manche directement à la mécanique suivante — en réalité, trois mots avaient expiré tout seuls (`RATES_MAX`) pendant que Playwright attendait patiemment un mot immobile. **Contournement** : cliquer avec `{ force: true }` (`element.click({force:true})` ou l'équivalent Playwright), qui saute cette attente de stabilité et clique là où l'élément se trouve réellement à l'instant présent — exactement ce qu'on veut sur une cible mouvante. Le même raisonnement vaut pour toute mécanique à chrono (`CapSurGame`, son brouillard qui se referme).

## Voir réellement ce qu'on dessine

**Ne jamais conclure « pas de navigateur dans cette session » sans avoir cherché.** Constaté le 22 août 2026 : une session cloud sans les outils `computer`/`preview_start`/`javascript_tool` (donc sans le panneau navigateur intégré) peut malgré tout avoir un vrai Chromium préinstallé, pilotable via le CLI Playwright en `Bash` — personne ne l'avait vérifié avant de déclarer la vérification visuelle bloquée. Vérifie d'abord :

```bash
ls /opt/pw-browsers/chromium 2>/dev/null && /opt/node22/bin/playwright --version
```

Si ça répond, tu as un vrai navigateur. Méthode, la plus simple d'abord :

**1. Le CLI Playwright — méthode par défaut, à essayer en premier.**

```bash
npm run dev &                       # démarrer le serveur (une seule fois)
/opt/node22/bin/playwright screenshot \
  --browser chromium --viewport-size "390,844" \
  --wait-for-timeout 1200 \
  http://localhost:5173/chemin-a-voir \
  /tmp/.../scratchpad/capture.png
```

Puis lire `capture.png` avec l'outil `Read`, qui affiche réellement l'image. `--viewport-size` doit reprendre la taille d'affichage réelle qu'on veut juger (mobile compris) — pas une résolution interne inventée, c'est le piège n° 12 ci-dessous. `--wait-for-timeout` laisse le temps au canvas aquarelle de peindre avant la capture. Le module npm `playwright`/`playwright-core` n'a pas besoin d'être une dépendance du projet : le CLI global suffit.

Ce chemin remplace entièrement le contournement historique ci-dessous pour toute session qui a ce Chromium : plus besoin de rendre le SVG dans un canvas caché ni de servir le base64 par un serveur local, on capture la vraie page.

**2. Si aucun Chromium n'est trouvable** (ni panneau navigateur, ni `/opt/pw-browsers`) — le contournement historique, pour un `<canvas>` ou un SVG rendus manuellement dans la page :

- Pour un SVG : récupérer le `innerHTML` du `<svg>` des filtres (`svg[width="0"]`) **et** celui de la forme à voir — sans les filtres, le rendu autonome sort des aplats plats. Pour un `<canvas>` déjà peint (moteur aquarelle génératif, voir `src/components/watercolor/`), pas besoin de ce détour : `drawImage` le canvas source directement.
- Remplacer chaque `var(--x)` par sa valeur résolue via `getComputedStyle(document.documentElement)` — une image autonome n'a pas accès aux variables CSS du document. Toujours peindre sur un fond `--papier` explicite avant de dessiner par-dessus : exporter en JPEG sur un canvas resté transparent noircit tout le vide, ce qui ressemble à s'y méprendre à un vrai bug de rendu.
- Composer dans un `<canvas>` (taille de sortie modeste, on regarde une composition, pas un pixel) via `drawImage`/`fillText`, en reprenant si besoin les vraies dimensions avec `getBoundingClientRect()` plutôt que des tailles inventées.
- **Ne pas faire transiter le base64 par le contexte de conversation** — un aller-retour tourne vite à 30-40 ko juste pour une vignette, et une session d'itération en enchaîne des dizaines. Démarrer un petit serveur HTTP local (`node`, une douzaine de lignes) qui écoute sur un port du scratchpad et écrit le `POST` reçu dans un fichier ; la page fait `fetch('http://localhost:PORT/', { method: 'POST', body: canvas.toDataURL(...) })`. Puis lire ce fichier avec l'outil `Read`.
- Le serveur de capture ne survit pas à un redémarrage de session (processus arrière-plan perdu) : le relancer avant la première capture d'une nouvelle session, avec le dev server.

**3. Ancien symptôme, spécifique au panneau navigateur intégré** (`computer{action:"screenshot"}` échoue en boucle avec « the Browser pane is not displayed »), quand ce panneau existe mais que sa capture plante : même contournement n° 2, ou basculer sur le CLI Playwright du n° 1 s'il est disponible — c'est presque toujours plus simple.

Sans une vérification visuelle réelle, on code des formes à l'aveugle, on livre, l'utilisateur renvoie « c'est moche », et on recommence sans jamais avoir vu ce qu'il a vu.

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
