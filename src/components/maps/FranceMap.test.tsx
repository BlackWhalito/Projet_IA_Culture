import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { FranceMap } from './FranceMap'
import { FRANCE_ZONES } from '../../content/maps/france'

describe('FranceMap', () => {
  it('rend chaque zone comme un bouton identifié par son label', () => {
    render(<FranceMap />)
    for (const zone of FRANCE_ZONES) {
      expect(screen.getByRole('button', { name: zone.label })).toBeInTheDocument()
    }
  })

  it('appelle onZoneClick avec le bon id au clic sur une ville', () => {
    const onZoneClick = vi.fn()
    render(<FranceMap onZoneClick={onZoneClick} />)
    fireEvent.click(screen.getByRole('button', { name: 'Paris' }))
    expect(onZoneClick).toHaveBeenCalledWith('paris')
  })

  it('appelle onZoneClick avec le bon id au clic sur un fleuve', () => {
    const onZoneClick = vi.fn()
    render(<FranceMap onZoneClick={onZoneClick} />)
    fireEvent.click(screen.getByRole('button', { name: 'La Loire' }))
    expect(onZoneClick).toHaveBeenCalledWith('loire')
  })

  it('appelle onZoneClick avec le bon id au clic sur un pays voisin', () => {
    const onZoneClick = vi.fn()
    render(<FranceMap onZoneClick={onZoneClick} />)
    fireEvent.click(screen.getByRole('button', { name: 'Espagne' }))
    expect(onZoneClick).toHaveBeenCalledWith('espagne')
  })

  it('répond aussi au clavier (Entrée)', () => {
    const onZoneClick = vi.fn()
    render(<FranceMap onZoneClick={onZoneClick} />)
    fireEvent.keyDown(screen.getByRole('button', { name: 'Lyon' }), { key: 'Enter' })
    expect(onZoneClick).toHaveBeenCalledWith('lyon')
  })

  it('masque les labels non révélés quand showAllLabels est faux', () => {
    render(<FranceMap showAllLabels={false} revealedZoneIds={['paris']} />)
    expect(screen.queryByText('Paris')).toBeInTheDocument()
    expect(screen.queryByText('Lyon')).not.toBeInTheDocument()
    // Le bouton reste cliquable même sans label visible.
    expect(screen.getByRole('button', { name: 'Lyon' })).toBeInTheDocument()
  })

  it("n'active pas une zone exclue de interactiveZoneIds", () => {
    const onZoneClick = vi.fn()
    render(<FranceMap onZoneClick={onZoneClick} interactiveZoneIds={['paris']} />)
    fireEvent.click(screen.getByRole('button', { name: 'Lyon' }))
    expect(onZoneClick).not.toHaveBeenCalled()
  })
})
