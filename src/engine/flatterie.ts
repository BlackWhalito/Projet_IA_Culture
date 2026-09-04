import type { FlatterieContent } from '../types/game'

type Replique = FlatterieContent['repliques'][number]

/**
 * « Maître Renard » — la mécanique de la flatterie.
 *
 * La logique vit ici plutôt que dans le composant parce qu'elle est **pure**,
 * et parce que c'est elle qui porte la leçon : l'ordre des compliments n'est
 * pas décoratif chez La Fontaine. Le renard commence par une chose vraie et
 * vérifiable — les plumes du corbeau *sont* luisantes —, il anoblit avant de
 * complimenter, puis il passe à l'invérifiable (la voix) sous une forme
 * conditionnelle qui ne l'engage à rien. Et **il ne demande jamais au corbeau
 * de chanter** : il crée le manque et laisse l'autre le combler.
 *
 * Une réplique dite trop tôt ne produit donc pas son effet : « si votre ramage
 * se rapporte à votre plumage » ne veut rien dire tant qu'on n'a pas parlé du
 * plumage, et le corbeau se demande d'où sort cette histoire de voix. C'est ce
 * décrochage que le joueur doit sentir, et il ne se sent qu'en le provoquant.
 */
export interface EtatFlatterie {
  vanite: number
  mefiance: number
  dites: string[]
}

export type Issue = 'en-cours' | 'pret' | 'perdu'

export const PLEIN = 100

function borner(v: number): number {
  return Math.min(PLEIN, Math.max(0, v))
}

/** Une réplique conditionnelle dite avant sa condition retombe à plat. */
export function estPrecoce(replique: Replique, dites: readonly string[]): boolean {
  return (replique.exige ?? []).some((id) => !dites.includes(id))
}

export function effetDe(
  replique: Replique,
  dites: readonly string[],
): { vanite: number; mefiance: number; reaction: string } {
  if (estPrecoce(replique, dites) && replique.siPrecoce) {
    return replique.siPrecoce
  }
  return { vanite: replique.vanite, mefiance: replique.mefiance, reaction: replique.reaction }
}

export function dire(etat: EtatFlatterie, replique: Replique): EtatFlatterie {
  const effet = effetDe(replique, etat.dites)
  return {
    vanite: borner(etat.vanite + effet.vanite),
    mefiance: borner(etat.mefiance + effet.mefiance),
    dites: [...etat.dites, replique.id],
  }
}

/**
 * Où en est la scène ?
 *
 * La méfiance pleine passe **avant** la vanité pleine : un corbeau qui a flairé
 * le piège s'envole, même flatté. C'est ce qui empêche de gagner en récitant
 * tous les compliments à la suite sans se soucier de l'ordre.
 */
export function issue(etat: EtatFlatterie): Issue {
  if (etat.mefiance >= PLEIN) return 'perdu'
  if (etat.vanite >= PLEIN) return 'pret'
  return 'en-cours'
}

/** Plus une seule réplique à dire, et le bec toujours fermé : il s'envole. */
export function aCourtDeMots(contenu: FlatterieContent, etat: EtatFlatterie): boolean {
  return issue(etat) === 'en-cours' && etat.dites.length >= contenu.repliques.length
}
