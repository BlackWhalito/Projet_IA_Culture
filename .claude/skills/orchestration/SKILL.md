---
name: orchestration
description: Comment piloter les sous-agents — lequel choisir, comment le briefer, quand ne surtout pas déléguer, comment vérifier ce qu'il rend, et quoi faire quand il se trompe. À invoquer avant de lancer un sous-agent, et dès qu'un agent rend un résultat douteux ou décevant.
---

# Orchestration des sous-agents

Cette skill dit **qui** appeler et **comment** le briefer. Pour savoir **à quel moment** d'un chantier explorer ou vérifier, c'est la skill `apex` — phase Analyser pour l'exploration, phase eXaminer pour la vérification.

## Qui orchestre

**La session principale.** C'est elle qui parle au propriétaire, connaît l'historique, tient les décisions produit et enchaîne les étapes. Les sous-agents sont des exécutants à contexte isolé : ils démarrent à froid, font une chose, rendent un rapport, disparaissent.

Il n'existe **pas** d'agent chef, et il ne doit pas en exister un. Un orchestrateur a besoin du contexte complet de la conversation ; un sous-agent n'en a aucun par construction. Placer l'orchestration dans un sous-agent revient soit à piloter à l'aveugle, soit à lui réexpédier tout le contexte — ce qui annule précisément l'isolation qui rend les sous-agents utiles.

*Ce raisonnement changerait si le projet devait tourner sans personne devant l'écran, en autonomie longue. Ce n'est pas le cas : le propriétaire distribue les tâches une par une.*

## Le routage

| Besoin | À qui | Pourquoi lui |
|---|---|---|
| Vérifier qu'un travail est réellement fini | `verificateur` | Ne peut modifier aucun fichier : il diagnostique, tu corriges |
| Casser un changement structurel qu'on croit fini | `avocat-du-diable` | Cherche le défaut que personne n'a pensé à tester — **après** le `verificateur`, jamais à sa place |
| Inventer ou critiquer une mécanique de jeu | `game-designer` | Lecture seule + web, explore largement sans polluer |
| Écrire ou réviser du contenu en volume | `redacteur-contenu` | Cantonné à `src/content/`, ne touche jamais au code |
| Chercher des failles de sécurité | `auditeur-securite` | Lecture seule : il qualifie le risque, tu décides du correctif |
| Trouver où est défini X, qui utilise Y | `Explore` | Rapide, lecture seule, conçu pour la recherche |
| Chantier large sans spécialiste dédié | `general-purpose` | Le repli quand aucun agent ne colle |

Un agent fraîchement écrit **est** désormais invocable par son nom sans redémarrer la session (constaté le 21/08/2026). Tente-le d'abord ; si le nom n'est pas trouvé, replie-toi sur `general-purpose` en recopiant le contenu du fichier d'agent dans le brief — voir la skill `pieges-du-projet`.

## Quand ne PAS déléguer

C'est la règle la plus rentable, parce que la sur-délégation coûte plus cher que l'inverse. Fais-le toi-même quand :

- **Un `grep` ou une lecture de fichier suffit.** Lancer un agent coûte plus que la commande, et attendre sa réponse coûte encore davantage.
- **C'est une décision produit.** Elle appartient au propriétaire, ou à toi. Un agent à contexte vide n'a rien pour trancher.
- **Le travail exige l'historique de la conversation.** L'agent démarre à froid : ce que tu devrais lui réexpliquer, tu ferais mieux de le faire.
- **C'est une correction de deux lignes.** Le brief serait plus long que le correctif.

## Briefer un agent

Un agent démarre **à froid** : il ne sait rien du projet, de la conversation, ni de ce qui a déjà été tenté. Un brief vague produit un travail vague. Sept éléments, dans cet ordre :

1. **Qui il est et sur quoi il travaille** — deux ou trois lignes de contexte projet, pas plus.
2. **Ce qu'il doit lire en premier**, chemins exacts. Sans ça, il explore au hasard et brûle son contexte.
3. **Les skills à invoquer** — notamment `pieges-du-projet` avant tout code, `nouvelle-mecanique` pour un jeu, `nouvelle-notion` pour du contenu.
4. **La mission**, précise et bornée. « Améliore le jeu » ne veut rien dire ; « migre les 8 notions qui utilisent `sort` vers `riviere` » se vérifie.
5. **Les contraintes non négociables** — conventions, interdits, pièges connus.
6. **Ce qu'il ne doit surtout pas toucher.** Décisif quand plusieurs travaux avancent en parallèle.
7. **Le format du rapport attendu** — sinon tu reçois une dissertation au lieu d'une liste de faits.

## Ne jamais croire un agent sur parole

Un agent qui écrit « tout passe » a pu se tromper, ou tester autre chose que ce que tu crois. **Rejoue les vérifications toi-même** : `npm run build`, `npm run lint`, `npm run test`, et le parcours dans le navigateur.

Lis aussi son code. Un rapport décrit une intention ; le fichier dit ce qui a réellement été écrit.

Cette règle a déjà payé sur ce projet : un agent avait signalé « tous les contrôles passent » — c'était vrai, mais seule la relecture du composant a montré *comment* il avait contourné un piège React, information qui a fini dans une skill.

## Parallèle ou séquentiel

**En parallèle** quand les travaux touchent des **fichiers différents**. Exemple réel : repeindre les écrans pendant qu'un agent construisait une nouvelle mécanique — aucun fichier commun, aucun conflit.

**En séquence** quand l'un dépend du résultat de l'autre, ou quand un doute existe sur le recouvrement des fichiers.

**Jamais deux agents sur les mêmes fichiers.** Ils ne se voient pas : le dernier qui écrit écrase l'autre, silencieusement.

Pendant qu'un agent tourne en arrière-plan, avance sur autre chose — mais jamais sur son périmètre.

## Quand un agent rate

- **Rapport vide ou vague** → le brief était mauvais, pas l'agent. Reformule en resserrant la mission et le format attendu.
- **Travail faux** → ne le relance pas à l'identique, il refera la même erreur. Soit tu corriges toi-même, soit tu le re-briefes **avec le diagnostic**.
- **Deux échecs de suite** → fais-le toi-même. La tâche est mal découpée pour une délégation, et un troisième essai coûtera plus qu'il ne rapportera.

## Rendre compte

Le rapport d'un agent **n'est pas visible** par le propriétaire : il ne voit que ce que tu lui écris. Transmets ce qui compte — les conclusions, les décisions à prendre, ce qui a été vérifié — sans recopier le rapport brut.

Et distingue toujours ce que **tu** as vérifié de ce que l'agent **affirme**.
