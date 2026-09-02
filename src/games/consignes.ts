import type { GameTypeId } from '../types/content'

/**
 * Le cadre narratif de chaque mécanique — la couche qui ne change jamais.
 *
 * Constat de l'audit : **aucun jeu ne disait ce qu'il fallait faire.** On
 * arrivait devant dix boutons en deux colonnes sans savoir qu'il fallait
 * apparier, devant un rectangle gris sans savoir qu'un mot allait tomber. Pour
 * un adulte qui joue une fois, c'est une barrière à l'entrée ; et pour
 * l'immersion, c'est un composant nu au lieu d'un lieu.
 *
 * Deux couches, pour ne pas payer la fiction quarante fois :
 *
 * - **ici**, ce qui appartient à la mécanique et vaut pour toutes ses notions ;
 * - dans le contenu (`consigne`), ce qui change d'une notion à l'autre.
 *
 * Une notion nouvelle n'écrit donc qu'une phrase, et la fiction reste
 * cohérente d'un niveau à l'autre. Le ton est celui d'un narrateur qui pose un
 * décor, pas d'un manuel qui explique une règle.
 */
export const FICTIONS: Record<GameTypeId, string> = {
  riviere: 'Le fleuve charrie des mots. Deux rives, un courant — et il ne repasse pas.',
  capsur: 'Le brouillard se referme sur la carte. Trouve avant qu’il ne recouvre tout.',
  match: 'Deux colonnes, une seule bonne façon de les relier.',
  timeline: 'Le temps se remet en place une carte à la fois. Une carte hors tour te revient.',
  qcm: 'Une question, trois pistes. Une seule tient debout.',
  chaine: 'Chaque phrase te rapporte le double — ou te ruine. Tu peux partir quand tu veux.',
  fildesjours: 'Une journée, des choix, et des forces qui se nourrissent rarement l’une l’autre.',
}
