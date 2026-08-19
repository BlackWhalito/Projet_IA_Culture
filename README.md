# Jeu Culture

Application web de jeux de culture générale, organisée par niveau scolaire (CP pour l'instant). Le but : réapprendre en s'amusant les notions importantes de chaque classe, pour les enfants comme pour les adultes.

## Stack

- React + TypeScript + Vite (frontend uniquement, pas de backend)
- `react-router-dom` pour la navigation
- `zustand` (+ `persist`) pour la progression, sauvegardée en `localStorage`
- CSS Modules pour le style
- `vitest` + `@testing-library/react` pour les tests

## Lancer le projet

```bash
npm install
npm run dev
```

Autres commandes utiles :

```bash
npm run test        # tests unitaires (une fois)
npm run test:watch  # tests unitaires en mode watch
npm run lint         # oxlint
npx tsc -b --noEmit  # vérification des types
```

## Architecture

```
src/
  types/            # Notion, GradeLevel, LevelDef, UserProgress, payloads de jeu
  content/
    domains.ts        # les 4 domaines (histoire, géographie, sciences, français)
    grades/            # registre des niveaux scolaires + notions par classe
    levels/            # séquences de notions regroupées en niveaux de jeu
  engine/            # sélection du jeu à jouer, scoring, mélange, chrono
  games/             # les mécaniques de mini-jeux (QCM, Association, Frise, Tri, Mot à trous)
  state/             # progressStore (zustand + persist)
  screens/           # HomeScreen, LevelMapScreen, GameSessionScreen
```

## Ajouter une notion de contenu

Chaque notion vit dans `src/content/grades/<niveau>/<domaine>.ts` et respecte le type `Notion` (voir `src/types/content.ts`). Exemple minimal :

```ts
{
  id: 'cp-sciences-exemple',       // slug stable, unique dans tout le contenu
  gradeId: 'cp',
  domainId: 'sciences',             // 'histoire' | 'geographie' | 'sciences' | 'francais'
  difficulty: 1,                    // 1 (facile) à 3 (plus difficile)
  title: 'Titre affiché',
  summary: 'Résumé affiché avant de jouer.',
  funFact: 'Anecdote affichée après la réponse (facultatif mais recommandé).',
  games: {
    qcm: { question: '...', choices: ['...', '...'], correctIndex: 0 },
    // une notion peut proposer plusieurs mécaniques (qcm, match, timeline, sort, fillblank)
  },
}
```

Règles à garder en tête :

- Éviter le trop évident : le public cible inclut des adultes qui veulent redécouvrir des notions oubliées, pas réapprendre que 1+1=2.
- Prévoir si possible un `qcm` de secours en plus de la mécanique principale, pour la fiabilité (voir `engine/selectGameForNotion.ts`, qui retombe sur `qcm` en dernier recours).
- Chaque forme de contenu (`match`, `timeline`, `sort`, `fillblank`) a ses propres champs, décrits dans `src/types/game.ts`.

Une fois la notion ajoutée dans son fichier de domaine, l'inclure dans un `LevelDef` (`src/content/levels/<niveau>-levels.ts`) pour qu'elle apparaisse dans un niveau de jeu, avec la mécanique choisie :

```ts
{ notionId: 'cp-sciences-exemple', gameType: 'qcm' }
```

## Ajouter un niveau scolaire

1. Passer `enabled: true` pour ce niveau dans `src/content/grades/index.ts`.
2. Créer `src/content/grades/<niveau>/{histoire,geographie,sciences,francais}.ts` et les ajouter à `src/content/notions.ts`.
3. Créer `src/content/levels/<niveau>-levels.ts` et l'ajouter à `src/content/levels/index.ts`.

Aucun code d'écran, de moteur de jeu ou de progression n'a besoin d'être modifié : tout est générique par rapport au niveau scolaire.
