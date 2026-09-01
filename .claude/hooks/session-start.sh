#!/bin/bash
# Hook SessionStart du projet Jeu Culture.
#
# Deux rôles, et un seul fichier parce qu'ils partagent le même déclencheur :
#
# 1. Installer les dépendances. Sans ça, une session distante démarre sans
#    `node_modules` : `npm run build`, `lint` et `test` échouent tous, et le
#    plus probable est qu'on ne s'en aperçoive pas avant d'avoir annoncé que
#    c'est fini.
# 2. Réinjecter les règles de méthode que le CLAUDE.md ne suffit pas à faire
#    appliquer. Le CLAUDE.md est bien chargé automatiquement ; les *skills*,
#    elles, ne le sont pas — seule leur description est visible, et une skill
#    qu'on n'invoque pas ne sert à rien. Ce rappel est exécuté par le harnais,
#    pas par le modèle : c'est le seul garde-fou qui ne dépende pas de sa
#    discipline.
#
# Sortie : stdout doit rester du JSON pur, donc tout le bruit d'installation
# part sur stderr.
set -euo pipefail

if [ ! -d "${CLAUDE_PROJECT_DIR:-.}/node_modules" ]; then
  (cd "${CLAUDE_PROJECT_DIR:-.}" && npm install --no-audit --no-fund) >&2 || true
fi

cat <<'JSON'
{
  "hookSpecificOutput": {
    "hookEventName": "SessionStart",
    "additionalContext": "Rappels de méthode — projet Jeu Culture (injectés par .claude/hooks/session-start.sh).\n\n1. Les skills ne sont PAS chargées automatiquement : tu ne vois que leur description. Il faut les INVOQUER (apex, aquarelle, pieges-du-projet, orchestration, nouvelle-mecanique, nouvelle-notion, audit-des-skills). Lire un SKILL.md avec cat ou sed n'équivaut pas à l'invoquer, et ça a déjà coûté une itération complète.\n\n2. Le propriétaire autorise les sous-agents sans demande explicite. Lance `verificateur` avant d'annoncer que quoi que ce soit est fini — c'est une règle du CLAUDE.md, pas une option.\n\n3. Travail visuel : n'annonce JAMAIS un rendu sans l'avoir regardé. Chromium et Playwright sont installés dans les sessions distantes ; la recette est dans la skill pieges-du-projet, section « Regarder un rendu ».\n\n4. Une erreur de lint, de build ou de console qui résiste plus de deux minutes : invoque pieges-du-projet AVANT de partir en débogage."
  }
}
JSON
