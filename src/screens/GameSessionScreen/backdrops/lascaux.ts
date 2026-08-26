import type { PaintScene } from '../../../components/watercolor/WatercolorScene'
import { contour, dryStroke, polygon, wash } from '../../../components/watercolor/engine'
import type { Point } from '../../../components/watercolor/engine'
import { gradedWash, vignette } from '../../../components/watercolor/atmosphere'
import { aurochs, chevalDeProfil } from '../../../components/watercolor/animal'
import {
  ENCRE_SOMBRE,
  OCRE,
  PIERRE_CHAUDE,
  SABLE,
  VIOLET,
  VIOLET_PROFOND,
} from '../../../components/watercolor/palette'
import type { LightPlan } from '../../../components/watercolor/light'

/**
 * La lumière d'une paroi : rasante, venue de la gauche, comme une lampe
 * portée. Elle reste alignée sur celle des tableaux de la carte — même
 * angle, mêmes teintes — pour que le fond appartienne au même monde que
 * la vignette du niveau.
 */
const LAMPE: LightPlan = {
  angleDeg: 200,
  warm: SABLE,
  cool: VIOLET_PROFOND,
  accent: ENCRE_SOMBRE,
}

/**
 * Une main négative : la paume n'est pas peinte, c'est le pourtour qui
 * l'est.
 *
 * C'est exactement ainsi qu'elles ont été faites il y a vingt mille ans —
 * la main posée à plat, le pigment soufflé autour — et c'est aussi la
 * seule technique qui fonctionne en `multiply`, où l'on ne peut rien
 * éclaircir. Peindre une main claire sur une paroi ocre est impossible ;
 * souffler du sombre autour d'une main laissée en réserve ne l'est pas.
 */
function mainNegative(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  taille: number,
  rng: () => number,
): void {
  // La main est décrite comme un contour fermé, uniquement pour savoir où
  // NE PAS souffler de pigment. Elle n'est jamais peinte — c'est tout le
  // principe. Quatre doigts inégaux et un pouce écarté : à cette échelle,
  // c'est l'écart entre les longueurs qui fait lire une main plutôt qu'une
  // patte ou une feuille.
  const forme: Point[] = ([
    [-0.72, 1.15], [-0.92, 0.45], [-1.55, 0.05], [-1.35, -0.25], [-0.72, -0.05],
    [-0.66, -1.15], [-0.34, -1.2], [-0.28, -0.1], [-0.12, -0.15],
    [-0.06, -1.45], [0.24, -1.42], [0.28, -0.15], [0.44, -0.18],
    [0.52, -1.2], [0.8, -1.15], [0.82, -0.1], [1.0, 0.0],
    [1.12, -0.75], [1.35, -0.65], [1.2, 0.35], [0.92, 1.15],
  ] as Array<[number, number]>).map(([dx, dy]) => [x + dx * taille, y + dy * taille] as Point)

  const dedans = (px: number, py: number): boolean => {
    let croise = false
    for (let i = 0, j = forme.length - 1; i < forme.length; j = i, i += 1) {
      const [xi, yi] = forme[i]
      const [xj, yj] = forme[j]
      if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) croise = !croise
    }
    return croise
  }

  // Le halo pulvérisé : des grains semés tout autour, dense contre la main
  // et clairsemé en s'éloignant, et JAMAIS dessus. C'est exactement le
  // geste d'il y a vingt mille ans — la main posée à plat, le pigment
  // soufflé autour — et c'est aussi la seule technique qui marche en
  // `multiply`, où l'on ne peut rien éclaircir. Peindre une main claire
  // sur une paroi ocre est impossible ; en réserver une ne l'est pas.
  let poses = 0
  for (let essai = 0; essai < 900 && poses < 190; essai += 1) {
    const a = rng() * Math.PI * 2
    const r = taille * (0.2 + Math.pow(rng(), 0.5) * 2.5)
    const px = x + Math.cos(a) * r
    const py = y + Math.sin(a) * r * 1.1 - taille * 0.15
    if (dedans(px, py)) continue
    poses += 1
    const pr = taille * (0.03 + rng() * 0.07)
    wash(ctx, polygon(px, py, pr, pr, 7, rng() * 6, rng), rng, {
      color: VIOLET_PROFOND,
      layers: 3,
      // Le grain s'éteint avec la distance : c'est ce dégradé de densité,
      // et non un contour, qui dessine la main en creux.
      alpha: (0.62 * Math.max(0.12, 1 - r / (taille * 2.6))) / 3,
      spread: 0.26,
      jitter: 0.32,
    })
  }
}

