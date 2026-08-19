/**
 * Monté une fois à la racine de l'app. Fournit :
 * - les filtres SVG de la direction artistique aquarelle (voir la skill
 *   `aquarelle`), référencés ailleurs par `filter="url(#aq-bord-1)"` etc.
 * - un grain de papier fixe et discret sur tout l'écran.
 *
 * Global pour l'instant car seul le CP (thème aquarelle) existe. Le jour où
 * un niveau scolaire "arcade" est ajouté, ce montage devra devenir
 * conditionnel au thème du niveau courant plutôt que de rester ici.
 */
export function AquarelleAtmosphere() {
  return (
    <>
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <defs>
          <filter id="aq-bord-1" x="-25%" y="-25%" width="150%" height="150%">
            <feTurbulence type="fractalNoise" baseFrequency="0.013" numOctaves={4} seed={3} result="g" />
            <feDisplacementMap in="SourceGraphic" in2="g" scale={15} xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id="aq-bord-2" x="-25%" y="-25%" width="150%" height="150%">
            <feTurbulence type="fractalNoise" baseFrequency="0.016" numOctaves={4} seed={19} result="g" />
            <feDisplacementMap in="SourceGraphic" in2="g" scale={12} xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id="aq-bord-3" x="-25%" y="-25%" width="150%" height="150%">
            <feTurbulence type="fractalNoise" baseFrequency="0.021" numOctaves={3} seed={41} result="g" />
            <feDisplacementMap in="SourceGraphic" in2="g" scale={9} xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id="aq-bord-4" x="-30%" y="-30%" width="160%" height="160%">
            <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves={3} seed={77} result="g" />
            <feDisplacementMap in="SourceGraphic" in2="g" scale={7} xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id="aq-diffusion">
            <feGaussianBlur stdDeviation="8" />
          </filter>
          <filter id="aq-papier">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={4} />
            <feColorMatrix type="saturate" values="0" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.055" />
            </feComponentTransfer>
          </filter>
        </defs>
      </svg>
      <svg
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      >
        <rect width="100%" height="100%" filter="url(#aq-papier)" />
      </svg>
    </>
  )
}
