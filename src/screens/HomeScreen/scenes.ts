import type { PaintScene } from '../../components/watercolor/WatercolorScene'
import { dryStroke, polygon, stroke, wash } from '../../components/watercolor/engine'
import type { Point } from '../../components/watercolor/engine'
import { arcade, column, dome, facade, fallenColumn, ruinFacade } from '../../components/watercolor/architecture'
import { cloud, gradedWash, reflection, ripples } from '../../components/watercolor/atmosphere'
import { girlWriting } from '../../components/watercolor/figure'
import type { LightPlan } from '../../components/watercolor/light'

/**
 * Les deux tableaux qui encadrent l'accueil. Pensés comme des aquarelles
 * abstraites, pas comme des illustrations : on lit une atmosphère avant de
 * lire un sujet. La palette reste celle de la skill `aquarelle`, dominée par
 * le bleu ardoise et portée par les violets qui font les ombres.
 */

const BLEU = '#5a7fa0'
const BLEU_CLAIR = '#8fb0c9'
const TURQUOISE = '#4f9a92'
const VIOLET = '#8d6aa8'
const VIOLET_BRUME = '#c3b0d4'
const VIOLET_PROFOND = '#5d4574'
const OCRE = '#c1663f'
const SABLE = '#d9a35f'
const VERT = '#7a9455'
const PAPIER = '#f7f2e7'
const ENCRE_SOMBRE = '#241d2b'
const PIERRE_CHAUDE = '#d8bd96'
const PIERRE_PALE = '#e6d9c4'

/**
 * La lumière unique des deux tableaux : elle vient de la gauche, chaude, et
 * toutes les ombres tombent donc à droite de chaque volume. C'est cette
 * décision prise une seule fois qui fait que les éléments se répondent —
 * l'harmonie qui manquait quand chaque objet calculait son ombre seul.
 */
const LUMIERE: LightPlan = {
  angleDeg: 200,
  warm: SABLE,
  cool: VIOLET_PROFOND,
  accent: ENCRE_SOMBRE,
}

/**
 * Un éclat de lumière réservée sur l'eau : un trait fin et allongé, jamais
 * une nappe. `highlight()`/`wash()` déforme toujours une forme aussi plate
 * (un ratio largeur/hauteur élevé) vers un disque, quels que soient les
 * réglages de `spread`/`jitter` — le contour fermé finit par s'arrondir.
 * `dryStroke`, fait pour les traits, garde le fil de lumière.
 */
function glint(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  length: number,
  thickness: number,
  rng: () => number,
  alpha: number,
): void {
  dryStroke(ctx, [
    [cx - length / 2, cy],
    [cx, cy + (rng() - 0.5) * thickness],
    [cx + length / 2, cy],
  ], thickness, rng, { color: PAPIER, alpha, layers: 2, jitter: 0.05 })
}

/** Chemin ondulant d'un bord à l'autre, à hauteur `y`. */
function houle(y: number, amplitude: number, w: number, rng: () => number): Point[] {
  const points: Point[] = []
  for (let i = 0; i <= 12; i += 1) {
    points.push([(i / 12) * w, y + Math.sin(i * 1.3 + amplitude) * amplitude + (rng() - 0.5) * amplitude * 0.6])
  }
  return points
}

/**
 * Une voile : un triangle penché, sa coque, son mât. Minuscule — c'est ce
 * qui donne l'échelle à la lagune. Sans un objet de taille connue, une
 * étendue d'eau n'a aucune profondeur lisible.
 */
function voile(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  taille: number,
  rng: () => number,
  distance: number,
): void {
  const alpha = 0.5 * (1 - distance * 0.7)
  wash(ctx, [
    [x, y - taille * 2.1],
    [x + taille * 0.85, y - taille * 0.1],
    [x - taille * 0.15, y - taille * 0.1],
  ], rng, { color: PIERRE_PALE, layers: 12, alpha: alpha / 12, spread: 0.05, jitter: 0.06 })
  dryStroke(ctx, [[x, y - taille * 2.2], [x, y]], taille * 0.1, rng, {
    color: ENCRE_SOMBRE,
    alpha: alpha * 0.8,
    layers: 2,
  })
  dryStroke(ctx, [[x - taille * 0.9, y], [x + taille * 0.9, y]], taille * 0.22, rng, {
    color: ENCRE_SOMBRE,
    alpha: alpha * 0.9,
    layers: 2,
  })
}

