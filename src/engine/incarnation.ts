import type { IncarnationContent } from '../types/game'

const JAUGE_MIN = 0
const JAUGE_MAX = 100

export function jaugesInitiales(jauges: IncarnationContent['jauges']): Record<string, number> {
  const etat: Record<string, number> = {}
  for (const jauge of jauges) {
    etat[jauge.id] = jauge.depart
  }
  return etat
}

export function appliquerEffets(jauges: Record<string, number>, effets: Record<string, number>): Record<string, number> {
  const suivant = { ...jauges }
  for (const [id, delta] of Object.entries(effets)) {
    const valeur = (suivant[id] ?? 0) + delta
    suivant[id] = Math.min(JAUGE_MAX, Math.max(JAUGE_MIN, valeur))
  }
  return suivant
}

/**
 * Premier épilogue dont toutes les conditions sont satisfaites par l'état final des
 * jauges. Sans correspondance, replie sur le dernier épilogue de la liste : un auteur
 * de contenu y place le dénouement par défaut, pour garantir qu'une partie arrive
 * toujours quelque part.
 */
export function resoudreEpilogue(
  jauges: Record<string, number>,
  epilogues: IncarnationContent['epilogues'],
): IncarnationContent['epilogues'][number] {
  const trouve = epilogues.find((epilogue) =>
    Object.entries(epilogue.condition).every(([id, [min, max]]) => {
      const valeur = jauges[id] ?? 0
      return valeur >= min && valeur <= max
    }),
  )
  return trouve ?? epilogues[epilogues.length - 1]
}