/**
 * La fresque de Lascaux, en fond des jeux du Niveau 1.
 *
 * **Pourquoi une œuvre, et pourquoi celle-là.** Le Niveau 1 porte la
 * Préhistoire, et la Préhistoire a laissé exactement une chose qu'on peut
 * appeler une œuvre : ses parois peintes. Mettre Lascaux derrière ses jeux
 * n'est donc pas un habillage plaqué — c'est le même sujet, vu de l'autre
 * côté. Le joueur répond à des questions sur la Préhistoire à l'intérieur
 * de ce que la Préhistoire a peint.
 *
 * **Ce que le fond doit accepter d'être.** Il passe sous des boutons et du
 * texte de jeu : la règle de la skill `aquarelle` est nette, le texte ne se
 * pose que sur du papier nu ou sur un lavis à moins de 15 % d'opacité. Le
 * fond est donc voilé en CSS ET creusé en son centre par un masque radial,
 * là où la colonne de contenu passe. Il n'est pleinement visible que sur
 * les marges — et c'est bien ce qu'on veut d'un décor : qu'on le voie sans
 * jamais le regarder.
 *
 * Peint en portrait (le format d'un téléphone), et étiré en CSS pour
 * couvrir l'écran. L'étirement ne se voit pas : une paroi n'a ni
 * horizontale ni verticale de référence.
 */
