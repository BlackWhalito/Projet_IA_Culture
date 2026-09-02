import { contexteActif, estActif, reverb } from './audio'

/**
 * Les ambiances musicales, une par niveau — entièrement synthétisées, comme
 * les bruitages : aucun fichier audio dans le projet.
 *
 * Le besoin vient du propriétaire, après avoir joué : « on se fait chier sans
 * musique ». Ce n'est pas de la décoration, c'est ce qui fait qu'une partie
 * dure trois minutes au lieu de trente secondes.
 *
 * ## Ce qu'une ambiance doit être ici
 *
 * Une nappe qu'on peut écouter vingt fois sans la détester. Concrètement :
 *
 * - **très en dessous des bruitages** (`VOLUME_MUSIQUE` vaut un cinquième du
 *   volume des sons) — la musique ne doit jamais couvrir un « juste » ou un
 *   « faux », qui portent l'information ;
 * - **modale, pas tonale** : chaque niveau a son mode, ce qui lui donne une
 *   couleur reconnaissable sans avoir besoin d'une mélodie qu'on retiendrait —
 *   et une mélodie qu'on retient est une mélodie qui lasse ;
 * - **asymétrique** : la basse, les accords et la voix mélodique n'ont pas la
 *   même longueur de cycle, si bien que la combinaison ne se répète vraiment
 *   qu'au bout de plusieurs minutes. C'est le procédé le moins coûteux pour
 *   qu'une boucle courte ne s'entende pas comme une boucle.
 *
 * ## Le lien avec le niveau
 *
 * Chaque niveau a une dominante, tirée de ce que ses cinq notions racontent, et
 * l'ambiance la traduit en mode, en tempo et en timbre. La progression des huit
 * dessine un arc : on part du grave et du rare (les origines), on passe par
 * l'eau, les saisons, la cour, la découverte, le voyage, le rythme des jours,
 * pour finir sur la fable et la révolte.
 */

export interface Ambiance {
  /** Ce que le niveau raconte, et pourquoi cette couleur musicale. */
  intention: string
  /** Fondamentale du mode, en Hertz. */
  tonique: number
  /**
   * Le mode, en demi-tons depuis la tonique. C'est lui qui donne sa couleur au
   * niveau : un mode mineur mélodique ne raconte pas la même chose qu'un mode
   * lydien, même joué sur les mêmes instruments.
   */
  mode: number[]
  /** Durée d'un temps, en secondes. Un « tempo » très lent, contemplatif. */
  temps: number
  /** Timbre de la nappe d'accords. */
  timbrePad: OscillatorType
  /** Timbre de la voix mélodique. */
  timbreVoix: OscillatorType
  /** Degrés du mode joués par la basse, un par cycle. */
  basse: number[]
  /** Degrés de la nappe : chaque entrée est un accord, joué un cycle durant. */
  accords: number[][]
  /**
   * La voix mélodique, en degrés du mode. `null` = un silence, et les silences
   * comptent autant que les notes : c'est ce qui empêche la nappe de devenir
   * un tapis continu.
   */
  voix: (number | null)[]
}

/**
 * Les huit ambiances du CP.
 *
 * Les degrés sont des indices dans `mode`, et peuvent dépasser sa longueur :
 * `7` sur un mode de 7 notes désigne la tonique à l'octave. C'est ce qui permet
 * d'écrire des lignes qui montent sans recopier les fréquences.
 */
