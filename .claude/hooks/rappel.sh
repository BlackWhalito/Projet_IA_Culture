#!/bin/bash
# Hook UserPromptSubmit — le contrepoids à la dilution.
#
# Le hook SessionStart parle une fois, au démarrage. Sur une session longue,
# ce qui a été lu tôt perd du poids face à ce qui vient d'arriver : c'est
# exactement comme ça que la règle des lavis en couches, lue au 3e message,
# a été violée au 15e.
#
# Celui-ci parle à chaque tour. Il doit donc rester très court — trois lignes,
# pas trente : un rappel qui coûte du contexte à chaque message devient
# lui-même le problème qu'il prétend résoudre.
set -euo pipefail

cat <<'JSON'
{
  "hookSpecificOutput": {
    "hookEventName": "UserPromptSubmit",
    "additionalContext": "Rappel permanent (Jeu Culture) : 1. Une skill se CHARGE par l'outil Skill ; la lire avec cat ne compte pas. 2. Ne jamais annoncer un rendu visuel sans l'avoir regardé dans un navigateur. 3. En rendant la main : si une friction a coûté du temps, corriger la skill ou le brief d'agent dans la foulée — c'est une case de la liste, pas un acte d'initiative. Mais jamais modifier pour modifier : sans gain réel et nommable, on ne touche à rien. Une skill qui grossit de retouches cosmétiques coûte du contexte à chaque invocation."
  }
}
JSON
