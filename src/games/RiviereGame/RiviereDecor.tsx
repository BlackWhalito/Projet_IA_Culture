/**
 * Le décor peint de La Rivière.
 *
 * Constat de l'audit : **La Rivière n'avait pas de rivière.** Un rectangle
 * gris, une lettre qui tombe, deux boutons. Le nom de la mécanique promettait
 * un courant et des berges ; l'écran donnait un tunnel. C'est l'écart le plus
 * net du projet entre ce qu'un jeu annonce et ce qu'il montre.
 *
 * Règles de la skill `aquarelle` appliquées ici :
 *
 * - **le décor est peint, l'interface ne l'est pas** — tout est en
 *   `pointer-events: none`, les mots et les paniers gardent leurs bords nets ;
 * - **chaque forme reçoit deux ou trois lavis**, même chemin, `seed` différent,
 *   ce qui fonce aux recouvrements comme un pinceau qui repasse ;
 * - **les filtres doux** (`aq-bord-3`, `aq-bord-4`) et non les forts : les
 *   bandes de courant font une quinzaine d'unités de large, et un déplacement
 *   de ±15 les effacerait — c'est ce qui était arrivé aux presqu'îles de la
 *   carte de France ;
 * - **trois couleurs**, le violet ne comptant pas : l'eau bleu ardoise, les
 *   berges vert olive, le papier.
 *
 * Le viewBox est fixe et le composant sans état : peint une fois, jamais
 * recalculé pendant le jeu.
 */
export function RiviereDecor() {
  return (
    <svg
      className="riviereDecor"
      viewBox="0 0 300 600"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
    >
      <g style={{ mixBlendMode: 'multiply' }}>
        {/* Les deux berges : elles cadrent le courant et disent où sont les rives. */}
        <path
          d="M0,0 L58,0 C44,120 66,250 48,380 C36,470 52,540 40,600 L0,600 Z"
          fill="var(--color-domain-sciences)"
          opacity={0.3}
          filter="url(#aq-bord-3)"
        />
        <path
          d="M0,0 L52,0 C40,130 60,250 42,382 C30,472 46,540 34,600 L0,600 Z"
          fill="var(--color-domain-sciences)"
          opacity={0.22}
          filter="url(#aq-bord-4)"
        />
        <path
          d="M300,0 L244,0 C258,120 236,250 254,380 C266,470 250,540 262,600 L300,600 Z"
          fill="var(--color-domain-sciences)"
          opacity={0.3}
          filter="url(#aq-bord-4)"
        />
        <path
          d="M300,0 L250,0 C262,130 242,250 258,382 C270,472 254,540 266,600 L300,600 Z"
          fill="var(--color-domain-sciences)"
          opacity={0.22}
          filter="url(#aq-bord-3)"
        />

        {/* L'eau : un lavis large entre les deux berges. */}
        <path
          d="M56,0 L246,0 C232,140 254,270 240,400 C230,490 246,548 238,600 L44,600 C52,548 34,490 46,400 C64,270 42,140 56,0 Z"
          fill="var(--color-domain-geographie)"
          opacity={0.26}
          filter="url(#aq-bord-3)"
        />
        <path
          d="M70,0 L232,0 C220,150 240,270 226,398 C216,486 232,546 224,600 L58,600 C66,546 48,486 60,398 C78,270 56,150 70,0 Z"
          fill="var(--color-domain-geographie)"
          opacity={0.2}
          filter="url(#aq-bord-4)"
        />

        {/* Le fil du courant : c'est ce qui fait qu'on voit l'eau *couler*,
            et pas seulement une bande bleue. Traits inégaux, jamais droits. */}
        <g stroke="var(--violet-profond)" fill="none" strokeLinecap="round" opacity={0.28}>
          <path d="M104,40 C96,130 112,220 100,320 C92,400 104,470 96,556" strokeWidth={2.5} />
          <path d="M150,20 C160,120 142,210 154,318 C164,410 148,486 158,580" strokeWidth={3} />
          <path d="M196,52 C204,140 188,230 200,330 C210,406 196,478 204,562" strokeWidth={2.5} />
        </g>

        {/* Quelques remous, pour que la surface ne soit pas lisse. */}
        <g stroke="var(--violet)" fill="none" strokeLinecap="round" opacity={0.22}>
          <path d="M118,120 C130,114 142,124 154,118" strokeWidth={2} />
          <path d="M170,236 C182,230 192,240 204,234" strokeWidth={2} />
          <path d="M96,352 C108,346 120,356 132,350" strokeWidth={2} />
          <path d="M160,462 C172,456 184,466 196,460" strokeWidth={2} />
        </g>
      </g>
    </svg>
  )
}
