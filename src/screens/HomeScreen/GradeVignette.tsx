import type { ReactNode } from 'react'
import type { GradeId } from '../../types/content'
import { GRADE_ART } from './gradeArt'

/**
 * La vignette peinte d'une classe : un décor de lavis, puis le motif au trait
 * de `gradeArt.tsx` posé dedans.
 *
 * Format PAYSAGE (200 x 88), et non plus carré. C'est le vrai gain de
 * dimensionnement de l'accueil : en carré, neuf cartes font plus de 1200px de
 * haut sur un écran de bureau, alors que la grille 3x3 en paysage se lit d'un
 * seul coup d'œil.
 *
 * Deux modes, et pas trois : `vif` pour la seule classe ouverte, `brume` pour
 * les autres. Une classe fermée n'est pas grisée, elle est LOIN — en aquarelle
 * la perspective atmosphérique se fait au lavis violet, jamais au gris. Le CP,
 * lui, est en pleine lumière chaude.
 *
 * Les filtres viennent de `AquarelleAtmosphere`, monté à la racine : on les
 * référence, on ne les redéclare jamais ici.
 */

interface Palette {
  ciel: string
  cielA: number
  sol: string
  solA: number
  accent: string
  accentA: number
  appui: string
  appuiA: number
  pale: string
  paleA: number
  ink: string
  inkO: number
  trait: string
}

const PAPIER = '#f7f2e7'
const SURFACE = '#fffdf8'

const PALETTES: Record<'vif' | 'brume', Palette> = {
  vif: {
    ciel: '#e6d9c4', cielA: 0.42,
    sol: '#d9a35f', solA: 0.4,
    accent: '#7a9455', accentA: 0.44,
    appui: '#8d6aa8', appuiA: 0.24,
    pale: '#e6d9c4', paleA: 0.5,
    ink: '#3f3542', inkO: 1,
    trait: '#5d4574',
  },
  brume: {
    ciel: '#c3b0d4', cielA: 0.19,
    sol: '#e6d9c4', solA: 0.34,
    accent: '#8d6aa8', accentA: 0.2,
    appui: '#c3b0d4', appuiA: 0.17,
    pale: '#e6d9c4', paleA: 0.3,
    ink: '#4a3560', inkO: 0.95,
    trait: '#9b86b3',
  },
}

/**
 * Le pigment se dépose en couches : toute forme peinte est repassée trois
 * fois, même tracé, filtre (donc graine) différent, en `multiply`. C'est ce
 * recouvrement qui fait les bords riches et le grain — une passe unique rend
 * un aplat mou qui ne ressemble à rien. Règle de la skill `aquarelle`.
 */
const REPARTITION = [0.52, 0.36, 0.28]

function couches(
  cle: string,
  make: (filtre: string, opacite: number, cle: string) => ReactNode,
  alpha: number,
  filtres: readonly string[] = ['aq-bord-1', 'aq-bord-2', 'aq-bord-3'],
): ReactNode[] {
  return filtres.map((f, i) => make(f, +(alpha * REPARTITION[i]).toFixed(3), `${cle}-${i}`))
}

const ell = (cx: number, cy: number, rx: number, ry: number, color: string) =>
  (f: string, o: number, cle: string) => (
    <ellipse key={cle} cx={cx} cy={cy} rx={rx} ry={ry} fill={color} opacity={o} filter={`url(#${f})`} />
  )

const bande = (y: number, h: number, color: string) =>
  (f: string, o: number, cle: string) => (
    <rect key={cle} x={-12} y={y} width={224} height={h} fill={color} opacity={o} filter={`url(#${f})`} />
  )

const courbe = (d: string, w: number, color: string) =>
  (f: string, o: number, cle: string) => (
    <path key={cle} d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" opacity={o} filter={`url(#${f})`} />
  )

/**
 * Le décor autour du motif : une intention par classe, pour que les neuf
 * vignettes se lisent comme une série et non comme neuf dessins sans rapport.
 * La lumière descend du petit matin (CP) au soir (3e).
 */
