import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import clsx from 'clsx'
import { GRADE_LEVELS } from '../../content/grades'
import { GRADE_ART } from './gradeArt'
import { SideArt } from './SideArt'
import styles from './HomeScreen.module.css'

export function HomeScreen() {
  return (
    <div className={styles.home}>
      <SideArt side="left" />
      <SideArt side="right" />
      <svg className={styles.hero} viewBox="0 0 400 140" aria-hidden="true">
        <g style={{ mixBlendMode: 'multiply' }}>
          <path
            d="M40,72 C8,42 58,8 128,16 C198,24 232,54 212,86 C192,118 108,122 58,106 C18,94 4,92 40,72 Z"
            fill="var(--violet-brume)"
            opacity="0.42"
            filter="url(#aq-bord-1)"
          />
          <path
            d="M44,70 C12,44 60,12 130,20 C196,28 228,56 210,84 C188,114 112,120 60,104 C22,92 8,88 44,70 Z"
            fill="var(--violet-brume)"
            opacity="0.3"
            filter="url(#aq-bord-3)"
          />
          <path
            d="M182,52 C162,22 232,6 292,16 C352,26 372,56 352,82 C332,110 262,116 222,102 C186,90 176,76 182,52 Z"
            fill="var(--violet)"
            opacity="0.26"
            filter="url(#aq-bord-2)"
          />
          <path
            d="M186,50 C168,24 234,10 290,18 C348,28 368,54 350,80 C330,106 264,112 226,100 C190,88 180,74 186,50 Z"
            fill="var(--violet)"
            opacity="0.18"
            filter="url(#aq-bord-4)"
          />
          <path
            d="M250,80 C245,64 267,56 282,62 C298,68 302,86 289,97 C276,107 254,101 250,80 Z"
            fill="var(--color-domain-sciences)"
            opacity="0.3"
            filter="url(#aq-bord-2)"
          />
          <path
            d="M60,102 Q140,60 232,76 T 342,50"
            fill="none"
            stroke="var(--violet-profond)"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.3"
          />
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
