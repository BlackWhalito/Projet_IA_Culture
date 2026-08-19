import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { EuropeMap } from './EuropeMap'
import { EUROPE_ZONES } from '../../content/maps/europe'

describe('EuropeMap', () => {
  it('rend chaque zone comme un bouton identifié par son label', () => {
    render(<EuropeMap />)
    for (const zone of EUROPE_ZONES) {
      expect(screen.getByRole('button', { name: zone.label })).toBeInTheDocument()
    }
  })

  it('appelle onZoneClick avec le bon id au clic sur un pays', () => {
    const onZoneClick = vi.fn()
    render(<EuropeMap onZoneClick={onZoneClick} />)
    fireEvent.click(screen.getByRole('button', { name: 'Italie' }))
    expect(onZoneClick).toHaveBeenCalledWith('italie-eu')
  })

  it('appelle onZoneClick avec le bon id au clic sur un continent', () => {
    const onZoneClick = vi.fn()
    render(<EuropeMap onZoneClick={onZoneClick} />)
    fireEvent.click(screen.getByRole('button', { name: "L'Asie" }))
    expect(onZoneClick).toHaveBeenCalledWith('asie')
  })
})
