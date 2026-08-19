# Phase 4 — eXaminer

Objectif : chercher **activement** ce qui ne va pas, avant que quelqu'un d'autre ne le trouve.

Cette phase ne se saute jamais, quelle que soit l'intensité choisie.

## Vérifier soi-même d'abord

Sur ce projet, dans cet ordre, sans s'arrêter au premier échec :

```bash
npm run build
```
```bash
npm run lint
```
```bash
npm run test
```

Puis **dans le navigateur**, parce que le compilateur ne voit pas un jeu injouable : joue réellement ce que tu as changé, avec une bonne réponse **et** une mauvaise.

### Si le navigateur n'est pas disponible

Certaines sessions (cloud, sans outil de preview) n'ont pas accès au navigateur. Ne fabrique jamais un « testé dans le navigateur » que tu n'as pas fait. Le substitut le plus proche : un test de composant (`@testing-library/react`) qui **rejoue le vrai parcours utilisateur** — clics via `fireEvent`, clavier, timers avec `vi.useFakeTimers()` + `act()` — jusqu'au bout (une bonne réponse **et** une mauvaise, comme dans le navigateur), plutôt qu'un test qui isole juste la logique pure. Vu cette nuit sur `FilDesJoursGame`, `FranceMap`, `CapSurGame` : ça détecte de vrais bugs (ex. `window.matchMedia` absent de jsdom) que `tsc`/lint ne voient pas. Dans le rapport final, dis explicitement que c'est ce qui a remplacé le navigateur — ce n'est pas équivalent à un humain qui clique, notamment pour le rendu visuel réel (aquarelle, mise en page, tailles tactiles).

## Relire son diff en étranger

Relis le changement comme si un inconnu l'avait écrit et que tu devais l'approuver. Cherche : du code mort laissé derrière, un cas limite non traité, un nom trompeur, une valeur en dur qui aurait dû être une variable, une trace de débogage oubliée.

## Confronter au plan

Reprends le plan de la phase 2. Chaque étape est-elle réellement faite, ou seulement commencée ? Quelque chose a-t-il été fait qui n'y figurait pas ? Un ajout non planifié n'est pas forcément mauvais, mais il doit être conscient.

## La revue par le vérificateur

Lance l'agent `verificateur`. Il travaille en contexte isolé, ne peut modifier aucun fichier, et rend un verdict `PRÊT` ou `À CORRIGER`.

Ne déclare jamais une tâche finie sur ta seule parole.

## La revue adverse — intensité forte

Pour un changement structurel, ou une zone déjà cassée une fois, lance **en plus** un agent dont la mission est explicitement de casser ton travail, pas de le valider. Brief à lui donner :

> Ton rôle est de trouver ce qui ne va pas dans ce changement. Pars du principe qu'il contient au moins un défaut sérieux, et trouve-le. Cherche en priorité : les cas limites non traités, les hypothèses non vérifiées, ce qui casse au deuxième passage, ce qui casse sur mobile, ce qui casse quand les données sont vides ou anormalement grandes, ce qui casse si l'utilisateur tape deux fois vite. Ne félicite rien, ne résume pas ce qui marche. Si tu ne trouves vraiment rien, dis quelle partie t'inspire le moins confiance et pourquoi.

Un rapport vide venant d'un agent adverse est un signal faible, pas une preuve.

## Rendre compte honnêtement

Dis ce qui marche, ce qui a été vérifié **et comment**, ce qui reste incertain. Ne dis jamais « c'est fait » pour quelque chose que tu n'as pas vu fonctionner de tes yeux.
