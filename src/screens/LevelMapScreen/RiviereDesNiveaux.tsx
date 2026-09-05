import { semer } from '../../engine/courbe'
import { bergePath, courantPath, hauteurPour, LARGEUR } from './riviereGeometrie'
import styles from './RiviereDesNiveaux.module.css'

/**
 * Les roseaux de la rive.
 *
 * Semés une fois, hors de tout composant : irréguliers mais identiques d'un
 * rendu à l'autre. Un décor qui se redessine autrement à chaque montage
 * scintille, et `Math.random()` dans un composant est refusé par oxlint.
 *
 * Ils suivent la ligne de rive au lieu d'être éparpillés sur toute la largeur :
 * des roseaux au milieu du cadre, loin de l'eau, ne disent rien — la première
 * version en semait partout et la page lisait comme un fond texturé.
 */
function roseaux(nombre: number) {
  const tirer = semer(20260905)
  const h = hauteurPour(nombre)
  const touffes: { x: number; y: number; hauteur: number; penche: number; vert: boolean }[] = []
  for (let y = -10; y < h + 20; y += 26) {
    for (const cote of [-1, 1] as const) {
      if (tirer() < 0.22) continue
      // L'axe du courant est en quinconce sur un pas de deux niveaux : on le
      // rapproche par une sinusoïde plutôt que de rééchantillonner la spline.
      const phase = Math.cos((Math.PI * (y - 96)) / 150)
      const axeX = 195 + 75 * phase
      const bord = axeX + cote * 105
      touffes.push({
        x: bord + cote * (2 + tirer() * 26),
        y,
        hauteur: 14 + tirer() * 24,
        penche: (tirer() - 0.5) * 16,
        vert: tirer() < 0.55,
      })
    }
  }
  return touffes
}

/** Quelques galets, posés sur la berge au ras de l'eau. */
function galets(nombre: number) {
  const tirer = semer(880417)
  const h = hauteurPour(nombre)
  return Array.from({ length: Math.round(h / 90) }, () => {
    const y = tirer() * h
    const cote = tirer() < 0.5 ? -1 : 1
    const axeX = 195 + 75 * Math.cos((Math.PI * (y - 96)) / 150)
    return {
      x: axeX + cote * (110 + tirer() * 40),
      y,
      rx: 6 + tirer() * 10,
      ry: 4 + tirer() * 5,
      tourne: (tirer() - 0.5) * 40,
    }
  })
}

interface RiviereDesNiveauxProps {
  nombre: number
}

/**
 * La rivière des niveaux.
 *
 * Elle était « un ruban lavande opaque » — un aplat au trait net, qui ne
 * ressemblait pas à de l'eau. Deux choses la rendent liquide :
 *
 * - **l'eau est le fond, pas un trait.** On peint une nappe large, puis les
 *   deux berges par-dessus la découpent. Un trait, si épais soit-il, garde
 *   deux bords parallèles et lit comme du papier ;
 * - **tout se dépose en couches**, chacune avec son propre `seed` de
 *   turbulence. Un seul lavis reste plat quelle que soit son opacité.
 */
export function RiviereDesNiveaux({ nombre }: RiviereDesNiveauxProps) {
  const hauteur = hauteurPour(nombre)
  const courant = courantPath(nombre)

  return (
    <svg
      className={styles.riviere}
      viewBox={`0 0 ${LARGEUR} ${hauteur}`}
      preserveAspectRatio="xMidYMin meet"
      role="presentation"
      aria-hidden="true"
    >
      {/*
        L'eau couvre tout le cadre. Les deux premières versions la peignaient
        en trait épais : son bord finissait toujours par apparaître quelque
        part, et la page lisait comme trois colonnes séparées par une couture
        verticale. Une nappe pleine n'a pas de bord — ce sont les berges qui la
        découpent, comme dans la nature.
      */}
      <g style={{ mixBlendMode: 'multiply' }}>
        <rect x="-20" y="-20" width={LARGEUR + 40} height={hauteur + 40} fill="var(--violet-brume)" opacity="0.3" />
        <rect
          x="-20"
          y="-20"
          width={LARGEUR + 40}
          height={hauteur + 40}
          fill="var(--violet)"
          opacity="0.12"
          filter="url(#aq-bord-1)"
        />
      </g>

      {/* Les fils du courant : ce qui fait qu'une nappe devient un cours d'eau. */}
      {[-56, -20, 20, 54].map((decalage, i) => (
        <path
          key={decalage}
          d={courant}
          fill="none"
          stroke={i % 2 === 0 ? 'var(--papier)' : 'var(--violet-profond)'}
          strokeWidth={i % 2 === 0 ? 10 : 2.5}
          strokeLinecap="round"
          opacity={i % 2 === 0 ? 0.55 : 0.14}
          transform={`translate(${decalage} 0)`}
          filter={`url(#aq-bord-${(i % 4) + 1})`}
        />
      ))}

      {/*
        Les berges. Le lavis de papier dessous est indispensable : sans lui, un
        `multiply` par-dessus l'eau ne fait que la foncer, et la terre lit
        comme une eau plus sale au lieu d'une rive.
      */}
      {([-1, 1] as const).map((cote, i) => (
        <g key={cote}>
          <path d={bergePath(nombre, cote)} fill="var(--papier)" filter={`url(#aq-bord-${i + 1})`} />
          <g style={{ mixBlendMode: 'multiply' }}>
            <path
              d={bergePath(nombre, cote)}
              fill="var(--color-domain-sciences)"
              opacity="0.26"
              filter={`url(#aq-bord-${i + 1})`}
            />
            <path
              d={bergePath(nombre, cote)}
              fill="var(--color-domain-histoire)"
              opacity="0.09"
              filter={`url(#aq-bord-${i + 3})`}
            />
          </g>
        </g>
      ))}

      {/* Les galets, au ras de l'eau. */}
      <g style={{ mixBlendMode: 'multiply' }}>
        {galets(nombre).map((g, i) => (
          <ellipse
            key={i}
            cx={g.x}
            cy={g.y}
            rx={g.rx}
            ry={g.ry}
            transform={`rotate(${g.tourne} ${g.x} ${g.y})`}
            fill="var(--violet-profond)"
            opacity="0.14"
          />
        ))}
      </g>

      {/* Les roseaux. Deux traits par touffe, d'opacités différentes : une
          seule ligne d'épaisseur constante lit comme un trait de règle. */}
      <g style={{ mixBlendMode: 'multiply' }}>
        {roseaux(nombre).map((r, i) => (
          <g key={i}>
            <path
              d={`M${r.x},${r.y} C${r.x + r.penche / 2},${r.y - r.hauteur * 0.6} ${r.x + r.penche},${r.y - r.hauteur * 0.8} ${r.x + r.penche * 1.4},${r.y - r.hauteur}`}
              fill="none"
              stroke={r.vert ? 'var(--color-domain-sciences)' : 'var(--violet)'}
              strokeWidth="2.2"
              strokeLinecap="round"
              opacity={r.vert ? 0.3 : 0.26}
            />
            <path
              d={`M${r.x + 3},${r.y} C${r.x + 3 - r.penche / 3},${r.y - r.hauteur * 0.5} ${r.x + 3 - r.penche / 2},${r.y - r.hauteur * 0.62} ${r.x + 3 - r.penche},${r.y - r.hauteur * 0.74}`}
              fill="none"
              stroke={r.vert ? 'var(--color-domain-sciences)' : 'var(--violet-profond)'}
              strokeWidth="1.6"
              strokeLinecap="round"
              opacity="0.2"
            />
          </g>
        ))}
      </g>
    </svg>
  )
}
