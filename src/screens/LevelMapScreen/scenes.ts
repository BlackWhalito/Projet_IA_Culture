import type { PaintScene } from '../../components/watercolor/WatercolorScene'
import { dryStroke, flecks, wash } from '../../components/watercolor/engine'
import type { Point } from '../../components/watercolor/engine'
import { arcade, balustrade, facade } from '../../components/watercolor/architecture'
import { cloud, gradedWash, reflection } from '../../components/watercolor/atmosphere'
import { bassin, jetDeau, parterre, topiaire } from '../../components/watercolor/jardin'
import type { Quad } from '../../components/watercolor/jardin'
import {
  BLEU,
  ENCRE_SOMBRE,
  PIERRE_CHAUDE,
  PIERRE_PALE,
  SABLE,
  VERT,
  VIOLET,
  VIOLET_BRUME,
  VIOLET_PROFOND,
} from '../../components/watercolor/palette'
import type { LightPlan } from '../../components/watercolor/light'

/**
 * Les tableaux des niveaux. Un par niveau, indexés dans `levelArt.ts`.
 *
 * Contrainte qui gouverne tout ici : ces tableaux s'affichent à environ
 * 200 px de large sur un téléphone. Ce ne sont donc pas des scènes
 * détaillées qu'on réduirait, mais des compositions pensées d'emblée en
 * **silhouettes larges et contrastées** — le piège n° 1 du moteur est de
 * juger une image à sa résolution interne et de la découvrir illisible à
 * sa taille réelle.
 */

/**
 * L'ombre des feuillages, seule exception au violet qui porte toutes les
 * ombres du projet. Ce n'est pas un caprice : en `multiply`, le prune de
 * `VIOLET_PROFOND` posé sur le vert olive des ifs donne un BRUN — certains
 * ifs de la première version viraient au marron pendant que leurs voisins
 * restaient verts, selon la part du cône que l'ombre couvrait. Un bleu
 * ardoise reste une ombre colorée (la règle est « jamais du gris », pas
 * « toujours du violet ») et garde le feuillage vert.
 */
const OMBRE_FEUILLAGE = BLEU

/**
 * La lumière des tableaux de niveaux : la même que celle de l'accueil
 * (`src/screens/HomeScreen/scenes.ts`), venue de la gauche et chaude, pour
 * que toute l'application reste éclairée par un seul soleil.
 */
const LUMIERE: LightPlan = {
  angleDeg: 200,
  warm: SABLE,
  cool: VIOLET_PROFOND,
  accent: ENCRE_SOMBRE,
}

/**
 * Versailles, vu du jardin.
 *
 * Le sujet ne tient pas à la quantité de pierre mais à deux traits, et
 * ces deux-là seulement se lisent encore à 200 px :
 *
 * 1. **Une ligne de toit horizontale.** Un château fort se reconnaît à ses
 *    verticales — donjon, tours. Un palais du Grand Siècle se reconnaît à
 *    leur absence : une façade démesurément longue, plate, qu'une
 *    balustrade hérissée de statues termine sans jamais monter. C'est le
 *    contraste le plus sûr entre les deux, et il survit à n'importe quelle
 *    réduction.
 * 2. **Un jardin qui converge.** Les parterres en miroir, l'allée qui se
 *    resserre, les ifs alignés en tailles décroissantes : la géométrie
 *    imposée à la nature. C'est elle qui dit « à la française » — et,
 *    accessoirement, c'est le seul moyen de donner de la profondeur à une
 *    étendue plate (règle générale du moteur : c'est le sujet qui crée la
 *    profondeur, jamais la matière).
 *
 * Le jet d'eau est la seule verticale, et la seule chose qui bouge dans un
 * jardin dessiné à la règle. Il est placé sur l'axe, au-dessus de l'allée
 * de sable laissée presque nue — un voile d'eau pâle ne se voit qu'en
 * réserve, jamais posé sur une masse sombre (tout se peint en `multiply`).
 */
