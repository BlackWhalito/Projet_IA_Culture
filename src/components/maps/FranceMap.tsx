import type { KeyboardEvent } from 'react'
import clsx from 'clsx'
import { FRANCE_CONTOUR_PATH, FRANCE_CORSE_PATH, FRANCE_VIEWBOX, FRANCE_ZONES } from '../../content/maps/france'
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

/**
 * Rayon de la zone tapable d'une ville ou d'un pays, en unités de viewBox.
 *
 * Mesuré à 390 px de large : à 28, les cibles faisaient 22 × 22 px réels, soit
 * la moitié du minimum de 44 px de la charte. À 38 elles passent à ~30 px.
 *
 * Pourquoi pas plus : les deux villes les plus proches, Marseille et Nice, sont
 * distantes de 81 unités. Au-delà de 40, leurs zones se recouvriraient et la
 * plus haute dans le DOM volerait les clics de l'autre — on gagnerait une
 * cible confortable en en rendant une autre inatteignable.
 *
 * Les 44 px restent donc hors d'atteinte tant que la carte tient dans une
 * carte de 390 px avec quinze zones : c'est une limite de place, pas de code.
 */
const RAYON_ZONE_TAPABLE = 38

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
      {/*
        Deux couches par forme, seeds différents : c'est la règle des lavis de la
        skill `aquarelle`, et c'est ce qui donne au bord son irrégularité de
        pinceau plutôt qu'un aplat découpé.

        Mais ici on prend les filtres **doux** (`aq-bord-4`, puis `aq-bord-3`),
        pas les deux premiers. `aq-bord-1` déplace les pixels de ±15 unités de
        viewBox ; or la Bretagne fait 36 unités de haut à sa pointe et le
        Cotentin 35 de large. Sous le filtre fort, les deux presqu'îles
        fondaient — et le tracé, lui, était juste. La règle générale : le
        `scale` d'un bord aquarelle doit rester bien en dessous de la plus
        petite dimension de la forme qu'il déforme.
      */}
      <g className={styles.contourCouches}>
        <path d={FRANCE_CONTOUR_PATH} className={styles.contourTrait} filter="url(#aq-bord-4)" opacity={0.42} />
        <path d={FRANCE_CONTOUR_PATH} className={styles.contourTrait} filter="url(#aq-bord-3)" opacity={0.32} />
        <path d={FRANCE_CORSE_PATH} className={styles.contourTrait} filter="url(#aq-bord-4)" opacity={0.42} />
        <path d={FRANCE_CORSE_PATH} className={styles.contourTrait} filter="url(#aq-bord-3)" opacity={0.32} />
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
          <circle cx={zone.cx} cy={zone.cy} r={RAYON_ZONE_TAPABLE} className={styles.zoneHitArea} />
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
          <circle cx={zone.cx} cy={zone.cy} r={RAYON_ZONE_TAPABLE} className={styles.zoneHitArea} />
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
