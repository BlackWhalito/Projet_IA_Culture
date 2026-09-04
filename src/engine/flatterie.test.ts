import { describe, expect, it } from 'vitest'
import { aCourtDeMots, dire, effetDe, estPrecoce, issue, type EtatFlatterie } from './flatterie'
import type { FlatterieContent } from '../types/game'

const CONTENU: FlatterieContent = {
  consigne: 'Fais-lui ouvrir le bec.',
  fable: { auteur: 'Jean de La Fontaine', titre: 'Le Corbeau et le Renard', annee: '1668' },
  cible: { nom: 'Maître Corbeau', possede: 'un fromage', vaniteDepart: 0, mefianceDepart: 20 },
  repliques: [
    { id: 'monsieur', texte: 'Monsieur du Corbeau.', authentique: true, vanite: 20, mefiance: 0, reaction: 'Monsieur.' },
    { id: 'plumage', texte: 'Que vous êtes joli !', authentique: true, vanite: 25, mefiance: 5, reaction: 'Il gonfle ses plumes.' },
    {
      id: 'ramage', texte: 'Si votre ramage…', authentique: true, vanite: 35, mefiance: 10,
      exige: ['plumage'],
      siPrecoce: { vanite: 5, mefiance: 30, reaction: 'Mon ramage ? Il n’a rien dit de mes plumes.' },
      reaction: 'Il penche la tête.',
    },
    {
      id: 'phenix', texte: 'Le Phénix de ces bois.', authentique: true, vanite: 20, mefiance: 15,
      exige: ['ramage'],
      siPrecoce: { vanite: 0, mefiance: 35, reaction: 'Le Phénix ? D’un coup ?' },
      reaction: 'Il ne se sent plus de joie.',
    },
    { id: 'fromage', texte: 'Beau fromage.', authentique: false, vanite: 0, mefiance: 40, reaction: 'Il resserre le bec.' },
    { id: 'chante', texte: 'Chantez-moi quelque chose.', authentique: false, vanite: 0, mefiance: 45, reaction: 'Pourquoi demandes-tu ?' },
  ],
  declencheur: { texte: '(Ne rien dire.)', reaction: 'Il ouvre un large bec, laisse tomber sa proie.' },
  moraleReussite: 'Le fromage est à toi.',
  moraleEchec: 'Il s’envole avec le fromage.',
  secondes: 45,
}

const r = (id: string) => CONTENU.repliques.find((x) => x.id === id)!
const depart = (): EtatFlatterie => ({
  vanite: CONTENU.cible.vaniteDepart,
  mefiance: CONTENU.cible.mefianceDepart,
  dites: [],
})
const enchainer = (...ids: string[]) => ids.reduce((e, id) => dire(e, r(id)), depart())

describe('flatterie', () => {
  /**
   * Le test qui prouve que l'ordre EST le jeu : les quatre vers de La Fontaine,
   * dans son ordre, remplissent la vanité pile à ras bord sans réveiller la
   * méfiance. C'est la seule ligne gagnante, et c'est la sienne.
   */
  it('gagne exactement sur l’ordre de La Fontaine', () => {
    const fin = enchainer('monsieur', 'plumage', 'ramage', 'phenix')
    expect(fin.vanite).toBe(100)
    expect(fin.mefiance).toBeLessThan(100)
    expect(issue(fin)).toBe('pret')
  })

  it('perd quand on récite les mêmes vers à l’envers', () => {
    const fin = enchainer('phenix', 'ramage', 'plumage', 'monsieur')
    expect(issue(fin)).not.toBe('pret')
    expect(fin.vanite).toBeLessThan(100)
  })

  /**
   * « Si votre ramage se rapporte à votre plumage » ne veut rien dire tant
   * qu'on n'a pas parlé du plumage. La réplique passe quand même — on ne
   * l'interdit pas — mais elle retombe à plat et réveille le corbeau.
   */
  it('fait retomber à plat une réplique conditionnelle dite trop tôt', () => {
    expect(estPrecoce(r('ramage'), [])).toBe(true)
    expect(estPrecoce(r('ramage'), ['plumage'])).toBe(false)

    const tot = effetDe(r('ramage'), [])
    const juste = effetDe(r('ramage'), ['plumage'])
    expect(tot.vanite).toBeLessThan(juste.vanite)
    expect(tot.mefiance).toBeGreaterThan(juste.mefiance)
    expect(tot.reaction).toMatch(/rien dit de mes plumes/)
  })

  it('fait fuir le corbeau dès qu’on nomme le fromage ou qu’on demande à entendre', () => {
    const fin = enchainer('monsieur', 'plumage', 'fromage', 'chante')
    expect(fin.mefiance).toBe(100)
    expect(issue(fin)).toBe('perdu')
  })

  it('laisse la méfiance pleine l’emporter sur la vanité pleine', () => {
    const flatte = { vanite: 100, mefiance: 100, dites: [] }
    expect(issue(flatte)).toBe('perdu')
  })

  it('borne les jauges au lieu de les laisser filer', () => {
    const fin = enchainer('chante', 'fromage', 'phenix')
    expect(fin.mefiance).toBe(100)
    expect(fin.vanite).toBeGreaterThanOrEqual(0)
  })

  it('déclare la fin quand il ne reste plus rien à dire et le bec fermé', () => {
    const presque = { vanite: 45, mefiance: 30, dites: CONTENU.repliques.map((x) => x.id) }
    expect(aCourtDeMots(CONTENU, presque)).toBe(true)
    expect(aCourtDeMots(CONTENU, depart())).toBe(false)
  })
})
