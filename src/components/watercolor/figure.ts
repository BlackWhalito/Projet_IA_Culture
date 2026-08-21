import { dryStroke, polygon, wash } from './engine'
import { litFromLeft } from './light'
import type { LightPlan } from './light'

/**
 * La figure humaine.
 *
 * Un seul sujet pour l'instant : une enfant qui écrit, au-dessus du titre.
 * Le risque ici est spécifique et plus élevé qu'ailleurs — un visage raté
 * se voit tout de suite, plus que n'importe quelle façade ratée. La règle
 * qui s'applique : rester ICONIQUE, jamais anatomique. Deux petits accents
 * sombres suffisent à faire des yeux qui regardent le joueur ; une bouche
 * détaillée est plus risquée qu'utile à cette échelle et à ce niveau
 * d'abstraction. Même logique que `voile()` dans `scenes.ts` — un bateau
 * reconnaissable en trois formes, jamais une coque détaillée.
 */

export interface GirlOptions {
  skin: string
  hair: string
  dress: string
  wood: string
  paper: string
  accent: string
}

/**
 * Une enfant assise à un bureau, en train d'écrire, qui lève les yeux vers
 * le joueur. `cx` centre le bureau, `yDesk` place son plateau, `scale`
 * règle toute la figure (la tête a un rayon d'environ `scale * 0.4`).
 */
