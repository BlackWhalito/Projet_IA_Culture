# Plan de refonte des jeux — CP

Issu du brainstorm du 19 août 2026, après rejet de la v1 (« ce ne sont que des QCM »).

## Diagnostic

**1. Les 5 mécaniques n'en sont qu'une.** Qcm, FillBlank, Match, Sort et Timeline demandent toutes le même geste : *désigner la bonne cible parmi N*. Cinq mises en page, un seul verbe. Le joueur ne fabrique rien, ne vise rien.

**2. Le contrat de sortie interdit le rejeu.** `GameCompleteResult = { correct, timeMs }` — et `timeMs`, calculé par les 5 jeux, est **jeté** : `computeStarRating` ne regarde que le ratio correct/total. Une mécanique ne peut donc rien dire d'autre que oui/non. Rien à améliorer au deuxième passage, donc aucune raison de rejouer.

**3. `GameShell` divulgue la réponse.** L'intro affiche le `summary`, le jeu pose la question. Vérifié sur `cp-geographie-ile` : le résumé est *« Une île est un morceau de terre entouré d'eau »*, le fillblank est la **même phrase avec un trou**, 4 secondes plus tard. Au moins 6 notions sont dans ce cas. Et le `funFact`, meilleur contenu du projet, est relégué en lot de consolation.

Corollaire : 18 des 40 notions n'ont qu'un payload `qcm`, et 55 % des créneaux de niveau sont qcm/fillblank.

## Trois corrections structurelles — prérequis

À faire **avant** toute nouvelle mécanique, sinon la coquille les reformatera toutes en QCM.

1. Élargir `GameCompleteResult` en `{ correct, timeMs, mistakes?, streak? }`, et faire enfin servir le `timeMs` que les jeux calculaient pour rien.

   > **Fait, mais autrement — et mieux.** Mettre le temps dans `computeStarRating` aurait mélangé deux rôles dans un seul chiffre. Les étoiles sont restées le ratio de bonnes réponses : elles sont la **porte de déverrouillage**, elles doivent rester lisibles par un enfant de 6 ans. Le temps et les erreurs alimentent un `computeSessionScore` distinct, qui mesure la **manière** et donne la chose qu'on peut battre en rejouant. Voir `src/engine/scoring.ts`.
2. Supprimer l'écran d'intro systématique de `GameShell`. Le `summary` rejoint le `funFact` **après** le jeu. Le jeu commence à froid ; les mécaniques qui ont besoin d'un cadrage le portent elles-mêmes.
3. Casser l'uniformité des niveaux : viser 3 jeux courts + 1 temps fort, au lieu de 5 créneaux identiques. Pas de changement de type, c'est de l'écriture de contenu.

## Les trois mécaniques à construire

### 1. La Rivière — *à faire en premier*

Des mots descendent le courant, on les jette dans le bon panier, ça accélère de 15 % tous les 5 objets. Objectif 20 objets, fin à 3 ratés.

Enseigne les classements où la connaissance visée est un **réflexe** et non un raisonnement : masculin/féminin, voyelle/consonne, nom/verbe, vivipare/ovipare. La vitesse est la mesure de l'acquisition, pas un gadget.

```ts
interface RiviereContent {
  paniers: { id: string; label: string }[]
  flottants: { label: string; panierId: string; visuel?: string }[]
  vitesseInitialeSec: number
  accelerationParPalier: number
  objectif: number
}
```

Migration depuis `SortContent` quasi mécanique : `categories` → `paniers`, `items` → `flottants`. Remplace 8 créneaux d'un coup. **Aucun visuel requis.**

Échec : l'objet raté s'échoue sur la berge et y reste. En fin de manche, on repasse les échoués avec leur bon panier. Pas de perte, une liste à revoir.

### 2. Le Fil des jours — l'incarnation

5 à 7 étapes de la vie d'un personnage. Scène, 2-3 actions, jauges qui bougent. **Aucune bonne réponse** : le monde réagit, et c'est ça qui enseigne.

Deux règles non négociables :
- *Pas de bonne réponse, mais un monde qui répond.* Si une option est « la bonne », c'est un QCM déguisé.
- *La contrainte de l'époque est la règle du jeu.* On n'écrit pas « la traversée fut longue » : on donne une jauge de moral qui descend et pas de terre en vue.

**Colomb 1492** en premier. Jauges : vivres, moral, milles. La carte du monde s'arrête net au bord — c'est celle de 1492. Cœur du jeu : Colomb tenait **deux journaux de bord**, un exact et un faux minoré montré à l'équipage. Le joueur ment chaque soir, ça marche, le moral tient — puis il ne sait plus lui-même où il est. **Décision du propriétaire : on garde, avec la chute.** La leçon est dans la conséquence, pas dans un sermon.