export const AMBIANCES: Record<string, Ambiance> = {
  'cp-level-1': {
    intention:
      "Les origines. Préhistoire, premiers repères, premiers sons de la langue : " +
      'un mode pentatonique sans demi-ton, le plus ancien et le plus universel, ' +
      'sur une basse qui ne bouge presque pas.',
    tonique: 130.81, // do2
    mode: [0, 3, 5, 7, 10],
    temps: 1.6,
    timbrePad: 'sine',
    timbreVoix: 'triangle',
    basse: [0, 0, 3, 0],
    accords: [
      [0, 3, 7],
      [0, 3, 7],
      [3, 7, 10],
      [0, 3, 7],
    ],
    voix: [7, null, 5, null, null, 3, null, 5, null, null, null, 7, null, null],
  },

  'cp-level-2': {
    intention:
      "L'eau et la pierre. Océans, états de l'eau, châteaux, paysages : un mode " +
      'dorien, qui coule sans jamais se résoudre tout à fait.',
    tonique: 146.83, // ré2
    mode: [0, 2, 3, 5, 7, 9, 10],
    temps: 1.45,
    timbrePad: 'sine',
    timbreVoix: 'sine',
    basse: [0, 0, 5, 3],
    accords: [
      [0, 3, 7],
      [0, 3, 7, 10],
      [5, 9, 12],
      [3, 7, 10],
    ],
    voix: [null, 4, 5, null, 7, null, null, 5, 4, null, null, 2, null, null, 0, null],
  },

  'cp-level-3': {
    intention:
      'Les saisons et le vivant. Un mode majeur simple, mais joué très lentement : ' +
      'la lumière sans la joliesse, comme un jardin regardé longtemps.',
    tonique: 164.81, // mi2
    mode: [0, 2, 4, 5, 7, 9, 11],
    temps: 1.7,
    timbrePad: 'triangle',
    timbreVoix: 'sine',
    basse: [0, 5, 3, 4],
    accords: [
      [0, 4, 7],
      [5, 9, 12],
      [3, 7, 10],
      [4, 7, 11],
    ],
    voix: [4, null, null, 2, 4, null, 7, null, null, null, 5, 4, null, null, 2, null, null, null],
  },

  'cp-level-4': {
    intention:
      'La cour et les contes. Louis XIV, Cendrillon, le fuseau : une basse de danse ' +
      "à trois temps et un mode mineur harmonique, dont la sixte augmentée sonne " +
      'exactement comme le baroque de mauvais rêve que Versailles était aussi.',
    tonique: 110, // la1
    mode: [0, 2, 3, 5, 7, 8, 11],
    temps: 1.1,
    timbrePad: 'triangle',
    timbreVoix: 'square',
    basse: [0, 0, 5, 5, 3, 3],
    accords: [
      [0, 3, 7],
      [0, 3, 7],
      [7, 11, 14],
      [7, 11, 14],
      [3, 7, 10],
      [5, 8, 12],
    ],
    voix: [7, null, 6, 7, null, null, 4, null, null, 3, null, 2, null, null, 0, null],
  },

  'cp-level-5': {
    intention:
      'La découverte. Inventions, continents, métamorphose : un mode lydien, dont ' +
      'la quarte augmentée donne cette impression de porte qui vient de s’ouvrir.',
    tonique: 174.61, // fa2
    mode: [0, 2, 4, 6, 7, 9, 11],
    temps: 1.25,
    timbrePad: 'sine',
    timbreVoix: 'triangle',
    basse: [0, 0, 4, 2],
    accords: [
      [0, 4, 7],
      [0, 4, 7, 11],
      [4, 7, 11],
      [2, 6, 9],
    ],
    voix: [0, null, 2, 4, null, 6, null, null, 7, null, null, 4, null, 2, null, null],
  },

  'cp-level-6': {
    intention:
      "Le voyage. Points cardinaux, Colomb, pays voisins : un mode mixolydien et " +
      'une basse qui alterne comme un roulis, deux temps forts pour deux bords ' +
      'de coque.',
    tonique: 130.81, // do2
    mode: [0, 2, 4, 5, 7, 9, 10],
    temps: 1.35,
    timbrePad: 'triangle',
    timbreVoix: 'sine',
    basse: [0, 6, 0, 4],
    accords: [
      [0, 4, 7],
      [6, 10, 13],
      [0, 4, 7],
      [4, 7, 11],
    ],
    voix: [null, 7, null, 6, null, 4, null, null, 2, 4, null, null, 0, null, null, null, 7, null],
  },

  'cp-level-7': {
    intention:
      'Le rythme des jours. Jour et nuit, jours de la semaine, rimes : la seule ' +
      "ambiance à pulsation régulière, sept accords pour sept jours, et une basse " +
      'qui revient toujours au même point.',
    tonique: 196, // sol2
    mode: [0, 2, 3, 5, 7, 8, 10],
    temps: 0.95,
    timbrePad: 'sine',
    timbreVoix: 'triangle',
    basse: [0, 0, 0, 3, 0, 0, 5],
    accords: [
      [0, 3, 7],
      [0, 3, 7],
      [2, 5, 9],
      [3, 7, 10],
      [0, 3, 7],
      [5, 8, 12],
      [4, 7, 10],
    ],
    voix: [0, null, 3, null, 2, null, null, 3, null, 5, null, null, 3, null, 0, null],
  },

  'cp-level-8': {
    intention:
      'La fable et la révolte. Le corbeau, la Révolution, le squelette : mode ' +
      'phrygien, la seconde mineure qui gratte, et le tempo le plus vif des huit. ' +
      'Le dernier niveau doit sonner comme quelque chose qui se prépare.',
    tonique: 123.47, // si1
    mode: [0, 1, 4, 5, 7, 8, 10],
    temps: 0.9,
    timbrePad: 'triangle',
    timbreVoix: 'square',
    basse: [0, 0, 1, 0, 5, 4],
    accords: [
      [0, 4, 7],
      [0, 4, 7],
      [1, 5, 8],
      [0, 4, 7],
      [5, 8, 12],
      [4, 7, 10],
    ],
    voix: [0, null, 1, null, 0, null, null, 4, null, null, 5, 4, null, 1, null, 0, null, null],
  },
}