/**
 * Gauche — la lagune. Un vrai lieu plutôt qu'une abstraction : une rive
 * lointaine et pâle à l'horizon, des voiles qui donnent l'échelle, une
 * étendue d'eau qui occupe les deux tiers bas. Même lumière que la cité
 * engloutie (`LUMIERE`), pour que les deux tableaux se répondent.
 *
 * Une étendue d'eau seule, sans horizon ni objet de taille connue, se lit
 * comme des bandes de couleur empilées — c'est le sujet qui fait la
 * profondeur, pas la matière.
 */
export const oceanScene: PaintScene = (ctx, w, h, rng) => {
  const horizon = h * 0.34

  // Ciel : un vrai dégradé continu, plus dense et plus froid en haut, se
  // vidant vers l'horizon où le papier reste presque nu. C'est cette bande
  // claire juste au-dessus de l'eau qui donne la lumière du tableau.
  gradedWash(ctx, -w * 0.05, 0, w * 1.05, horizon, [
    { at: 0, color: VIOLET, alpha: 0.5 },
    { at: 0.45, color: VIOLET_BRUME, alpha: 0.32 },
    { at: 0.8, color: SABLE, alpha: 0.16 },
    { at: 1, color: SABLE, alpha: 0.05 },
  ])

  // Trois nuages, décalés et de tailles franchement inégales — alignés ou
  // de même taille, ils redeviennent une frise décorative.
  cloud(ctx, w * 0.32, h * 0.13, w * 0.7, h * 0.06, rng, LUMIERE, {
    light: PIERRE_PALE,
    shade: VIOLET,
    alpha: 0.18,
    highlight: PAPIER,
  })
  cloud(ctx, w * 0.78, h * 0.2, w * 0.5, h * 0.038, rng, LUMIERE, {
    light: PIERRE_PALE,
    shade: VIOLET_BRUME,
    alpha: 0.13,
    highlight: PAPIER,
  })
  cloud(ctx, w * 0.5, h * 0.28, w * 0.85, h * 0.022, rng, LUMIERE, {
    light: SABLE,
    shade: VIOLET_BRUME,
    alpha: 0.09,
    highlight: PAPIER,
  })

  // La rive lointaine : des silhouettes très pâles, à peine posées, avec un
  // campanile qui dépasse — assez pour que l'horizon soit un lieu.
  facade(ctx, w * 0.24, horizon - h * 0.045, horizon, w * 0.3, rng, LUMIERE, {
    stone: VIOLET_BRUME,
    shade: VIOLET,
    distance: 0.92,
    floors: 0,
    bays: 0,
  })
  facade(ctx, w * 0.62, horizon - h * 0.03, horizon, w * 0.34, rng, LUMIERE, {
    stone: VIOLET_BRUME,
    shade: VIOLET,
    distance: 0.94,
    floors: 0,
    bays: 0,
  })
  // Le campanile de la rive : il doit rester dans la même valeur pâle que
  // le reste de l'horizon. Plus saturé que ce qui l'entoure, il se détache
  // comme une barre posée devant plutôt qu'un bâtiment dans la brume.
  facade(ctx, w * 0.44, horizon - h * 0.075, horizon, w * 0.035, rng, LUMIERE, {
    stone: VIOLET_BRUME,
    shade: VIOLET,
    distance: 0.9,
    floors: 0,
    bays: 0,
  })
  dome(ctx, w * 0.78, horizon - h * 0.025, w * 0.05, rng, LUMIERE, {
    stone: VIOLET_BRUME,
    shade: VIOLET,
    distance: 0.9,
  })

  // L'eau : des masses larges et superposées, de plus en plus sombres et
  // franches en descendant — c'est la perspective, l'eau lointaine est
  // toujours plus pâle que celle qui est à nos pieds.
  // L'eau : un seul dégradé continu du pâle (horizon) au profond (premier
  // plan). Des ellipses de couleurs différentes empilées se liraient
  // toujours comme des bandes — l'œil trouve la frontière quel que soit le
  // recouvrement.
  // Un dégradé natif est bien plus faible qu'une accumulation de lavis à
  // opacité comparable : il ne passe qu'une fois. Les valeurs doivent donc
  // être nettement plus hautes qu'on ne l'attend.
  gradedWash(ctx, -w * 0.05, horizon, w * 1.05, h * 1.02, [
    { at: 0, color: BLEU_CLAIR, alpha: 0.22 },
    { at: 0.26, color: TURQUOISE, alpha: 0.42 },
    { at: 0.56, color: BLEU, alpha: 0.56 },
    { at: 0.8, color: VIOLET, alpha: 0.6 },
    { at: 1, color: VIOLET_PROFOND, alpha: 0.72 },
  ])

  // Les reflets de la rive, tirés verticalement juste sous l'horizon.
  reflection(ctx, w * 0.24, w * 0.3, horizon, h * 0.045, VIOLET_BRUME, rng, 5)
  reflection(ctx, w * 0.62, w * 0.34, horizon, h * 0.038, VIOLET_BRUME, rng, 5)
  reflection(ctx, w * 0.44, w * 0.04, horizon, h * 0.055, VIOLET, rng, 2)

  // Les rides, en perspective : serrées et fines près de l'horizon, plus
  // rares et plus marquées au premier plan. C'est cette variation d'échelle
  // qui couche le plan d'eau — des touches de taille constante feraient
  // lire un mur vertical texturé.
  ripples(ctx, 0, w, horizon + h * 0.02, h * 1.0, 34, rng, {
    color: BLEU,
    accent: VIOLET_PROFOND,
  })

  // Les voiles : deux au loin, minuscules, une plus près et plus franche.
  voile(ctx, w * 0.3, horizon + h * 0.035, w * 0.035, rng, 0.75)
  voile(ctx, w * 0.68, horizon + h * 0.05, w * 0.045, rng, 0.6)
  voile(ctx, w * 0.44, h * 0.62, w * 0.075, rng, 0.15)

  // Éclats de lumière réservée sur les crêtes.
  stroke(ctx, houle(h * 0.55, 4, w * 0.8, rng), 2, rng, { color: PAPIER, alpha: 0.045, layers: 10 })
  glint(ctx, w * 0.66, h * 0.49, w * 0.14, h * 0.016, rng, 0.5)
  glint(ctx, w * 0.26, h * 0.76, w * 0.12, h * 0.018, rng, 0.45)

  // Une profondeur qui referme le bas du tableau.
  wash(ctx, polygon(w * 0.5, h * 1.06, w * 0.9, h * 0.14, 11, 0, rng), rng, {
    color: VIOLET_PROFOND,
    layers: 20,
    alpha: 0.028,
    spread: 0.16,
  })
}