export const versaillesScene: PaintScene = (ctx, w, h, rng) => {
  const axis = w * 0.5
  // La façade : très large, très basse — près de dix fois plus longue que
  // haute. Ce rapport EST le sujet : l'étirer bien au-delà de ce qu'on
  // croit nécessaire est ce qui fait basculer la lecture de « un
  // bâtiment » à « Versailles ».
  const palaisW = w * 0.84
  const yFaite = h * 0.225
  const ySol = h * 0.4
  const yTerrasse = h * 0.525
  const corpsW = w * 0.22

  const jardinHaut = yTerrasse + h * 0.012
  const jardinBas = h * 1.02
  const profondeur = (y: number) => (y - jardinHaut) / (jardinBas - jardinHaut)
  /** Demi-largeur de l'allée centrale : elle s'ouvre vers le spectateur. */
  const allee = (y: number) => w * (0.035 + 0.125 * profondeur(y))
  /** Bord extérieur du jardin, à gauche — il sort du cadre au premier plan. */
  const bordure = (y: number) => w * (0.13 - 0.235 * profondeur(y))

  // ---------------------------------------------------------------- ciel
  // Confiné au-dessus de la terrasse : en `multiply` rien n'occulte rien,
  // un ciel qui déborde sur le jardin le grise sur toute sa hauteur.
  gradedWash(ctx, -w * 0.05, 0, w * 1.05, yTerrasse, [
    // Le dégradé doit s'éteindre JUSTE à la ligne de toit, ni avant ni
    // après, et c'est le réglage le plus sensible du tableau.
    //
    // Trop tôt (première version) : le ciel n'a plus de densité au-dessus
    // du palais, la façade et le ciel se retrouvent à la même valeur —
    // mesuré à l'écran, 190 contre 183 — et le bâtiment devient un
    // fantôme, quelle que soit la couleur de sa pierre.
    //
    // Trop tard : tout se peint en `multiply`, donc un ciel encore dense
    // à hauteur de façade la teinte À TRAVERS elle. La version qui
    // gardait du sable jusqu'en bas rendait un Versailles rose.
    //
    // La chute est donc calée sur `yFaite` : plein pigment au-dessus,
    // papier presque nu en dessous.
    { at: 0, color: VIOLET, alpha: 0.46 },
    { at: 0.2, color: VIOLET, alpha: 0.38 },
    { at: 0.36, color: VIOLET_BRUME, alpha: 0.3 },
    { at: 0.47, color: VIOLET_BRUME, alpha: 0.12 },
    { at: 0.58, color: SABLE, alpha: 0.03 },
    { at: 1, color: SABLE, alpha: 0 },
  ])
  // Deux nuages volontairement très plats : ils redoublent l'horizontale
  // du bâtiment au lieu de la contrarier.
  cloud(ctx, w * 0.3, h * 0.07, w * 0.66, h * 0.022, rng, LUMIERE, {
    light: PIERRE_PALE,
    shade: VIOLET,
    alpha: 0.15,
  })
  cloud(ctx, w * 0.74, h * 0.125, w * 0.46, h * 0.013, rng, LUMIERE, {
    light: SABLE,
    shade: VIOLET_BRUME,
    alpha: 0.07,
  })

  // ------------------------------------------------------------- palais
  // Le corps de bâtiment, d'un seul tenant sur toute la largeur : trois
  // blocs juxtaposés donneraient trois faces éclairées et trois faces à
  // l'ombre, c'est-à-dire un code-barres. Le relief vient au-dessus, du
  // décrochement de l'attique central et des balustrades.
  // `shade` en pierre chaude, c'est-à-dire à peine distinct de `stone` :
  // `facade()` assombrit 45 % de sa largeur d'un seul bloc, ce qui modèle
  // bien un bâtiment étroit mais coupait ce mur de 270 px en deux moitiés
  // de couleurs différentes — essayé en violet franc puis en violet de
  // brume, les deux repeignaient la moitié droite du palais en lavande.
  // `spread`/`jitter` relevés pour la même raison d'échelle : aux valeurs
  // par défaut, une masse aussi large sort avec un bord de ruban adhésif.
  facade(ctx, axis, yFaite, ySol, palaisW, rng, LUMIERE, {
    stone: PIERRE_PALE,
    shade: PIERRE_CHAUDE,
    distance: 0.42,
    floors: 1,
    bays: 15,
    spread: 0.045,
    jitter: 0.11,
  })
  // Le soleil sur le tiers gauche du mur, du côté d'où vient la lumière.
  // `facade()` n'en pose qu'un voile, calibré pour des bâtiments étroits ;
  // sur cette largeur il ne se voyait pas, et le palais restait un bandeau
  // blanc sans température.
  wash(ctx, [
    [axis - palaisW / 2, ySol],
    [axis - palaisW / 2, yFaite],
    [axis - palaisW * 0.1, yFaite],
    [axis - palaisW * 0.1, ySol],
  ], rng, { color: SABLE, layers: 10, alpha: 0.06 / 10, spread: 0.04, jitter: 0.14 })

  // Le grain de la pierre. `stoneTexture()` a été essayé ici et retiré :
  // ses hachures en violet profond ne se lisent pas comme du grain sur un
  // mur de 270 px, mais comme un voile gris qui désature toute la pierre.
  // Des dépôts chauds et rares font le même travail sans ternir.
  flecks(ctx, axis, (yFaite + ySol) / 2, palaisW * 0.44, (ySol - yFaite) * 0.35, 7, rng, {
    color: SABLE,
    layers: 5,
    alpha: 0.035,
    spread: 0.3,
    jitter: 0.26,
  })
  // Le rez-de-chaussée en arcades : la rangée de petits noirs qui fait
  // basculer une masse claire en bâtiment habité. Bande volontairement
  // basse, et les ouvertures nombreuses donc étroites — larges et grises,
  // elles se lisaient comme les piles d'un viaduc ; hautes, elles
  // deviennent une jupe noire sous le palais.
  arcade(ctx, axis - palaisW / 2, axis + palaisW / 2, ySol - (ySol - yFaite) * 0.3, ySol, 27, rng, LUMIERE, 0.42)
  // Le bandeau qui sépare les deux niveaux, et le socle. Deux horizontales
  // franches valent, ici, tous les modelés de pierre.
  dryStroke(ctx, [[axis - palaisW / 2, ySol - (ySol - yFaite) * 0.44], [axis + palaisW / 2, ySol - (ySol - yFaite) * 0.42]], 1, rng, {
    color: VIOLET_PROFOND,
    alpha: 0.22,
    layers: 2,
  })
  dryStroke(ctx, [[axis - palaisW / 2, ySol], [axis + palaisW / 2, ySol]], 1.2, rng, {
    color: ENCRE_SOMBRE,
    alpha: 0.34,
    layers: 2,
  })

  // L'ombre portée de la corniche sur le haut du mur : le trait qui donne
  // son relief à une architecture classique. Sans elle, la façade reste
  // une découpe de papier posée sur le ciel.
  wash(ctx, [
    [axis - palaisW / 2, yFaite],
    [axis + palaisW / 2, yFaite],
    [axis + palaisW / 2, yFaite + h * 0.018],
    [axis - palaisW / 2, yFaite + h * 0.018],
  ], rng, { color: VIOLET_BRUME, layers: 10, alpha: 0.34 / 10, spread: 0.04, jitter: 0.18 })

  // L'attique central : le seul décrochement de toute la silhouette. Il
  // monte de très peu — c'est justement ce qui distingue un palais d'un
  // château fort, dont la moindre tour dépasse de plusieurs étages.
  const yAttique = h * 0.16
  facade(ctx, axis, yAttique, yFaite, corpsW, rng, LUMIERE, {
    stone: PIERRE_PALE,
    shade: PIERRE_PALE,
    distance: 0.7,
    floors: 0,
    bays: 0,
    spread: 0.05,
    jitter: 0.12,
  })

  // Les balustrades : sur les ailes d'abord, sur l'attique ensuite, plus
  // haut. Ce sont elles, avec leurs statues, qui donnent au toit sa
  // dentelure au lieu d'un bord de rectangle.
  const aileGauche: [number, number] = [axis - palaisW / 2, axis - corpsW / 2]
  const aileDroite: [number, number] = [axis + corpsW / 2, axis + palaisW / 2]
  for (const [x0, x1] of [aileGauche, aileDroite]) {
    balustrade(ctx, x0, x1, yFaite, h * 0.03, rng, LUMIERE, {
      stone: PIERRE_PALE,
      shade: VIOLET_PROFOND,
      distance: 0.24,
      statues: 3,
    })
  }
  balustrade(ctx, axis - corpsW / 2, axis + corpsW / 2, yAttique, h * 0.03, rng, LUMIERE, {
    stone: PIERRE_PALE,
    shade: VIOLET_PROFOND,
    distance: 0.26,
    statues: 3,
  })

  // Les bosquets qui ferment la perspective de chaque côté du palais :
  // des ifs de fond, pâlis par la distance. Sans eux la façade flotte,
  // coupée net par les bords du cadre.
  for (const cote of [-1, 1]) {
    for (let i = 0; i < 3; i += 1) {
      topiaire(ctx, axis + cote * (palaisW / 2 + w * (0.01 + i * 0.028)), ySol + h * 0.02, h * (0.15 - i * 0.018), rng, LUMIERE, {
        green: VERT,
        shade: OMBRE_FEUILLAGE,
        distance: 0.55,
      })
    }
  }

  // L'ombre que le palais porte à ses pieds, décalée du côté opposé à la
  // lumière : elle pose le bâtiment au sol au lieu de le laisser flotter.
  wash(ctx, [
    [axis - palaisW / 2, ySol],
    [axis + palaisW / 2, ySol],
    [axis + palaisW / 2 + w * 0.02, ySol + h * 0.018],
    [axis - palaisW / 2 + w * 0.02, ySol + h * 0.018],
  ], rng, { color: VIOLET_BRUME, layers: 12, alpha: 0.26 / 12, spread: 0.05, jitter: 0.2 })

  // ----------------------------------------------------------- terrasse
  // Une bande claire entre le palais et le jardin : elle sépare les deux
  // sujets et, surtout, elle laisse respirer — sans elle, les parterres
  // montent jusqu'aux murs et tout se tasse.
  dryStroke(ctx, [[0, yTerrasse], [w, yTerrasse + (rng() - 0.5) * h * 0.008]], h * 0.009, rng, {
    color: VIOLET_BRUME,
    alpha: 0.22,
    layers: 2,
  })
  for (const [x0, x1] of [[-w * 0.02, axis - w * 0.09], [axis + w * 0.09, w * 1.02]] as const) {
    balustrade(ctx, x0, x1, yTerrasse, h * 0.018, rng, LUMIERE, {
      stone: PIERRE_PALE,
      shade: VIOLET_BRUME,
      distance: 0.55,
    })
  }

  // Le Parterre d'Eau : les deux miroirs rectangulaires posés devant la
  // façade côté jardin. Ils occupent la bande qui, sans eux, restait un
  // quart de tableau vide entre le palais et les parterres — et c'est
  // exactement ce qui se trouve là dans le vrai jardin.
  //
  // Le reflet se peint en SOMBRE, jamais en clair : en `multiply` on ne
  // peut qu'assombrir, donc un palais pâle ne peut pas se refléter en
  // pâle. Ce qui se reflète ici, ce sont ses parties sombres — l'arcade
  // du rez-de-chaussée et la ligne de toit — et ça suffit à faire un
  // miroir.
  for (const cote of [-1, 1]) {
    const bx0 = axis + cote * w * 0.07
    const bx1 = axis + cote * w * 0.35
    const byLoin = ySol + h * 0.04
    const byPres = yTerrasse - h * 0.02
    wash(ctx, [
      [bx0, byLoin],
      [bx1, byLoin],
      [bx1 + cote * w * 0.035, byPres],
      [bx0 + cote * w * 0.004, byPres],
    ], rng, { color: BLEU, layers: 20, alpha: 0.62 / 20, spread: 0.04, jitter: 0.1 })
    reflection(ctx, (bx0 + bx1) / 2, Math.abs(bx1 - bx0) * 0.8, byLoin, (byPres - byLoin) * 0.55, VIOLET, rng, 3)
    dryStroke(ctx, [
      [bx0 + cote * w * 0.004, byPres],
      [bx1 + cote * w * 0.035, byPres],
    ], h * 0.005, rng, { color: VIOLET_BRUME, alpha: 0.22, layers: 1 })
  }

  // L'escalier axial, suggéré par trois marches — le lien entre la
  // terrasse et le jardin, et un rappel de l'axe avant même les parterres.
  for (let m = 0; m < 3; m += 1) {
    const my = yTerrasse - h * (0.03 - m * 0.014)
    const mw = w * (0.05 + m * 0.014)
    dryStroke(ctx, [[axis - mw, my], [axis + mw, my]], h * 0.007, rng, {
      color: VIOLET_PROFOND,
      alpha: 0.24,
      layers: 1,
    })
  }

  // ------------------------------------------------------------- jardin
  // Le sol, sous tout le reste : un voile chaud très faible qui monte en
  // densité vers le premier plan. Sans lui, les vides entre les parterres
  // restaient du papier nu et l'image se trouait — mais il doit rester
  // assez pâle pour que l'allée demeure la zone la plus claire, sans quoi
  // le jet d'eau n'a plus rien sur quoi se détacher.
  gradedWash(ctx, -w * 0.05, ySol, w * 1.05, h * 1.02, [
    { at: 0, color: PIERRE_PALE, alpha: 0.1 },
    { at: 0.6, color: PIERRE_PALE, alpha: 0.24 },
    { at: 1, color: VIOLET_BRUME, alpha: 0.28 },
  ])

  const yHaut = jardinHaut + h * 0.03
  const yBas = h * 0.8
  for (const cote of [-1, 1]) {
    const quad: Quad = [
      [axis + cote * (allee(yHaut) + w * 0.05), yHaut],
      [axis + cote * (axis - bordure(yHaut)), yHaut],
      [axis + cote * (axis - bordure(yBas)), yBas],
      [axis + cote * (allee(yBas) + w * 0.05), yBas],
    ]
    // Le quad doit rester dans le sens horaire pour que `wash` le trace
    // sans se replier : à droite les deux colonnes sont déjà dans l'ordre,
    // à gauche il faut les échanger.
    parterre(ctx, cote === 1 ? quad : [quad[1], quad[0], quad[3], quad[2]], rng, LUMIERE, {
      sand: PIERRE_PALE,
      green: VERT,
      shade: VIOLET_PROFOND,
      distance: 0.18,
      cols: 2,
      rows: 2,
    })
  }

  // Les ifs de l'allée : mêmes intervalles, tailles croissantes vers le
  // spectateur. C'est le seul indice de profondeur du tableau — un objet
  // de taille connue répété à plusieurs distances.
  for (const t of [0.02, 0.13, 0.27, 0.44, 0.66, 0.92]) {
    const y = jardinHaut + t * (jardinBas - jardinHaut)
    for (const cote of [-1, 1]) {
      topiaire(ctx, axis + cote * (allee(y) + w * 0.022), y, h * (0.05 + t * 0.15), rng, LUMIERE, {
        green: VERT,
        shade: OMBRE_FEUILLAGE,
        distance: 0.34 - t * 0.32,
        weight: 1 + t * 0.25,
      })
    }
  }

  // L'allée reste presque du papier nu : c'est la réserve la plus claire
  // du tableau, et la seule zone où le voile du jet d'eau peut se voir.
  // Deux fuyantes suffisent à la faire lire comme un sol qui s'éloigne.
  for (const cote of [-1, 1]) {
    const fuyante: Point[] = [
      [axis + cote * allee(jardinHaut), jardinHaut],
      [axis + cote * allee(h * 0.7), h * 0.7],
      [axis + cote * allee(jardinBas), jardinBas],
    ]
    dryStroke(ctx, fuyante, w * 0.006, rng, { color: VIOLET_BRUME, alpha: 0.26, layers: 1 })
  }

  // --------------------------------------------------- bassin et jet d'eau
  bassin(ctx, axis, h * 0.88, allee(h * 0.88) * 1.15, h * 0.07, rng, LUMIERE, {
    stone: PIERRE_PALE,
    water: BLEU,
    shade: VIOLET_PROFOND,
    distance: 0,
  })
  jetDeau(ctx, axis, h * 0.86, h * 0.28, rng, {
    spray: VIOLET,
    core: VIOLET_PROFOND,
    distance: 0.3,
  })

  // Le coin bas du tableau s'assombrit : c'est ce qui referme la
  // composition et empêche le regard de sortir par le bas, là où une
  // perspective centrale l'entraîne naturellement.
  gradedWash(ctx, -w * 0.05, h * 0.86, w * 1.05, h * 1.02, [
    { at: 0, color: VIOLET_BRUME, alpha: 0 },
    { at: 1, color: VIOLET, alpha: 0.2 },
  ])

  // Les deux ifs de premier plan, coupés par le bord bas : le repoussoir.
  // Ce sont les masses les plus sombres et les plus nettes du tableau —
  // sans un premier plan franc, une perspective centrale reste une image
  // plate, quelle que soit la justesse des fuyantes.
  topiaire(ctx, w * 0.05, h * 1.08, h * 0.52, rng, LUMIERE, {
    green: VERT,
    shade: OMBRE_FEUILLAGE,
    distance: 0,
    weight: 2.1,
  })
  topiaire(ctx, w * 0.96, h * 1.05, h * 0.46, rng, LUMIERE, {
    green: VERT,
    shade: OMBRE_FEUILLAGE,
    distance: 0,
    weight: 1.95,
  })
}
