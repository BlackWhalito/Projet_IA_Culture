import type { TelegrammeContent } from '../types/game'

type Message = TelegrammeContent['messages'][number]

/**
 * Ce que le guichet répond quand on expédie.
 *
 * La logique vit ici plutôt que dans le composant parce qu'elle est **pure** :
 * elle se teste sans navigateur, et c'est la seule partie de la mécanique où
 * une erreur serait invisible à l'œil — un message accepté alors qu'il ne
 * devrait pas l'être ressemble exactement à un message accepté à raison.
 */
export interface Verdict {
  recu: boolean
  /** Ce que le destinataire fait. Jamais « faux » : une scène. */
  scene: string
}

/** Le compte facturé : les mots gardés, plus chaque STOP posé. */
export function compterMots(message: Message, barres: readonly number[], stops: readonly number[]): number {
  return message.mots.length - barres.length + stops.length
}

/**
 * Le télégramme part-il juste ?
 *
 * Quatre causes d'échec, dans cet ordre :
 *
 * 0. la dépêche coûte plus que le tarif ;
 * 1. un mot porteur a été sacrifié ;
 * 2. un STOP a été posé là où il inverse le sens ;
 * 3. une frontière entre deux ordres n'a pas été marquée.
 *
 * Le STOP fautif passe **avant** le STOP manquant, et ce n'est pas un détail :
 * poser le STOP au mauvais endroit, c'est à la fois en poser un de trop et en
 * omettre un. Répondre « il manquait un STOP » à quelqu'un qui vient d'en
 * poser un serait un mensonge, et il chercherait au mauvais endroit.
 *
 * Le budget est vérifié ici **aussi**, alors que le bouton « Expédier » reste
 * déjà éteint tant qu'il est dépassé. Ce n'est pas une ceinture de sécurité
 * décorative : à l'expiration de l'horloge, la dépêche part telle quelle,
 * sans passer par le bouton. Sans ce contrôle, la manche se gagnait en ne
 * touchant à rien et en laissant filer le temps — le message du client était
 * intact, donc juste, et personne ne payait le dépassement.
 */
export function evaluerMessage(
  message: Message,
  barres: readonly number[],
  stops: readonly number[],
): Verdict {
  const cout = compterMots(message, barres, stops)
  if (cout > message.budget) {
    return {
      recu: false,
      scene:
        `L’employé compte : ${cout} mots pour un tarif de ${message.budget}. ` +
        'Le client n’a pas de quoi. La dépêche reste sur le comptoir, et personne ne part.',
    }
  }

  const sacrifie = message.porteurs.find((p) => barres.includes(p.index))
  if (sacrifie) return { recu: false, scene: sacrifie.scene }

  const attendus = message.stops.map((s) => s.apres)
  const fautif = (message.stopsFautifs ?? []).find(
    (s) => stops.includes(s.apres) && !attendus.includes(s.apres),
  )
  if (fautif) return { recu: false, scene: fautif.scene }

  const manquant = message.stops.find((s) => !stops.includes(s.apres))
  if (manquant) return { recu: false, scene: manquant.sansLui }

  return { recu: true, scene: message.reception }
}