/**
 * Droite — la cité engloutie. Une barque minuscule s'avance vers des tours
 * qui sortent à peine de l'eau, dans une brume ocre. L'échelle fait tout le
 * sujet : la barque doit rester petite pour que la ville paraisse immense.
 */
export const citeEngloutieScene: PaintScene = (ctx, w, h, rng) => {
  // Ciel : même construction que la lagune — un dégradé continu qui se vide
  // vers le bas, et des nuages structurés. C'est ce qui fait que les deux
  // tableaux se répondent au lieu de coexister.
  //
  // Confiné au ciel : en `multiply`, rien n'occulte rien, un lavis qui
  // déborde sur la ville reste visible À TRAVERS les façades et se lit
  // comme une écharpe qui traverse les bâtiments.
  gradedWash(ctx, -w * 0.05, 0, w * 1.05, h * 0.34, [
    { at: 0, color: OCRE, alpha: 0.34 },
    { at: 0.5, color: VIOLET_BRUME, alpha: 0.26 },
    { at: 0.85, color: SABLE, alpha: 0.12 },
    { at: 1, color: SABLE, alpha: 0.04 },
  ])
  // `light: VIOLET_BRUME`, pas `PIERRE_PALE` comme sur la lagune : ce ciel
  // est chaud (OCRE/SABLE) alors que celui de la lagune est froid (VIOLET).
  // PIERRE_PALE, un beige pâle, s'y fondait presque entièrement — le corps
  // du nuage restait quasi invisible et son highlight, pourtant bien posé
  // dessus, se lisait comme flottant sur du ciel nu. Un lavis froid tranche
  // sur un ciel chaud là où un lavis chaud s'y noie.
  cloud(ctx, w * 0.62, h * 0.11, w * 0.66, h * 0.045, rng, LUMIERE, {
    light: VIOLET_BRUME,
    shade: VIOLET,
    alpha: 0.16,
    highlight: PAPIER,
  })
  cloud(ctx, w * 0.22, h * 0.2, w * 0.5, h * 0.026, rng, LUMIERE, {
    light: SABLE,
    shade: VIOLET_BRUME,
    alpha: 0.1,
    highlight: PAPIER,
  })

  // La ville. Chaque bâtiment est un vrai volume d'architecture — façade
  // avec ses fenêtres, corniche, toit en pente ou dôme — et non plus une
  // masse effilée. `distance` (0 = devant, 1 = horizon) gouverne à la fois
  // le contraste et la netteté du trait.
  const quai = h * 0.66

  // Fond lointain : deux silhouettes très pâles, sans détail, qui creusent
  // l'espace derrière la ville.
  facade(ctx, w * 0.16, h * 0.42, quai, w * 0.16, rng, LUMIERE, {
    stone: VIOLET_BRUME,
    shade: VIOLET,
    distance: 0.85,
    floors: 0,
    bays: 0,
  })
  facade(ctx, w * 0.88, h * 0.46, quai, w * 0.14, rng, LUMIERE, {
    stone: VIOLET_BRUME,
    shade: VIOLET,
    distance: 0.8,
    floors: 0,
    bays: 0,
  })

  // Plan intermédiaire : le campanile, qui donne la verticale dominante.
  // Une cité engloutie n'a plus de toits — `ruinFacade` remplace le
  // toit en pente et la corniche par un sommet rongé, brisé par le temps
  // plutôt que par l'eau qui l'a fait sombrer.
  ruinFacade(ctx, w * 0.3, h * 0.2, quai, w * 0.13, rng, LUMIERE, {
    stone: PIERRE_CHAUDE,
    shade: VIOLET_PROFOND,
    moss: VERT,
    distance: 0.4,
    floors: 4,
    bays: 2,
  })

  // Un fragment de colonnade brisée, entre le campanile et le dôme : le
  // repère qui dit « Antiquité », pas seulement « vieux » — une façade
  // rongée peut aussi bien être une usine abandonnée. Trois colonnes,
  // cassures inégales, une seule encore couronnée de son chapiteau.
  // Rayons doublés par rapport au premier essai : à la taille d'affichage
  // réelle du canvas (220px de source, réduit encore par le CSS), un rayon
  // sous ~0.02 * w tombe sous le seuil de lisibilité — vérifié à l'échelle
  // réelle, pas seulement sur une capture zoomée qui masque le problème.
  column(ctx, w * 0.37, quai, h * 0.22, w * 0.024, rng, LUMIERE, {
    stone: PIERRE_PALE,
    shade: VIOLET_PROFOND,
    distance: 0.35,
    broken: true,
  })
  column(ctx, w * 0.425, quai, h * 0.16, w * 0.022, rng, LUMIERE, {
    stone: PIERRE_PALE,
    shade: VIOLET_PROFOND,
    distance: 0.38,
    broken: true,
  })
  column(ctx, w * 0.48, quai, h * 0.27, w * 0.026, rng, LUMIERE, {
    stone: PIERRE_CHAUDE,
    shade: VIOLET_PROFOND,
    distance: 0.32,
    broken: false,
  })

  // Un tambour effondré, à moitié submergé au bord de l'eau — la colonne
  // qui n'a pas tenu, contrepoint au premier plan de celles qui tiennent
  // encore debout au loin.
  fallenColumn(ctx, w * 0.19, quai - h * 0.006, w * 0.15, w * 0.018, rng, LUMIERE, {
    stone: PIERRE_CHAUDE,
    shade: VIOLET_PROFOND,
    distance: 0.12,
  })

  // Le dôme, contrepoint rond d'une skyline sinon toute en verticales — le
  // seul volume encore intact au milieu des ruines, ce qui le rend d'autant
  // plus frappant. Ses murs, eux, ont vieilli comme les autres.
  dome(ctx, w * 0.56, h * 0.4, w * 0.11, rng, LUMIERE, {
    stone: PIERRE_PALE,
    shade: VIOLET,
    distance: 0.5,
  })
  ruinFacade(ctx, w * 0.56, h * 0.4, quai, w * 0.17, rng, LUMIERE, {
    stone: PIERRE_PALE,
    shade: VIOLET_PROFOND,
    moss: VERT,
    distance: 0.5,
    floors: 2,
    bays: 3,
    decay: 0.3,
  })

  // Premier plan à droite : la grande masse d'ombre, celle qui porte le
  // contraste du tableau. Son arcade, trouée de quelques arches
  // effondrées, donne le rythme brisé d'une colonnade en ruine.
  ruinFacade(ctx, w * 0.82, h * 0.33, quai, w * 0.3, rng, LUMIERE, {
    stone: VIOLET,
    shade: VIOLET_PROFOND,
    moss: VERT,
    distance: 0.08,
    floors: 3,
    bays: 3,
  })
  arcade(ctx, w * 0.68, w * 0.97, h * 0.55, quai, 4, rng, LUMIERE, 0.15, 0.22)

  // Premier plan à gauche : une façade claire, presque du papier nu, pour
  // que la masse sombre de droite ait quelque chose à quoi s'opposer —
  // moins rongée que les autres (`decay` réduit), pour que toute la ville
  // ne casse pas à la même hauteur.
  ruinFacade(ctx, w * 0.08, h * 0.5, quai, w * 0.2, rng, LUMIERE, {
    stone: PIERRE_PALE,
    shade: VIOLET_BRUME,
    moss: VERT,
    distance: 0.15,
    floors: 2,
    bays: 2,
    decay: 0.32,
  })

  // Les reflets : tirés vers le bas en traits verticaux, puis cassés par des
  // rides horizontales. Un reflet qui ne serait qu'une copie délavée reste
  // une tache ; ce sont les cassures qui en font de l'eau.
  for (const [cx, largeur, color, longueur] of [
    [0.3, 0.13, PIERRE_CHAUDE, 0.16],
    [0.56, 0.17, PIERRE_PALE, 0.13],
    [0.82, 0.3, VIOLET_PROFOND, 0.15],
    [0.08, 0.2, PIERRE_PALE, 0.12],
  ] as Array<[number, number, string, number]>) {
    reflection(ctx, w * cx, w * largeur, quai, h * longueur, color, rng, 9)
  }

  // L'eau, tenue sous la ligne de quai pour la même raison que le ciel :
  // en `multiply`, une bande d'eau qui remonte trop haut traverse
  // visiblement les façades.
  gradedWash(ctx, -w * 0.05, quai, w * 1.05, h * 1.02, [
    { at: 0, color: BLEU_CLAIR, alpha: 0.26 },
    { at: 0.35, color: BLEU, alpha: 0.46 },
    { at: 0.72, color: VIOLET, alpha: 0.56 },
    { at: 1, color: VIOLET_PROFOND, alpha: 0.68 },
  ])
  // Les rides, en perspective comme sur la lagune.
  ripples(ctx, 0, w, quai + h * 0.01, h * 1.0, 26, rng, {
    color: BLEU,
    accent: VIOLET_PROFOND,
  })
  stroke(ctx, houle(h * 0.72, 3, w * 0.8, rng), 2, rng, { color: PAPIER, alpha: 0.04, layers: 9 })
  // Deux éclats de lumière francs sur l'eau — le papier qui perce net,
  // pas seulement un voile pâle.
  glint(ctx, w * 0.68, h * 0.73, w * 0.12, h * 0.016, rng, 0.5)
  glint(ctx, w * 0.22, h * 0.88, w * 0.1, h * 0.014, rng, 0.45)

  // La barque : petite, décalée, avec sa voile et son sillage.
  const bx = w * 0.32
  const by = h * 0.75
  const s = w * 0.055
  wash(ctx, [
    [bx - s, by],
    [bx + s, by],
    [bx + s * 0.6, by + s * 0.5],
    [bx - s * 0.6, by + s * 0.5],
  ], rng, { color: VIOLET_PROFOND, layers: 22, alpha: 0.05, spread: 0.06, jitter: 0.07 })
  wash(ctx, [
    [bx, by - s * 1.9],
    [bx + s * 0.85, by - s * 0.1],
    [bx - s * 0.2, by - s * 0.1],
  ], rng, { color: OCRE, layers: 24, alpha: 0.04, spread: 0.06, jitter: 0.06 })
  dryStroke(ctx, [[bx, by - s * 2], [bx, by]], 1.4, rng, { color: ENCRE_SOMBRE, alpha: 0.5, layers: 3 })
  dryStroke(ctx, [[bx - s, by], [bx + s * 0.6, by + s * 0.5]], 1.6, rng, {
    color: ENCRE_SOMBRE,
    alpha: 0.4,
    layers: 2,
  })
  stroke(ctx, [[bx - s * 1.6, by + s * 0.7], [bx + s * 2.4, by + s * 0.55]], 2.4, rng, {
    color: PAPIER,
    alpha: 0.045,
    layers: 10,
  })
  // Un éclat réservé est toujours un trait fin, jamais une nappe — voir
  // `glint()`. Une couleur saturée (essayé ici avec `BLEU_CLAIR`) se lisait
  // comme une tache posée sur l'eau, pas comme un reflet ; une forme ronde
  // (essayé ensuite avec `highlight()`) se lisait comme un galet flottant.
  glint(ctx, w * 0.6, h * 0.72, w * 0.1, h * 0.014, rng, 0.4)
  glint(ctx, w * 0.4, h * 0.9, w * 0.12, h * 0.016, rng, 0.35)

  // Un dernier voile vert-de-gris sur l'eau basse, pour le côté submergé.
  wash(ctx, polygon(w * 0.5, h * 0.9, w * 0.7, h * 0.1, 10, 0, rng), rng, {
    color: VERT,
    layers: 14,
    alpha: 0.016,
    spread: 0.2,
  })
}

