import clsx from 'clsx'
import { WatercolorScene } from '../../components/watercolor/WatercolorScene'
import { citeEngloutieScene, oceanScene } from './scenes'
import styles from './HomeScreen.module.css'

/**
 * Les deux tableaux aquarelle qui encadrent l'accueil sur grand écran
 * (masqués sous 1100px, voir HomeScreen.module.css). Peints par le moteur
 * génératif plutôt que dessinés à la main : une forme écrite à la main ne
 * donne jamais un rendu pictural, voir src/components/watercolor/engine.ts.
 *
 * 340×990, contre 220×640 auparavant. La source doit suivre la largeur
 * réellement affichée (plafond CSS porté à 320px) : c'est cette taille-là qui
 * décide de ce qui est lisible, pas la résolution interne. Les colonnes de la
 * cité engloutie avaient déjà été jugées illisibles pour cette raison exacte —
 * nettes sur une capture zoomée, sous le seuil une fois réduites à l'écran.
 */
export function SideArt({ side }: { side: 'left' | 'right' }) {
  return (
    <div className={clsx(styles.sideArt, side === 'left' ? styles.sideArtLeft : styles.sideArtRight)}>
      <WatercolorScene
        paint={side === 'left' ? oceanScene : citeEngloutieScene}
        width={340}
        height={990}
        seed={side === 'left' ? 1847 : 2213}
      />
    </div>
  )
}
