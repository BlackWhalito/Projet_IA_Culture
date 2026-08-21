import clsx from 'clsx'
import { WatercolorScene } from '../../components/watercolor/WatercolorScene'
import { citeEngloutieScene, oceanScene } from './scenes'
import styles from './HomeScreen.module.css'

/**
 * Les deux tableaux aquarelle qui encadrent l'accueil sur grand écran
 * (masqués sous 1100px, voir HomeScreen.module.css). Peints par le moteur
 * génératif plutôt que dessinés à la main : une forme écrite à la main ne
 * donne jamais un rendu pictural, voir src/components/watercolor/engine.ts.
 */
export function SideArt({ side }: { side: 'left' | 'right' }) {
  return (
    <div className={clsx(styles.sideArt, side === 'left' ? styles.sideArtLeft : styles.sideArtRight)}>
      <WatercolorScene
        paint={side === 'left' ? oceanScene : citeEngloutieScene}
        width={220}
        height={640}
        seed={side === 'left' ? 1847 : 2213}
      />
    </div>
  )
}
