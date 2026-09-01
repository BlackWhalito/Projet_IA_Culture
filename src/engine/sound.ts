/**
 * Le son du jeu, entièrement synthétisé — aucun fichier audio dans le projet.
 *
 * Pourquoi la synthèse plutôt que des fichiers : rien à télécharger, rien à
 * licencier, rien qui alourdisse le bundle, et le timbre se règle au Hertz près
 * pour rester dans la direction aquarelle (des sons d'eau et de bois, jamais de
 * bips d'arcade — l'arcade est prévue pour les grandes classes, pas ici).
 *
 * Le contrat est en deux morceaux, et c'est volontaire :
 *
 * - `VOIX` est une **table de données pure**, décrivant chaque son en notes.
 *   Elle se teste sans navigateur et sans `AudioContext`.
 * - `jouerSon` est la seule fonction qui touche au Web Audio. Elle est sans
 *   effet observable quand le son est coupé ou quand l'environnement n'a pas
 *   d'`AudioContext` (jsdom en test, par exemple) : les jeux peuvent donc
 *   l'appeler sans garde.
 */

export type SonId =
  | 'tap'
  | 'juste'
  | 'faux'
  | 'depot'
  | 'rate'
  | 'apparition'
  | 'victoire'
  | 'defaite'

export interface Note {
  /** Fréquence de départ, en Hertz. */
  freq: number
  /** Fréquence d'arrivée, si la note glisse. Absente = note tenue. */
  glissandoVers?: number
  /** Décalage par rapport au début du son, en secondes. */
  delai: number
  duree: number
  type: OscillatorType
  /** Volume de crête de la note, avant le volume général. */
  gain: number
}

export interface Voix {
  notes: Note[]
  /** Part du signal envoyée dans la réverbération, de 0 à 1. */
  reverb: number
}

/**
 * Les huit voix du jeu.
 *
 * Toutes les hauteurs sont prises dans une gamme pentatonique de do majeur
 * (do, ré, mi, sol, la) : n'importe quelle combinaison de ces notes sonne
 * juste, y compris quand deux sons se chevauchent — ce qui arrive en
 * permanence dans La Rivière. C'est la raison pour laquelle on ne trouve ici
 * ni fa ni si.
 */
export const VOIX: Record<SonId, Voix> = {
  /** Bois sec et court : on a saisi quelque chose. */
  tap: {
    notes: [{ freq: 523.25, delai: 0, duree: 0.05, type: 'triangle', gain: 0.18 }],
    reverb: 0.12,
  },

  /** Deux notes qui montent, do puis sol : la récompense la plus fréquente. */
  juste: {
    notes: [
      { freq: 523.25, delai: 0, duree: 0.16, type: 'sine', gain: 0.3 },
      { freq: 783.99, delai: 0.08, duree: 0.34, type: 'sine', gain: 0.26 },
    ],
    reverb: 0.4,
  },

  /**
   * Une note grave et molle qui redescend, pas un buzzer.
   * Se tromper doit être doux : le jeu veut qu'on se trompe.
   */
  faux: {
    notes: [{ freq: 220, glissandoVers: 174.61, delai: 0, duree: 0.3, type: 'triangle', gain: 0.22 }],
    reverb: 0.25,
  },

  /** Une goutte : quelque chose est tombé au bon endroit. */
  depot: {
    notes: [{ freq: 880, glissandoVers: 392, delai: 0, duree: 0.14, type: 'sine', gain: 0.24 }],
    reverb: 0.45,
  },

  /** La même goutte, plus grave et plus lente : quelque chose a filé. */
  rate: {
    notes: [{ freq: 392, glissandoVers: 196, delai: 0, duree: 0.32, type: 'sine', gain: 0.2 }],
    reverb: 0.5,
  },

  /** Souffle très discret à l'arrivée d'un élément. Doit s'entendre à peine. */
  apparition: {
    notes: [{ freq: 1046.5, delai: 0, duree: 0.09, type: 'sine', gain: 0.08 }],
    reverb: 0.3,
  },

  /** Arpège montant do–mi–sol–do : la fin d'une manche gagnée. */
  victoire: {
    notes: [
      { freq: 523.25, delai: 0, duree: 0.2, type: 'sine', gain: 0.26 },
      { freq: 659.25, delai: 0.1, duree: 0.2, type: 'sine', gain: 0.26 },
      { freq: 783.99, delai: 0.2, duree: 0.24, type: 'sine', gain: 0.26 },
      { freq: 1046.5, delai: 0.3, duree: 0.5, type: 'sine', gain: 0.22 },
    ],
    reverb: 0.55,
  },

  /** Deux notes qui descendent : la manche est perdue, sans agressivité. */
  defaite: {
    notes: [
      { freq: 392, delai: 0, duree: 0.22, type: 'triangle', gain: 0.24 },
      { freq: 261.63, delai: 0.14, duree: 0.5, type: 'triangle', gain: 0.22 },
    ],
    reverb: 0.5,
  },
}

