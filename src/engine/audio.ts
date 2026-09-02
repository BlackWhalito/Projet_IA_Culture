/**
 * Le contexte audio partagé, et le réglage marche/arrêt du son.
 *
 * Il vit à part parce que **deux modules en ont besoin** : `sound.ts` pour les
 * bruitages, `musique.ts` pour les ambiances de niveau. Deux `AudioContext`
 * distincts sonneraient l'un par-dessus l'autre sans partager la réverbération,
 * et les navigateurs en limitent le nombre.
 */

type FabriqueContexte = new () => AudioContext

const CLE_STOCKAGE = 'jeu-culture-son-v1'
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

function fabriqueContexte(): FabriqueContexte | null {
  if (typeof window === 'undefined') return null
  const w = window as unknown as { AudioContext?: FabriqueContexte; webkitAudioContext?: FabriqueContexte }
  return w.AudioContext ?? w.webkitAudioContext ?? null
}

let contexte: AudioContext | null = null
let reverbNoeud: ConvolverNode | null = null

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
 *
 * Rend `null` là où le Web Audio n'existe pas (jsdom en test), ce qui permet
 * aux appelants de ne poser aucune garde.
 */
export function contexteActif(): AudioContext | null {
  const Fabrique = fabriqueContexte()
  if (!Fabrique) return null
  if (!contexte) {
    contexte = new Fabrique()
    reverbNoeud = fabriquerReverb(contexte)
    reverbNoeud.connect(contexte.destination)
  }
  if (contexte.state === 'suspended') void contexte.resume()
  return contexte
}

/** La réverbération partagée. `null` tant que le contexte n'existe pas. */
export function reverb(): ConvolverNode | null {
  return reverbNoeud
}
