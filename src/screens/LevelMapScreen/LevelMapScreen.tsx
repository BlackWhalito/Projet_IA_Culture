import { Link, useParams } from 'react-router-dom'
import clsx from 'clsx'
import type { GradeId } from '../../types/content'
import { GRADE_LEVELS } from '../../content/grades'
import { getLevelsByGrade } from '../../content/levels'
import { useProgressStore } from '../../state/progressStore'
import { clampStarRating } from '../../engine/scoring'
import { WatercolorScene } from '../../components/watercolor/WatercolorScene'
import { LEVEL_ART } from './levelArt'
import styles from './LevelMapScreen.module.css'

export function LevelMapScreen() {
  const { gradeId } = useParams<{ gradeId: GradeId }>()
  const levelsProgress = useProgressStore((state) => state.levels)

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

  return (
    <div className={styles.map}>
      <h1>{grade.label}</h1>
      <div className={styles.path}>
        <svg className={styles.trail} viewBox="0 0 200 100" preserveAspectRatio="none" aria-hidden="true">
          <path
            d="M40,0 Q160,12 100,25 T40,50 Q-20,62 100,75 T40,100"
            fill="none"
            stroke="var(--violet-brume)"
            strokeWidth="6"
            strokeLinecap="round"
            filter="url(#aq-bord-3)"
          />
        </svg>
        {levels.map((level, i) => {
          const progress = levelsProgress[level.id]
          const unlocked = i === 0 || Boolean(levelsProgress[levels[i - 1].id]?.completed)
          const stars = clampStarRating(progress?.starRating)
          const side = i % 2 === 0 ? styles.left : styles.right
          const art = LEVEL_ART[level.id]

          // Le tableau est décoratif quand le niveau est verrouillé : sous
          // son voile, il n'y a plus rien à décrire à voix haute, et le
          // cadenas dit déjà tout ce que le joueur a besoin de savoir.
          const painting = art ? (
            <WatercolorScene
              className={styles.art}
              paint={art.paint}
              width={320}
              height={168}
              seed={art.seed}
              alt={unlocked ? art.alt : undefined}
            />
          ) : null

          if (!unlocked) {
            return (
              <div
                key={level.id}
                className={clsx(styles.node, styles.locked, side, art && styles.withArt)}
                aria-label={`${level.title} (verrouillé)`}
              >
                {painting}
                <span className={styles.body}>
                  <span aria-hidden="true">🔒</span>
                  {level.title}
                </span>
              </div>
            )
          }

          return (
            <Link
              key={level.id}
              to={`/${grade.id}/level/${level.id}`}
              className={clsx(styles.node, styles.unlocked, side, art && styles.withArt)}
            >
              {painting}
              <span className={styles.body}>
                {level.title}
                <span className={styles.stars} aria-label={`${stars} étoiles sur 3`}>
                  {'⭐'.repeat(stars)}
                  {'☆'.repeat(3 - stars)}
                </span>
              </span>
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
