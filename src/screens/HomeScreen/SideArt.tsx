import type { CSSProperties } from 'react'
import clsx from 'clsx'
import styles from './HomeScreen.module.css'

/**
 * Deux petits tableaux aquarelle qui habillent les marges de l'accueil sur
 * grand écran (voir HomeScreen.module.css, masqués sous 1100px). Purement
 * décoratif — même raison qu'à côté de gradeArt.tsx : ça vit ici plutôt que
 * dans src/content/ parce que ce n'est pas une notion pédagogique.
 */
export function SideArt({ side }: { side: 'left' | 'right' }) {
  return (
    <div className={clsx(styles.sideArt, side === 'left' ? styles.sideArtLeft : styles.sideArtRight)}>
      <svg
        viewBox="0 0 160 480"
        aria-hidden="true"
        style={side === 'right' ? ({ transform: 'scaleX(-1)' } as CSSProperties) : undefined}
      >
        <rect x="10" y="10" width="140" height="460" rx="30" fill="var(--violet-brume)" opacity="0.14" filter="url(#aq-bord-4)" />
        <g style={{ mixBlendMode: 'multiply' }}>
          <path
            d="M30,90 C10,50 70,20 110,50 C150,80 140,140 100,150 C60,160 20,140 30,90 Z"
            fill="var(--violet)"
            opacity="0.22"
            filter="url(#aq-bord-1)"
          />
          <path
            d="M40,320 C20,280 80,250 120,280 C160,310 150,370 110,380 C70,390 30,370 40,320 Z"
            fill="var(--violet-brume)"
            opacity="0.28"
            filter="url(#aq-bord-3)"
          />
          <path
            d="M75,210 C68,195 92,190 100,202 C108,214 98,228 82,226 C70,224 70,218 75,210 Z"
            fill="var(--color-domain-sciences)"
            opacity="0.26"
            filter="url(#aq-bord-2)"
          />
        </g>
        <path
          d="M80,440 Q75,340 85,240 Q92,160 78,70"
          fill="none"
          stroke="var(--violet-profond)"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.35"
        />
        <path d="M85,380 C100,375 108,390 98,400 C88,408 78,398 85,380 Z" fill="var(--color-domain-sciences)" opacity="0.3" />
        <path d="M80,300 C65,296 58,312 68,320 C78,327 87,316 80,300 Z" fill="var(--color-domain-sciences)" opacity="0.3" />
        <path d="M88,180 C103,177 110,192 100,201 C90,209 81,197 88,180 Z" fill="var(--color-domain-sciences)" opacity="0.3" />
      </svg>
    </div>
  )
}