function decor(id: GradeId, p: Palette): ReactNode {
  const ciel = couches('ciel', ell(100, 4, 132, 40, p.ciel), p.cielA)
  const sol = couches('sol', ell(100, 86, 128, 30, p.sol), p.solA)

  switch (id) {
    // CP — le pupitre au petit matin : une feuille réservée sous le crayon.
    case 'cp':
      return (
        <>
          {ciel}
          {couches('lueur', ell(46, 20, 74, 15, p.pale), p.paleA)}
          {sol}
          {couches('vert', ell(34, 68, 62, 24, p.accent), 0.34)}
          {couches('vert2', ell(174, 74, 46, 17, p.accent), 0.2, ['aq-bord-2', 'aq-bord-3', 'aq-bord-4'])}
          {couches(
            'feuille',
            (f, o, cle) => (
              <rect key={cle} x={54} y={30} width={96} height={44} rx={2} fill={SURFACE} opacity={o} filter={`url(#${f})`} transform="rotate(-3 102 52)" />
            ),
            1.15,
            ['aq-bord-3', 'aq-bord-4', 'aq-bord-3'],
          )}
          {couches('clair', courbe('M20,76 Q62,71 100,77', 3, PAPIER), 0.9, ['aq-bord-4', 'aq-bord-4', 'aq-bord-4'])}
        </>
      )
    // CE1 — le livre ouvert, et la lueur humide qui monte des pages.
    case 'ce1':
      return (
        <>
          {ciel}
          <ellipse cx={100} cy={46} rx={64} ry={32} fill={p.pale} opacity={p.paleA * 0.85} filter="url(#aq-diffusion)" />
          {sol}
          {couches('ombre', ell(100, 74, 60, 11, p.appui), p.appuiA + 0.2)}
          {couches('sol2', courbe('M32,80 Q100,75 168,81', 2.4, p.trait), 0.34, ['aq-bord-4', 'aq-bord-4', 'aq-bord-4'])}
        </>
      )
    // CE2 — la règle graduée, posée sur une trame de mesures.
    case 'ce2':
      return (
        <>
          {ciel}
          {sol}
          {couches('ligne', courbe('M6,60 Q100,55 194,61', 2.4, p.appui), p.appuiA + 0.5, ['aq-bord-4', 'aq-bord-4', 'aq-bord-4'])}
          <g stroke={p.appui} strokeWidth={1.8} opacity={p.appuiA + 0.44} strokeLinecap="round" filter="url(#aq-bord-4)">
            {[14, 36, 58, 80, 102, 124, 146, 168, 190].map((x, i) => (
              <line key={x} x1={x} y1={i % 2 ? 62 : 60} x2={x} y2={i % 2 ? 74 : 80} />
            ))}
          </g>
        </>
      )
    // CM1 — le globe, un horizon franc derrière lui, son reflet dessous.
    case 'cm1':
      return (
        <>
          {ciel}
          {couches('mer', bande(48, 48, p.appui), p.appuiA + 0.26)}
          {couches('horizon', courbe('M-12,48 Q100,44 212,49', 2.6, p.pale), p.paleA + 0.4, ['aq-bord-4', 'aq-bord-4', 'aq-bord-4'])}
          {couches('reflet', ell(100, 80, 40, 8, p.trait), 0.3, ['aq-bord-3', 'aq-bord-4', 'aq-bord-3'])}
          {couches('eclat', courbe('M28,68 Q86,64 144,69', 2, PAPIER), 0.7, ['aq-bord-4', 'aq-bord-4', 'aq-bord-4'])}
        </>
      )
    // CM2 — la loupe : ce qu'elle survole devient plus clair, le reste grène.
    case 'cm2':
      return (
        <>
          {ciel}
          {couches('grain', bande(30, 66, p.sol), p.solA + 0.26)}
          <g opacity={p.appuiA + 0.5} filter="url(#aq-bord-4)">
            {[[140, 26, 2.6], [158, 44, 2.2], [174, 24, 2.8], [150, 68, 2.4], [180, 60, 2], [22, 70, 2.4], [16, 34, 2]].map(
              ([cx, cy, r]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill={p.trait} />,
            )}
          </g>
          {couches('lentille', ell(94, 37, 40, 33, SURFACE), 1.4, ['aq-bord-2', 'aq-bord-3', 'aq-bord-4'])}
        </>
      )
    // 6e — le compas, et l'arc en pointillés qu'il vient de tracer.
    case '6e':
      return (
        <>
          {ciel}
          {sol}
          {couches('arc', courbe('M38,80 A64,64 0 0 1 162,80', 2.4, p.pale), p.paleA + 0.35, ['aq-bord-4', 'aq-bord-4', 'aq-bord-4'])}
          <path
            d="M20,78 A80,80 0 0 1 180,78"
            fill="none"
            stroke={p.appui}
            strokeWidth={2.4}
            opacity={p.appuiA + 0.55}
            strokeDasharray="7 8"
            strokeLinecap="round"
            filter="url(#aq-bord-4)"
          />
        </>
      )
    // 5e — l'éprouvette, et les bulles qui montent.
    case '5e':
      return (
        <>
          {ciel}
          {sol}
          {couches('halo', ell(100, 58, 50, 26, p.pale), p.paleA + 0.2, ['aq-bord-2', 'aq-bord-3', 'aq-bord-4'])}
          <g opacity={p.appuiA + 0.56} filter="url(#aq-bord-4)">
            {[[124, 36, 5, 1.8], [138, 19, 3.4, 1.6], [118, 14, 2.4, 1.4], [70, 26, 3.8, 1.6], [58, 12, 2.2, 1.4]].map(
              ([cx, cy, r, sw]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill="none" stroke={p.trait} strokeWidth={sw} />,
            )}
          </g>
        </>
      )
    // 4e — la boussole, posée sur une carte marine : les lignes de rhumb
    // rayonnent au-delà d'elle, et la mer commence sous l'horizon.
    case '4e':
      return (
        <>
          {ciel}
          {couches('carte', ell(100, 40, 88, 30, p.pale), p.paleA + 0.1, ['aq-bord-2', 'aq-bord-3', 'aq-bord-4'])}
          {sol}
          <g stroke={p.appui} strokeWidth={1.5} opacity={p.appuiA + 0.42} strokeLinecap="round" filter="url(#aq-bord-4)">
            {[[42, 42], [158, 42], [58, 16], [142, 16], [58, 68], [142, 68]].map(([x, y]) => (
              <line key={`${x}-${y}`} x1={100} y1={42} x2={x} y2={y} />
            ))}
          </g>
          {couches('mer', courbe('M-12,66 Q100,61 212,67', 2.6, p.appui), p.appuiA + 0.5, ['aq-bord-4', 'aq-bord-4', 'aq-bord-4'])}
          {couches('mer2', courbe('M22,78 Q100,73 178,79', 2.2, p.appui), p.appuiA + 0.36, ['aq-bord-4', 'aq-bord-4', 'aq-bord-4'])}
        </>
      )
    // 3e — le diplôme, dans la lumière du soir : fin du parcours.
    case '3e':
      return (
        <>
          {couches('soir', ell(100, -2, 136, 46, p.trait), p.cielA + 0.2)}
          {couches('lueur', ell(122, 32, 76, 22, p.pale), p.paleA + 0.3, ['aq-bord-2', 'aq-bord-3', 'aq-bord-4'])}
          {couches('sol', bande(54, 42, p.trait), p.solA + 0.26)}
          {couches('clair', courbe('M16,74 Q100,69 184,75', 3.2, PAPIER), 0.85, ['aq-bord-4', 'aq-bord-4', 'aq-bord-4'])}
        </>
      )
  }
}

export function GradeVignette({ gradeId, ouvert }: { gradeId: GradeId; ouvert: boolean }) {
  const p = PALETTES[ouvert ? 'vif' : 'brume']
  return (
    <svg viewBox="0 0 200 88" aria-hidden="true" style={{ display: 'block', width: '100%', height: 'auto' }}>
      <g style={{ mixBlendMode: 'multiply' }}>{decor(gradeId, p)}</g>
      {/*
        Le motif au trait de `gradeArt.tsx`, ramené du carré 100x100 dans le
        format paysage. C'est lui qui porte le lien avec la classe ; le décor
        ne fait que le mettre en situation.
      */}
      <g
        opacity={p.inkO}
        transform="translate(64, 7) scale(0.74)"
        style={{ ['--_accent' as string]: p.accent, ['--encre' as string]: p.ink }}
      >
        {GRADE_ART[gradeId]}
      </g>
    </svg>
  )
}