const CLE_STOCKAGE = 'jeu-culture-son-v1'
/** Volume général, appliqué par-dessus le gain de chaque note. */
const VOLUME_MAITRE = 0.5
/** Longueur de la queue de réverbération, en secondes. */
const REVERB_SEC = 1.1

/**
 * Le son est actif par défaut : c'est ce qui rend le jeu immersif, et le
 * couper doit être un geste volontaire, pas une découverte.
 */
export function estActif(): boolean {
  try {
    return window.localStorage.getItem(CLE_STOCKAGE) !== 'off'
  } catch {
    // Navigation privée, stockage bloqué : on joue le son plutôt que de se taire.
    return true
  }
}

export function definirActif(actif: boolean): void {
  try {
    window.localStorage.setItem(CLE_STOCKAGE, actif ? 'on' : 'off')
  } catch {
    // Le réglage ne survivra pas au rechargement, mais la session courante marche.
  }
}

type FabriqueContexte = new () => AudioContext

function fabriqueContexte(): FabriqueContexte | null {
  if (typeof window === 'undefined') return null
  const w = window as unknown as { AudioContext?: FabriqueContexte; webkitAudioContext?: FabriqueContexte }
  return w.AudioContext ?? w.webkitAudioContext ?? null
}

let contexte: AudioContext | null = null
let reverb: ConvolverNode | null = null

/**
 * Une réverbération synthétisée : du bruit qui décroît, ce qui suffit à donner
 * aux notes l'espace d'une pièce plutôt que la sécheresse d'un oscillateur nu.
 * C'est ce détail, plus que les hauteurs, qui fait la différence entre « bip »
 * et « instrument ».
 */
function fabriquerReverb(ctx: AudioContext): ConvolverNode {
  const longueur = Math.floor(ctx.sampleRate * REVERB_SEC)
  const buffer = ctx.createBuffer(2, longueur, ctx.sampleRate)
  for (let canal = 0; canal < 2; canal++) {
    const donnees = buffer.getChannelData(canal)
    for (let i = 0; i < longueur; i++) {
      // Décroissance exponentielle : la queue s'éteint sans coupure nette.
      donnees[i] = (Math.random() * 2 - 1) * (1 - i / longueur) ** 3
    }
  }
  const noeud = ctx.createConvolver()
  noeud.buffer = buffer
  return noeud
}

/**
 * Le contexte audio ne peut pas être créé au chargement du module : les
 * navigateurs le suspendent tant que l'utilisateur n'a pas interagi avec la
 * page. On le fabrique donc au premier son — c'est-à-dire après un clic, par
 * construction — et on le réveille s'il a été suspendu entre-temps.
 */
function contexteActif(): AudioContext | null {
  const Fabrique = fabriqueContexte()
  if (!Fabrique) return null
  if (!contexte) {
    contexte = new Fabrique()
    reverb = fabriquerReverb(contexte)
    reverb.connect(contexte.destination)
  }
  if (contexte.state === 'suspended') void contexte.resume()
  return contexte
}

/**
 * Joue un son. Ne lève jamais : un environnement sans Web Audio (jsdom), un
 * son coupé, un contexte refusé par le navigateur — dans tous ces cas l'appel
 * ne fait simplement rien, et les jeux n'ont pas à s'en préoccuper.
 */
export function jouerSon(id: SonId): void {
  if (!estActif()) return
  const ctx = contexteActif()
  if (!ctx || !reverb) return

  const voix = VOIX[id]
  const maintenant = ctx.currentTime

  for (const note of voix.notes) {
    const osc = ctx.createOscillator()
    osc.type = note.type
    const debut = maintenant + note.delai
    const fin = debut + note.duree
    osc.frequency.setValueAtTime(note.freq, debut)
    if (note.glissandoVers !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(note.glissandoVers, fin)
    }

    // Enveloppe : attaque très courte pour ne pas claquer, extinction douce.
    const enveloppe = ctx.createGain()
    const crete = note.gain * VOLUME_MAITRE
    enveloppe.gain.setValueAtTime(0.0001, debut)
    enveloppe.gain.exponentialRampToValueAtTime(crete, debut + 0.012)
    enveloppe.gain.exponentialRampToValueAtTime(0.0001, fin)

    const sec = ctx.createGain()
    sec.gain.value = 1 - voix.reverb
    const mouille = ctx.createGain()
    mouille.gain.value = voix.reverb

    osc.connect(enveloppe)
    enveloppe.connect(sec)
    enveloppe.connect(mouille)
    sec.connect(ctx.destination)
    mouille.connect(reverb)

    osc.start(debut)
    osc.stop(fin + 0.02)
  }
}
