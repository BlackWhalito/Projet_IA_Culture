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

Autres commandes :

```bash
npm run build       # tsc -b puis vite build — c'est ici que le type-check passe
npm run lint        # oxlint
npm run test        # tests unitaires (une fois)
npm run test:watch  # tests unitaires en mode watch
```

## Architecture

```
src/
  types/            # Notion, GradeLevel, LevelDef, UserProgress,
                    # contrat de sortie des jeux + payloads de contenu
  content/          # données statiques écrites à la main, jamais mutées
    domains.ts        # les 4 domaines (histoire, géographie, sciences, français)
    grades/           # registre des niveaux scolaires + notions par classe
    levels/           # séquences de notions regroupées en niveaux de jeu
    maps/             # zones cliquables des cartes SVG
  engine/           # sélection du jeu, scoring, jauges du Fil des jours, mélange, chrono
  games/            # les 6 mécaniques + la coquille commune (GameShell, GameRouter)
  state/            # progressStore (zustand + persist)
  screens/          # HomeScreen, LevelMapScreen, GameSessionScreen
  components/       # cartes SVG, moteur de peinture aquarelle
```

**Les dépendances descendent, jamais l'inverse.** L'échelle réelle, du bas vers le haut :

```
types            n'importe rien
content, engine  → types
state            → engine, types
components       → content, types
games            → components, content, engine, types
screens          → components, content, engine, games, state, types
```

Un import qui remonte est un défaut, pas un raccourci. C'est ce qui garantit qu'un changement d'écran ne peut pas casser la sauvegarde.

Les six mécaniques, et l'identifiant de `gameType` qui les désigne :

| `gameType` | Dossier | Ce qu'on y fait |
|---|---|---|
| `qcm` | `QcmGame/` | Choisir la bonne réponse — mécanique de révision, en repli |
| `match` | `MatchGame/` | Associer deux colonnes |
| `timeline` | `TimelineGame/` | Remettre des événements dans l'ordre |
| `riviere` | `RiviereGame/` | Trier des mots qui descendent le courant, ça accélère |
| `capsur` | `CapSurGame/` | Trouver un lieu sur une carte avant que le brouillard se referme |
| `fildesjours` | `FilDesJoursGame/` | Incarner un personnage historique, les jauges répondent |

L'identifiant et le nom du dossier se correspondent : c'est une règle, pas un hasard.

## Où trouver le reste

Ce fichier ne décrit que la forme du projet. Tout ce qui touche à la manière de travailler vit ailleurs, et s'y trouve à jour :

- **[CLAUDE.md](CLAUDE.md)** — les règles d'architecture et les décisions non devinables à la lecture du code
- **Skill `nouvelle-notion`** — écrire ou réviser une notion de `src/content/` : format exact, règles éditoriales, checklist
- **Skill `nouvelle-mecanique`** — ajouter un mini-jeu de bout en bout, les cinq endroits à toucher
- **Skill `aquarelle`** — la direction artistique du CP
- **[docs/feuille-de-route.md](docs/feuille-de-route.md)** — ce qui reste à faire
- **[docs/plan-jeux.md](docs/plan-jeux.md)** — pourquoi les mécaniques sont ce qu'elles sont

Ajouter un niveau scolaire est purement additif : passer `enabled: true` dans `src/content/grades/index.ts`, créer les fichiers de contenu et de niveaux, les agréger. Aucun code d'écran, de moteur ni de progression n'est à modifier.
