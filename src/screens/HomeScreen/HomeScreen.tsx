import { Link } from 'react-router-dom'
import clsx from 'clsx'
import { GRADE_LEVELS } from '../../content/grades'
import styles from './HomeScreen.module.css'

export function HomeScreen() {
  return (
    <div className={styles.home}>
      <svg className={styles.hero} viewBox="0 0 400 120" aria-hidden="true">
        <g style={{ mixBlendMode: 'multiply' }}>
          <ellipse cx="120" cy="60" rx="150" ry="46" fill="var(--violet-brume)" opacity="0.5" filter="url(#aq-bord-1)" />
          <ellipse cx="290" cy="55" rx="130" ry="40" fill="var(--color-domain-sciences)" opacity="0.3" filter="url(#aq-bord-2)" />
          <ellipse cx="205" cy="70" rx="110" ry="34" fill="var(--violet)" opacity="0.22" filter="url(#aq-bord-3)" />
        </g>
      </svg>

      <h1 className={styles.title}>Jeu Culture</h1>
      <p className={styles.subtitle}>Choisis un niveau scolaire pour commencer à jouer.</p>

      <div className={styles.grid}>
        {GRADE_LEVELS.map((grade) =>
          grade.enabled ? (
            <Link key={grade.id} to={`/${grade.id}`} className={clsx(styles.card, styles.enabled)}>
              {grade.label}
            </Link>
          ) : (
            <div key={grade.id} className={clsx(styles.card, styles.disabled)}>
              {grade.label}
              <span className={styles.soon}>Bientôt disponible</span>
            </div>
          ),
        )}
      </div>
    </div>
  )
}
