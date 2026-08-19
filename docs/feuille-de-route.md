# Feuille de route

Tout ce qui reste à faire, découpé en tâches assez petites pour être demandées une par une. Chaque tâche est autonome : elle laisse l'app en état de marche, et son résultat est visible ou vérifiable.

**Taille** — S : une passe courte. M : un chantier avec plusieurs étapes. L : à découper encore si on l'attaque.

**Comment lire** — les jalons sont dans l'ordre où ils ont du sens, mais à l'intérieur d'un jalon les tâches peuvent souvent être prises dans le désordre. Les dépendances sont indiquées quand elles existent.

---

## Où on en est aujourd'hui

| Fait | État |
|---|---|
| Infra agents + skills (`apex`, `aquarelle`, `pieges-du-projet`, `nouvelle-mecanique`, `nouvelle-notion`) | ✅ |
| Diagnostic et plan des mécaniques ([plan-jeux.md](plan-jeux.md)) | ✅ |
| Score réel qui tient compte du temps, savoir déplacé après le jeu | ✅ |
| Aquarelle appliquée : accueil, carte des niveaux, coquille de jeu, QCM | ✅ |
| **La Rivière** — 1re mécanique à tension, remplace 8 exercices de Tri | ✅ |
| **Jalon 1 entier** — Le Fil des jours (moteur + Colomb + Louis XIV), les cartes de France et d'Europe, Cap sur, la géo migrée | ✅ (nuit du 19 août, voir [rapport-nuit.md](rapport-nuit.md)) |
| Bonus 2.4/2.5 — Mot à trous et le code mort de Tri supprimés | ✅ (même nuit) |

Il reste **4 anciennes mécaniques à traiter** (2.1 à 2.3, restant de Jalon 2), l'habillage à finir, les niveaux à rééquilibrer, et une passe de solidité. Voir [rapport-nuit.md](rapport-nuit.md) pour les décisions prises cette nuit et ce qui reste à valider.

---

## Jalon 1 — Finir de sortir du QCM

Le cœur du problème que tu as signalé. À la fin de ce jalon, les trois mécaniques du plan existent.

### 1.1 — Le moteur du « Fil des jours » · M
Construire la mécanique d'incarnation **sans son contenu** : l'enchaînement des étapes, les jauges qui montent et descendent, les boutons de choix, la conséquence affichée après chaque décision, et l'épilogue final choisi selon l'état des jauges.
**Pourquoi d'abord** — c'est la partie risquée. Si l'expérience ne fonctionne pas, autant le savoir avant d'écrire des heures de texte historique.
**Fini quand** — on peut jouer un scénario bidon de 3 étapes de bout en bout, voir les jauges bouger, et arriver à un épilogue.

### 1.2 — Le scénario Christophe Colomb · M
Écrire les 7 étapes de la traversée de 1492 : le chargement des cales, la sortie des Canaries, **le double journal de bord** (il ment à l'équipage, ça marche, puis il se perd lui-même), la mutinerie, et la découverte qui n'est pas les Indes.
**Dépend de** — 1.1.
**Attention** — travail d'auteur, pas de développeur. Chaque fait doit être vérifié : c'est du contenu éducatif pour enfants, une date fausse est un défaut grave. À confier au sous-agent `redacteur-contenu`.
**Fini quand** — on joue les 7 étapes, deux parties différentes racontent deux histoires différentes.

### 1.3 — Le scénario Louis XIV · S
Le lever du roi, avec une règle de jeu qui fait tout comprendre : **aucune option ne permet d'être seul**. On saisit Versailles comme une machine à tenir la noblesse, pas comme un joli château.
**Dépend de** — 1.1 (et gagne à venir après 1.2, dont il réutilise le format).

### 1.4 — La carte SVG de la France · M
Dessiner une carte simplifiée en code : contour du pays, les grands fleuves, une dizaine de villes, les pays voisins. C'est un **investissement** : elle resservira du CP à la 3e.
**Pourquoi c'est une tâche à part** — c'est du dessin, pas de la logique. La mélanger au code du jeu rendrait les deux plus durs.
**Fini quand** — la carte s'affiche, chaque zone est cliquable et identifiable.

### 1.5 — Le jeu « Cap sur » · M
La mécanique de carte : un nom à trouver, du brouillard qui se referme en 6 secondes. Juste → la zone s'illumine et garde son nom. Faux → **le nom de ce qu'on a touché s'affiche** (« Ça, c'est la Seine »), l'erreur enseigne un deuxième fait.
**Dépend de** — 1.4.
**Fini quand** — on joue une manche de 5 cibles, avec une bonne et une mauvaise réponse.

### 1.6 — Brancher la géographie sur la carte · S
Migrer les notions de géo qui n'ont qu'un QCM aujourd'hui (Paris, la Loire, les pays voisins, les continents) vers « Cap sur ».
**Dépend de** — 1.5.
**Pourquoi ça compte** — 6 des 10 notions de géo sont des QCM faute de carte : on teste un mot au lieu de construire une image mentale du pays.

### 1.7 — La carte SVG de l'Europe · S
Même travail que 1.4, pour les pays voisins et les continents.
**Dépend de** — 1.4 (dont elle réutilise la technique).

