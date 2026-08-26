import type { PaintScene } from '../../../components/watercolor/WatercolorScene'
import { dryStroke, polygon, wash } from '../../../components/watercolor/engine'
import type { Point } from '../../../components/watercolor/engine'
import { gradedWash } from '../../../components/watercolor/atmosphere'
import { mammouth } from '../../../components/watercolor/animal'
import { collines } from '../../../components/watercolor/terrain'
import {
  ENCRE_SOMBRE,
  OCRE,
  PIERRE_CHAUDE,
  SABLE,
  VIOLET,
  VIOLET_BRUME,
  VIOLET_PROFOND,
} from '../../../components/watercolor/palette'
import { LUMIERE } from './lumiere'

/**
 * Un feu de camp : le foyer, les flammes, et la fumée qui monte.
 *
 * Le piège est de vouloir peindre la LUEUR. On ne peut pas : tout se peint
 * en `multiply`, donc rien ne peut éclaircir le papier. Un feu ne se rend
 * pas par sa lumière mais par trois choses qu'on peut assombrir — la
 * couronne de pierres, la découpe des flammes, et surtout **les silhouettes
 * noires qu'on met autour**. C'est le contre-jour des figures qui dit qu'il
 * y a de la lumière au milieu, pas le feu lui-même.
 */
function feu(
  ctx: CanvasRenderingContext2D,
  x: number,
  yGround: number,
  height: number,
  rng: () => number,
): void {
  // Les pierres du foyer, en couronne aplatie.
  for (let i = 0; i < 5; i += 1) {
    const t = (i / 4 - 0.5) * 2
    wash(ctx, polygon(x + t * height * 0.55, yGround + height * 0.04, height * 0.16, height * 0.1, 8, 0, rng), rng, {
      color: VIOLET_PROFOND,
      layers: 10,
      alpha: 0.6 / 10,
      spread: 0.14,
      jitter: 0.18,
    })
  }
  // Les flammes : des langues étroites, inégales, qui se penchent toutes du
  // même côté. Trois langues de hauteurs franchement différentes — égales,
  // elles font une couronne décorative plutôt qu'un feu.
  const langues: Array<[number, number, string]> = [
    [-0.3, 0.75, OCRE],
    [0.05, 1, OCRE],
    [0.3, 0.6, SABLE],
  ]
  for (const [dx, ratio, couleur] of langues) {
    const hf = height * ratio
    wash(ctx, [
      [x + dx * height * 0.5 - height * 0.16, yGround],
      [x + dx * height * 0.5 - height * 0.04, yGround - hf * 0.6],
      [x + dx * height * 0.5 + height * 0.06, yGround - hf],
      [x + dx * height * 0.5 + height * 0.1, yGround - hf * 0.45],
      [x + dx * height * 0.5 + height * 0.18, yGround],
    ], rng, {
      color: couleur,
      layers: 16,
      alpha: 0.62 / 16,
      spread: 0.1,
      jitter: 0.24,
    })
  }
  // La fumée : un voile pâle et large qui s'élève en s'écartant. Posée sur
  // le ciel resté clair, elle se voit ; posée sur la falaise sombre, elle
  // disparaîtrait — d'où le décalage vers le côté dégagé.
  const fumee: Point[] = []
  for (let i = 0; i <= 6; i += 1) {
    const t = i / 6
    fumee.push([x + height * (0.06 + t * 0.5) + Math.sin(t * 4) * height * 0.12, yGround - height * (1.1 + t * 1.9)])
  }
  dryStroke(ctx, fumee, height * 0.22, rng, {
    color: VIOLET_BRUME,
    alpha: 0.06,
    layers: 1,
    jitter: 0.36,
  })
}

