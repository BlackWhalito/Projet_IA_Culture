---
name: audit-des-skills
description: Vérifie la santé du système de skills et d'agents — doublons, chevauchements, descriptions qui ne se déclenchent jamais, liens morts entre skills, contenu périmé, skills inutilisées, contradictions. À lancer après avoir ajouté deux ou trois skills, quand une skill n'a pas été invoquée alors qu'elle aurait dû l'être, ou avant d'attaquer une nouvelle phase de travail.
---

# Audit des skills

## Pourquoi cette skill existe

Le projet a une règle permanente : **toute friction rencontrée se range immédiatement dans une skill.** Excellente règle, mais elle fait mécaniquement grossir la bibliothèque. Sans contrepoids, on obtient au bout de quelques mois une collection où les skills se chevauchent, se contredisent, pointent vers des fichiers disparus, et surtout **ne se déclenchent plus au bon moment**.

Cette skill est ce contrepoids. Elle ne produit rien de neuf : elle remet le système d'aplomb.

**Ne la lance pas à chaque session** — c'est du gaspillage. Les bons moments :

- Deux ou trois skills ont été ajoutées depuis le dernier audit
- Une skill *aurait dû* être invoquée et ne l'a pas été
- Avant d'attaquer un nouveau jalon de la feuille de route
- Une skill a été renommée, scindée ou supprimée

## Étape 1 — L'inventaire

Commence par voir ce qui existe réellement, sans te fier à ta mémoire.

```bash
ls .claude/skills/*/SKILL.md .claude/agents/*.md
```

Puis lis toutes les descriptions d'un coup — c'est le seul texte qui décide du déclenchement, il mérite d'être vu en bloc :

```bash
for f in .claude/skills/*/SKILL.md .claude/agents/*.md; do echo "=== $f"; sed -n '2,5p' "$f"; done
```

Et la taille de chaque fichier, avec le verdict — ne te contente pas de lire des chiffres bruts, l'œil les laisse filer :

```bash
for f in .claude/skills/*/SKILL.md .claude/skills/*/references/*.md .claude/agents/*.md; do n=$(wc -l < "$f"); if [ "$n" -gt 250 ]; then echo "SURPOIDS  $n  $f"; elif [ "$n" -gt 150 ]; then echo "surveiller $n  $f"; fi; done; echo "(rien listé au-dessus = tout est dans les clous)"
```

## Étape 2 — Les huit défauts

### 1. Le doublon et le chevauchement

Deux skills qui couvrent le même terrain. Le chevauchement partiel est **pire** que le doublon franc : il crée une hésitation à chaque fois.

**Détection** — pour chaque paire de descriptions voisines, pose-toi la question : *« Pour la tâche X, laquelle j'invoque ? »* Toute hésitation est un chevauchement.

