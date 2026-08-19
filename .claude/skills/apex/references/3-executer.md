# Phase 3 — Exécuter

Objectif : dérouler le plan, une étape à la fois, sans jamais avancer sur du sable.

## Une étape, une vérification, puis la suivante

Fais l'étape N **entièrement**. Vérifie-la comme prévu au plan. Seulement ensuite, passe à N+1.

Enchaîner trois étapes puis tout tester d'un coup semble plus rapide : c'est faux. Quand ça casse, tu ne sais plus laquelle des trois est en cause, et tu paies en débogage ce que tu croyais gagner.

## La règle des deux échecs

Une étape qui échoue deux fois signale que le **plan** est faux, pas seulement le code. Arrête, retourne en Analyse, comprends pourquoi.

Le troisième correctif tenté à l'aveugle empile les dégâts.

## Quand le plan se révèle faux

Ça arrive, et ce n'est pas un échec — c'est de l'information. Dis-le explicitement, replanifie la partie concernée, reprends.

Ne continue jamais un plan que tu sais mauvais simplement parce qu'il est écrit.

## Capitaliser au moment où ça fait mal

Dès qu'un piège te coûte du temps — règle de lint obscure, comportement inattendu de l'outillage, faux positif — **écris-le dans la skill concernée tout de suite**, pas « plus tard ». Plus tard, tu auras oublié le détail qui fait gagner du temps.

C'est une règle permanente du projet, pas une option.

## Sortie de phase

Le changement est fait, chaque étape a été vérifiée individuellement. Tu n'as encore **rien** déclaré fini.