/**
 * Une silhouette assise, de dos, genoux repliés.
 *
 * Écrite ici plutôt que reprise de `figure.ts` : `childWatchingSea()`
 * module ses opacités pour une figure vue en pleine lumière, et sortait en
 * tache grise même peinte tout en encre. À contre-jour d'un feu, une
 * personne n'est qu'un aplat plein — c'est plus simple à peindre, et plus
 * juste.
 */
function silhouetteAssise(
  ctx: CanvasRenderingContext2D,
  x: number,
  yGround: number,
  taille: number,
  rng: () => number,
): void {
  const T = taille
  wash(ctx, [
    [x - T * 0.42, yGround],
    [x - T * 0.34, yGround - T * 0.5],
    [x - T * 0.2, yGround - T * 0.78],
    [x - T * 0.16, yGround - T * 1.0],
    [x, yGround - T * 1.12],
    [x + T * 0.16, yGround - T * 1.0],
    [x + T * 0.2, yGround - T * 0.76],
    [x + T * 0.34, yGround - T * 0.44],
    [x + T * 0.46, yGround - T * 0.12],
    [x + T * 0.44, yGround],
  ], rng, { color: ENCRE_SOMBRE, layers: 22, alpha: 1.8 / 22, spread: 0.05, jitter: 0.12 })
  // Le genou relevé, une bosse détachée du dos : c'est lui qui dit
  // « assis » plutôt que « accroupi » ou « debout de dos ».
  wash(ctx, polygon(x + T * 0.36, yGround - T * 0.34, T * 0.22, T * 0.26, 10, 0, rng), rng, {
    color: ENCRE_SOMBRE,
    layers: 16,
    alpha: 1.4 / 16,
    spread: 0.08,
    jitter: 0.16,
  })
}

/**
 * La Préhistoire, au crépuscule.
 *
 * Le sujet est le plus difficile des huit : « la Préhistoire » n'a pas de
 * monument. Trois signes la portent, et ils ne se remplacent pas les uns
 * les autres — **un abri sous roche**, **un feu**, et **un mammouth**. Le
 * feu seul ferait un bivouac de n'importe quel siècle ; le mammouth seul,
 * un documentaire animalier ; l'abri seul, une falaise.
 *
 * Le tableau est construit à contre-jour, comme le château fort : ciel
 * clair en bas, masses sombres devant. C'est la seule façon de faire lire
 * une silhouette compliquée à 200 px — et c'est aussi la lumière qui
 * convient au sujet, la fin du jour étant le moment où l'on rentre au
 * campement.
 */
