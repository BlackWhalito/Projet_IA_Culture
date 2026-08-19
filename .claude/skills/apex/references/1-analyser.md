# Phase 1 — Analyser

Objectif : comprendre le terrain avant d'y toucher. Tu sors de cette phase avec des faits, pas des suppositions.

## Reformuler d'abord

Écris la tâche en une phrase : *« Faire en sorte que ___, pour que ___. »*

Si tu n'y arrives pas, tu n'as pas compris la demande. Pose la question **maintenant**, pas après trois heures de code.

Sépare ensuite explicitement :

- **Ce qui est demandé** — le résultat voulu
- **Ce qui est supposé** — ce que tu crois vrai sans l'avoir vérifié
- **Ce qui est inconnu** — ce qu'il faut aller chercher

Les suppositions sont la matière première des bugs. Chacune doit devenir un fait vérifié ou une question posée.

## Explorer en parallèle

Les questions indépendantes se cherchent **simultanément**, dans des agents `Explore` séparés. Chacun revient avec sa réponse sans encombrer le contexte principal.

Lance en parallèle quand tu as **2 à 4 questions sans lien entre elles**, par exemple :

- « Où est défini X, et qui l'utilise ? »
- « Comment le projet gère-t-il déjà Y ailleurs ? »
- « Qu'est-ce qui casserait si je changeais Z ? »

**Ne lance pas d'agent** pour ce qu'un seul `grep` ou une seule lecture de fichier règle. Un agent coûte plus cher qu'une commande, et attendre sa réponse coûte plus que la lancer.

## Le précédent interne prime

Avant d'inventer une manière de faire, cherche si le projet en a déjà une. Un code qui ressemble à son voisin se maintient mieux qu'un code « meilleur » mais isolé.

## Sortie de phase

Trois à six lignes, pas une dissertation :

- Ce qui existe déjà et qu'on va réutiliser
- Les fichiers réellement concernés
- Ce qui reste incertain, et comment on tranchera

Si l'analyse révèle que la tâche est plus grosse que prévu — plusieurs zones, plusieurs risques — **dis-le maintenant** et propose de la découper avant de planifier.
