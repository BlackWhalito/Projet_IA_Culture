#!/bin/bash
# Prépare une session Claude Code sur le web : sans ça, `npm run test`, `npm run lint`
# et `npm run build` échouent tous les trois sur « vitest: not found », parce que le
# conteneur démarre avec un dépôt fraîchement cloné et aucun node_modules.
#
# Ne fait rien en local : la machine du propriétaire a déjà ses dépendances, et une
# réinstallation à chaque ouverture de session ne lui apporterait que de l'attente.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-$(dirname "$0")/../..}"

# `npm install` plutôt que `npm ci` : l'état du conteneur est mis en cache après le
# hook, et `install` sait repartir d'un node_modules déjà présent là où `ci` le
# supprime et réinstalle tout à chaque fois.
npm install --no-audit --no-fund