export const prehistoireScene: PaintScene = (ctx, w, h, rng) => {
  const horizon = h * 0.56

  // ---------------------------------------------------------------- ciel
  gradedWash(ctx, -w * 0.05, 0, w * 1.05, horizon + h * 0.02, [
    { at: 0, color: VIOLET_PROFOND, alpha: 0.4 },
    { at: 0.3, color: VIOLET, alpha: 0.28 },
    { at: 0.6, color: VIOLET_BRUME, alpha: 0.18 },
    { at: 0.84, color: OCRE, alpha: 0.16 },
    { at: 1, color: SABLE, alpha: 0.06 },
  ])

  collines(ctx, -w * 0.05, w * 1.05, horizon - h * 0.07, horizon + h * 0.06, rng, {
    green: VIOLET,
    shade: VIOLET_PROFOND,
    distance: 0.6,
    bosses: 3,
  })

  gradedWash(ctx, -w * 0.05, horizon, w * 1.05, h * 1.02, [
    { at: 0, color: SABLE, alpha: 0.16 },
    { at: 0.4, color: OCRE, alpha: 0.3 },
    { at: 1, color: VIOLET_PROFOND, alpha: 0.5 },
  ])

  // ---------------------------------------------------------- le troupeau
  // Chaque mammouth chevauche la ligne d'horizon : son dos passe au-dessus,
  // dans le ciel clair, ses pattes en dessous, dans la plaine. C'est la
  // seule position où sa silhouette est entièrement lisible.
  mammouth(ctx, w * 0.6, horizon + h * 0.11, h * 0.2, rng, LUMIERE, {
    coat: VIOLET_PROFOND,
    shade: PIERRE_CHAUDE,
    accent: ENCRE_SOMBRE,
    distance: 0.1,
    facing: -1,
  })
  mammouth(ctx, w * 0.82, horizon + h * 0.05, h * 0.13, rng, LUMIERE, {
    coat: VIOLET,
    shade: PIERRE_CHAUDE,
    accent: ENCRE_SOMBRE,
    distance: 0.4,
    facing: -1,
  })

  // ------------------------------------------------------------- la grotte
  //
  // Le tableau est vu DEPUIS l'abri, et la paroi fait le cadre. Trois
  // versions l'ont d'abord montré de l'extérieur, en falaise posée sur la
  // gauche : à 200 px, une falaise reste un caillou, et l'ouverture creusée
  // dedans est soit invisible (paroi sombre) soit énorme (paroi claire).
  //
  // En cadre, le problème disparaît : la masse sombre n'a plus à être
  // reconnue, elle a seulement à encadrer. Et elle raconte davantage — on
  // n'est plus devant un abri, on est dedans, on regarde la plaine.
  //
  // Deux masses, gauche et droite, qui se rejoignent en haut : c'est la
  // seule façon de creuser une ouverture, `wash()` ne sachant pas peindre
  // de trou.
  const paroiG: Point[] = [
    [-w * 0.06, h * 1.06],
    [-w * 0.06, -h * 0.06],
    [w * 0.54, -h * 0.06],
    [w * 0.4, h * 0.06],
    [w * 0.3, h * 0.1],
    [w * 0.24, h * 0.22],
    [w * 0.22, h * 0.4],
    [w * 0.17, h * 0.66],
    [w * 0.12, h * 1.06],
  ]
  const paroiD: Point[] = [
    [w * 1.06, h * 1.06],
    [w * 1.06, -h * 0.06],
    [w * 0.5, -h * 0.06],
    [w * 0.62, h * 0.07],
    [w * 0.74, h * 0.13],
    [w * 0.8, h * 0.28],
    [w * 0.84, h * 0.5],
    [w * 0.9, h * 1.06],
  ]
  for (const paroi of [paroiG, paroiD]) {
    wash(ctx, paroi, rng, {
      color: VIOLET_PROFOND,
      layers: 26,
      alpha: 1.5 / 26,
      spread: 0.04,
      jitter: 0.1,
    })
    wash(ctx, paroi, rng, {
      color: ENCRE_SOMBRE,
      layers: 14,
      alpha: 0.7 / 14,
      spread: 0.05,
      jitter: 0.14,
    })
  }

  // Le sol de l'abri : il referme le bas du cadre et rattache les deux
  // parois. Sans lui, l'ouverture donne l'impression de flotter.
  wash(ctx, [
    [-w * 0.06, h * 1.06],
    [-w * 0.06, h * 0.94],
    [w * 0.28, h * 0.88],
    [w * 0.7, h * 0.9],
    [w * 1.06, h * 0.96],
    [w * 1.06, h * 1.06],
  ], rng, { color: VIOLET_PROFOND, layers: 20, alpha: 1.1 / 20, spread: 0.06, jitter: 0.16 })

  // ---------------------------------------------------------- le campement
  feu(ctx, w * 0.37, h * 0.9, h * 0.19, rng)

  // Les deux figures, de dos, entre nous et le feu : pures silhouettes.
  // De dos parce qu'un visage raté se voit plus que n'importe quoi
  // d'autre — et parce qu'à contre-jour d'un feu, il n'y a rien d'autre
  // qu'une silhouette à peindre.
  silhouetteAssise(ctx, w * 0.25, h * 1.0, h * 0.2, rng)
  silhouetteAssise(ctx, w * 0.54, h * 1.05, h * 0.24, rng)
}