/**
 * Volume de la musique, appliqué à toute l'ambiance.
 *
 * Très bas, et c'est délibéré : les bruitages culminent autour de 0,15 après
 * leur propre volume général. Une nappe d'ambiance qui les concurrence rend le
 * jeu illisible — on n'entend plus si l'on a eu juste.
 */
const VOLUME_MUSIQUE = 0.09
/** On programme les notes par tranches, un peu en avance sur l'horloge audio. */
const HORIZON_SEC = 4
const PERIODE_REPROGRAMMATION_MS = 2000

/** Convertit un degré du mode en fréquence, en montant d'octave si besoin. */
export function frequenceDuDegre(ambiance: Ambiance, degre: number): number {
  const taille = ambiance.mode.length
  const octave = Math.floor(degre / taille)
  const dansLeMode = ((degre % taille) + taille) % taille
  const demiTons = ambiance.mode[dansLeMode] + 12 * octave
  return ambiance.tonique * 2 ** (demiTons / 12)
}

interface Lecture {
  ambiance: Ambiance
  /** Prochain temps à programmer, en secondes de l'horloge audio. */
  prochainTemps: number
  /** Index courant dans chaque ligne — elles avancent indépendamment. */
  curseurs: { basse: number; accords: number; voix: number }
  minuteur: number | null
  sortie: GainNode | null
}

let lecture: Lecture | null = null

function jouerNote(
  ctx: AudioContext,
  sortie: GainNode,
  freq: number,
  debut: number,
  duree: number,
  type: OscillatorType,
  gain: number,
) {
  const osc = ctx.createOscillator()
  osc.type = type
  osc.frequency.setValueAtTime(freq, debut)

  // Attaque et extinction longues : une nappe ne doit jamais claquer.
  const env = ctx.createGain()
  env.gain.setValueAtTime(0.0001, debut)
  env.gain.exponentialRampToValueAtTime(Math.max(gain, 0.0002), debut + duree * 0.35)
  env.gain.exponentialRampToValueAtTime(0.0001, debut + duree)

  osc.connect(env)
  env.connect(sortie)
  osc.start(debut)
  osc.stop(debut + duree + 0.05)
}

/**
 * Programme tout ce qui tombe dans l'horizon, puis se rappelle plus tard.
 *
 * On ne joue pas note à note depuis un `setInterval` : l'horloge de JavaScript
 * dérive et fait boiter le tempo. On programme à l'avance sur l'horloge audio,
 * qui est échantillonnée et n'a aucune dérive, et le minuteur ne sert qu'à
 * revenir programmer la tranche suivante.
 */
