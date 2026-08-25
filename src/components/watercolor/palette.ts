/**
 * Les pigments du moteur.
 *
 * Ils vivent ici, et non dans un fichier de scène, depuis qu'il y a plus
 * d'une scène : recopier treize constantes de couleur d'un tableau à
 * l'autre les fait diverger à la première retouche, et deux tableaux dont
 * les violets ne coïncident plus ne se répondent plus.
 *
 * Ce sont les mêmes valeurs que les variables CSS de la skill `aquarelle`
 * (`src/styles/tokens.css`), redéclarées en JavaScript parce qu'un canvas
 * n'a pas accès aux variables du document — c'est une duplication assumée,
 * pas un oubli.
 */

export const BLEU = '#5a7fa0'
export const BLEU_CLAIR = '#8fb0c9'
export const TURQUOISE = '#4f9a92'
export const VIOLET = '#8d6aa8'
export const VIOLET_BRUME = '#c3b0d4'
export const VIOLET_PROFOND = '#5d4574'
export const OCRE = '#c1663f'
export const SABLE = '#d9a35f'
export const VERT = '#7a9455'
export const PAPIER = '#f7f2e7'
export const ENCRE_SOMBRE = '#241d2b'
export const PIERRE_CHAUDE = '#d8bd96'
export const PIERRE_PALE = '#e6d9c4'
