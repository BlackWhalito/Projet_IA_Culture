import { BLEU, ENCRE_SOMBRE, SABLE, VIOLET_PROFOND } from '../../../components/watercolor/palette'
import type { LightPlan } from '../../../components/watercolor/light'

/**
 * La lumière des tableaux de niveaux : la même que celle de l'accueil
 * (`src/screens/HomeScreen/scenes.ts`), venue de la gauche et chaude, pour
 * que toute l'application reste éclairée par un seul soleil.
 *
 * Elle est partagée par les huit tableaux. C'est la décision qui les fait
 * tenir ensemble malgré des sujets, des palettes et des heures du jour
 * complètement différents — un joueur qui fait défiler la carte doit voir
 * une collection, pas huit images sans rapport.
 */
export const LUMIERE: LightPlan = {
  angleDeg: 200,
  warm: SABLE,
  cool: VIOLET_PROFOND,
  accent: ENCRE_SOMBRE,
}

/**
 * L'ombre des feuillages, seule exception au violet qui porte toutes les
 * ombres du projet. Ce n'est pas un caprice : en `multiply`, le prune de
 * `VIOLET_PROFOND` posé sur du vert donne un BRUN — des ifs entiers
 * viraient au marron pendant que leurs voisins restaient verts, selon la
 * part du cône que l'ombre couvrait. Un bleu ardoise reste une ombre
 * colorée (la règle est « jamais du gris », pas « toujours du violet ») et
 * garde le feuillage vert.
 */
export const OMBRE_FEUILLAGE = BLEU
