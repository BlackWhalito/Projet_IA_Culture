import type { PaintScene } from '../../../components/watercolor/WatercolorScene'
import { lascauxScene } from './lascaux'

/**
 * L'œuvre peinte en fond des jeux d'un niveau, indexée par `level.id`.
 *
 * Registre distinct de `LEVEL_ART` (les vignettes de la carte) et pas une
 * simple propriété de plus : les deux images n'ont ni le même format, ni
 * la même contrainte, ni la même durée de vie à l'écran. Une vignette est
 * un petit paysage large qu'on regarde une seconde ; un fond est une
 * grande surface en portrait qu'on ne doit justement PAS regarder, sous
 * laquelle on joue plusieurs minutes.
 *
 * **La règle de choix** : le fond n'illustre pas le niveau, il en montre
 * une œuvre — quelque chose que l'époque ou le sujet du niveau a
 * réellement produit. C'est ce qui le distingue d'une seconde vignette
 * agrandie, et c'est ce qui lui donne quelque chose à apprendre au joueur
 * sans lui demander de lire quoi que ce soit.
 *
 * Un niveau absent du registre joue sans fond, exactement comme avant.
 */
export interface LevelBackdrop {
  paint: PaintScene
  seed: number
}

export const LEVEL_BACKDROP: Record<string, LevelBackdrop> = {
  // Niveau 1 · la Préhistoire, jouée à l'intérieur de ce que la
  // Préhistoire a peint.
  'cp-level-1': { paint: lascauxScene, seed: 17300 },
}
