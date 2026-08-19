---
name: apex
description: Workflow d'implémentation en quatre phases — Analyser, Planifier, Exécuter, eXaminer. Charge une phase à la fois, explore en agents parallèles, valide son propre résultat, et peut lancer une revue adverse avant de conclure. À invoquer avant d'implémenter une fonctionnalité, de corriger un bug, ou pour tout changement qui mérite un déroulé reproductible plutôt qu'une édition à l'improviste.
---

# APEX

**A**nalyser → **P**lanifier → **E**xécuter → e**X**aminer.

Un changement raté vient presque toujours d'une phase sautée : on a codé avant d'avoir compris, ou on a déclaré fini sans avoir vérifié. APEX rend ces quatre phases obligatoires et explicites.

## Charger une phase à la fois

Ne lis pas les quatre fichiers d'un coup — ça sature le contexte et mélange les modes de pensée. Lis le fichier d'une phase **au moment où tu y entres**, applique-le, passe à la suivante.

| Phase | Fichier | Question à laquelle elle répond |
|---|---|---|
| Analyser | `references/1-analyser.md` | De quoi s'agit-il vraiment, et qu'est-ce qui existe déjà ? |
| Planifier | `references/2-planifier.md` | Quelles étapes, dans quel ordre, vérifiées comment ? |
| Exécuter | `references/3-executer.md` | Une étape à la fois, vérifiée avant la suivante |
| eXaminer | `references/4-examiner.md` | Est-ce que ça marche vraiment, et qu'est-ce qui pourrait casser ? |

## Régler l'intensité

APEX n'est pas à taille unique. Choisis avant de commencer, et annonce ton choix en une ligne :

- **Léger** — correction évidente, un fichier, risque nul. Analyser et Planifier tiennent en deux phrases. eXaminer reste obligatoire.
- **Standard** — la plupart des tâches. Les quatre phases, sans revue adverse.
- **Fort** — changement structurel, plusieurs mécaniques touchées, ou zone déjà cassée une fois. Les quatre phases **plus** la revue adverse.

## Les trois règles qui ne se négocient pas

1. **Une étape non vérifiable n'est pas une étape.** Si tu ne sais pas dire comment tu constateras sa réussite, elle est mal découpée.
2. **Deux échecs sur la même étape = retour en Analyse.** Un troisième correctif à l'aveugle empile les dégâts au lieu de les réduire.
3. **Toute friction rencontrée se range immédiatement dans une skill.** Règle permanente du projet : on ne redécouvre pas deux fois le même piège.
