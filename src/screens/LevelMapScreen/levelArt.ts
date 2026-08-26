import type { PaintScene } from '../../components/watercolor/WatercolorScene'
import {
  caravelleScene,
  chateauFortScene,
  fableScene,
  papillonScene,
  parisScene,
  prehistoireScene,
  saisonsScene,
  versaillesScene,
} from './scenes'

/**
 * Le tableau qui illustre un niveau, indexé par `level.id`.
 *
 * Volontairement **hors de `src/content/`** et hors de `LevelDef` : un
 * tableau n'est pas une donnée pédagogique, c'est de l'habillage. Le mettre
 * dans le contenu mélangerait deux choses que ce projet garde séparées, et
 * obligerait à toucher aux types du contenu pour repeindre une image.
 *
 * Un niveau absent de ce registre s'affiche simplement sans tableau — la
 * carte reste complète pendant que le niveau attend le sien.
 *
 * **Chaque sujet est tiré d'une notion réellement jouée dans son niveau.**
 * C'est la seule règle de choix, et elle n'est pas décorative : un joueur
 * qui reconnaît sur la carte ce qu'il vient d'apprendre relie les deux tout
 * seul. Un tableau choisi pour sa beauté seule ne ferait pas ce travail.
 */
export interface LevelArt {
  paint: PaintScene
  /** Graine du tirage : la même image à chaque rendu, pas de scintillement. */
  seed: number
  /** Ce que la peinture représente, pour un lecteur d'écran. */
  alt: string
}

export const LEVEL_ART: Record<string, LevelArt> = {
  // Niveau 1 · la Préhistoire.
  'cp-level-1': {
    seed: 3301,
    paint: prehistoireScene,
    alt: "Un campement préhistorique peint à l'aquarelle, au crépuscule : un abri sous roche, un feu autour duquel deux silhouettes sont assises, et des mammouths qui traversent la plaine à l'horizon.",
  },
  // Niveau 2 · les châteaux forts et les chevaliers.
  'cp-level-2': {
    seed: 1214,
    paint: chateauFortScene,
    alt: "Un château fort peint à l'aquarelle, dressé sur son rocher au-dessus d'une douve : donjon crénelé, tours à toits pointus, pont-levis abaissé, et deux chevaliers en armure qui s'en approchent au premier plan.",
  },
  // Niveau 3 · les quatre saisons.
  'cp-level-3': {
    seed: 1725,
    paint: saisonsScene,
    alt: "Quatre panneaux peints à l'aquarelle montrant le même arbre au fil des saisons : en fleurs au printemps, en pleine feuille l'été, roux en automne, nu sur la neige en hiver.",
  },
  // Niveau 4 · Louis XIV. 1682 : l'année où la cour s'installe à Versailles.
  'cp-level-4': {
    seed: 1682,
    paint: versaillesScene,
    alt: "Le château de Versailles peint à l'aquarelle, vu depuis son jardin à la française : la longue façade et ses statues, les parterres qui se resserrent vers elle, un bassin et son jet d'eau au premier plan.",
  },
  // Niveau 5 · le cycle du papillon.
  'cp-level-5': {
    seed: 4408,
    paint: papillonScene,
    alt: "Une prairie d'été peinte à l'aquarelle où le cycle du papillon se lit de bas en haut : une chenille sur une feuille, une chrysalide suspendue au-dessus d'elle, et un grand papillon aux ailes ouvertes en vol.",
  },
  // Niveau 6 · Christophe Colomb et les points cardinaux. 1492.
  'cp-level-6': {
    seed: 1492,
    paint: caravelleScene,
    alt: "Une caravelle peinte à l'aquarelle, seule au large à l'aube, voiles carrées gonflées, avec une rose des vents dessinée dans le ciel comme sur une carte marine.",
  },
  // Niveau 7 · la tour Eiffel et les monuments. 1889.
  'cp-level-7': {
    seed: 1889,
    paint: parisScene,
    alt: "Paris peint à l'aquarelle au crépuscule : la tour Eiffel en silhouette au-dessus de la Seine, les toits de zinc et les arbres du quai, une péniche sur le fleuve.",
  },
  // Niveau 8 · Le Corbeau et le Renard.
  'cp-level-8': {
    seed: 1668,
    paint: fableScene,
    alt: "Le Corbeau et le Renard peints à l'aquarelle dans un sous-bois d'automne : le corbeau perché sur une branche, un morceau de fromage dans le bec, et le renard assis en dessous qui lève le museau vers lui.",
  },
}
