---
name: nouvelle-mecanique
description: Ajouter une nouvelle mécanique de mini-jeu au projet, de bout en bout. À invoquer avant d'écrire la première ligne d'un nouveau jeu — la checklist évite d'oublier un maillon (types, routeur, contenu, test) et de découvrir le problème seulement à l'exécution.
---

Ajouter une mécanique touche cinq endroits. En oublier un ne casse pas la compilation — ça produit un jeu qui ne se lance jamais. Suis l'ordre.

> Une mécanique complète est un chantier à intensité **standard** ou **forte** : invoque d'abord la skill `apex` et déroule ses phases. Cette checklist est le contenu de la phase Planifier, pas un substitut au workflow.

## 1. Le type de contenu — `src/types/game.ts`

Décris la forme des données que consomme le jeu, par exemple :

```ts
export interface MaMecaniqueContent {
  consigne: string
  elements: { id: string; label: string }[]
}
```

Puis déclare l'identifiant dans `GameTypeId` (`src/types/content.ts`) et ajoute le champ optionnel correspondant à `NotionGames`.

## 2. Le composant — `src/games/MaMecaniqueGame/`

Un dossier, un `.tsx`, un `.module.css` à côté. Le contrat est identique pour toutes les mécaniques :

```ts
{ content: MaMecaniqueContent; onComplete: (result: GameCompleteResult) => void }
```

`GameCompleteResult` vaut `{ correct, timeMs, mistakes?, streak? }` et vit dans `src/types/game.ts`, pas à côté des composants : le moteur de score et le magasin de progression le lisent, et ils ne doivent rien savoir de l'interface.

**Le nom du dossier et l'identifiant se correspondent**, c'est une règle : `capsur` → `CapSurGame/`, `fildesjours` → `FilDesJoursGame/`. Un identifiant technique en face d'un nom produit (l'ancien `mapclick` pour `CapSurGame`) rend la mécanique introuvable au `grep`, et c'est le premier geste de qui découvre le code.

Contraintes non négociables :
- Chronométrage via `elapsedSince` (`src/engine/timing.ts`), mélange via `shuffle` (`src/engine/shuffle.ts`). Jamais `Date.now()` ni `Math.random()` dans le composant — voir la skill `pieges-du-projet`.
- Cibles tactiles ≥ 44px, mobile d'abord.
- Le jeu gère l'échec autant que la réussite : se tromper doit apprendre quelque chose, jamais seulement punir.

## 3. Le routeur — `src/games/GameRouter.tsx`

Ajoute le `case`. Comme `SelectedGame` est une union discriminée sur `gameType`, TypeScript restreint `content` tout seul dans la branche — pas de cast.

## 4. La sélection — `src/engine/selectGameForNotion.ts`

Place l'identifiant dans `GAME_PRIORITY`. L'ordre compte : c'est le repli quand une notion ne pointe pas explicitement une mécanique. `qcm` reste **toujours dernier**, c'est le filet de sécurité.

## 5. Le contenu et le niveau

Une mécanique sans contenu est invisible. Ajoute le payload à au moins une notion de `src/content/grades/cp/`, puis épingle-la dans un `LevelDef` :

```ts
{ notionId: 'cp-sciences-exemple', gameType: 'mamecanique' }
```

Attention : si le `gameType` épinglé n'existe pas dans les `games` de la notion, `selectGameForNotion` retombe silencieusement sur une autre mécanique. Pas d'erreur, juste le mauvais jeu à l'écran.

## 6. Vérifier

Un test unitaire dans `src/engine/` si la mécanique amène de la logique de scoring. Puis, systématiquement, lance l'agent `verificateur` — il joue réellement la mécanique en bonne et en mauvaise réponse, ce que `tsc` ne fera jamais.
