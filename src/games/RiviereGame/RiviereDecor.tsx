import styles from './RiviereDecor.module.css'

/**
 * Le décor peint de La Rivière — et, depuis cette version, **une rivière qui
 * coule vraiment**.
 *
 * Première version : un rectangle gris. Deuxième : de l'eau peinte, mais
 * immobile — verdict du propriétaire, « pas belle du tout, il faut du
 * mouvement ». Une eau qui ne bouge pas n'est pas de l'eau, c'est une bande
 * bleue.
 *
 * Comment le mouvement est obtenu, sans violer la règle de coût de la skill
 * `aquarelle` (« jamais de filtre SVG sur un élément animé ») :
 *
 * - les **berges et le lit** sont peints une fois, avec leurs lavis filtrés, et
 *   ne bougent jamais ;
 * - le **courant** est un groupe SANS filtre, dessiné en double sur deux
 *   hauteurs, qu'on fait défiler en `transform` — le motif se referme sur
 *   lui-même, donc la boucle est invisible ;
 * - les **reflets** respirent en `opacity` sur un cycle lent et décalé.
 *
 * Deux vitesses différentes (le fil rapide au centre, les reflets lents sur les
 * bords) suffisent à faire lire un courant : c'est la parallaxe qui donne la
 * profondeur, pas le nombre de traits.
 *
 * Tout est en `pointer-events: none` : le décor est peint, l'interface ne l'est
 * pas, et le mot doit rester saisissable partout sur sa course.
 */
export function RiviereDecor() {
  return (
    <svg
      className={styles.decor}
      viewBox="0 0 300 600"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        {/* Le lit du fleuve : plus sombre au centre, comme une eau profonde. */}
        <linearGradient id="riv-profondeur" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--color-domain-geographie)" stopOpacity="0.16" />
          <stop offset="50%" stopColor="var(--violet-profond)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="var(--color-domain-geographie)" stopOpacity="0.16" />
        </linearGradient>
        {/* Le motif de courant, défini une fois et réutilisé deux fois. */}
        <g id="riv-courant">
          <path d="M104,0 C96,90 112,180 100,280 C92,360 104,430 96,520 C92,560 98,580 100,600" />
          <path d="M150,-20 C160,80 142,170 154,278 C164,370 148,446 158,540 C162,570 156,590 150,600" />
          <path d="M196,12 C204,100 188,190 200,290 C210,366 196,438 204,522 C208,562 200,584 196,600" />
          <path d="M126,40 C120,130 132,210 124,300 C118,380 128,450 122,540 C120,570 124,588 126,600" />
          <path d="M174,-40 C182,60 168,150 178,250 C188,340 172,420 180,510 C184,556 176,580 174,600" />
        </g>
        <g id="riv-remous">
          <path d="M118,120 C130,113 142,125 154,117" />
          <path d="M170,236 C182,229 192,241 204,233" />
          <path d="M96,352 C108,345 120,357 132,349" />
          <path d="M160,462 C172,455 184,467 196,459" />
          <path d="M132,540 C144,533 156,545 168,537" />
        </g>
      </defs>

      {/* ---- Ce qui ne bouge jamais : les berges et le lit, avec leurs lavis ---- */}
      <g style={{ mixBlendMode: 'multiply' }}>
        <path
          d="M0,0 L58,0 C44,120 66,250 48,380 C36,470 52,540 40,600 L0,600 Z"
          fill="var(--color-domain-sciences)"
          opacity={0.34}
          filter="url(#aq-bord-3)"
        />
        <path
          d="M0,0 L50,0 C38,130 60,250 40,382 C28,472 46,540 32,600 L0,600 Z"
          fill="var(--color-domain-sciences)"
          opacity={0.24}
          filter="url(#aq-bord-4)"
        />
        <path
          d="M300,0 L244,0 C258,120 236,250 254,380 C266,470 250,540 262,600 L300,600 Z"
          fill="var(--color-domain-sciences)"
          opacity={0.34}
          filter="url(#aq-bord-4)"
        />
        <path
          d="M300,0 L252,0 C264,130 242,250 260,382 C272,472 254,540 270,600 L300,600 Z"
          fill="var(--color-domain-sciences)"
          opacity={0.24}
          filter="url(#aq-bord-3)"
        />

        {/* L'eau, en deux lavis superposés puis un dégradé de profondeur. */}
        <path
          d="M56,0 L246,0 C232,140 254,270 240,400 C230,490 246,548 238,600 L44,600 C52,548 34,490 46,400 C64,270 42,140 56,0 Z"
          fill="var(--color-domain-geographie)"
          opacity={0.24}
          filter="url(#aq-bord-3)"
        />
        <path
          d="M70,0 L232,0 C220,150 240,270 226,398 C216,486 232,546 224,600 L58,600 C66,546 48,486 60,398 C78,270 56,150 70,0 Z"
          fill="url(#riv-profondeur)"
          filter="url(#aq-bord-4)"
        />
      </g>

      {/* ---- Ce qui coule : aucun filtre ici, uniquement des transformations ---- */}
      <g className={styles.courant}>
        <g className={styles.courantMotif}>
          <use href="#riv-courant" />
          <use href="#riv-courant" y={-600} />
        </g>
      </g>

      <g className={styles.remous}>
        <g className={styles.remousMotif}>
          <use href="#riv-remous" />
          <use href="#riv-remous" y={-600} />
        </g>
      </g>

      {/* Les écumes : de petits éclats clairs qui remontent la surface. */}
      <g className={styles.ecume}>
        <g className={styles.ecumeMotif}>
          <circle cx={112} cy={80} r={2.5} />
          <circle cx={188} cy={190} r={2} />
          <circle cx={140} cy={310} r={3} />
          <circle cx={205} cy={420} r={2.2} />
          <circle cx={98} cy={500} r={2.6} />
          <circle cx={112} cy={-520} r={2.5} />
          <circle cx={188} cy={-410} r={2} />
          <circle cx={140} cy={-290} r={3} />
          <circle cx={205} cy={-180} r={2.2} />
          <circle cx={98} cy={-100} r={2.6} />
        </g>
      </g>
    </svg>
  )
}
