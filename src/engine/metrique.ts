/**
 * Le compte des pieds d'un vers français.
 *
 * C'est le cœur du jeu « Douze pieds », et il vit ici plutôt que dans le
 * composant parce que c'est une fonction **pure** : elle se teste sans
 * navigateur, et c'est la seule partie de cette mécanique où une erreur serait
 * invisible à l'œil.
 *
 * ## La règle que le jeu enseigne
 *
 * Un e final ne se compte pas toujours. Devant une consonne il vaut une
 * syllabe, devant une voyelle il **s'élide** et n'en vaut aucune, et en fin de
 * vers il ne compte jamais.
 *
 *     Je ne puis / de-meu-re / loin de toi / plus long-temps
 *          3    +     3     +      3      +      3        = 12
 *
 * Mais « demeure » suivi de « à jamais » ne vaut que 2 : le e tombe. C'est
 * exactement ce qu'un adulte a oublié, et c'est pourquoi les vers sonnent faux
 * quand on les lit comme on parle. La règle ne se constate qu'**en
 * assemblant** — elle dépend du mot suivant. Aucun QCM ne peut l'enseigner ;
 * ici le peigne se recalcule sous les doigts du joueur.
 */

export interface Tuile {
  mot: string
  /** Nombre de pieds du groupe, e final compris. */
  pieds: number
  /**
   * Le groupe se termine par un e muet. Il perd alors un pied devant une
   * voyelle ou un h muet, et un pied en fin de vers.
   */
  eFinal?: boolean
}

/** Voyelles qui provoquent l'élision du e final précédent. */
const VOYELLES = 'aàâeéèêëiîïoôöuùûüyAÀÂEÉÈÊËIÎÏOÔÖUÙÛÜY'

/**
 * Le h muet élide comme une voyelle, le h aspiré non — « de houx » et jamais
 * « d'houx », mais « d'honneur » et jamais « de honneur ». La distinction ne
 * s'entend pas et ne se devine pas : elle s'apprend mot par mot.
 *
 * On liste donc les mots aspirés, et tout autre h est traité comme muet : c'est
 * le cas de loin le plus fréquent (homme, heure, honneur, histoire…). Une
 * première version listait des PRÉFIXES — « ho », « hi », « hu » — et classait
 * du coup « homme », « honneur » et « heure » parmi les aspirés, silencieusement.
 *
 * Un mot aspiré absent de cette liste serait mal compté. Le filet est dans
 * `contentIntegrity.test.ts` : le vers réel de chaque quatrain doit s'assembler
 * à partir de sa réserve, ce qui échoue dès qu'une élision est mal jugée.
 */
const H_ASPIRE = new Set([
  'hache', 'haie', 'haine', 'hair', 'haïr', 'halte', 'hameau', 'hanche', 'hangar',
  'hardi', 'harde', 'hargne', 'haricot', 'harpe', 'hasard', 'hâte', 'haut', 'haute',
  'hauteur', 'havre', 'hérisson', 'héros', 'hibou', 'hideux', 'hiérarchie', 'homard',
  'honte', 'honteux', 'hoquet', 'hors', 'houle', 'housse', 'houx', 'hublot', 'huche',
  'huit', 'hurler', 'hurlement', 'hutte',
])

function commenceParVoyelle(mot: string): boolean {
  const premier = mot.trimStart()[0]
  if (!premier) return false
  if (VOYELLES.includes(premier)) return true
  if (premier !== 'h' && premier !== 'H') return false
  const premierMot = mot.trim().toLowerCase().split(/[\s’']/)[0].replace(/[.,;:!?]/g, '')
  return !H_ASPIRE.has(premierMot)
}

/**
 * Compte les pieds d'un vers en cours d'assemblage.
 *
 * Le calcul dépend de l'ordre : retirer ou ajouter un mot recalcule tout le
 * vers, y compris les pieds des mots qui le précèdent. C'est voulu — c'est la
 * démonstration.
 */
export function compterPieds(tuiles: readonly Tuile[]): number {
  let total = 0
  for (let i = 0; i < tuiles.length; i++) {
    const tuile = tuiles[i]
    total += tuile.pieds
    if (!tuile.eFinal) continue

    const suivante = tuiles[i + 1]
    // En fin de vers, le e muet ne compte jamais.
    if (!suivante) {
      total -= 1
      continue
    }
    // Devant une voyelle ou un h muet, il s'élide.
    if (commenceParVoyelle(suivante.mot)) total -= 1
  }
  return total
}

/**
 * Le vers est-il recevable ?
 *
 * Deux conditions, et le jeu n'en accepte pas une seule : le compte exact, et
 * la rime. Un vers de douze pieds qui ne rime pas n'est pas un vers d'un
 * quatrain — c'est une phrase de douze pieds.
 */
export function versRecevable(
  tuiles: readonly Tuile[],
  piedsCible: number,
  rimeCle: string,
  rimeDe: (tuile: Tuile) => string | undefined,
): boolean {
  if (tuiles.length === 0) return false
  if (compterPieds(tuiles) !== piedsCible) return false
  return rimeDe(tuiles[tuiles.length - 1]) === rimeCle
}
