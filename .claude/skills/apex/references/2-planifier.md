# Phase 2 — Planifier

Objectif : transformer l'analyse en une suite d'étapes dont chacune peut réussir ou échouer **visiblement**.

## Découper

Une bonne étape :

- touche **peu de fichiers** — au-delà de trois, méfie-toi ;
- laisse le projet dans un **état cohérent** : ça compile, ça tourne ;
- se vérifie **par elle-même**, sans attendre les étapes suivantes.

Une étape trop grosse se reconnaît à ceci : tu n'arrives pas à dire ce que tu vérifierais à la fin. Découpe jusqu'à ce que la réponse devienne évidente.

## Ordonner par le risque, pas par la facilité

Mets **l'étape la plus incertaine en premier**. Si l'approche est mauvaise, tu veux le découvrir au bout de dix minutes, pas après avoir bâti trois étages dessus.

Commencer par le facile donne une fausse impression d'avancement et fait payer l'échec au prix fort.

## Nommer la vérification

Pour chaque étape, écris **comment tu sauras qu'elle est réussie** : une commande à lancer, un écran à regarder, un test, une valeur à lire. « Ça devrait marcher » n'est pas une vérification.

## Dire le résultat en clair

Le propriétaire de ce projet n'est pas développeur. Termine le plan par **une phrase sans jargon** décrivant ce qu'il verra changer à l'écran.

Si tu n'arrives pas à formuler de changement visible, demande-toi si la tâche vaut d'être faite maintenant.

## Sortie de phase

Une liste numérotée. Pour chaque étape : ce qu'elle fait, quels fichiers, comment on vérifie. Rien de plus.
