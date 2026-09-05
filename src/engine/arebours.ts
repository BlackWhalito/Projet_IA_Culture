import type { ARebourseContent } from '../types/game'

type Demande = ARebourseContent['demandes'][number]

/**
 * Le jugement d'une demande d'« À rebours ».
 *
 * Pur, donc testable sans navigateur — et c'est ici que vit la seule chose
 * qu'une erreur rendrait invisible à l'œil : un ordre faux accepté ressemble
 * exactement à un ordre juste accepté.
 */
export function memeOrdre(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((id, i) => id === b[i])
}

/**
 * La méprise nommée, s'il y en a une pour cet ordre-là.
 *
 * C'est ce qui distingue cette mécanique d'un simple « faux » : quand le
 * joueur récite au lieu de lire, on lui montre **ce qu'il vient de composer**
 * — le drapeau des premières années de la Révolution, celui de l'Irlande
 * devant la délégation ivoirienne. Un « raté » n'apprend rien ; une
 * conséquence nommée, si.
 */
export function mepriseDe(demande: Demande, ordre: readonly string[]): string | undefined {
  return demande.meprises?.find((m) => memeOrdre(m.ordre, ordre))?.texte
}

/**
 * La probabilité de tomber juste au hasard, pour vérifier qu'une demande
 * n'est pas gagnable en tapant sans lire.
 *
 * Le rack contient toute la suite, mais la demande n'en attend qu'une partie :
 * on tire donc `attendu.length` tuiles parmi `suite.length`, dans l'ordre.
 */
export function chanceAuHasard(contenu: ARebourseContent, demande: Demande): number {
  const n = contenu.suite.length
  const k = demande.attendu.length
  let arrangements = 1
  for (let i = 0; i < k; i++) arrangements *= n - i
  return 1 / arrangements
}
