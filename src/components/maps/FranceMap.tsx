import type { KeyboardEvent } from 'react'
import clsx from 'clsx'
import { FRANCE_CONTOUR_PATH, FRANCE_VIEWBOX, FRANCE_ZONES } from '../../content/maps/france'
import type { MapZone } from '../../types/maps'
import styles from './FranceMap.module.css'

interface FranceMapProps {
  onZoneClick?: (zoneId: string) => void
  /** Zones qu'on peut effectivement toucher. Par défaut, toutes. */
  interactiveZoneIds?: string[]
  /** Zones dont le label reste affiché même si `showAllLabels` est faux. */
  revealedZoneIds?: string[]
  activeZoneId?: string | null
  /** Base cartographique nue : chaque zone est déjà identifiée par son label. */
  showAllLabels?: boolean
}

function estInteractive(zone: MapZone, interactiveZoneIds: string[] | undefined): boolean {
  return !interactiveZoneIds || interactiveZoneIds.includes(zone.id)
}

export function FranceMap({
  onZoneClick,
  interactiveZoneIds,
  revealedZoneIds,
  activeZoneId,
  showAllLabels = true,
}: FranceMapProps) {
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

  const villes = FRANCE_ZONES.filter((z) => z.kind === 'ville')
  const fleuves = FRANCE_ZONES.filter((z) => z.kind === 'fleuve')
  const paysVoisins = FRANCE_ZONES.filter((z) => z.kind === 'pays-voisin')

  return (
    <svg viewBox={FRANCE_VIEWBOX} className={styles.carte} role="img" aria-label="Carte de la France">
      <g className={styles.contourCouches}>
        <path d={FRANCE_CONTOUR_PATH} className={styles.contourTrait} filter="url(#aq-bord-1)" opacity={0.42} />
        <path d={FRANCE_CONTOUR_PATH} className={styles.contourTrait} filter="url(#aq-bord-2)" opacity={0.32} />
      </g>

      {fleuves.map((zone) => (
        <g
          key={zone.id}
          role="button"
          tabIndex={0}
          aria-label={zone.label}
          className={clsx(styles.zone, { [styles.zoneActive]: activeZoneId === zone.id })}
          onClick={() => handleActivate(zone)}
          onKeyDown={(e) => handleKeyDown(e, zone)}
        >
          <path d={zone.d} className={styles.fleuveZoneHit} />
          <path d={zone.d} className={styles.fleuveTrait} filter="url(#aq-bord-3)" />
          {labelVisible(zone.id) && (
            <text x={zone.labelX} y={zone.labelY} className={styles.labelFleuve}>
              {zone.label}
            </text>
          )}
        </g>
      ))}

      {paysVoisins.map((zone) => (
        <g
          key={zone.id}
          role="button"
          tabIndex={0}
          aria-label={zone.label}
          className={clsx(styles.zone, { [styles.zoneActive]: activeZoneId === zone.id })}
          onClick={() => handleActivate(zone)}
          onKeyDown={(e) => handleKeyDown(e, zone)}
        >
          <circle cx={zone.cx} cy={zone.cy} r={28} className={styles.zoneHitArea} />
          <circle cx={zone.cx} cy={zone.cy} r={7} className={styles.pointPays} />
          {labelVisible(zone.id) && (
            <text x={zone.cx} y={(zone.cy ?? 0) + 22} className={styles.labelPays}>
              {zone.label}
            </text>
          )}
        </g>
      ))}

      {villes.map((zone) => (
        <g
          key={zone.id}
          role="button"
          tabIndex={0}
          aria-label={zone.label}
          className={clsx(styles.zone, { [styles.zoneActive]: activeZoneId === zone.id })}
          onClick={() => handleActivate(zone)}
          onKeyDown={(e) => handleKeyDown(e, zone)}
        >
          <circle cx={zone.cx} cy={zone.cy} r={28} className={styles.zoneHitArea} />
          <circle cx={zone.cx} cy={zone.cy} r={7} className={styles.pointVille} />
          {labelVisible(zone.id) && (
            <text x={zone.cx} y={(zone.cy ?? 0) - 12} className={styles.labelVille}>
              {zone.label}
            </text>
          )}
        </g>
      ))}
    </svg>
  )
}
