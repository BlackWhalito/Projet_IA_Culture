import { contour, dryStroke, flecks, polygon, wash } from './engine'
import type { Point } from './engine'
import { attenue, litFromLeft } from './light'
import type { LightPlan } from './light'

/**
 * Le paysage : ce sur quoi les bâtiments se posent, et ce qui pousse
 * autour.
 *
 * Séparé de `architecture.ts` par une frontière simple : ici, rien n'a
 * d'angle droit et rien ne se répète. Séparé de `jardin.ts` par l'inverse
 * de ce qui définit ce module-là — un jardin à la française se lit à sa
 * géométrie imposée, un paysage à son absence de géométrie.
 */

/**
 * Une masse rocheuse : la crête irrégulière d'abord, la pierre ensuite.
 *
 * La règle des contours brisés en plateaux (celle de `ruinFacade`) ne
 * s'applique PAS ici : elle existe pour qu'un mur cassé ne se lise pas
 * comme une montagne. Un rocher, lui, veut précisément des pentes.
 */
export function roche(
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
  // Le trait sur la crête : posé par tronçons, jamais en cerne continu.
  // C'est lui qui fait basculer une masse molle en arête de pierre — sans
  // aucun trait, un rocher reste une tache, quelle que soit la justesse de
  // sa silhouette.
  contour(ctx, crete, rng, {
    color: plan.accent,
    width: Math.max(0.7, (x1 - x0) * 0.004),
    alpha: 0.28 * weight,
    layers: 2,
    coverage: 0.44,
    runs: 3,
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
 * Des collines : la même idée que `roche()`, mais molle.
 *
 * Deux modules pour deux crêtes pourrait sembler du gaspillage — c'est en
 * réalité toute la différence entre un relief usé et un relief cassé, et
 * elle se lit immédiatement. Une crête anguleuse dit « montagne, roche
 * nue » ; une crête ondulée dit « campagne ». Aucun réglage de couleur ne
 * fait basculer l'un vers l'autre.
 */
export function collines(
  ctx: CanvasRenderingContext2D,
  x0: number,
  x1: number,
  yCrete: number,
  yBas: number,
  rng: () => number,
  options: { green: string; shade: string; distance?: number; bosses?: number },
): void {
  const { green, shade, distance = 0, bosses = 3 } = options
  const points: Point[] = []
  const pas = bosses * 6
  const phase = rng() * Math.PI * 2
  for (let i = 0; i <= pas; i += 1) {
    const t = i / pas
    // Une somme de deux sinus de périodes différentes : une seule donnerait
    // une tôle ondulée, deux suffisent à casser la régularité sans qu'on
    // ait besoin de hasard, donc sans risque de tirage malchanceux.
    const onde = Math.sin(phase + t * Math.PI * 2 * bosses) * 0.6 + Math.sin(phase * 1.7 + t * Math.PI * 2 * (bosses * 1.7)) * 0.4
    points.push([x0 + (x1 - x0) * t, yCrete + (yBas - yCrete) * 0.5 * (1 - onde * 0.9)])
  }
  wash(ctx, [[x0, yBas], ...points, [x1, yBas]], rng, {
    color: green,
    layers: 20,
    alpha: attenue(0.72, distance) / 20,
    spread: 0.05,
    jitter: 0.14,
  })
  // Un trait ténu sur la ligne de crête : sur un lointain, il ne doit pas
  // se lire comme un trait, seulement empêcher la colline de se dissoudre
  // dans le ciel.
  contour(ctx, points, rng, {
    color: shade,
    width: 0.8,
    alpha: attenue(0.3, distance) * (1 - distance),
    layers: 1,
    coverage: 0.4,
    runs: 2,
  })

  // Le creux entre deux bosses reçoit l'ombre : sans elle, une suite de
  // dômes reste un aplat au contour ondulé, pas un relief.
  const creux: Point[] = points.map(([px, py]) => [px, py + (yBas - py) * 0.55])
  wash(ctx, [[x0, yBas], ...creux, [x1, yBas]], rng, {
    color: shade,
    layers: 12,
    alpha: attenue(0.4, distance) / 12,
    spread: 0.07,
    jitter: 0.16,
  })
}

export interface ArbreOptions {
  /** Le feuillage. Ignoré si `bare`. */
  canopy: string
  /** Le bois du tronc et des branches. */
  wood: string
  /** L'ombre dans le feuillage — un bleu, jamais un prune (voir `OMBRE_FEUILLAGE`). */
  shade: string
  distance?: number
  /** Densité du pigment, pour qu'un arbre de premier plan puisse être le noir du tableau. */
  weight?: number
  /** Arbre nu : branches seules, pas de feuillage. L'hiver, ou un arbre mort. */
  bare?: boolean
  /** Points clairs semés dans le feuillage — fleurs, fruits. */
  speck?: string
}

/**
 * Un arbre de plein vent : tronc, charpentière, houppier.
 *
 * L'exact opposé de `topiaire()`, et c'est voulu — l'un est taillé, l'autre
 * pas, et c'est le seul contraste qui distingue un jardin d'une campagne.
 * Trois choses le décident :
 *
 * 1. **Le tronc se divise.** Un fût unique qui monte jusqu'au feuillage
 *    donne un champignon ou une sucette. Ce sont les deux ou trois
 *    branches maîtresses qui font l'arbre, et elles doivent MORDRE dans le
 *    houppier, pas s'arrêter dessous.
 * 2. **Le houppier est un agrégat**, jamais un disque : plusieurs lobes
 *    inégaux dont le contour général reste large et bas — un houppier plus
 *    haut que large donne un cyprès.
 * 3. **Il est troué.** Quelques échappées de ciel dans la masse ; c'est ce
 *    qui empêche le feuillage de se lire comme une éponge.
 */
export function arbre(
  ctx: CanvasRenderingContext2D,
  x: number,
  yBase: number,
  height: number,
  rng: () => number,
  plan: LightPlan,
  options: ArbreOptions,
): void {
  const { canopy, wood, shade, distance = 0, weight = 1, bare = false, speck } = options
  const lit = litFromLeft(plan)
  const yFourche = yBase - height * 0.38
  const largeur = height * 0.8
  const penche = (rng() - 0.5) * height * 0.05

  // Le tronc est un POLYGONE, pas un trait. `dryStroke` effile ses deux
  // bouts : un tronc tracé avec lui sort en fuseau, aussi fin au pied
  // qu'au sommet — une aubergine plantée dans le sol. Un vrai tronc
  // s'évase au pied et s'affine en montant, et cette dissymétrie est tout
  // ce qui le fait tenir debout à l'œil.
  const pied = height * 0.055
  const col = height * 0.03
  wash(ctx, [
    [x - pied, yBase + height * 0.02],
    [x - pied * 0.6, yBase - height * 0.14],
    [x - col + penche, yFourche],
    [x + col + penche, yFourche],
    [x + pied * 0.6, yBase - height * 0.14],
    [x + pied, yBase + height * 0.02],
  ], rng, {
    color: wood,
    layers: 18,
    alpha: (attenue(1.35, distance) * weight) / 18,
    spread: 0.05,
    jitter: 0.1,
  })

  /**
   * Une branche et ses sous-branches, par bifurcations successives.
   *
   * Récursif parce qu'un arbre l'est : c'est la répétition du MÊME geste à
   * des échelles décroissantes qui fait un arbre. Trois branches droites
   * partant du même point donnent une fourche à foin — le défaut de la
   * première version, immédiatement visible sur l'arbre nu de l'hiver.
   */
  const branche = (bx: number, by: number, dx: number, dy: number, epaisseur: number, reste: number): void => {
    const fx = bx + dx
    const fy = by + dy
    dryStroke(ctx, [
      [bx, by],
      [bx + dx * 0.55 + (rng() - 0.5) * epaisseur * 2, by + dy * 0.5],
      [fx, fy],
    ], epaisseur, rng, {
      color: wood,
      // Sous un houppier, le bois se devine et ne se détaille pas :
      // à pleine densité, les charpentières transparaissent au travers
      // du feuillage et se lisent comme des lames plantées dedans.
      alpha: attenue(bare ? 0.55 : 0.3, distance) * weight,
      layers: 2,
      jitter: 0.14,
    })
    if (reste <= 0) return
    for (const sens of [-1, 1]) {
      const angle = sens * (0.5 + rng() * 0.4)
      const cos = Math.cos(angle)
      const sin = Math.sin(angle)
      branche(fx, fy, (dx * cos - dy * sin) * 0.66, (dx * sin + dy * cos) * 0.66, epaisseur * 0.6, reste - 1)
    }
  }

  // Deux charpentières, de longueurs franchement inégales : symétriques,
  // elles redonnent la fourche.
  branche(x + penche, yFourche, -largeur * 0.2, -height * 0.2, height * 0.036 * weight, bare ? 3 : 1)
  branche(x + penche, yFourche, largeur * 0.26, -height * 0.16, height * 0.03 * weight, bare ? 3 : 1)

  if (bare) return

  // Le houppier : des lobes inégaux, larges et bas. Peints APRÈS les
  // branches et assez denses pour les avaler — des charpentières qui
  // transparaissent au travers se lisent comme des lames plantées dans le
  // feuillage, pas comme du bois sous des feuilles.
  const lobes = 6
  const yCentre = yFourche - height * 0.26
  for (let i = 0; i < lobes; i += 1) {
    const a = (i / lobes) * Math.PI * 2 + rng() * 0.7
    const r = (0.42 + rng() * 0.34) * largeur * 0.5
    const lx = x + penche + Math.cos(a) * largeur * 0.24
    const ly = yCentre + Math.sin(a) * height * 0.12
    wash(ctx, polygon(lx, ly, r, r * (0.74 + rng() * 0.3), 11, rng() * 6, rng), rng, {
      color: canopy,
      layers: 18,
      alpha: (attenue(0.66, distance) * weight) / 18,
      spread: 0.16,
      jitter: 0.34,
    })
  }
  // L'ombre du houppier : une masse compacte du côté opposé à la lumière,
  // toujours plus BASSE que le centre — la lumière vient d'en haut, donc
  // le dessous d'un feuillage est toujours son côté sombre.
  wash(ctx, polygon(
    x + penche + (lit ? largeur * 0.16 : -largeur * 0.16),
    yCentre + height * 0.1,
    largeur * 0.32,
    height * 0.15,
    11,
    0,
    rng,
  ), rng, {
    color: shade,
    layers: 14,
    alpha: (attenue(0.44, distance) * weight) / 14,
    spread: 0.2,
    jitter: 0.36,
  })
  // Le dessous du houppier, tracé par tronçons : c'est le seul endroit
  // d'un arbre où le bord se voit vraiment, là où la masse se referme sur
  // son ombre. Le sommet, lui, reste perdu dans la lumière.
  const sousBois: Point[] = []
  for (let i = 0; i <= 10; i += 1) {
    const a = Math.PI * (0.08 + (i / 10) * 0.84)
    sousBois.push([
      x + penche + Math.cos(a) * largeur * 0.62,
      yCentre + Math.sin(a) * height * 0.36,
    ])
  }
  contour(ctx, sousBois, rng, {
    color: shade,
    width: Math.max(0.7, height * 0.016),
    alpha: attenue(0.5, distance) * weight,
    layers: 2,
    coverage: 0.5,
    runs: 3,
  })
  // Et le flanc du tronc à l'ombre, une seule fois : deux traits en
  // feraient une planche.
  contour(ctx, [
    [x + (lit ? pied * 0.8 : -pied * 0.8), yBase],
    [x + (lit ? col * 0.8 : -col * 0.8) + penche, yFourche],
  ], rng, {
    color: plan.accent,
    width: Math.max(0.6, height * 0.012),
    alpha: attenue(0.34, distance) * weight,
    layers: 2,
    coverage: 0.62,
    runs: 2,
  })

  if (speck) {
    flecks(ctx, x + penche, yCentre, largeur * 0.4, height * 0.2, 7, rng, {
      color: speck,
      layers: 6,
      alpha: attenue(0.1, distance),
      spread: 0.3,
      jitter: 0.3,
    })
  }
}
