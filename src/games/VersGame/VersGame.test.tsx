import { describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { VersGame } from './VersGame'
import type { VersContent } from '../../types/game'

/** La réserve du premier quatrain, telle qu'elle est écrite dans le contenu. */
const CONTENU: VersContent = {
  consigne: 'Finis le quatrain.',
  auteur: 'Victor Hugo',
  oeuvre: 'Les Contemplations',
  annee: '1856',
  secondesParStrophe: 90,
  strophes: [
    {
      amont: [
        'Demain, dès l’aube, à l’heure où blanchit la campagne,',
        'Je partirai. Vois-tu, je sais que tu m’attends.',
        'J’irai par la forêt, j’irai par la montagne.',
      ],
      piedsCible: 12,
      rimeCle: 'ɑ̃',
      rimeAffichee: '[ɑ̃]',
      reserve: [
        { mot: 'Je ne puis demeurer', pieds: 6 },
        { mot: 'loin de toi', pieds: 3 },
        { mot: 'plus longtemps', pieds: 3, rimeCle: 'ɑ̃' },
        { mot: 'un instant', pieds: 3, rimeCle: 'ɑ̃' },
        { mot: 'attendre', pieds: 3, eFinal: true, rimeCle: 'ɑ̃dʁ' },
        { mot: 'davantage', pieds: 4, eFinal: true, rimeCle: 'aʒ' },
      ],
      versReel: 'Je ne puis demeurer loin de toi plus longtemps.',
      commentaire: 'Hugo marche vers la tombe de sa fille.',
    },
  ],
}

const poser = (mot: string) => fireEvent.click(screen.getByRole('button', { name: mot }))

/** Le peigne porte le compte courant : c'est le seul retour chiffré du jeu. */
const pieds = () => screen.getByLabelText(/pieds sur 12/).getAttribute('aria-label')

describe('VersGame', () => {
  it('additionne les pieds à chaque mot posé', () => {
    render(<VersGame content={CONTENU} onComplete={vi.fn()} />)
    expect(pieds()).toBe('0 pieds sur 12')
    poser('Je ne puis demeurer')
    expect(pieds()).toBe('6 pieds sur 12')
    poser('loin de toi')
    expect(pieds()).toBe('9 pieds sur 12')
  })

  /**
   * Le test qui justifie la mécanique. « davantage » ne vaut pas le même nombre
   * de pieds selon le mot suivant, et le joueur doit pouvoir le CONSTATER : le
   * compte change sous son doigt sans qu'il ait touché à « davantage ».
   */
  it('élide le e muet quand le mot suivant commence par une voyelle', () => {
    render(<VersGame content={CONTENU} onComplete={vi.fn()} />)
    poser('davantage')
    // Seul et en fin de vers, le e final ne compte pas : 4 − 1.
    expect(pieds()).toBe('3 pieds sur 12')
    poser('loin de toi')
    // Devant une consonne, il se relève : 4 + 3.
    expect(pieds()).toBe('7 pieds sur 12')
  })

  it('élide devant une voyelle sans qu’on touche au mot précédent', () => {
    render(<VersGame content={CONTENU} onComplete={vi.fn()} />)
    poser('davantage')
    poser('loin de toi')
    // « davantage » vaut ses quatre pieds devant une consonne : 4 + 3.
    expect(pieds()).toBe('7 pieds sur 12')

    // On ne change QUE le mot suivant. « un instant » commence par une
    // voyelle : le e de « davantage » tombe et le peigne recule d'un cran,
    // sans qu'on ait touché à « davantage ». C'est la leçon, et elle est
    // visible à l'écran.
    fireEvent.click(screen.getAllByRole('button', { name: 'loin de toi' })[0])
    poser('un instant')
    expect(pieds()).toBe('6 pieds sur 12')
  })

  it('retire un mot posé quand on tape dessus, et recalcule tout', () => {
    render(<VersGame content={CONTENU} onComplete={vi.fn()} />)
    poser('attendre')
    poser('un instant')
    expect(pieds()).toBe('5 pieds sur 12')

    // « un instant » apparaît deux fois : dans la ligne, et dans la réserve
    // (désactivé). Taper celui de la ligne le rend à la réserve.
    fireEvent.click(screen.getAllByRole('button', { name: 'un instant' })[0])
    expect(pieds()).toBe('2 pieds sur 12')
  })

  it('laisse « Écrire » éteint tant que le vers boite ou ne rime pas', () => {
    render(<VersGame content={CONTENU} onComplete={vi.fn()} />)
    const ecrire = screen.getByRole('button', { name: 'Écrire' })
    expect(ecrire).toBeDisabled()

    // Douze pieds exacts, mais la rime est en [aʒ] : ce n'est pas un vers du
    // quatrain, et le bouton doit le refuser.
    poser('Je ne puis demeurer')
    poser('loin de toi')
    poser('davantage')
    expect(pieds()).toBe('12 pieds sur 12')
    expect(ecrire).toBeDisabled()
  })

  it('allume « Écrire » sur le bon compte ET la bonne rime, puis révèle Hugo', () => {
    render(<VersGame content={CONTENU} onComplete={vi.fn()} />)
    poser('Je ne puis demeurer')
    poser('loin de toi')
    poser('plus longtemps')

    const ecrire = screen.getByRole('button', { name: 'Écrire' })
    expect(ecrire).toBeEnabled()
    fireEvent.click(ecrire)

    expect(screen.getByText('Je ne puis demeurer loin de toi plus longtemps')).toBeInTheDocument()
    expect(screen.getByText(CONTENU.strophes[0].commentaire)).toBeInTheDocument()
    // Le joueur a retrouvé le vers exact : le répéter sous « Hugo, lui, a
    // écrit » gâcherait le seul moment rare de la manche.
    expect(screen.getByText(/Mot pour mot/)).toBeInTheDocument()
    expect(screen.queryByText(/Victor Hugo, lui, a écrit/)).not.toBeInTheDocument()
  })

  it('rend une victoire une fois la révélation refermée', () => {
    vi.useFakeTimers()
    try {
      const onComplete = vi.fn()
      render(<VersGame content={CONTENU} onComplete={onComplete} />)
      poser('Je ne puis demeurer')
      poser('loin de toi')
      poser('plus longtemps')
      fireEvent.click(screen.getByRole('button', { name: 'Écrire' }))

      // La révélation ne défile plus toute seule : c'est la récompense de la
      // manche, elle attend qu'on la quitte.
      expect(onComplete).not.toHaveBeenCalled()
      act(() => void vi.advanceTimersByTime(800))
      fireEvent.click(screen.getByRole('button', { name: 'Fermer le recueil' }))
      act(() => void vi.advanceTimersByTime(1000))
      expect(onComplete).toHaveBeenCalledWith(
        expect.objectContaining({ correct: true, mistakes: 0 }),
      )
    } finally {
      vi.useRealTimers()
    }
  })

  /**
   * La bougie n'est pas décorative : à son terme la manche est perdue, et le
   * joueur repart quand même avec le vers de Hugo. Le chrono se décompte
   * seconde par seconde, donc il faut avancer d'autant de tours de rendu.
   */
  it('perd la manche quand la bougie s’éteint, mais montre le vers réel', () => {
    vi.useFakeTimers()
    try {
      const onComplete = vi.fn()
      render(<VersGame content={CONTENU} onComplete={onComplete} />)
      expect(screen.getByText('90 s')).toBeInTheDocument()

      for (let i = 0; i < 90; i++) act(() => void vi.advanceTimersByTime(1000))
      expect(screen.getByText(CONTENU.strophes[0].versReel)).toBeInTheDocument()
      expect(screen.getByText(/La bougie s’est éteinte/)).toBeInTheDocument()

      act(() => void vi.advanceTimersByTime(800))
      fireEvent.click(screen.getByRole('button', { name: 'Fermer le recueil' }))
      act(() => void vi.advanceTimersByTime(1000))
      expect(onComplete).toHaveBeenCalledWith(
        expect.objectContaining({ correct: false, mistakes: 1 }),
      )
    } finally {
      vi.useRealTimers()
    }
  })

  /**
   * Deux quatrains d'affilée : la réserve, le peigne et la bougie doivent
   * repartir de zéro, sinon le deuxième vers hérite du premier.
   */
  it('enchaîne les quatrains en remettant la réserve et la bougie à neuf', () => {
    const deux: VersContent = {
      ...CONTENU,
      strophes: [
        CONTENU.strophes[0],
        {
          ...CONTENU.strophes[0],
          amont: ['Triste, et le jour pour moi sera comme la nuit.'],
          versReel: 'Un bouquet de houx vert et de bruyère en fleur.',
          commentaire: 'Le houx et la bruyère poussent sur les tombes normandes.',
        },
      ],
    }
    vi.useFakeTimers()
    try {
      const onComplete = vi.fn()
      render(<VersGame content={deux} onComplete={onComplete} />)
      expect(screen.getByText('Quatrain 1 / 2')).toBeInTheDocument()

      poser('Je ne puis demeurer')
      poser('loin de toi')
      poser('plus longtemps')
      fireEvent.click(screen.getByRole('button', { name: 'Écrire' }))
      act(() => void vi.advanceTimersByTime(800))
      fireEvent.click(screen.getByRole('button', { name: 'Vers suivant' }))

      expect(screen.getByText('Quatrain 2 / 2')).toBeInTheDocument()
      expect(pieds()).toBe('0 pieds sur 12')
      expect(screen.getByText('90 s')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Écrire' })).toBeDisabled()
      expect(onComplete).not.toHaveBeenCalled()
    } finally {
      vi.useRealTimers()
    }
  })

  it('remet Hugo à côté quand le vers du joueur diffère du sien', () => {
    render(<VersGame content={CONTENU} onComplete={vi.fn()} />)
    // Douze pieds sur la bonne rime, mais ce n'est pas le vers de Hugo.
    poser('Je ne puis demeurer')
    poser('attendre')
    poser('plus longtemps')
    fireEvent.click(screen.getByRole('button', { name: 'Écrire' }))

    expect(screen.getByText(/Victor Hugo, lui, a écrit/)).toBeInTheDocument()
    expect(screen.getByText(CONTENU.strophes[0].versReel)).toBeInTheDocument()
    expect(screen.queryByText(/Mot pour mot/)).not.toBeInTheDocument()
  })

  /**
   * Le bug que la vérification a trouvé : « Écrire » et le bouton de la
   * révélation occupent la même place. Un double tap — ou simplement un joueur
   * impatient — sautait le quatrain sans jamais voir le vers de Hugo.
   */
  it('ne laisse pas un double tap sur « Écrire » sauter la révélation', () => {
    vi.useFakeTimers()
    try {
      const deux: VersContent = {
        ...CONTENU,
        strophes: [CONTENU.strophes[0], { ...CONTENU.strophes[0], amont: ['Deuxième.'] }],
      }
      render(<VersGame content={deux} onComplete={vi.fn()} />)
      poser('Je ne puis demeurer')
      poser('loin de toi')
      poser('plus longtemps')

      const ecrire = screen.getByRole('button', { name: 'Écrire' })
      fireEvent.click(ecrire)
      // Le second tap du double clic, immédiatement après, tombe sur le bouton
      // qui vient de prendre la place : il doit être inerte.
      fireEvent.click(screen.getByRole('button', { name: 'Vers suivant' }))
      expect(screen.getByText('Quatrain 1 / 2')).toBeInTheDocument()
      expect(screen.getByText(CONTENU.strophes[0].commentaire)).toBeInTheDocument()

      // Une fois le délai passé, le bouton répond.
      act(() => void vi.advanceTimersByTime(800))
      fireEvent.click(screen.getByRole('button', { name: 'Vers suivant' }))
      expect(screen.getByText('Quatrain 2 / 2')).toBeInTheDocument()
    } finally {
      vi.useRealTimers()
    }
  })
})
