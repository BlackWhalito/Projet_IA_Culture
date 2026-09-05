import type { CSSProperties } from 'react'
import { Link, useParams } from 'react-router-dom'
import clsx from 'clsx'
import type { GradeId } from '../../types/content'
import { GRADE_LEVELS } from '../../content/grades'
import { getLevelsByGrade } from '../../content/levels'
import { getNotionById } from '../../content/notions'
import { DOMAINS } from '../../content/domains'
import { useProgressStore } from '../../state/progressStore'
import { useModeTest } from '../../state/modeTest'
import { clampStarRating } from '../../engine/scoring'
import { RiviereDesNiveaux } from './RiviereDesNiveaux'
import { hauteurPour, positionNiveau, LARGEUR } from './riviereGeometrie'
import styles from './LevelMapScreen.module.css'

/**
 * Les couleurs des domaines abordés par un niveau, sans doublon et dans
 * l'ordre où on les rencontre.
 *
 * C'est ce qui fait qu'un niveau ne ressemble pas au précédent : huit plaques
 * identiques ne disent rien de ce qu'il y a dedans, et c'était le reproche —
 * « ce n'est pas joli », mais surtout ce n'est pas informatif.
 */
function couleursDuNiveau(notionIds: readonly { notionId: string }[]): string[] {
  const vues: string[] = []
  for (const { notionId } of notionIds) {
    const domaine = getNotionById(notionId)?.domainId
    if (!domaine) continue
    const couleur = DOMAINS[domaine].color
    if (!vues.includes(couleur)) vues.push(couleur)
  }
  return vues
}

/** Un cadenas dessiné : l'emoji système jurait avec le reste de la page. */
function Cadenas() {
  return (
    <svg className={styles.cadenas} viewBox="0 0 16 18" aria-hidden="true">
      <path
        d="M4.5 8 V5.5 a3.5 3.5 0 0 1 7 0 V8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <rect x="2" y="8" width="12" height="9" rx="2.2" fill="currentColor" />
    </svg>
  )
}

export function LevelMapScreen() {
  const { gradeId } = useParams<{ gradeId: GradeId }>()
  const levelsProgress = useProgressStore((state) => state.levels)
  const modeTest = useModeTest((etat) => etat.actif)

  const grade = GRADE_LEVELS.find((g) => g.id === gradeId)
  if (!grade || !grade.enabled) {
    return (
      <div className={styles.map}>
        <p>Ce niveau scolaire n'est pas encore disponible.</p>
        <Link to="/">Retour à l'accueil</Link>
      </div>
    )
  }

  const levels = getLevelsByGrade(grade.id)
  const hauteur = hauteurPour(levels.length)
  const premierVerrouille = levels.findIndex(
    (_, i) => i > 0 && !levelsProgress[levels[i - 1].id]?.completed,
  )

  return (
    <div className={styles.map}>
      <h1 className={styles.titre}>{grade.label}</h1>
      <p className={styles.sous}>Remonte la rivière. Chaque halte est un niveau.</p>
      {modeTest ? <p className={styles.bacASable}>Bac à sable : tous les niveaux sont ouverts.</p> : null}

      {/*
        Le cours d'eau et les plaques partagent le même repère : la rivière est
        peinte dans un SVG au ratio fixe, et chaque plaque est posée en
        pourcentage de ce même repère. Les deux ne peuvent donc pas dériver.
      */}
      <div className={styles.cours} style={{ aspectRatio: `${LARGEUR} / ${hauteur}` }}>
        <RiviereDesNiveaux nombre={levels.length} />

        {levels.map((level, i) => {
          const progress = levelsProgress[level.id]
          // En bac à sable, tout est ouvert : on vient regarder une mécanique
          // précise, pas gagner trente-huit manches pour l'atteindre.
          const unlocked = modeTest || i === 0 || Boolean(levelsProgress[levels[i - 1].id]?.completed)
          const stars = clampStarRating(progress?.starRating)
          const { x, y } = positionNiveau(i)
          const pose: CSSProperties = {
            left: `${(x / LARGEUR) * 100}%`,
            top: `${(y / hauteur) * 100}%`,
          }
          const couleurs = couleursDuNiveau(level.notionIds)
          const courant = i === (premierVerrouille === -1 ? levels.length - 1 : premierVerrouille - 1)

          const dedans = (
            <>
              <span className={styles.rang}>{i + 1}</span>
              <span className={styles.nom}>{level.title}</span>
              {/* Les domaines du niveau : c'est ce qui distingue une halte
                  de la suivante au premier coup d'œil. */}
              <span className={styles.domaines} aria-hidden="true">
                {couleurs.map((couleur) => (
                  <span
                    key={couleur}
                    className={styles.pastille}
                    style={{ '--_teinte': couleur } as CSSProperties}
                  />
                ))}
              </span>
              {unlocked ? (
                <span className={styles.etoiles} aria-label={`${stars} étoiles sur 3`}>
                  {'★'.repeat(stars)}
                  {'☆'.repeat(3 - stars)}
                </span>
              ) : (
                <Cadenas />
              )}
            </>
          )

          if (!unlocked) {
            return (
              <div
                key={level.id}
                className={clsx(styles.halte, styles.verrouillee)}
                style={pose}
                aria-label={`${level.title} (verrouillé)`}
              >
                {dedans}
              </div>
            )
          }

          return (
            <Link
              key={level.id}
              to={`/${grade.id}/level/${level.id}`}
              className={clsx(styles.halte, styles.ouverte, { [styles.courante]: courant })}
              style={pose}
            >
              {dedans}
            </Link>
          )
        })}
      </div>

      <Link to="/" className={styles.back}>
        Retour à l'accueil
      </Link>
    </div>
  )
}
