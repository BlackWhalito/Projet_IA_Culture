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

**Symptôme.** On vient d'écrire `.claude/agents/mon-agent.md`, et l'outil Agent répond `Agent type 'mon-agent' not found`.

**Cause.** Le registre des agents et des skills est chargé au démarrage de la session. Un fichier créé après coup n'est pas vu.

**Contournement.** Pour la session en cours, lancer `general-purpose` en recopiant le contenu du fichier d'agent dans le prompt. Le fichier servira normalement aux sessions suivantes. Même logique pour une skill fraîchement écrite : appliquer son contenu à la main jusqu'au prochain démarrage.

## Piloter le navigateur : les trois pièges

**Les `ref_N` deviennent obsolètes dès que le DOM change.** Après un clic qui fait avancer le jeu, les références lues précédemment pointent dans le vide (`ref is stale`). Refais un `read_page` après chaque changement d'écran plutôt que de réutiliser une liste de refs.

**`tabId` change après certaines navigations.** Un `navigate` peut répondre « denied or failed » simplement parce que l'onglet visé n'existe plus. Réflexe : `tabs_context` pour relire les identifiants réels, puis recommencer.

**`javascript_tool` expire au bout de 30 s.** Une boucle longue qui enchaîne des clics avec des attentes dépasse facilement ce plafond et ne rend rien. Découpe en scripts courts (moins de 10 actions), ou clique via l'outil `computer`.

Note utile : `element.click()` en JS fonctionne bien sur React (délégation d'événements native), c'est le moyen le plus rapide de traverser plusieurs écrans — tant que le script reste court.

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

## Environnement Windows

- Le shell principal est **PowerShell**, pas bash. `&&` n'existe pas en PowerShell 5.1 : utiliser `;` ou `if ($?) { }`.
- `npm create vite@latest .` échoue si le dossier n'est pas vide (le prompt interactif d'écrasement ne peut pas recevoir de réponse). Contournement : générer dans un sous-dossier temporaire puis remonter les fichiers.