/**
 * Le bandeau au-dessus du titre : une enfant qui écrit à son bureau, qui
 * lève les yeux vers le joueur. Le bas du canvas passe légèrement sous le
 * titre (marge négative en CSS) — le bureau peut y mordre sans problème,
 * mais la tête doit rester nettement au-dessus de cette ligne, elle est le
 * seul endroit où un défaut se verrait vraiment.
 *
 * L'atmosphère (deux lavis pâles) reste à gauche, sobre : la figure est le
 * sujet, pas un élément de plus au milieu des autres.
 */
export const bandeauScene: PaintScene = (ctx, w, h, rng) => {
  wash(ctx, polygon(w * 0.14, h * 0.5, w * 0.2, h * 0.36, 11, 0, rng), rng, {
    color: VIOLET_BRUME,
    layers: 22,
    alpha: 0.02,
    spread: 0.22,
  })
  wash(ctx, polygon(w * 0.38, h * 0.4, w * 0.18, h * 0.3, 10, 0, rng), rng, {
    color: BLEU_CLAIR,
    layers: 20,
    alpha: 0.014,
    spread: 0.24,
  })
  stroke(ctx, houle(h * 0.8, 3, w * 0.96, rng), 2, rng, { color: VIOLET_PROFOND, alpha: 0.014, layers: 8 })

  girlWriting(ctx, w * 0.74, h * 0.7, h * 0.27, rng, LUMIERE, {
    skin: PIERRE_CHAUDE,
    hair: VIOLET_PROFOND,
    dress: VIOLET,
    wood: SABLE,
    paper: PAPIER,
    accent: ENCRE_SOMBRE,
  })
}
