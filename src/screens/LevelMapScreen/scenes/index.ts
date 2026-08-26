/**
 * Les tableaux des niveaux. Un fichier par tableau, un tableau par niveau.
 *
 * Contrainte qui gouverne tous ces fichiers : ils s'affichent à environ
 * 200 px de large sur un téléphone. Ce ne sont donc pas des scènes
 * détaillées qu'on réduirait, mais des compositions pensées d'emblée en
 * **silhouettes larges et contrastées** — le piège n° 1 du moteur est de
 * juger une image à sa résolution interne et de la découvrir illisible à
 * sa taille réelle.
 *
 * Ils partagent une seule lumière (`lumiere.ts`) et une seule palette
 * (`components/watercolor/palette.ts`) : c'est ce qui les fait tenir
 * ensemble comme une collection malgré huit sujets, huit heures du jour et
 * huit ambiances différentes.
 */
export { prehistoireScene } from './prehistoire'
export { chateauFortScene } from './chateauFort'
export { saisonsScene } from './saisons'
export { versaillesScene } from './versailles'
export { papillonScene } from './papillon'
export { caravelleScene } from './caravelle'
export { parisScene } from './paris'
export { fableScene } from './fable'
