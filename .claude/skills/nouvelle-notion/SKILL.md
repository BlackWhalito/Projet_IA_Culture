---
name: nouvelle-notion
description: Rédiger une notion de culture générale pour le projet — format exact, règles éditoriales, checklist de validation. À invoquer avant d'écrire ou de réviser du contenu dans src/content/.
---

Une **notion** est une unité de savoir : un fait, sa mise en scène ludique, et l'anecdote qui le rend mémorable.

## Où ça vit

`src/content/grades/<niveau>/<domaine>.ts`, un tableau de `Notion`. Les quatre domaines sont `histoire`, `geographie`, `sciences`, `francais` — pas de maths, hors périmètre culture générale.

Le fichier doit être agrégé dans `src/content/notions.ts`, sinon la notion n'existe pour personne.

## Format

```ts
{
  id: 'cp-sciences-exemple',      // slug stable et unique dans TOUT le contenu
  gradeId: 'cp',
  domainId: 'sciences',
  difficulty: 1,                   // 1 à 3, à l'intérieur du niveau scolaire
  title: 'Titre affiché',
  summary: 'Ce qu'on apprend, en une phrase, avant de jouer.',
  funFact: 'L'anecdote affichée après la réponse.',
  games: {
    qcm: { question: '...', choices: ['...', '...'], correctIndex: 0 },
    // une notion peut porter plusieurs mécaniques : le même fait se rejoue autrement
  },
}
```

Les formes de payload par mécanique sont dans `src/types/game.ts`.

## Règles éditoriales

**Rien de trivial.** Le public inclut des adultes qui redécouvrent des notions oubliées depuis l'école. Test : si un adulte cultivé lit la notion et ne ressent rien, elle ne mérite pas sa place. Pas de « 1+1=2 ».

**Une notion = un fait précis**, pas un survol de thème. « Les animaux » n'est pas une notion ; « vivipares et ovipares » en est une.

**Le `funFact` est le champ le plus important**, pas un ornement. C'est lui qui fait que la notion reste. Vise l'anecdote qu'on a envie de répéter à quelqu'un le soir même.

**Exactitude non négociable.** C'est du contenu éducatif pour des enfants : une date fausse est un défaut grave. En cas de doute sur un fait, une date, une attribution — vérifier par une recherche web, ou changer de notion.

**Français impeccable.** Les fautes se voient immédiatement à l'écran. Deux ont déjà échappé à une première relecture sur ce projet.

**Prévoir un `qcm` de secours** en plus de la mécanique principale : `selectGameForNotion` retombe sur `qcm` en dernier recours, une notion sans filet peut devenir injouable.

## Adapter au niveau

Le ton monte en crescendo avec le niveau scolaire. Au CP : très visuel, contemplatif, mais avec de vraies phrases pour qu'un adulte ne s'ennuie pas — jamais du texte enfantin au point d'être creux. Plus le niveau monte, plus le contenu devient exigeant et adulte.

## Checklist avant de conclure

- [ ] `id` unique dans tout le contenu, préfixé `<niveau>-<domaine>-`
- [ ] Fichier de domaine agrégé dans `src/content/notions.ts`
- [ ] Faits vérifiés, dates confirmées
- [ ] `funFact` réellement surprenant
- [ ] Un `qcm` présent en filet de sécurité
- [ ] La notion apparaît dans un `LevelDef` de `src/content/levels/`, sinon elle est inatteignable
- [ ] Le `gameType` épinglé dans le `LevelDef` existe bien dans `games`
