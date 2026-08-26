import type { PaintScene } from '../../components/watercolor/WatercolorScene'
import { dryStroke, flecks, wash } from '../../components/watercolor/engine'
import type { Point } from '../../components/watercolor/engine'
import {
  arcade,
  balustrade,
  banner,
  battlement,
  facade,
  roundTower,
} from '../../components/watercolor/architecture'
import { cloud, gradedWash, reflection, ripples } from '../../components/watercolor/atmosphere'
import { knightOnHorse } from '../../components/watercolor/figure'
import { bassin, jetDeau, parterre, topiaire } from '../../components/watercolor/jardin'
import type { Quad } from '../../components/watercolor/jardin'
import {
  BLEU,
  ENCRE_SOMBRE,
  OCRE,
  PIERRE_CHAUDE,
  PIERRE_PALE,
  SABLE,
  VERT,
  VIOLET,
  VIOLET_BRUME,
  VIOLET_PROFOND,
} from '../../components/watercolor/palette'
import { litFromLeft } from '../../components/watercolor/light'
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
  const travees = 17
  const corpsW = (w * 0.84 * 5) / travees

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
    // `floors: 0` : la façade ne pose que sa masse, jamais ses fenêtres.
    // `windows()` décale chaque ouverture au hasard et en supprime une sur
    // six, exprès — « une grille parfaitement remplie se lit comme une
    // texture régulière ». C'est juste pour un palazzo en ruine, et faux
    // ici : la façade de Versailles EST une grille parfaitement remplie,
    // sa régularité est le sujet. Le désordre, si léger soit-il, la rendait
    // approximative. Les travées sont donc tracées à la main, plus bas, et
    // rigoureusement alignées avec les arcades du rez-de-chaussée.
    floors: 0,
    bays: 0,
    spread: 0.04,
    jitter: 0.08,
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

  // ------------------------------------------------- l'ordre de la façade
  //
  // Ce qui fait qu'une architecture classique se lit comme DESSINÉE et non
  // comme esquissée, ce ne sont ni la couleur de sa pierre ni la finesse
  // de ses bords : ce sont quelques traits sombres, droits et exactement
  // alignés. Une masse en lavage, aussi juste soit-elle, reste vague sans
  // eux.
  //
  // Tout ce bloc part donc d'une seule trame — `travee(i)` — que les
  // arcades du bas, les fenêtres du haut et les ressauts partagent. C'est
  // l'alignement vertical entre les trois qui produit l'impression de
  // précision, bien plus que le détail de chacun.
  const murX0 = axis - palaisW / 2
  const murX1 = axis + palaisW / 2
  const murH = ySol - yFaite
  const portee = palaisW / travees
  const travee = (i: number) => murX0 + portee * (i + 0.5)

  const yEntablement = yFaite + murH * 0.16
  const yFenetreHaut = yFaite + murH * 0.24
  const yFenetreBas = yFaite + murH * 0.58
  const yBandeau = yFaite + murH * 0.63
  const yArcade = yFaite + murH * 0.66

  // Le rez-de-chaussée en arcades : la rangée de petits noirs qui fait
  // basculer une masse claire en bâtiment habité. `arcade()` répartit ses
  // ouvertures sur exactement la même portée que `travee()`, donc chaque
  // arche tombe sous sa fenêtre.
  arcade(ctx, murX0, murX1, yArcade, ySol, travees, rng, LUMIERE, 0.42)

  // L'étage : une fenêtre cintrée par travée, tracée à la main pour rester
  // à sa place au pixel près. Le cintre compte autant que l'alignement —
  // un rectangle se lit comme une meurtrière, une ouverture arrondie
  // comme une croisée.
  const fenetreL = portee * 0.23
  for (let i = 0; i < travees; i += 1) {
    const fx = travee(i)
    const naissance = yFenetreHaut + fenetreL * 0.5
    const croisee: Point[] = [[fx - fenetreL / 2, yFenetreBas], [fx - fenetreL / 2, naissance]]
    for (let a = 0; a <= 6; a += 1) {
      const t = Math.PI - (a / 6) * Math.PI
      croisee.push([fx + Math.cos(t) * fenetreL * 0.5, naissance - Math.sin(t) * fenetreL * 0.5])
    }
    croisee.push([fx + fenetreL / 2, yFenetreBas])
    wash(ctx, croisee, rng, {
      color: VIOLET,
      layers: 8,
      alpha: 0.5 / 8,
      spread: 0.02,
      jitter: 0.04,
    })
  }

  // Les ressauts : les verticales qui marquent l'avant-corps central et
  // les deux pavillons d'extrémité. Quatre traits, pas une colonnade —
  // une verticale par travée donnerait un peigne, et un peigne à 5 px
  // d'intervalle redevient une texture.
  const yAttique = h * 0.16
  for (const i of [3, 6, 11, 14]) {
    const rx = murX0 + portee * i
    // Celles de l'avant-corps (6 et 11) montent jusqu'au sommet de
    // l'attique, celles des pavillons s'arrêtent à la ligne de toit. Une
    // verticale qui court d'un bout à l'autre du volume qu'elle marque,
    // c'est ce qui distingue un ressaut d'un trait posé sur un mur.
    const haut = i === 6 || i === 11 ? yAttique : yFaite
    dryStroke(ctx, [[rx, haut], [rx, ySol]], 0.9, rng, {
      color: VIOLET_PROFOND,
      alpha: 0.26,
      layers: 2,
      jitter: 0.03,
    })
  }

  // Les trois horizontales de l'ordre : entablement, bandeau d'étage,
  // socle. Ce sont les traits les plus francs du tableau après le
  // premier plan — c'est d'eux que vient la rigueur.
  for (const [y, epaisseur, couleur, alpha] of [
    [yEntablement, 1.1, VIOLET_PROFOND, 0.3],
    [yBandeau, 0.9, VIOLET_PROFOND, 0.24],
    [ySol, 1.3, ENCRE_SOMBRE, 0.36],
  ] as Array<[number, number, string, number]>) {
    dryStroke(ctx, [[murX0, y], [murX1, y]], epaisseur, rng, {
      color: couleur,
      alpha,
      layers: 2,
      jitter: 0.02,
    })
  }

  // L'ombre portée de la corniche, entre la ligne de toit et
  // l'entablement : c'est elle qui donne son épaisseur à la pierre. Sans
  // elle, la façade reste une découpe de papier posée sur le ciel.
  wash(ctx, [
    [murX0, yFaite],
    [murX1, yFaite],
    [murX1, yFaite + murH * 0.1],
    [murX0, yFaite + murH * 0.1],
  ], rng, { color: VIOLET, layers: 10, alpha: 0.22 / 10, spread: 0.03, jitter: 0.1 })

  // L'attique central : le seul décrochement de toute la silhouette. Il
  // monte de très peu — c'est justement ce qui distingue un palais d'un
  // château fort, dont la moindre tour dépasse de plusieurs étages.
  //
  // Peint à la main plutôt qu'avec `facade()` : celle-ci ne trace son
  // arête franche que du côté éclairé, et sur un bâtiment dont la symétrie
  // EST le sujet, cette verticale unique se lisait comme une erreur. Les
  // deux ressauts tracés plus haut la remplacent, des deux côtés à la fois.
  wash(ctx, [
    [axis - corpsW / 2, yFaite],
    [axis - corpsW / 2, yAttique],
    [axis + corpsW / 2, yAttique],
    [axis + corpsW / 2, yFaite],
  ], rng, { color: PIERRE_PALE, layers: 16, alpha: 0.2 / 16, spread: 0.035, jitter: 0.09 })
  dryStroke(ctx, [[axis - corpsW / 2, yAttique + (yFaite - yAttique) * 0.32], [axis + corpsW / 2, yAttique + (yFaite - yAttique) * 0.32]], 0.8, rng, {
    color: VIOLET_PROFOND,
    alpha: 0.2,
    layers: 1,
    jitter: 0.02,
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

/**
 * Une masse rocheuse : la crête irrégulière d'abord, la pierre ensuite.
 *
 * Vit ici et non dans `architecture.ts` parce que ce n'est justement pas
 * de l'architecture — aucun angle droit, aucune répétition. La règle des
 * contours brisés en plateaux (celle de `ruinFacade`) ne s'applique PAS :
 * elle existe pour qu'un mur cassé ne se lise pas comme une montagne. Ici
 * on veut précisément une montagne, donc des pentes.
 */
function roche(
  ctx: CanvasRenderingContext2D,
  x0: number,
  x1: number,
  yCrete: number,
  yBas: number,
  rng: () => number,
  plan: LightPlan,
  options: { stone: string; shade: string; relief?: number; weight?: number },
): void {
  const { stone, shade, relief = 1, weight = 1 } = options
  const lit = litFromLeft(plan)
  const pas = 7
  const crete: Point[] = []
  for (let i = 0; i <= pas; i += 1) {
    const t = i / pas
    // Le profil général monte au centre et retombe aux bords : sans ce
    // gabarit, le tirage seul rend une ligne de dents toutes pareilles.
    const gabarit = 0.35 + Math.sin(t * Math.PI) ** 0.7 * 0.65
    crete.push([x0 + (x1 - x0) * t, yCrete + (yBas - yCrete) * (1 - gabarit * relief) * (0.6 + rng() * 0.5)])
  }
  wash(ctx, [[x0, yBas], ...crete, [x1, yBas]], rng, {
    color: stone,
    layers: 24,
    alpha: (0.6 * weight) / 24,
    spread: 0.06,
    jitter: 0.12,
  })
  const milieu = Math.floor(crete.length / 2)
  const pan = lit ? crete.slice(milieu) : crete.slice(0, milieu + 1)
  wash(ctx, [[pan[0][0], yBas], ...pan, [pan[pan.length - 1][0], yBas]], rng, {
    color: shade,
    layers: 14,
    alpha: (0.42 * weight) / 14,
    spread: 0.07,
    jitter: 0.13,
  })
  // Les fissures : quelques obliques sombres qui suivent la pente. C'est
  // le seul « détail » d'un rocher qui se lise à petite taille.
  for (let i = 0; i < 5; i += 1) {
    const fx = x0 + (x1 - x0) * (0.15 + rng() * 0.7)
    const fy = yCrete + (yBas - yCrete) * (0.25 + rng() * 0.3)
    dryStroke(ctx, [
      [fx, fy],
      [fx + (rng() - 0.5) * (x1 - x0) * 0.05, fy + (yBas - fy) * 0.55],
    ], Math.max(0.6, (x1 - x0) * 0.006), rng, {
      color: plan.accent,
      alpha: 0.2,
      layers: 1,
      jitter: 0.14,
    })
  }
}

/**
 * Un château fort, sa douve et deux chevaliers qui montent vers le pont.
 *
 * Écrit en miroir de `versaillesScene`, et c'est délibéré : les deux
 * tableaux racontent le même mot — « château » — et doivent se lire comme
 * deux choses opposées, sans que le joueur ait à lire une légende.
 *
 * | | Château fort | Versailles |
 * |---|---|---|
 * | Silhouette | verticales : donjon, tours | une horizontale, sans rupture |
 * | Couronnement | créneaux **pleins** | balustrade **ajourée** |
 * | Ouvertures | meurtrières, rarissimes | grille régulière de croisées |
 * | Ce qu'il y a devant | une douve, un pont-levis | un jardin dessiné |
 * | Lumière | contre-jour chaud de fin de jour | plein jour froid |
 *
 * Les chevaliers sont au premier plan, et pas seulement pour dater la
 * scène : sans un objet de taille connue, une forteresse sur son rocher
 * n'a aucune échelle et pourrait aussi bien être une maquette.
 */
export const chateauFortScene: PaintScene = (ctx, w, h, rng) => {
  const yCrete = h * 0.58
  const yPied = h * 0.615
  const yDouve = h * 0.68
  const yBerge = h * 0.83

  // ---------------------------------------------------------------- ciel
  // Contre-jour : le ciel s'ÉCLAIRE vers l'horizon, à l'inverse de celui
  // de Versailles qui s'y éteint. La forteresse se découpe alors en sombre
  // sur un fond clair — c'est la lecture la plus sûre d'une silhouette
  // compliquée, et la plus dramatique.
  gradedWash(ctx, -w * 0.05, 0, w * 1.05, yCrete + h * 0.02, [
    // Le contre-jour vit de l'écart entre un haut de ciel profond et une
    // lueur basse serrée : étalée, la lueur éclaircit toute l'image et la
    // forteresse n'a plus rien contre quoi se découper.
    { at: 0, color: VIOLET_PROFOND, alpha: 0.56 },
    { at: 0.22, color: VIOLET, alpha: 0.4 },
    { at: 0.46, color: VIOLET, alpha: 0.26 },
    { at: 0.66, color: VIOLET_BRUME, alpha: 0.16 },
    { at: 0.84, color: OCRE, alpha: 0.12 },
    { at: 1, color: SABLE, alpha: 0.05 },
  ])
  cloud(ctx, w * 0.24, h * 0.12, w * 0.6, h * 0.024, rng, LUMIERE, {
    light: VIOLET_BRUME,
    shade: VIOLET,
    alpha: 0.16,
  })
  cloud(ctx, w * 0.72, h * 0.22, w * 0.52, h * 0.016, rng, LUMIERE, {
    light: OCRE,
    shade: VIOLET_BRUME,
    alpha: 0.1,
  })

  // ------------------------------------------------------------- rocher
  // Le château est bâti SUR quelque chose. Posé sur une ligne d'horizon
  // plate, il aurait l'air déposé là ; c'est l'escarpement qui explique
  // pourquoi on l'a construit à cet endroit.
  roche(ctx, -w * 0.08, w * 1.08, yCrete - h * 0.07, yDouve + h * 0.015, rng, LUMIERE, {
    stone: VIOLET,
    shade: VIOLET_PROFOND,
    relief: 0.7,
  })

  // ------------------------------------------------------------ château
  //
  // Rien ne se chevauche, et c'est la règle qui gouverne tout ce bloc.
  // Tout se peint en `multiply` : une tour posée par-dessus la courtine
  // double le pigment sur toute leur intersection, et cette intersection
  // se lit comme une boîte translucide collée sur le mur — pas comme une
  // tour devant lui. Les pans de courtine courent donc ENTRE les tours,
  // et le donjon ne commence qu'au-dessus du chemin de ronde, comme il
  // s'élève réellement derrière la muraille.
  const yChemin = h * 0.4
  const tourG = { x: w * 0.245, r: w * 0.044 }
  const tourD = { x: w * 0.875, r: w * 0.038 }
  const porteG = { x: w * 0.4, r: w * 0.026 }
  const porteD = { x: w * 0.5, r: w * 0.026 }
  const donjonX = w * 0.685
  const donjonL = w * 0.13
  const yDonjon = h * 0.135

  const pans: Array<[number, number]> = [
    [tourG.x + tourG.r * 0.7, porteG.x - porteG.r * 0.7],
    [porteG.x + porteG.r * 0.7, porteD.x - porteD.r * 0.7],
    [porteD.x + porteD.r * 0.7, tourD.x - tourD.r * 0.7],
  ]
  for (const [x0, x1] of pans) {
    facade(ctx, (x0 + x1) / 2, yChemin, yPied, x1 - x0, rng, LUMIERE, {
      stone: PIERRE_CHAUDE,
      shade: VIOLET_PROFOND,
      distance: 0.2,
      floors: 0,
      bays: 0,
      spread: 0.04,
      jitter: 0.09,
    })
    // Seconde charge. `facade()` plafonne à `VALEUR.MOYEN`, calibré pour
    // une pierre au soleil ; une muraille en contre-jour doit être bien
    // plus dense que ça, sinon elle reste un carton beige que le ciel
    // clair traverse.
    wash(ctx, [[x0, yPied], [x0, yChemin], [x1, yChemin], [x1, yPied]], rng, {
      color: VIOLET_BRUME,
      layers: 16,
      alpha: 0.52 / 16,
      spread: 0.03,
      jitter: 0.08,
    })
    battlement(ctx, x0, x1, yChemin, h * 0.028, rng, LUMIERE, {
      stone: PIERRE_CHAUDE,
      shade: VIOLET_PROFOND,
      distance: 0.2,
    })
  }

  // La porte : une seule arche sombre au pied du mur, entre les deux
  // tours qui l'encadrent. C'est le seul vrai noir de la muraille, et
  // l'œil y va tout droit — ce qui tombe bien, c'est là qu'arrivent les
  // chevaliers.
  arcade(ctx, w * 0.418, w * 0.482, yPied - h * 0.08, yPied, 1, rng, LUMIERE, 0.15)

  // Les tours de la porte, crénelées et courtes : une porte percée dans un
  // mur nu ne se lit pas comme une porte, elle se lit comme un trou.
  for (const t of [porteG, porteD]) {
    roundTower(ctx, t.x, h * 0.345, yPied, t.r, rng, LUMIERE, {
      stone: PIERRE_CHAUDE,
      shade: VIOLET_PROFOND,
      roof: 'creneaux',
      distance: 0.18,
      slits: 1,
    })
  }

  // Les deux grosses tours d'angle, coiffées de poivrières. Le cône est le
  // deuxième repère du château fort après le créneau, et le seul qui
  // survive quand la silhouette devient minuscule.
  roundTower(ctx, tourG.x, h * 0.3, yPied + h * 0.01, tourG.r, rng, LUMIERE, {
    stone: PIERRE_CHAUDE,
    shade: VIOLET_PROFOND,
    roof: 'poivriere',
    roofColor: BLEU,
    distance: 0.16,
    slits: 2,
  })
  roundTower(ctx, tourD.x, h * 0.335, yPied + h * 0.01, tourD.r, rng, LUMIERE, {
    stone: PIERRE_CHAUDE,
    shade: VIOLET_PROFOND,
    roof: 'poivriere',
    roofColor: BLEU,
    distance: 0.2,
    slits: 2,
  })

  // Le donjon : la verticale dominante, celle qui dit « fort » avant tout
  // le reste. Décalé de l'axe — une forteresse épouse son rocher, elle ne
  // se compose pas. C'est aussi ce qui l'oppose le plus nettement à
  // Versailles, dont la symétrie est toute la démonstration.
  const yPiedDonjon = yChemin - h * 0.016
  facade(ctx, donjonX, yDonjon, yPiedDonjon, donjonL, rng, LUMIERE, {
    stone: PIERRE_CHAUDE,
    shade: VIOLET_PROFOND,
    distance: 0.12,
    floors: 0,
    bays: 0,
    spread: 0.04,
    jitter: 0.08,
  })
  wash(ctx, [
    [donjonX - donjonL / 2, yPiedDonjon],
    [donjonX - donjonL / 2, yDonjon],
    [donjonX + donjonL / 2, yDonjon],
    [donjonX + donjonL / 2, yPiedDonjon],
  ], rng, { color: VIOLET_BRUME, layers: 16, alpha: 0.46 / 16, spread: 0.03, jitter: 0.07 })
  for (let i = 0; i < 2; i += 1) {
    const sy = yDonjon + (yPiedDonjon - yDonjon) * (0.3 + i * 0.3)
    dryStroke(ctx, [[donjonX - donjonL * 0.08, sy], [donjonX - donjonL * 0.08, sy + h * 0.024]], w * 0.008, rng, {
      color: ENCRE_SOMBRE,
      alpha: 0.55,
      layers: 2,
    })
  }
  battlement(ctx, donjonX - donjonL / 2 - w * 0.008, donjonX + donjonL / 2 + w * 0.008, yDonjon, h * 0.03, rng, LUMIERE, {
    stone: PIERRE_CHAUDE,
    shade: VIOLET_PROFOND,
    distance: 0.12,
  })
  banner(ctx, donjonX + donjonL * 0.24, yDonjon - h * 0.032, h * 0.075, rng, LUMIERE, {
    cloth: OCRE,
    distance: 0.1,
  })

  // Le rocher revient PAR-DESSUS le pied des murs, et c'est ce qui change
  // le plus la lecture de l'ensemble. Sans lui, toutes les bases de tours
  // et de courtines s'alignaient sur une horizontale parfaite, et le
  // château se lisait comme une découpe de carton posée sur une étagère.
  // Une crête irrégulière qui mord les bases à des hauteurs différentes le
  // fait sortir de son rocher au lieu d'être posé dessus.
  roche(ctx, -w * 0.08, w * 1.08, yPied - h * 0.025, yDouve + h * 0.02, rng, LUMIERE, {
    stone: VIOLET_PROFOND,
    shade: ENCRE_SOMBRE,
    relief: 0.5,
    weight: 1.5,
  })

  // ------------------------------------------------- douve et pont-levis
  gradedWash(ctx, -w * 0.05, yDouve, w * 1.05, yBerge + h * 0.02, [
    { at: 0, color: BLEU, alpha: 0.3 },
    { at: 0.5, color: BLEU, alpha: 0.52 },
    { at: 1, color: VIOLET_PROFOND, alpha: 0.6 },
  ])
  // Le reflet du château, tiré vers le bas puis cassé par les rides. Il
  // ne peut être que SOMBRE : en `multiply`, une pierre claire ne peut pas
  // s'y refléter en clair.
  for (const [cx, largeur] of [[0.245, 0.1], [0.45, 0.12], [0.685, 0.15], [0.875, 0.09]] as Array<[number, number]>) {
    reflection(ctx, w * cx, w * largeur, yDouve, (yBerge - yDouve) * 0.8, VIOLET_PROFOND, rng, 3)
  }
  ripples(ctx, 0, w, yDouve + h * 0.01, yBerge, 18, rng, { color: BLEU, accent: VIOLET_PROFOND })

  // Le pont-levis : abaissé, il relie la porte à la berge et donne à la
  // scène son mouvement — un pont relevé fermerait le récit au lieu de
  // l'ouvrir. Il s'élargit vers le spectateur, comme toute fuyante.
  wash(ctx, [
    [w * 0.42, yPied],
    [w * 0.48, yPied],
    [w * 0.505, yBerge],
    [w * 0.395, yBerge],
  ], rng, { color: SABLE, layers: 18, alpha: 0.45 / 18, spread: 0.03, jitter: 0.07 })
  for (const cote of [-1, 1]) {
    dryStroke(ctx, [
      [w * (0.45 + cote * 0.03), yPied],
      [w * (0.45 + cote * 0.055), yBerge],
    ], 0.9, rng, { color: ENCRE_SOMBRE, alpha: 0.4, layers: 2 })
  }
  // Les chaînes, qui remontent vers la porte : deux obliques qui disent
  // « pont-levis » plutôt que « planche ».
  for (const cote of [-1, 1]) {
    dryStroke(ctx, [
      [w * (0.45 + cote * 0.032), yPied - h * 0.002],
      [w * (0.45 + cote * 0.05), yPied - h * 0.06],
    ], 0.7, rng, { color: ENCRE_SOMBRE, alpha: 0.32, layers: 1 })
  }

  // -------------------------------------------------------- premier plan
  gradedWash(ctx, -w * 0.05, yBerge, w * 1.05, h * 1.02, [
    { at: 0, color: SABLE, alpha: 0.2 },
    { at: 0.45, color: OCRE, alpha: 0.3 },
    { at: 1, color: VIOLET_PROFOND, alpha: 0.56 },
  ])

  // Les deux chevaliers, en route vers le pont. Le plus proche est aussi
  // le plus sombre et le plus grand : c'est le repoussoir du tableau, le
  // même rôle que les ifs de premier plan à Versailles.
  knightOnHorse(ctx, w * 0.36, h * 0.92, h * 0.15, rng, LUMIERE, {
    horse: VIOLET_PROFOND,
    armour: BLEU,
    pennon: OCRE,
    accent: ENCRE_SOMBRE,
    distance: 0.3,
    facing: 1,
  })
  knightOnHorse(ctx, w * 0.14, h * 1.0, h * 0.21, rng, LUMIERE, {
    horse: ENCRE_SOMBRE,
    armour: BLEU,
    pennon: OCRE,
    accent: ENCRE_SOMBRE,
    distance: 0,
    facing: 1,
  })

  // Un éperon rocheux au coin bas droit : il referme la composition du
  // côté où il n'y a pas de chevalier, et empêche le regard de sortir.
  roche(ctx, w * 0.7, w * 1.1, h * 0.9, h * 1.06, rng, LUMIERE, {
    stone: VIOLET_PROFOND,
    shade: ENCRE_SOMBRE,
    relief: 0.8,
    weight: 1.7,
  })
}