Puis **Louis XIV** : jauges autorité / attention de la Cour, et une règle de jeu — *aucune option ne permet d'être seul*. On comprend Versailles comme une machine à tenir la noblesse.

```ts
interface FilDesJoursContent {
  personnage: { nom: string; annee: string; role: string }
  jauges: { id: string; label: string; depart: number }[]
  etapes: {
    titre: string
    scene: string
    options: { texte: string; effets: Record<string, number>
               consequence: string; historique?: string }[]
  }[]
  epilogues: { condition: Record<string, [number, number]>; texte: string }[]
}
```

Code trivial (machine à états + jauges CSS), **coût en écriture** : ~40 lignes de texte vérifié par personnage. Seule mécanique non rejouable à l'identique.

### 3. Cap sur — la carte

Carte muette, un nom à trouver, brouillard qui se referme en 6 s. Juste : la zone s'illumine et son nom y reste. Faux : **le nom de ce qu'on a touché s'affiche** (« Ça, c'est la Seine ») — l'erreur enseigne un second fait.

Aujourd'hui 6 des 10 notions de géographie n'ont qu'un QCM faute de carte : on teste un mot au lieu de construire une image mentale.

```ts
interface CapSurContent {
  carteId: 'france' | 'europe' | 'monde'
  cibles: string[]            // ids de zones, dans l'ordre où elles sont demandées
  secondesParCible: number
}
```

> **Écart assumé avec le plan d'origine.** Le plan faisait porter la géométrie (`d`, `cx`, `cy`, `rayon`) par le contenu de la notion. À l'implémentation, la géométrie a été sortie dans `src/content/maps/` : une notion ne cite plus qu'un id de zone. Sans ça, la même ville aurait été redessinée dans chaque notion qui la mentionne. `contentIntegrity.test.ts` vérifie que chaque id cité existe bien sur sa carte.

Coût élevé : il faut produire 3 cartes SVG simplifiées. Mais elles resserviront du CP à la 3e — investissement de plateforme. Zone tapable **jamais sous 44px**, quitte à déborder du tracé.

## Sort des 5 mécaniques actuelles

| Mécanique | Verdict |
|---|---|
| **FillBlank** | **Supprimer.** C'est un QCM avec une phrase, et cette phrase est le `summary` recopié avec un trou. |
| **Sort** | **Supprimer**, remplacée par La Rivière. Même donnée, même intention, sans le temps mort. |
| **Timeline** | **Scinder.** Les cycles (papillon, plante, saisons) passent sur une **roue** — une ligne droite enseigne activement le contraire d'un cycle. La frise droite reste pour la vraie chronologie, avec retour immédiat après chaque pose. |
| **Match** | **Retravailler.** La moins mauvaise : elle fait construire une relation. Refonte = tracer le lien **au doigt**, et les liens composent une image (les 5 sens dessinent un visage). |
| **Qcm** | **Garder, rétrograder** de 45 % à ~12 % des créneaux. Devient la mécanique de **révision** : uniquement sur une notion déjà jouée autrement, jamais dans le même écran que son propre résumé. |

## Doctrine

**Geste oui, glisser-déposer non.** Le geste continu au pointeur (peindre, glisser un curseur, tracer un lien) est rouvert et se code proprement avec les Pointer Events. Le glisser-déposer d'objets vers des cibles reste refusé : sur mobile il entre en conflit avec le défilement et rate une fois sur cinq.

**Le double public se règle en stratifiant, pas en simplifiant.** L'écran de jeu ne porte que du visuel et 4 à 8 mots — un enfant de 6 ans peut jouer sans savoir lire. La profondeur (le pourquoi, la date, l'anecdote) est dans l'écran d'après, en vraies phrases pour l'adulte. Le Fil des jours est l'exception assumée : texte-lourd, fait pour être lu à voix haute par l'adulte à l'enfant.

**Aucune illustration externe.** Tout est dessiné en code — voir la skill `aquarelle`. Laboratoire de style : `public/aquarelle.html`.

## Fiches en réserve

Écrites et non planifiées : **Le Bec du corbeau** (on est le Renard, on flatte pour faire ouvrir le bec — meilleur rapport effet/effort, une journée), **Le Thermomètre** (curseur de température, les 3 états de l'eau comme moments d'un même corps), **La Grotte** (peindre Lascaux à la lueur d'une torche), **Garder le feu** (tenir un feu une nuit entière), **La Roue de la vie**, **Au pied de la lettre** (expressions imagées prises au sens littéral).
