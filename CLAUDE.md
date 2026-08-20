# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Ce que c'est

App web française qui fait réapprendre la culture générale en jouant. Contenu classé par niveau scolaire ; seul le **CP** existe. Public double : enfants **et** adultes qui redécouvrent — donc jamais de contenu trivial. Frontend seul, progression en `localStorage`.

## Commandes

```bash
npm run dev      # serveur de dev
npm run build    # tsc -b puis vite build — le type-check passe ici
npm run lint     # oxlint
npm run test     # vitest
npx vitest run chemin/du/fichier.test.ts
```

## Méthode de travail

- **Invoque la skill `apex`** avant d'implémenter une fonctionnalité ou de corriger un bug : Analyser → Planifier → Exécuter → eXaminer, une phase chargée à la fois.
- **Lance l'agent `verificateur`** avant d'annoncer que quoi que ce soit est fini. Ne crois jamais un agent sur parole : rejoue ses vérifications toi-même.
- **La session principale orchestre** — il n'existe pas d'agent chef, et il ne doit pas en exister. Avant de déléguer, voir la skill `orchestration` : routage, brief, et surtout quand ne PAS déléguer.
- **Les skills et les agents s'entretiennent tout seuls, sans qu'on le demande.** Quatre déclencheurs, et eux seuls : une friction a coûté du temps ; un fichier affirme quelque chose devenu faux ; une skill aurait dû se déclencher et ne l'a pas fait (sa `description` est en cause) ; un agent a mal travaillé (son brief est en cause, pas lui). Corriger dans la foulée, en un commit à part qui dit le gain obtenu.
- **Hors de ces quatre cas, on ne touche à rien.** Ne jamais chercher quoi améliorer pour justifier la règle : une skill qui grossit de retouches cosmétiques coûte du contexte à chaque invocation. Un ajout qui dépasse les seuils de taille se scinde, il ne s'empile pas. Contrepoids : lancer `audit-des-skills` tous les deux ou trois ajouts.
- **Garde ce fichier court.** Le détail va dans les skills, chargées à la demande.
- Le propriétaire n'est pas développeur : il tranche le produit, pas la technique. Recommander plutôt que faire arbitrer, et expliquer sans jargon.
- **Le contredire dès qu'une meilleure façon de faire existe** — il l'a demandé explicitement. Sa demande décrit un besoin réel, mais pas forcément la bonne solution : s'il existe mieux, le dire **avant** de coder, avec la raison et une recommandation nette. Cela vaut aussi pour un choix produit dont il ne peut pas voir le coût technique. En sens inverse, ne jamais fabriquer un désaccord pour avoir l'air critique : quand sa demande est la bonne, le dire en une ligne et exécuter.

## La règle d'architecture qui ne se viole pas

`src/content/` = données statiques écrites à la main, jamais mutées à l'exécution.
`src/state/` = état runtime persisté en `localStorage`.
Séparées au niveau des types (`types/content.ts` vs `types/progress.ts`), elles ne se mélangent jamais.

## Décisions non devinables à la lecture du code

- **Le déverrouillage des niveaux est dérivé, jamais stocké.** `LevelMapScreen` regarde si le niveau précédent est complété. Conséquence assumée : ouvrir directement l'URL d'un niveau le joue, sans blocage.
- **`selectGameForNotion` rend une union discriminée**, donc le `switch` de `GameRouter` restreint `content` gratuitement. Repli sur `qcm` en dernier recours.
- **`timing.ts` / `shuffle.ts` existent pour contourner oxlint** (`react(purity)`), pas par élégance. Toujours passer par eux.
- **Ajouter un niveau scolaire est purement additif** : fichiers de contenu + `enabled: true`, aucun code moteur ou écran à toucher.
- **Le savoir arrive après le jeu**, jamais avant : `GameShell` n'a plus d'écran d'intro, le résumé et l'anecdote sont la récompense.

## Direction produit

Les jeux doivent être **réellement amusants**, pas des QCM déguisés. Test : aurait-on envie d'y rejouer en connaissant déjà la réponse ?

Ressorts retenus : tension/chrono, manipulation/geste, surprise/humour, incarnation. Récompenses/collection : proposé et **écarté**.

Direction artistique **aquarelle** au CP (skill `aquarelle`) ; arcade rétro prévue pour les grandes classes.

## Où trouver le reste

- [docs/feuille-de-route.md](docs/feuille-de-route.md) — toutes les tâches restantes, découpées et expliquées
- [docs/plan-jeux.md](docs/plan-jeux.md) — diagnostic et spécifications des mécaniques
- Skills : `apex`, `orchestration`, `aquarelle`, `pieges-du-projet`, `nouvelle-mecanique`, `nouvelle-notion`, `audit-des-skills`
- Agents : `verificateur`, `auditeur-securite`, `game-designer`, `redacteur-contenu`
