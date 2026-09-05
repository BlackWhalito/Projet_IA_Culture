import type { CSSProperties } from 'react'
import type { GameTypeId } from '../types/content'
import { semer } from '../engine/courbe'
import styles from './DecorDeJeu.module.css'

/**
 * Le bandeau peint de chaque jeu.
 *
 * Le reproche était net : « la salle, c'est juste une page blanche, et ce
 * n'est pas très joli ». Chaque mécanique reçoit donc sa scène.
 *
 * Deux contraintes de la skill `aquarelle` décident de la forme :
 *
 * - **le décor est peint, l'interface ne l'est pas.** La scène est un bandeau
 *   en haut de la carte, jamais un fond sous le texte : un lavis chargé
 *   derrière une consigne la rend illisible, et jouable gagne toujours contre
 *   joli ;
 * - **rien ne bouge pendant qu'on joue.** Aucune de ces scènes n'est animée.
 *
 * Le vocabulaire est commun — un ciel, deux ou trois plans de collines — et
 * chaque mécanique n'ajoute que ce qui la distingue. Dix scènes indépendantes
 * auraient dérivé les unes des autres au premier ajout.
 */

const L = 400
const H = 150

/** Une colline : trois couches, seeds distincts, comme tout pigment déposé. */
function Colline({
  d,
  couleur,
  opacite,
  seed,
}: {
  d: string
  couleur: string
  opacite: number
  seed: number
}) {
  return (
    <g style={{ mixBlendMode: 'multiply' }}>
      <path d={d} fill={couleur} opacity={opacite} filter={`url(#aq-bord-${(seed % 4) + 1})`} />
      <path
        d={d}
        fill={couleur}
        opacity={opacite * 0.7}
        transform="translate(2 -2)"
        filter={`url(#aq-bord-${((seed + 2) % 4) + 1})`}
      />
    </g>
  )
}

/** Les lointains : toujours en violet-brume, c'est la perspective atmosphérique. */
function Fond() {
  return (
    <>
      <Colline
        d={`M-10,${H} L-10,86 C60,70 140,92 210,78 C280,64 340,80 ${L + 10},70 L${L + 10},${H} Z`}
        couleur="var(--violet-brume)"
        opacite={0.3}
        seed={0}
      />
      <Colline
        d={`M-10,${H} L-10,104 C70,94 130,112 200,102 C270,92 330,106 ${L + 10},98 L${L + 10},${H} Z`}
        couleur="var(--violet)"
        opacite={0.18}
        seed={2}
      />
    </>
  )
}

/** Un arbre lointain : un tronc et une masse, jamais un dessin d'arbre. */
function Arbre({ x, y, h, seed }: { x: number; y: number; h: number; seed: number }) {
  return (
    <g style={{ mixBlendMode: 'multiply' }}>
      <path
        d={`M${x},${y} L${x + 1},${y - h}`}
        stroke="var(--violet-profond)"
        strokeWidth="2.4"
        strokeLinecap="round"
        opacity="0.34"
      />
      <ellipse
        cx={x + 1}
        cy={y - h - 6}
        rx={h * 0.42}
        ry={h * 0.36}
        fill="var(--color-domain-sciences)"
        opacity="0.22"
        filter={`url(#aq-bord-${(seed % 4) + 1})`}
      />
    </g>
  )
}

