import type { KeyboardEvent } from 'react'
import clsx from 'clsx'
import { EUROPE_CONTOUR_PATH, EUROPE_VIEWBOX, EUROPE_ZONES } from '../../content/maps/europe'
import type { MapZone } from '../../types/maps'
import styles from './EuropeMap.module.css'

interface EuropeMapProps {
  onZoneClick?: (zoneId: string) => void
  interactiveZoneIds?: string[]
  revealedZoneIds?: string[]
  activeZoneId?: string | null
  showAllLabels?: boolean
}

/** Voir la note de `FranceMap` : 28 unités donnaient une cible de 22 px à l'écran, moitié du minimum tactile. */
const RAYON_TACTILE = 44

function estInteractive(zone: MapZone, interactiveZoneIds: string[] | undefined): boolean {
  return !interactiveZoneIds || interactiveZoneIds.includes(zone.id)
}

export function EuropeMap({
  onZoneClick,
  interactiveZoneIds,
  revealedZoneIds,
  activeZoneId,
  showAllLabels = true,
}: EuropeMapProps) {
  function handleActivate(zone: MapZone) {
    if (estInteractive(zone, interactiveZoneIds)) onZoneClick?.(zone.id)
  }

  function handleKeyDown(event: KeyboardEvent<SVGGElement>, zone: MapZone) {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    handleActivate(zone)
  }

  function labelVisible(zoneId: string): boolean {
    return showAllLabels || Boolean(revealedZoneIds?.includes(zoneId))
  }

  const pays = EUROPE_ZONES.filter((z) => z.kind === 'pays')
  const continents = EUROPE_ZONES.filter((z) => z.kind === 'continent')

  return (
    <svg viewBox={EUROPE_VIEWBOX} className={styles.carte} role="img" aria-label="Carte de l'Europe">
      <g className={styles.contourCouches}>
        <path d={EUROPE_CONTOUR_PATH} className={styles.contourTrait} filter="url(#aq-bord-1)" opacity={0.42} />
        <path d={EUROPE_CONTOUR_PATH} className={styles.contourTrait} filter="url(#aq-bord-2)" opacity={0.32} />
      </g>

      {continents.map((zone) => (
        <g
          key={zone.id}
          role={estInteractive(zone, interactiveZoneIds) ? 'button' : undefined}
          tabIndex={estInteractive(zone, interactiveZoneIds) ? 0 : undefined}
          aria-label={estInteractive(zone, interactiveZoneIds) ? zone.label : undefined}
          className={clsx(styles.zone, { [styles.zoneActive]: activeZoneId === zone.id })}
          onClick={() => handleActivate(zone)}
          onKeyDown={(e) => handleKeyDown(e, zone)}
        >
          <circle cx={zone.cx} cy={zone.cy} r={RAYON_TACTILE} className={styles.zoneHitArea} />
          <circle cx={zone.cx} cy={zone.cy} r={9} className={styles.pointContinent} />
          {labelVisible(zone.id) && (
            <text x={zone.cx} y={(zone.cy ?? 0) + 24} className={styles.labelContinent}>
              {zone.label}
            </text>
          )}
        </g>
      ))}

      {pays.map((zone) => (
        <g
          key={zone.id}
          role={estInteractive(zone, interactiveZoneIds) ? 'button' : undefined}
          tabIndex={estInteractive(zone, interactiveZoneIds) ? 0 : undefined}
          aria-label={estInteractive(zone, interactiveZoneIds) ? zone.label : undefined}
          className={clsx(styles.zone, { [styles.zoneActive]: activeZoneId === zone.id })}
          onClick={() => handleActivate(zone)}
          onKeyDown={(e) => handleKeyDown(e, zone)}
        >
          <circle cx={zone.cx} cy={zone.cy} r={RAYON_TACTILE} className={styles.zoneHitArea} />
          <circle cx={zone.cx} cy={zone.cy} r={7} className={styles.pointPays} />
          {labelVisible(zone.id) && (
            <text x={zone.cx} y={(zone.cy ?? 0) - 12} className={styles.labelPays}>
              {zone.label}
            </text>
          )}
        </g>
      ))}
    </svg>
  )
}
