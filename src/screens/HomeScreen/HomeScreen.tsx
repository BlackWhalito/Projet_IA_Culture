import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import clsx from 'clsx'
import { GRADE_LEVELS } from '../../content/grades'
import { GRADE_ART } from './gradeArt'
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
        {GRADE_LEVELS.map((grade, i) => {
          const accent = grade.enabled ? 'var(--color-domain-sciences)' : 'var(--violet)'
          const washA = grade.enabled ? 0.4 : 0.22
          const washB = grade.enabled ? 0.28 : 0.16
          const filterA = `url(#aq-bord-${(i % 4) + 1})`
          const filterB = `url(#aq-bord-${((i + 2) % 4) + 1})`
          const cx = 50 + ((i % 3) - 1) * 4
          const cy = 46 + (i % 2) * 6

          const art = (
            <svg
              className={styles.art}
              viewBox="0 0 100 100"
              aria-hidden="true"
              style={{ '--_accent': accent } as CSSProperties}
            >
              <g style={{ mixBlendMode: 'multiply' }}>
                <ellipse cx={cx} cy={cy} rx="42" ry="36" fill={accent} opacity={washA} filter={filterA} />
                <ellipse
                  cx={100 - cx}
                  cy="54"
                  rx="36"
                  ry="30"
                  fill={grade.enabled ? 'var(--violet)' : 'var(--violet-brume)'}
                  opacity={washB}
                  filter={filterB}
                />
              </g>
              {GRADE_ART[grade.id]}
            </svg>
          )

          return grade.enabled ? (
            <Link key={grade.id} to={`/${grade.id}`} className={clsx(styles.card, styles.enabled)}>
              {art}
              <span className={styles.label}>{grade.label}</span>
            </Link>
          ) : (
            <div key={grade.id} className={clsx(styles.card, styles.disabled)}>
              {art}
              <span className={styles.label}>{grade.label}</span>
              <span className={styles.soon}>Bientôt disponible</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