export const lascauxScene: PaintScene = (ctx, w, h, rng) => {
  // ------------------------------------------------------------- la paroi
  // Le calcaire : un fond chaud et inégal. Un aplat régulier ferait un
  // mur de plâtre ; ce sont les variations lentes qui font la roche.
  gradedWash(ctx, -w * 0.05, -h * 0.02, w * 1.05, h * 1.02, [
    { at: 0, color: SABLE, alpha: 0.34 },
    { at: 0.3, color: PIERRE_CHAUDE, alpha: 0.42 },
    { at: 0.62, color: SABLE, alpha: 0.3 },
    { at: 1, color: OCRE, alpha: 0.36 },
  ])
  vignette(ctx, -w * 0.05, -h * 0.02, w * 1.05, h * 1.02, {
    cx: w * 0.3,
    cy: h * 0.3,
    color: VIOLET_PROFOND,
    alpha: 0.42,
    creux: 0.15,
  })

  // Les coulées et les concrétions : de grandes masses très diluées, qui
  // se recouvrent sans jamais se répéter. C'est le seul « détail » d'une
  // roche qui se lise à travers un voile de 20 %.
  // Les concrétions et les coulées. Verticales et très étirées, parce que
  // c'est l'eau qui les fait et que l'eau descend : rondes et compactes
  // (première version), elles se lisaient comme un motif de camouflage.
  // Peu nombreuses et très diluées, aussi — une paroi est monotone, c'est
  // ce qui la distingue d'un mur peint.
  for (let i = 0; i < 5; i += 1) {
    const cx = w * (0.05 + rng() * 0.9)
    const cy = h * (rng() * 1.1 - 0.05)
    wash(ctx, polygon(cx, cy, w * (0.1 + rng() * 0.16), h * (0.16 + rng() * 0.22), 14, 0, rng), rng, {
      color: rng() > 0.5 ? VIOLET : VIOLET_PROFOND,
      layers: 12,
      alpha: (0.05 + rng() * 0.05) / 12,
      spread: 0.3,
      jitter: 0.46,
    })
  }
  // Le grain du calcaire : beaucoup de très petites taches, semées à la
  // main plutôt que par `flecks()`. Celle-ci dimensionne ses taches sur la
  // zone qu'on lui donne — sur une surface plein écran, elle produit donc
  // des taches ÉNORMES, et la paroi sortait en motif de camouflage. Ici la
  // taille du grain est absolue, pas relative.
  for (let i = 0; i < 150; i += 1) {
    const gx = w * rng()
    const gy = h * rng()
    const gr = w * (0.004 + rng() * 0.014)
    wash(ctx, polygon(gx, gy, gr, gr * (0.7 + rng() * 0.7), 7, rng() * 6, rng), rng, {
      color: rng() > 0.35 ? VIOLET_PROFOND : OCRE,
      layers: 3,
      alpha: (0.06 + rng() * 0.1) / 3,
      spread: 0.3,
      jitter: 0.4,
    })
  }

  // Les fissures : longues, presque verticales, jamais droites. Elles
  // structurent la paroi et rappellent que c'est de la pierre.
  for (let i = 0; i < 5; i += 1) {
    const fx = w * (0.08 + rng() * 0.84)
    const fy = h * (rng() * 0.5)
    const fissure: Point[] = [[fx, fy]]
    for (let k = 1; k <= 5; k += 1) {
      fissure.push([fx + (rng() - 0.5) * w * 0.12, fy + (h * 0.42 * k) / 5])
    }
    dryStroke(ctx, fissure, w * 0.005, rng, {
      color: VIOLET_PROFOND,
      alpha: 0.16,
      layers: 1,
      jitter: 0.24,
    })
  }

  // ----------------------------------------------------------- la fresque
  // Les bêtes ne sont pas alignées ni à la même échelle : sur une vraie
  // paroi, chaque peintre a pris la place qui restait, et les figures se
  // chevauchent à des tailles sans rapport. Cette anarchie EST le style —
  // une frise régulière se lirait comme une décoration de chambre d'enfant.
  aurochs(ctx, w * 0.56, h * 0.28, h * 0.13, rng, LAMPE, {
    coat: OCRE,
    shade: VIOLET_PROFOND,
    accent: ENCRE_SOMBRE,
    facing: -1,
    weight: 0.9,
  })
  chevalDeProfil(ctx, w * 0.3, h * 0.44, h * 0.075, rng, LAMPE, {
    coat: SABLE,
    shade: OCRE,
    accent: ENCRE_SOMBRE,
    facing: -1,
    weight: 0.85,
  })
  chevalDeProfil(ctx, w * 0.68, h * 0.56, h * 0.055, rng, LAMPE, {
    coat: OCRE,
    shade: SABLE,
    accent: ENCRE_SOMBRE,
    facing: 1,
    weight: 0.8,
  })
  aurochs(ctx, w * 0.34, h * 0.78, h * 0.1, rng, LAMPE, {
    coat: VIOLET_PROFOND,
    shade: ENCRE_SOMBRE,
    accent: ENCRE_SOMBRE,
    facing: 1,
    weight: 0.8,
  })
  chevalDeProfil(ctx, w * 0.74, h * 0.9, h * 0.07, rng, LAMPE, {
    coat: OCRE,
    shade: SABLE,
    accent: ENCRE_SOMBRE,
    facing: -1,
    weight: 0.85,
  })

  // Les mains, en bas à gauche : la signature des grottes ornées, et la
  // seule chose sur ces parois qui ne soit pas un animal.
  mainNegative(ctx, w * 0.2, h * 0.78, h * 0.032, rng)
  mainNegative(ctx, w * 0.33, h * 0.84, h * 0.026, rng)
  mainNegative(ctx, w * 0.14, h * 0.89, h * 0.022, rng)

  // Les ponctuations : des files de points, présentes à Lascaux comme
  // ailleurs, et dont personne ne sait ce qu'elles voulaient dire.
  for (const [px, py, n] of [[0.82, 0.36, 6], [0.2, 0.16, 5], [0.5, 0.68, 4]] as Array<[number, number, number]>) {
    for (let i = 0; i < n; i += 1) {
      const dx = w * px + i * w * 0.026 + (rng() - 0.5) * w * 0.01
      const dy = h * py + i * h * 0.008 + (rng() - 0.5) * h * 0.006
      wash(ctx, polygon(dx, dy, w * 0.009, w * 0.009, 8, 0, rng), rng, {
        color: VIOLET_PROFOND,
        layers: 8,
        alpha: 0.5 / 8,
        spread: 0.16,
        jitter: 0.22,
      })
    }
  }

  // Une dernière bête, très grande et très pâle, à cheval sur les autres :
  // sur une paroi, les figures se recouvrent parce qu'elles ont été
  // peintes à des siècles d'intervalle. C'est ce palimpseste qui rend une
  // grotte ornée émouvante, et il tient en un seul appel.
  contour(ctx, ([
    [0.14, 0.5], [0.3, 0.42], [0.52, 0.4], [0.72, 0.46], [0.84, 0.58],
    [0.8, 0.72], [0.6, 0.78], [0.34, 0.76], [0.18, 0.66], [0.14, 0.54],
  ] as Array<[number, number]>).map(([dx, dy]) => [w * dx, h * dy] as Point), rng, {
    color: ENCRE_SOMBRE,
    width: w * 0.008,
    alpha: 0.14,
    layers: 1,
    coverage: 0.42,
    runs: 3,
  })
}
