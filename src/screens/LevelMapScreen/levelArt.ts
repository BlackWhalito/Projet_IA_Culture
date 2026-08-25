import type { PaintScene } from '../../components/watercolor/WatercolorScene'
import { versaillesScene } from './scenes'

/**
 * Le tableau qui illustre un niveau, indexé par `level.id`.
 *
 * Volontairement **hors de `src/content/`** et hors de `LevelDef` : un
 * tableau n'est pas une donnée pédagogique, c'est de l'habillage. Le mettre
 * dans le contenu mélangerait deux choses que ce projet garde séparées, et
 * obligerait à toucher aux types du contenu pour repeindre une image.
 *
 * Un niveau absent de ce registre s'affiche simplement sans tableau — la
 * carte reste complète pendant que les autres niveaux attendent le leur.
 */
export interface LevelArt {
  paint: PaintScene
  /** Graine du tirage : la même image à chaque rendu, pas de scintillement. */
  seed: number
  /** Ce que la peinture représente, pour un lecteur d'écran. */
  alt: string
}

export const LEVEL_ART: Record<string, LevelArt> = {
  // 1682 : l'année où la cour s'installe à Versailles.
  'cp-level-2': {
    paint: versaillesScene,
    seed: 1682,
    alt: "Le château de Versailles peint à l'aquarelle, vu depuis son jardin à la française : la longue façade et ses statues, les parterres qui se resserrent vers elle, un bassin et son jet d'eau au premier plan.",
  },
}