export function girlWriting(
  ctx: CanvasRenderingContext2D,
  cx: number,
  yDesk: number,
  scale: number,
  rng: () => number,
  plan: LightPlan,
  options: GirlOptions,
): void {
  const { skin, hair, dress, wood, paper, accent } = options
  const lit = litFromLeft(plan)
  // Le côté qui écrit — le carnet, la main et le bras qui s'y penche
  // doivent TOUS être du même côté. Un bureau décalé à l'opposé du bras
  // qui écrit force ce bras à traverser tout le buste en diagonale : à
  // l'écran, deux bras qui se croisent en X, une posture cassée plutôt
  // qu'une enfant penchée sur son carnet.
  const writingSide = lit ? 1 : -1

  // Le bureau : un plateau et un panneau avant, juste assez pour poser la
  // scène — ce n'est pas le sujet, il ne doit pas rivaliser avec elle.
  const deskW = scale * 2.6
  const deskH = scale * 0.85
  wash(ctx, [
    [cx - deskW / 2, yDesk + deskH],
    [cx - deskW / 2, yDesk],
    [cx + deskW / 2, yDesk],
    [cx + deskW / 2, yDesk + deskH],
  ], rng, { color: wood, layers: 16, alpha: 0.4 / 16, spread: 0.04, jitter: 0.05 })
  dryStroke(ctx, [[cx - deskW / 2, yDesk], [cx + deskW / 2, yDesk]], scale * 0.05, rng, {
    color: accent,
    alpha: 0.3,
    layers: 2,
  })

  // Le carnet et ses lignes d'écriture, à peine suggérées — jamais du texte
  // lisible, seulement le geste. Posé nettement AU-DESSUS du plateau (pas
  // à cheval sur son arête), avec un bord sombre fin : sans lui, le papier
  // clair se fond dans le bois clair et disparaît.
  const bookX = cx + writingSide * deskW * 0.08
  const bookY = yDesk - scale * 0.28
  const bookW = scale * 0.7
  const bookH = scale * 0.42
  wash(ctx, [
    [bookX - bookW / 2, bookY + bookH / 2],
    [bookX - bookW / 2, bookY - bookH / 2],
    [bookX + bookW / 2, bookY - bookH / 2],
    [bookX + bookW / 2, bookY + bookH / 2],
  ], rng, { color: paper, layers: 14, alpha: 0.55 / 14, spread: 0.04, jitter: 0.06 })
  dryStroke(ctx, [
    [bookX - bookW / 2, bookY - bookH / 2],
    [bookX + bookW / 2, bookY - bookH / 2],
    [bookX + bookW / 2, bookY + bookH / 2],
    [bookX - bookW / 2, bookY + bookH / 2],
    [bookX - bookW / 2, bookY - bookH / 2],
  ], scale * 0.02, rng, { color: accent, alpha: 0.28, layers: 1 })
  for (let i = 0; i < 3; i += 1) {
    const ly = bookY - bookH * 0.28 + i * bookH * 0.26
    dryStroke(ctx, [[bookX - bookW * 0.32, ly], [bookX + bookW * 0.32, ly]], scale * 0.018, rng, {
      color: accent,
      alpha: 0.3,
      layers: 1,
    })
  }

  // Le torse : une robe simple, plus large aux épaules, qui plonge sous le
  // plateau du bureau — on ne dessine jamais ce que le bureau cache.
  const shoulderY = yDesk - scale * 0.95
  const torsoW = scale * 1.1
  wash(ctx, [
    [cx - torsoW * 0.55, yDesk + scale * 0.15],
    [cx - torsoW * 0.5, shoulderY],
    [cx + torsoW * 0.5, shoulderY],
    [cx + torsoW * 0.55, yDesk + scale * 0.15],
  ], rng, { color: dress, layers: 18, alpha: 0.45 / 18, spread: 0.06, jitter: 0.08 })

  // Les bras : deux traits qui plongent vers le bureau — celui qui écrit se
  // penche jusqu'au carnet, l'autre repose simplement sur le bord.
  const handX = bookX + writingSide * bookW * 0.1
  const handY = bookY + bookH * 0.32
  dryStroke(ctx, [
    [cx + writingSide * torsoW * 0.35, shoulderY + scale * 0.1],
    [cx + writingSide * torsoW * 0.1, yDesk - scale * 0.15],
    [handX, handY],
  ], scale * 0.15, rng, { color: skin, alpha: 0.5, layers: 3 })
  dryStroke(ctx, [
    [cx - writingSide * torsoW * 0.4, shoulderY + scale * 0.15],
    [cx - writingSide * torsoW * 0.28, yDesk],
  ], scale * 0.13, rng, { color: skin, alpha: 0.45, layers: 3 })

  // La main qui écrit : un petit accent rond, juste assez pour ancrer le
  // stylo à un poignet plutôt qu'à un trait qui flotte.
  wash(ctx, polygon(handX, handY, scale * 0.09, scale * 0.08, 7, 0, rng), rng, {
    color: skin,
    layers: 10,
    alpha: 0.45 / 10,
    spread: 0.08,
    jitter: 0.1,
  })

  // Le stylo : un trait fin, tenu par cette main, pointé vers le carnet.
  dryStroke(ctx, [
    [handX - writingSide * scale * 0.1, handY + scale * 0.08],
    [handX + writingSide * scale * 0.2, handY - scale * 0.22],
  ], scale * 0.035, rng, { color: accent, alpha: 0.65, layers: 2 })

  // La tête : ronde, centrée au-dessus des épaules.
  const headR = scale * 0.4
  const headY = shoulderY - headR * 0.85
  wash(ctx, polygon(cx, headY, headR, headR * 1.05, 12, 0, rng), rng, {
    color: skin,
    layers: 20,
    alpha: 0.42 / 20,
    spread: 0.05,
    jitter: 0.06,
  })

  // Les cheveux : une masse derrière la tête avec deux couettes — le repère
  // le plus sûr pour lire « une enfant » d'un coup d'œil, bien plus fiable
  // qu'aucun détail de visage.
  wash(ctx, [
    [cx - headR * 1.05, headY + headR * 0.35],
    [cx - headR * 0.9, headY - headR * 0.85],
    [cx, headY - headR * 1.1],
    [cx + headR * 0.9, headY - headR * 0.85],
    [cx + headR * 1.05, headY + headR * 0.35],
    [cx + headR * 0.65, headY - headR * 0.05],
    [cx, headY - headR * 0.45],
    [cx - headR * 0.65, headY - headR * 0.05],
  ], rng, { color: hair, layers: 16, alpha: 0.5 / 16, spread: 0.06, jitter: 0.08 })
  // Les couettes : hautes et courtes, collées à la tête. Descendues jusqu'à
  // hauteur d'épaule, elles se lisaient comme des épaulettes plutôt que des
  // cheveux, d'autant que `hair` et `dress` restent dans la même famille de
  // violet une fois mélangés en `multiply`.
  wash(ctx, polygon(cx - headR * 1.1, headY + headR * 0.15, headR * 0.26, headR * 0.32, 8, 0, rng), rng, {
    color: hair,
    layers: 12,
    alpha: 0.4 / 12,
    spread: 0.08,
    jitter: 0.1,
  })
  wash(ctx, polygon(cx + headR * 1.1, headY + headR * 0.15, headR * 0.26, headR * 0.32, 8, 0, rng), rng, {
    color: hair,
    layers: 12,
    alpha: 0.4 / 12,
    spread: 0.08,
    jitter: 0.1,
  })

  // Les yeux : deux tout petits accents sombres, la seule vraie touche de
  // détail qu'on s'autorise sur le visage. Ce sont eux, et eux seuls, qui
  // disent qu'elle regarde le joueur.
  const eyeY = headY + headR * 0.05
  wash(ctx, polygon(cx - headR * 0.28, eyeY, headR * 0.07, headR * 0.09, 6, 0, rng), rng, {
    color: accent,
    layers: 8,
    alpha: 0.55 / 8,
    spread: 0.05,
    jitter: 0.06,
  })
  wash(ctx, polygon(cx + headR * 0.28, eyeY, headR * 0.07, headR * 0.09, 6, 0, rng), rng, {
    color: accent,
    layers: 8,
    alpha: 0.55 / 8,
    spread: 0.05,
    jitter: 0.06,
  })
}