**Correction** — soit fusionner, soit tracer explicitement la frontière **dans les deux descriptions** (« celle-ci pour X ; pour Y, voir *l'autre* »). Une frontière implicite ne tient jamais.

### 2. La description qui ne déclenche pas

**Le défaut le plus fréquent et le plus coûteux.** La `description` est le seul texte lu au moment de décider si la skill se charge. Une description qui résume le *contenu* au lieu de nommer la *situation* rend la skill invisible : elle existe, elle est bonne, et elle ne sert jamais.

**Détection** — masque le nom et le corps, lis uniquement la description, et demande-toi : *« Dans quelle situation concrète est-ce que j'irais chercher ça ? »* Si la réponse n'est pas immédiate, la description est à refaire.

**Correction** — une bonne description nomme **quand** on s'en sert, pas ce qu'elle contient. Comparer :

- ✗ « Contient la palette, les filtres SVG et les règles de cohérence visuelle. »
- ✓ « À invoquer avant de dessiner ou de styler quoi que ce soit pour les petites classes. »

### 3. Le lien mort

Une skill qui renvoie vers une autre skill renommée ou supprimée, ou vers un fichier de référence absent.

Ne cherche pas les renvois par une formule figée du type « skill `nom` » : les skills sont citées de dix manières différentes, et un motif trop strict fabrique de faux orphelins. Cherche le **nom** partout, en excluant le dossier de la skill elle-même :

```bash
for d in .claude/skills/*/; do n=$(basename "$d"); echo "== $n"; grep -rl "$n" .claude/skills/ .claude/agents/ CLAUDE.md docs/ 2>/dev/null | grep -v "skills/$n/" | sed 's/^/   /'; done
```

Une skill citée par **zéro** fichier est inatteignable : rien ne guide vers elle. Vérifie aussi que chaque `references/*.md` mentionné dans un SKILL.md existe réellement.

### 4. La skill jamais invoquée

Elle existe, elle est propre, et personne ne l'appelle jamais. Deux causes possibles, deux traitements opposés :

- **Sa description ne déclenche pas** → la réécrire (défaut n° 2). C'est le cas le plus fréquent, et la skill est à garder.
- **Elle ne sert réellement à rien** → proposer sa suppression.

**Ne supprime jamais une skill de ta propre initiative.** Signale-la, explique pourquoi, laisse le propriétaire trancher.

### 5. La skill devenue obèse

**C'est le défaut qui coûte le plus cher sans jamais produire d'erreur visible.** Une skill trop longue ne casse rien : elle se charge, elle répond, tout semble normal. Ce qu'elle coûte réellement, c'est du contexte gâché à chaque invocation — moins de place pour le reste de la tâche, une lecture plus lente à traiter. La performance se dégrade en silence, jamais par un message d'erreur.

Trois seuils, pas un seul, et ils s'appliquent identiquement à un `SKILL.md`, à un fichier de `references/`, et à un agent :

- **Sous 150 lignes** — sain, rien à faire.
- **150 à 250 lignes** — à surveiller. Pas urgent, mais le prochain ajout de contenu doit être scindé plutôt qu'empilé.
- **Au-delà de 250 lignes** — surpoids réel. Corrige à cet audit-ci, ne reporte pas.

Ces seuils comptent les **lignes**, pas les octets ni les mots : c'est ce que `wc -l` mesure à l'étape 1, et c'est ce qui approxime le mieux le coût réel de lecture.

**Corriger un `SKILL.md` obèse** — scinder en `references/`, réduire le `SKILL.md` à un routeur qui dit quel fichier lire à quel moment, pas à un résumé de leur contenu. La skill `apex` est le modèle : un routeur de 35 lignes, quatre fichiers de phase chargés un par un, jamais tous ensemble.

**Corriger un fichier de `references/` lui-même obèse** — le symptôme est le même, mais scinder en sous-fichiers ne suffit pas toujours : demande-toi d'abord s'il essaie de couvrir plusieurs situations distinctes qui mériteraient chacune sa propre entrée, plutôt qu'une seule section qui grossit.

**Corriger un agent obèse** — même traitement qu'un `SKILL.md` : un agent n'a pas de mécanisme de `references/`, donc son fichier doit rester court par discipline d'écriture, pas par découpage. Vise la moitié du seuil skill (125 lignes) : un agent n'a pas de propriétaire pour relire son brief avant qu'il parte en tâche de fond, l'erreur s'y voit moins vite.

### 6. La contradiction

Deux skills qui donnent des consignes incompatibles. **Le défaut le plus dangereux, parce qu'il est silencieux** : on suit l'une des deux sans savoir que l'autre disait le contraire.

**Détection** — repère les sujets traités par plusieurs skills (le style, les tests, le découpage, la vérification) et lis ce que chacune en dit. Cherche particulièrement les règles absolues (« toujours », « jamais ») qui se croisent.

### 7. Le contenu périmé

Une skill qui nomme un fichier, une fonction ou un drapeau qui a changé depuis. Très réel ici : `pieges-du-projet` et `nouvelle-mecanique` citent des chemins précis.

```bash
grep -rhoE 'src/[a-zA-Z0-9/._-]+\.(ts|tsx|css|md)' .claude/skills/ .claude/agents/ CLAUDE.md | sort -u | while read -r p; do if [ -e "$p" ]; then echo "ok       $p"; else echo "MANQUANT $p"; fi; done
```

Vérifie aussi les noms de fonctions et de commandes cités, que ce script ne détecte pas.

> **Piège d'écriture, déjà rencontré :** ne mets pas de backtick dans un motif `grep` passé au shell — il sera interprété comme une substitution de commande et le motif ne trouvera silencieusement rien. Un audit qui ne remonte aucun problème parce que sa commande est cassée est pire qu'un audit non lancé. Ancre les motifs sur du texte ordinaire (`src/…`, le nom de la skill), jamais sur la ponctuation Markdown.

### 8. Le chevauchement avec CLAUDE.md

`CLAUDE.md` est chargé **en permanence** ; les skills, seulement au besoin. Tout ce qui est écrit dans les deux occupe du contexte en pure perte.

**Correction** — le détail va dans la skill, `CLAUDE.md` ne garde qu'un pointeur. La règle du projet est explicite : garder `CLAUDE.md` court.

## Étape 3 — Les agents aussi

Même grille, appliquée à `.claude/agents/` :

- Deux agents dont les missions se recouvrent → l'un des deux ne sera jamais choisi.
- Un agent dont la description ne dit pas **quand** le lancer ne sera jamais lancé.
- Un agent dont la liste `tools` est incohérente avec sa mission : un agent de revue qui peut écrire dans les fichiers finira par « corriger » au lieu de rapporter.

Vérifie aussi ce défaut mécanique, qui casse l'invocation sans erreur visible : **le `name:` du frontmatter doit être identique au nom du dossier** (pour une skill) ou du fichier (pour un agent).

```bash
for d in .claude/skills/*/; do n=$(basename "$d"); f=$(grep -m1 '^name:' "$d/SKILL.md" | sed 's/name: *//'); [ "$n" = "$f" ] || echo "DISCORDANCE: dossier=$n frontmatter=$f"; done
```

## Étape 4 — Corriger, et jusqu'où

**Corrige directement** — liens morts, chemins périmés, discordances de nom, descriptions à réécrire, découpage d'une skill obèse. Ce sont des réparations mécaniques, sans perte.

**Signale sans agir** — suppression d'une skill, fusion de deux skills, résolution d'une contradiction de fond. Ces décisions changent la manière de travailler : elles appartiennent au propriétaire du projet.

## Étape 5 — Le rapport

Court, en français, dans cet ordre de gravité :

**CASSÉ** — lien mort, chemin inexistant, discordance de nom. Corrigé directement, dis lequel et comment.
**INVISIBLE** — skill ou agent dont la description ne déclenchera jamais. Corrigé, avec l'avant/après.
**À TRANCHER** — chevauchement, contradiction, skill candidate à la suppression. Pas touché, question posée.
**SAIN** — le reste, en une ligne.

Termine par une phrase honnête sur l'état général du système. Si tout va bien, dis-le simplement — un audit qui invente des problèmes pour justifier son existence est pire qu'un audit non lancé.