---

## Jalon 2 — Traiter les anciennes mécaniques

Quatre mécaniques d'origine attendent leur sort. Décisions déjà prises dans [plan-jeux.md](plan-jeux.md).

### 2.1 — Refondre « Association » · M
La moins mauvaise des anciennes : elle fait construire une relation. Deux changements — **tracer le lien au doigt** au lieu de taper deux boutons, et faire que les liens tracés **composent une image** (les 5 sens dessinent un visage, les jours de la semaine une constellation).
**Fini quand** — on relie au doigt, et l'image apparaît à la fin.

### 2.2 — La Roue de la vie · M
Les cycles (papillon, plante, saisons) quittent la frise droite pour une **roue qui se met à tourner** une fois complétée.
**Pourquoi ça compte** — une ligne droite a un début et une fin : elle enseigne activement le contraire d'un cycle. Le papillon pond, on repart à l'œuf. Une roue ne peut pas mentir là-dessus.

### 2.3 — Corriger la frise chronologique · S
La frise droite reste pour la vraie chronologie, mais avec un **retour immédiat après chaque pose** au lieu d'un verdict à la fin sans retour arrière possible.

### 2.4 — Supprimer « Mot à trous » · S
C'est un QCM avec une phrase, et cette phrase est le résumé recopié avec un trou. Migrer son contenu vers une autre mécanique, puis retirer le code.
**Fini quand** — plus aucune notion ne l'utilise, le composant est supprimé, tout compile.

### 2.5 — Supprimer le code mort de « Tri » · S
La Rivière l'a remplacé partout, mais le composant `SortGame` et son type traînent encore, inaccessibles.
**Fini quand** — le dossier a disparu, build et tests passent.

---

## Jalon 3 — Finir l'habillage

L'aquarelle est appliquée sur 4 écrans. Il reste ce qui n'était pas encore stabilisé.

### 3.1 — Repeindre La Rivière · S
Piste en lavis, mots flottants sur papier, paniers peints. Elle utilise déjà les bonnes variables de couleur, donc c'est de l'ajustement, pas une refonte.

### 3.2 — Repeindre Association, Roue et Frise · M
**Dépend de** — 2.1, 2.2, 2.3. À ne surtout pas faire avant : repeindre ce qu'on va refaire, c'est du travail jeté.

### 3.3 — L'écran de fin de session · S
Aujourd'hui : trois étoiles jaunes et un chiffre. C'est le moment de récompense, il mérite mieux — étoiles peintes, score qui s'inscrit, record mis en valeur.

### 3.4 — Transitions douces et respect du mouvement réduit · S
Le décor respire lentement et **se fige dès que le joueur agit** (règle de la skill `aquarelle`). Et tout le mouvement d'ambiance disparaît si la personne a demandé moins d'animations dans son système.

---

## Jalon 4 — Rééquilibrer les niveaux

Le contenu existe, mais son agencement date de la v1.

### 4.1 — Rétrograder le QCM · S
De ~45 % des exercices à ~12 %. Il change de rôle : plus la mécanique de découverte, mais celle de **révision** — uniquement sur une notion déjà jouée sous une autre forme.
**Dépend de** — jalon 1 (il faut des mécaniques de remplacement disponibles).

### 4.2 — Recomposer les 8 niveaux · M
Aujourd'hui chaque niveau est 5 créneaux identiques : rien ne monte, rien ne surprend. Viser **3 jeux courts + 1 temps fort** (une incarnation, ou une pièce de vitrine).
**Dépend de** — jalon 1.

### 4.3 — Relire tout le contenu CP · M
Passe complète sur les 40 notions : fautes de français, faits à revérifier, et surtout **traquer le trivial** — si un adulte cultivé lit la notion et ne ressent rien, elle ne mérite pas sa place.
**À confier au** sous-agent `redacteur-contenu`, c'est long et sans intérêt à garder en contexte.

---

## Jalon 5 — Solidifier

### 5.1 — Tester les nouvelles mécaniques · M
Tests unitaires sur la logique testable en isolation : progression des jauges, calcul de l'accélération, choix de l'épilogue, détection de la bonne zone sur la carte.

### 5.2 — Passe d'accessibilité · S
Cibles tactiles, contrastes, navigation au clavier, textes alternatifs. À faire une fois que les écrans ne bougent plus.

### 5.3 — Vérification finale et revue adverse · S
L'agent `verificateur` sur l'ensemble, puis une **revue adverse** (intensité forte d'APEX) : un agent dont la mission est de casser le travail, pas de le valider.

---

## Réserve — non planifié

Six mécaniques conçues et documentées dans [plan-jeux.md](plan-jeux.md), à sortir du tiroir si besoin : **Le Bec du corbeau** (on est le Renard, on flatte pour faire ouvrir le bec — meilleur rapport effet/effort, une journée de travail), **Le Thermomètre**, **La Grotte** (peindre Lascaux à la torche), **Garder le feu**, **Au pied de la lettre**, **La Boussole**.

Et hors périmètre actuel : les autres niveaux scolaires (CE1 et au-delà), qui ne demandent que du contenu — l'architecture est déjà prête.