function Scene({ gameType }: { gameType: GameTypeId }) {
  switch (gameType) {
    /* Hugo marche vers une tombe, la nuit, avant l'aube. */
    case 'vers':
      return (
        <>
          <g style={{ mixBlendMode: 'multiply' }}>
            <circle cx="318" cy="40" r="17" fill="var(--violet-brume)" opacity="0.5" />
            <circle cx="326" cy="35" r="17" fill="var(--papier)" opacity="0.96" />
          </g>
          <Fond />
          <Arbre x={62} y={104} h={40} seed={1} />
          <Arbre x={96} y={108} h={26} seed={3} />
          <Arbre x={286} y={106} h={32} seed={2} />
        </>
      )

    /* Les poteaux du télégraphe, et les fils qui filent vers l'horizon. */
    case 'telegramme':
      return (
        <>
          <Fond />
          <g style={{ mixBlendMode: 'multiply' }}>
            {[
              { x: 40, h: 74 },
              { x: 132, h: 58 },
              { x: 210, h: 46 },
              { x: 268, h: 36 },
              { x: 310, h: 28 },
            ].map((p, i, tous) => (
              <g key={p.x}>
                <path
                  d={`M${p.x},110 L${p.x},${110 - p.h}`}
                  stroke="var(--encre)"
                  strokeWidth={2.6 - i * 0.35}
                  strokeLinecap="round"
                  opacity="0.42"
                />
                <path
                  d={`M${p.x - 9 + i},${110 - p.h + 6} L${p.x + 9 - i},${110 - p.h + 6}`}
                  stroke="var(--encre)"
                  strokeWidth={2 - i * 0.25}
                  strokeLinecap="round"
                  opacity="0.38"
                />
                {i < tous.length - 1 ? (
                  <path
                    d={`M${p.x},${110 - p.h + 8} Q${(p.x + tous[i + 1].x) / 2},${118 - (p.h + tous[i + 1].h) / 2} ${tous[i + 1].x},${110 - tous[i + 1].h + 8}`}
                    fill="none"
                    stroke="var(--encre)"
                    strokeWidth="1.1"
                    opacity="0.3"
                  />
                ) : null}
              </g>
            ))}
          </g>
        </>
      )

    /* La forêt du corbeau : des troncs vus d'en bas, et du feuillage. */
    case 'flatterie':
      return (
        <>
          {/* Le feuillage d'abord, pour que les troncs le traversent. */}
          <g style={{ mixBlendMode: 'multiply' }}>
            <ellipse cx="70" cy="10" rx="110" ry="44" fill="var(--color-domain-sciences)" opacity="0.26" filter="url(#aq-bord-1)" />
            <ellipse cx="220" cy="2" rx="120" ry="46" fill="var(--color-domain-sciences)" opacity="0.22" filter="url(#aq-bord-3)" />
            <ellipse cx="356" cy="14" rx="86" ry="40" fill="var(--color-domain-sciences)" opacity="0.24" filter="url(#aq-bord-2)" />
            <ellipse cx="150" cy="34" rx="78" ry="26" fill="var(--violet)" opacity="0.14" filter="url(#aq-bord-4)" />
            <ellipse cx="300" cy="40" rx="70" ry="22" fill="var(--violet)" opacity="0.12" filter="url(#aq-bord-1)" />
          </g>
          {/* Les troncs. Les pâles sont loin : la perspective atmosphérique
              fait la profondeur toute seule, sans changer d'échelle. */}
          <g style={{ mixBlendMode: 'multiply' }}>
            {[
              { x: 30, l: 20, o: 0.3 },
              { x: 96, l: 9, o: 0.16 },
              { x: 148, l: 26, o: 0.34 },
              { x: 214, l: 8, o: 0.14 },
              { x: 258, l: 17, o: 0.26 },
              { x: 324, l: 11, o: 0.18 },
              { x: 376, l: 24, o: 0.32 },
            ].map((t, i) => (
              <path
                key={t.x}
                d={`M${t.x},${H + 6} C${t.x + 3},${H * 0.6} ${t.x + 5},${H * 0.3} ${t.x + 7},-6`}
                fill="none"
                stroke="var(--violet-profond)"
                strokeWidth={t.l}
                strokeLinecap="round"
                opacity={t.o}
                filter={`url(#aq-bord-${(i % 4) + 1})`}
              />
            ))}
          </g>
          {/* Le sol de la clairière. */}
          <Colline
            d={`M-10,${H} L-10,120 C90,112 180,126 260,118 C320,112 350,120 ${L + 10},114 L${L + 10},${H} Z`}
            couleur="var(--color-domain-histoire)"
            opacite={0.16}
            seed={1}
          />
        </>
      )

    /* La mer, pour qui pointe une côte sur une carte. */
    case 'capsur':
      return (
        <>
          <Fond />
          <g style={{ mixBlendMode: 'multiply' }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <path
                key={i}
                d={`M${-10 + i * 14},${118 + i * 6} q26,-7 52,0 t52,0 t52,0 t52,0 t52,0 t52,0`}
                fill="none"
                stroke="var(--color-domain-geographie)"
                strokeWidth="2"
                strokeLinecap="round"
                opacity={0.24 - i * 0.03}
              />
            ))}
            <path d="M300,104 L300,58 L336,104 Z" fill="var(--papier)" opacity="0.9" />
            <path d="M300,104 L300,58 L336,104 Z" fill="var(--violet)" opacity="0.2" filter="url(#aq-bord-2)" />
          </g>
        </>
      )

    /* Le chemin qui monte : on ne sait pas encore où il mène. */
    case 'fildesjours':
      return (
        <>
          <Fond />
          <g style={{ mixBlendMode: 'multiply' }}>
            <path
              d={`M140,${H} C176,120 200,104 224,86 C238,76 252,74 268,72`}
              fill="none"
              stroke="var(--color-domain-histoire)"
              strokeWidth="34"
              strokeLinecap="round"
              opacity="0.16"
              filter="url(#aq-bord-1)"
            />
            <path
              d={`M140,${H} C176,120 200,104 224,86 C238,76 252,74 268,72`}
              fill="none"
              stroke="var(--papier)"
              strokeWidth="12"
              strokeLinecap="round"
              opacity="0.5"
            />
          </g>
          <Arbre x={90} y={112} h={30} seed={2} />
          <Arbre x={318} y={98} h={22} seed={0} />
        </>
      )

    /* Les bornes d'un chemin : ce qui est déjà posé, et ce qui vient. */
    case 'timeline':
      return (
        <>
          <Fond />
          <g style={{ mixBlendMode: 'multiply' }}>
            {[
              { x: 34, h: 40 },
              { x: 118, h: 34 },
              { x: 196, h: 28 },
              { x: 262, h: 22 },
              { x: 316, h: 17 },
              { x: 356, h: 13 },
            ].map((b, i) => (
              <rect
                key={b.x}
                x={b.x}
                y={112 - b.h}
                width={11 - i}
                height={b.h}
                rx="3"
                fill="var(--violet-profond)"
                opacity={0.3 - i * 0.03}
                filter={`url(#aq-bord-${(i % 4) + 1})`}
              />
            ))}
          </g>
        </>
      )

    /* La foire : des fanions au-dessus d'une table de pari. */
    case 'chaine':
      return (
        <>
          <Fond />
          <g style={{ mixBlendMode: 'multiply' }}>
            <path
              d="M-10,14 C80,36 150,30 230,40 C290,48 340,42 410,52"
              fill="none"
              stroke="var(--encre)"
              strokeWidth="1.4"
              opacity="0.3"
            />
            {Array.from({ length: 11 }, (_, i) => {
              const tirer = semer(4400 + i)
              const x = -4 + i * 38
              const y = 16 + i * 3.4
              const teintes = [
                'var(--color-domain-histoire)',
                'var(--violet)',
                'var(--color-domain-sciences)',
              ]
              return (
                <path
                  key={x}
                  d={`M${x},${y} L${x + 20},${y + 2} L${x + 10},${y + 26} Z`}
                  fill={teintes[i % 3]}
                  opacity={0.24 + tirer() * 0.12}
                  filter={`url(#aq-bord-${(i % 4) + 1})`}
                />
              )
            })}
          </g>
        </>
      )

    /* Le bureau du secrétaire : l'encrier et la lueur de la lampe. */
    case 'ponctuation':
      return (
        <>
          <g style={{ mixBlendMode: 'multiply' }}>
            <ellipse cx="200" cy="52" rx="150" ry="54" fill="var(--color-domain-histoire)" opacity="0.1" filter="url(#aq-bord-4)" />
            <rect x="-10" y="104" width={L + 20} height={H - 104} fill="var(--color-domain-histoire)" opacity="0.2" filter="url(#aq-bord-1)" />
            <path d="M262,104 L262,86 q14,-4 28,0 L290,104 Z" fill="var(--encre)" opacity="0.32" filter="url(#aq-bord-2)" />
            <path
              d="M300,102 C316,82 330,58 344,34"
              fill="none"
              stroke="var(--encre)"
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0.3"
            />
            <rect x="86" y="88" width="118" height="16" rx="3" fill="var(--papier)" opacity="0.9" />
            <rect x="86" y="88" width="118" height="16" rx="3" fill="var(--violet)" opacity="0.14" filter="url(#aq-bord-3)" />
          </g>
        </>
      )

    /* L'eau, pour la rivière — le jeu a déjà son décor animé, celui-ci ne fait
       que prolonger la scène au-dessus de la carte. */
    case 'riviere':
      return (
        <>
          <Fond />
          <g style={{ mixBlendMode: 'multiply' }}>
            {[0, 1, 2, 3].map((i) => (
              <path
                key={i}
                d={`M-10,${112 + i * 9} q30,-6 60,0 t60,0 t60,0 t60,0 t60,0 t60,0`}
                fill="none"
                stroke="var(--color-domain-geographie)"
                strokeWidth="2.4"
                strokeLinecap="round"
                opacity={0.26 - i * 0.04}
              />
            ))}
          </g>
          <Arbre x={54} y={104} h={30} seed={1} />
          <Arbre x={344} y={100} h={24} seed={3} />
        </>
      )

    /* Le QCM n'a pas de lieu : il a le paysage nu, et c'est très bien. */
    default:
      return (
        <>
          <Fond />
          <Arbre x={72} y={102} h={34} seed={0} />
          <Arbre x={318} y={96} h={26} seed={2} />
        </>
      )
  }
}

interface DecorDeJeuProps {
  gameType: GameTypeId
  couleurDomaine: string
}

export function DecorDeJeu({ gameType, couleurDomaine }: DecorDeJeuProps) {
  return (
    <div className={styles.cadre} style={{ '--_teinte': couleurDomaine } as CSSProperties}>
      <svg
        className={styles.scene}
        viewBox={`0 0 ${L} ${H}`}
        preserveAspectRatio="xMidYMid meet"
        role="presentation"
        aria-hidden="true"
      >
        {/* Le ciel : un lavis de la couleur du domaine, très pâle. C'est ce qui
            fait qu'un jeu d'histoire ne ressemble pas à un jeu de sciences. */}
        <rect x="-10" y="-10" width={L + 20} height={H + 20} fill="var(--_teinte)" opacity="0.08" />
        <Scene gameType={gameType} />
      </svg>
    </div>
  )
}