function programmer() {
  if (!lecture) return
  const ctx = contexteActif()
  const echo = reverb()
  if (!ctx || !echo || !lecture.sortie) return

  const { ambiance, curseurs, sortie } = lecture
  const limite = ctx.currentTime + HORIZON_SEC
  if (lecture.prochainTemps < ctx.currentTime) lecture.prochainTemps = ctx.currentTime + 0.1

  while (lecture.prochainTemps < limite) {
    const t = lecture.prochainTemps
    const duree = ambiance.temps

    const degreBasse = ambiance.basse[curseurs.basse % ambiance.basse.length]
    jouerNote(ctx, sortie, frequenceDuDegre(ambiance, degreBasse) / 2, t, duree * 1.6, 'sine', 0.5)

    const accord = ambiance.accords[curseurs.accords % ambiance.accords.length]
    for (const degre of accord) {
      jouerNote(ctx, sortie, frequenceDuDegre(ambiance, degre), t, duree * 1.9, ambiance.timbrePad, 0.16)
    }

    const degreVoix = ambiance.voix[curseurs.voix % ambiance.voix.length]
    if (degreVoix !== null) {
      jouerNote(ctx, sortie, frequenceDuDegre(ambiance, degreVoix) * 2, t, duree * 0.9, ambiance.timbreVoix, 0.1)
    }

    // Les trois lignes avancent séparément : c'est ce décalage de longueurs
    // (4, 4 et 14 par exemple) qui fait que la boucle ne se referme pas avant
    // plusieurs minutes.
    curseurs.basse += 1
    curseurs.accords += 1
    curseurs.voix += 1
    lecture.prochainTemps += duree
  }

  lecture.minuteur = window.setTimeout(programmer, PERIODE_REPROGRAMMATION_MS)
}

/**
 * Lance l'ambiance d'un niveau. Sans effet si le son est coupé, si le niveau
 * n'a pas d'ambiance, ou si l'environnement n'a pas de Web Audio.
 *
 * Relancer la même ambiance ne la redémarre pas : on ne veut pas de coupure
 * quand on passe d'un jeu au suivant à l'intérieur d'un niveau.
 */
export function demarrerMusique(levelId: string): void {
  if (!estActif()) return
  const ambiance = AMBIANCES[levelId]
  if (!ambiance) return
  if (lecture && lecture.ambiance === ambiance) return

  arreterMusique()
  const ctx = contexteActif()
  const echo = reverb()
  if (!ctx || !echo) return

  const sortie = ctx.createGain()
  // Fondu d'entrée : la musique arrive, elle ne surgit pas.
  sortie.gain.setValueAtTime(0.0001, ctx.currentTime)
  sortie.gain.exponentialRampToValueAtTime(VOLUME_MUSIQUE, ctx.currentTime + 2.5)
  sortie.connect(ctx.destination)
  // Une part fixe part dans la réverbération commune : c'est ce qui place la
  // musique dans le même lieu que les bruitages, au lieu de deux mondes à côté.
  const mouille = ctx.createGain()
  mouille.gain.value = 0.5
  sortie.connect(mouille)
  mouille.connect(echo)

  lecture = {
    ambiance,
    prochainTemps: ctx.currentTime + 0.2,
    curseurs: { basse: 0, accords: 0, voix: 0 },
    minuteur: null,
    sortie,
  }
  programmer()
}

/** Coupe l'ambiance en cours, avec un fondu de sortie. */
export function arreterMusique(): void {
  if (!lecture) return
  if (lecture.minuteur !== null) window.clearTimeout(lecture.minuteur)
  const ctx = contexteActif()
  const sortie = lecture.sortie
  if (ctx && sortie) {
    const fin = ctx.currentTime + 0.6
    sortie.gain.cancelScheduledValues(ctx.currentTime)
    sortie.gain.setValueAtTime(Math.max(sortie.gain.value, 0.0002), ctx.currentTime)
    sortie.gain.exponentialRampToValueAtTime(0.0001, fin)
    window.setTimeout(() => sortie.disconnect(), 900)
  }
  lecture = null
}

/** Vrai si une ambiance joue actuellement. Sert aux tests et au bouton son. */
export function musiqueEnCours(): boolean {
  return lecture !== null
}
