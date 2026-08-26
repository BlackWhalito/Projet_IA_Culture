import { dryStroke, polygon, wash } from './engine'
import type { Point } from './engine'
import { litFromLeft } from './light'
import type { LightPlan } from './light'

/**
 * La figure humaine.
 *
 * Le risque ici est spécifique et plus élevé qu'ailleurs — un visage raté
 * se voit tout de suite, plus que n'importe quelle façade ratée. La règle
 * qui s'applique : rester ICONIQUE, jamais anatomique. Deux petits accents
 * sombres suffisent à faire des yeux qui regardent le joueur ; une bouche
 * détaillée est plus risquée qu'utile à cette échelle et à ce niveau
 * d'abstraction. Même logique que `voile()` dans `scenes.ts` — un bateau
 * reconnaissable en trois formes, jamais une coque détaillée.
 *
 * `childWatchingSea` pousse cette règle plus loin : vue de dos, assise,
 * elle n'a tout simplement aucun visage à risquer. La posture seule (genoux
 * repliés, bras autour, tête inclinée vers l'horizon) suffit à dire
 * « regarde au loin » — le motif classique de la figure vue de dos.
 *
 * `adultReading` applique la même esquive autrement : de face, mais tête
 * penchée vers son livre plutôt que vers le joueur. Un adulte absorbé dans
 * sa lecture regarde la page, pas devant lui — la posture dit « lit »,
 * aucun regard à peindre.
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

export interface ChildOptions {
  skin: string
  hair: string
  clothes: string
  accent: string
}

/**
 * Un enfant assis, vu de dos, genoux repliés contre la poitrine — le motif
 * classique de la figure qui regarde au loin. `cx` centre la silhouette,
 * `yGround` place l'assise (le rocher ou le sol sur lequel elle est posée),
 * `scale` règle toute la figure (la tête a un rayon d'environ `scale * 0.34`).
 *
 * Vue de dos : ni yeux ni visage à peindre. La tête, les épaules et la
 * posture repliée suffisent seules à la lecture « un enfant qui regarde la
 * mer » — le risque le plus élevé de `figure.ts` (un visage raté) est ici
 * simplement absent plutôt qu'atténué.
 */
export function childWatchingSea(
  ctx: CanvasRenderingContext2D,
  cx: number,
  yGround: number,
  scale: number,
  rng: () => number,
  plan: LightPlan,
  options: ChildOptions,
): void {
  const { skin, hair, clothes, accent } = options
  const lit = litFromLeft(plan)
  // Un tout petit penché du buste vers l'horizon, toujours du même côté que
  // la lumière — sans lui la silhouette reste plantée bien droite, moins
  // convaincante qu'une posture relâchée face au large.
  const lean = lit ? scale * 0.06 : -scale * 0.06

  // Les jambes repliées : une masse simple, plus large à l'assise qu'aux
  // genoux — le détail du pli du genou n'apporte rien à cette échelle.
  const hipY = yGround
  const kneeY = yGround - scale * 0.5
  const hipW = scale * 0.85
  const kneeW = scale * 0.5
  wash(ctx, [
    [cx - hipW / 2, hipY],
    [cx - kneeW / 2 + lean, kneeY],
    [cx + kneeW / 2 + lean, kneeY],
    [cx + hipW / 2, hipY],
  ], rng, { color: clothes, layers: 18, alpha: 0.42 / 18, spread: 0.05, jitter: 0.07 })

  // Le dos : une masse qui part des hanches et remonte, plus étroite aux
  // épaules qu'à l'assise — vue de dos, le dos EST la silhouette, il n'y a
  // rien d'autre à peindre pour le torse.
  const shoulderY = kneeY - scale * 0.5
  const shoulderW = scale * 0.62
  wash(ctx, [
    [cx - kneeW / 2 + lean, kneeY],
    [cx - shoulderW / 2 + lean, shoulderY],
    [cx + shoulderW / 2 + lean, shoulderY],
    [cx + kneeW / 2 + lean, kneeY],
  ], rng, { color: clothes, layers: 20, alpha: 0.42 / 20, spread: 0.05, jitter: 0.06 })

  // Les bras : deux traits qui partent des épaules et enveloppent les
  // genoux — c'est ce geste, plus que n'importe quel autre détail, qui dit
  // « repliée sur elle-même à regarder ».
  dryStroke(ctx, [
    [cx - shoulderW * 0.4 + lean, shoulderY + scale * 0.08],
    [cx - kneeW * 0.15 + lean, kneeY - scale * 0.02],
    [cx + lean * 1.5, kneeY + scale * 0.04],
  ], scale * 0.13, rng, { color: skin, alpha: 0.42, layers: 3 })
  dryStroke(ctx, [
    [cx + shoulderW * 0.4 + lean, shoulderY + scale * 0.08],
    [cx + kneeW * 0.15 + lean, kneeY - scale * 0.02],
    [cx + lean * 0.5, kneeY + scale * 0.06],
  ], scale * 0.13, rng, { color: skin, alpha: 0.42, layers: 3 })

  // La tête : ronde, penchée avec le buste, tournée vers l'horizon.
  const headR = scale * 0.34
  const headY = shoulderY - headR * 0.95
  const headX = cx + lean * 1.4
  wash(ctx, polygon(headX, headY, headR, headR * 1.05, 12, 0, rng), rng, {
    color: skin,
    layers: 18,
    alpha: 0.4 / 18,
    spread: 0.05,
    jitter: 0.06,
  })

  // Les cheveux : vue de dos, ils couvrent presque toute la tête plutôt que
  // de la couronner — c'est cette masse, pas un visage, qui fait la tête.
  // Un peu descendus vers les épaules pour suggérer une chevelure qui
  // retombe, jamais jusqu'à se confondre avec le vêtement (même piège que
  // les couettes de `girlWriting` : rester collé à la tête).
  wash(ctx, [
    [headX - headR * 1.02, headY + headR * 0.5],
    [headX - headR * 0.85, headY - headR * 0.75],
    [headX, headY - headR * 1.05],
    [headX + headR * 0.85, headY - headR * 0.75],
    [headX + headR * 1.02, headY + headR * 0.5],
    [headX + headR * 0.7, headY + headR * 1.3],
    [headX, headY + headR * 1.5],
    [headX - headR * 0.7, headY + headR * 1.3],
  ], rng, { color: hair, layers: 16, alpha: 0.48 / 16, spread: 0.06, jitter: 0.08 })

  // Une petite touche d'accent au col — l'arête sombre qui sépare la
  // chevelure du vêtement, sans quoi les deux masses proches en teinte
  // (selon la palette de la scène) risquent de fusionner en un seul bloc.
  dryStroke(ctx, [
    [headX - shoulderW * 0.3 + lean, headY + headR * 1.4],
    [headX + shoulderW * 0.3 + lean, headY + headR * 1.35],
  ], scale * 0.03, rng, { color: accent, alpha: 0.3, layers: 2 })
}

export interface AdultOptions {
  skin: string
  hair: string
  clothes: string
  paper: string
  accent: string
}

/**
 * Un adulte debout, en train de lire, tête penchée vers son livre. `cx`
 * centre la silhouette, `yGround` place ses pieds, `scale` règle toute la
 * figure (la tête a un rayon d'environ `scale * 0.26` — plus petite en
 * proportion du corps que celle de `girlWriting`, ce qui suffit à lire
 * « adulte » plutôt que « enfant » sans rien changer d'autre).
 *
 * Aucun œil peint : la tête inclinée regarde le livre, pas le joueur.
 */
export function adultReading(
  ctx: CanvasRenderingContext2D,
  cx: number,
  yGround: number,
  scale: number,
  rng: () => number,
  plan: LightPlan,
  options: AdultOptions,
): void {
  const { skin, hair, clothes, paper, accent } = options
  const lit = litFromLeft(plan)
  const side = lit ? 1 : -1

  // Le vêtement : une silhouette longue et simple, plus large aux épaules
  // qu'à l'ourlet — une robe d'enfant s'arrête au bureau, celle-ci descend
  // jusqu'aux pieds, c'est ce qui fait « adulte debout » avant même la tête.
  const shoulderY = yGround - scale * 1.55
  const hipW = scale * 0.42
  const shoulderW = scale * 0.62
  wash(ctx, [
    [cx - hipW / 2, yGround],
    [cx - shoulderW / 2, shoulderY],
    [cx + shoulderW / 2, shoulderY],
    [cx + hipW / 2, yGround],
  ], rng, { color: clothes, layers: 20, alpha: 0.45 / 20, spread: 0.05, jitter: 0.07 })

  // Le livre, tenu à hauteur de poitrine, légèrement du côté éclairé — même
  // logique que le carnet de `girlWriting` : un bord sombre net, sans quoi
  // le papier clair se fond dans un vêtement de teinte proche et disparaît.
  const bookY = shoulderY + scale * 0.5
  const bookX = cx + side * scale * 0.06
  const bookW = scale * 0.5
  const bookH = scale * 0.36
  wash(ctx, [
    [bookX - bookW / 2, bookY + bookH / 2],
    [bookX - bookW / 2, bookY - bookH / 2],
    [bookX + bookW / 2, bookY - bookH / 2],
    [bookX + bookW / 2, bookY + bookH / 2],
  ], rng, { color: paper, layers: 14, alpha: 0.55 / 14, spread: 0.04, jitter: 0.06 })
  // Contour nettement plus appuyé que celui du carnet de `girlWriting`
  // (largeur et alpha nettement relevés, pas seulement copiés) : le carnet
  // repose sur le bureau (bois `SABLE`), jamais sur la robe — ce livre-ci
  // est tenu contre le vêtement lui-même. Le remplissage `paper` reste
  // quasi indifférent au fond en `multiply` (un blanc cassé ne peut
  // qu'assombrir très légèrement ce qu'il recouvre, quelle que soit sa
  // couleur — la même limite que le highlight des nuages d'un chantier
  // précédent), donc c'est ce contour, seul, qui doit rendre le rectangle
  // du livre lisible. Signalé par le `verificateur` : à l'alpha/largeur du
  // carnet, le livre restait quasi invisible ici.
  dryStroke(ctx, [
    [bookX - bookW / 2, bookY - bookH / 2],
    [bookX + bookW / 2, bookY - bookH / 2],
    [bookX + bookW / 2, bookY + bookH / 2],
    [bookX - bookW / 2, bookY + bookH / 2],
    [bookX - bookW / 2, bookY - bookH / 2],
  ], scale * 0.035, rng, { color: accent, alpha: 0.5, layers: 2 })
  // La reliure : un trait central qui sépare les deux pages, suggéré plutôt
  // que du texte — jamais de texte lisible, seulement le geste du livre.
  dryStroke(ctx, [[bookX, bookY - bookH * 0.4], [bookX, bookY + bookH * 0.4]], scale * 0.02, rng, {
    color: accent,
    alpha: 0.4,
    layers: 1,
  })

  // Les bras : deux traits qui plongent des épaules vers le livre, comme
  // les bras de `girlWriting` vers son carnet.
  dryStroke(ctx, [
    [cx - shoulderW * 0.36, shoulderY + scale * 0.1],
    [bookX - bookW * 0.28, bookY],
  ], scale * 0.12, rng, { color: skin, alpha: 0.42, layers: 3 })
  dryStroke(ctx, [
    [cx + shoulderW * 0.36, shoulderY + scale * 0.1],
    [bookX + bookW * 0.28, bookY],
  ], scale * 0.12, rng, { color: skin, alpha: 0.42, layers: 3 })

  // La tête, penchée vers le livre : décalée vers le bas et son côté
  // plutôt que centrée sur les épaules — c'est cette inclinaison qui dit
  // « absorbé dans sa lecture », pas seulement « debout ».
  const headR = scale * 0.26
  const headX = cx + side * scale * 0.05
  const headY = shoulderY - headR * 0.55
  wash(ctx, polygon(headX, headY, headR, headR * 1.05, 12, 0, rng), rng, {
    color: skin,
    layers: 16,
    alpha: 0.4 / 16,
    spread: 0.05,
    jitter: 0.06,
  })

  // Les cheveux : une masse courte, sans couettes — c'est la silhouette
  // (épaules larges, vêtement long) qui dit « adulte », pas la coiffure.
  wash(ctx, [
    [headX - headR * 1.0, headY + headR * 0.2],
    [headX - headR * 0.7, headY - headR * 0.85],
    [headX, headY - headR * 1.05],
    [headX + headR * 0.7, headY - headR * 0.85],
    [headX + headR * 1.0, headY + headR * 0.2],
    [headX, headY - headR * 0.25],
  ], rng, { color: hair, layers: 14, alpha: 0.45 / 14, spread: 0.06, jitter: 0.08 })

  // Une petite touche d'accent au col, même rôle que sur `girlWriting` :
  // sans elle, une chevelure et un vêtement de teinte proche fusionnent.
  dryStroke(ctx, [
    [headX - shoulderW * 0.28, headY + headR * 1.3],
    [headX + shoulderW * 0.28, headY + headR * 1.25],
  ], scale * 0.03, rng, { color: accent, alpha: 0.3, layers: 2 })
}

export interface KnightOptions {
  /** La robe du cheval, et la masse principale de la silhouette. */
  horse: string
  /** L'armure du cavalier — plus froide que le cheval, sinon les deux fusionnent. */
  armour: string
  /** Le fanion de la lance : la seule tache franchement colorée. */
  pennon: string
  accent: string
  distance?: number
  /** Sens de la marche : -1 vers la gauche, 1 vers la droite. */
  facing?: -1 | 1
}

/**
 * Un chevalier à cheval, de profil.
 *
 * Trois formes décident de tout, et il n'en faut pas une quatrième :
 *
 * 1. **La ligne de dos du cheval** — longue, presque horizontale, remontant
 *    à l'encolure. C'est elle qui dit « cheval » avant les pattes.
 * 2. **Le cavalier assis droit**, une masse compacte posée haut sur cette
 *    ligne. Un cavalier penché ou couché se lit comme un bagage.
 * 3. **La lance en oblique**, et son fanion. C'est le seul élément qui dise
 *    « chevalier » plutôt que « cavalier », et il est bon marché : deux
 *    traits. Sans lui, la silhouette pourrait être n'importe quel cavalier
 *    de n'importe quel siècle.
 *
 * Aucun visage, aucune main, aucun harnais : à cette échelle ils ne
 * produiraient que du bruit, et le risque d'un visage raté est le plus
 * élevé du moteur (voir l'en-tête de ce fichier). `height` est la hauteur
 * au garrot, du sol au dos.
 */
export function knightOnHorse(
  ctx: CanvasRenderingContext2D,
  x: number,
  yGround: number,
  height: number,
  rng: () => number,
  plan: LightPlan,
  options: KnightOptions,
): void {
  const { horse, armour, pennon, accent, distance = 0, facing = -1 } = options
  const f = facing
  const att = 1 - distance * 0.6
  const H = height
  const yDos = yGround - H

  // L'ombre au sol d'abord, sous le ventre : posée après, elle se
  // superposerait aux jambes et les épaissirait.
  wash(ctx, polygon(x, yGround + H * 0.02, H * 0.6, H * 0.07, 9, 0, rng), rng, {
    color: plan.cool,
    layers: 8,
    alpha: (0.34 * att) / 8,
    spread: 0.14,
    jitter: 0.2,
  })

  // Les quatre jambes AVANT le corps : un membre peint par-dessus le
  // tronc laisse voir sa jointure en `multiply`, alors que sous le tronc
  // il en sort proprement.
  // Quatre jambes fines et COUDÉES : un membre droit d'un bout à l'autre
  // donne un pied de table. C'est l'angle du genou (ou du jarret) à mi-
  // hauteur, et l'écart entre la paire avant et la paire arrière, qui font
  // qu'un cheval marche au lieu d'être posé.
  for (const [px, coude, pied] of [
    [0.36, 0.42, 0.5],
    [0.26, 0.3, 0.36],
    [-0.3, -0.36, -0.42],
    [-0.4, -0.48, -0.58],
  ] as Array<[number, number, number]>) {
    dryStroke(ctx, [
      [x + f * H * px, yDos + H * 0.26],
      [x + f * H * coude, yDos + H * 0.62],
      [x + f * H * pied, yGround - H * 0.01],
      // Le tracé descend SOUS le sol : `dryStroke` effile ses deux bouts,
      // donc une jambe qui s'arrête pile sur la ligne de sol se termine en
      // pointe d'aiguille au lieu d'un sabot.
      [x + f * H * pied, yGround + H * 0.04],
    ], H * 0.09 * att, rng, { color: horse, alpha: 0.4 * att, layers: 2, jitter: 0.09 })
  }

  // Le corps, l'encolure et la tête en UNE SEULE silhouette fermée.
  //
  // Ce qui sépare un cheval d'un lama, à 30 px de haut, tient à UNE
  // proportion : la tête. Longue (0,4 fois la hauteur au garrot, soit
  // deux fois plus longue que haute) et nettement détachée de l'encolure,
  // le chanfrein filant vers l'avant et vers le bas. Deux essais l'ont
  // rendue courte et ronde, posée au sommet d'une encolure épaisse : les
  // deux ont donné un camélidé. Aucun réglage de couleur ne rattrape ça.
  //
  // C'est la leçon la plus chère de cette figure : assemblés en morceaux
  // (un tronc, un trait d'encolure, une boule de tête), les trois sortaient
  // en table à pattes surmontée d'un ballon. Un animal se reconnaît à son
  // contour continu — le passage du garrot à l'encolure, la courbe de la
  // croupe — et aucun de ces passages n'existe si chaque partie est peinte
  // séparément.
  //
  // Les proportions ne s'inventent pas non plus : corps aussi long que le
  // garrot est haut, ventre à mi-hauteur, encolure oblique à 45°, tête
  // ALLONGÉE et non ronde. Une tête ronde donne un poney de manège ; c'est
  // le chanfrein long qui fait le cheval.
  const cheval: Point[] = ([
    // poitrail et ventre
    [0.44, 0.3], [0.4, 0.4], [0.18, 0.46], [-0.06, 0.47], [-0.26, 0.44],
    // arrière-main, la masse la plus lourde de l'animal
    [-0.46, 0.38], [-0.6, 0.26], [-0.64, 0.1], [-0.56, -0.02], [-0.4, -0.05],
    // dos, creusé au rein puis relevé au garrot
    [-0.1, 0.01], [0.16, -0.02], [0.3, -0.06],
    // encolure et chanfrein
    [0.44, -0.22], [0.58, -0.38], [0.72, -0.44], [0.9, -0.34], [0.98, -0.24],
    // ganache, gorge, retour au poitrail
    [0.86, -0.18], [0.7, -0.2], [0.6, -0.1], [0.52, 0.06], [0.5, 0.18],
  ] as Array<[number, number]>).map(([dx, dy]) => [x + f * H * dx, yDos + H * dy] as Point)
  wash(ctx, cheval, rng, {
    color: horse,
    layers: 24,
    alpha: (1.1 * att) / 24,
    spread: 0.025,
    jitter: 0.06,
  })

  // La queue : elle part de la croupe et tombe — elle ferme la silhouette
  // à l'arrière, là où le corps s'arrêterait net.
  dryStroke(ctx, [
    [x - f * H * 0.6, yDos + H * 0.04],
    [x - f * H * 0.7, yDos + H * 0.26],
    [x - f * H * 0.72, yDos + H * 0.46],
  ], H * 0.1 * att, rng, { color: horse, alpha: 0.6 * att, layers: 2, jitter: 0.14 })

  // Le cavalier : un tronc compact assis droit, et un heaume rond. En
  // teinte d'armure, plus froide que la robe — deux masses de même valeur
  // l'une sur l'autre ne font qu'une seule tache.
  const yEpaules = yDos - H * 0.56
  wash(ctx, [
    [x - f * H * 0.15, yDos + H * 0.06],
    [x - f * H * 0.11, yEpaules],
    [x + f * H * 0.13, yEpaules],
    [x + f * H * 0.17, yDos + H * 0.06],
  ], rng, { color: armour, layers: 18, alpha: (1.3 * att) / 18, spread: 0.05, jitter: 0.09 })
  wash(ctx, polygon(x + f * H * 0.02, yEpaules - H * 0.15, H * 0.14, H * 0.15, 10, 0, rng), rng, {
    color: armour,
    layers: 14,
    alpha: (1.35 * att) / 14,
    spread: 0.05,
    jitter: 0.08,
  })
  // La jambe du cavalier, le long du flanc : sans elle, le tronc a l'air
  // posé sur le dos plutôt qu'à califourchon.
  dryStroke(ctx, [
    [x + f * H * 0.06, yDos + H * 0.02],
    [x + f * H * 0.18, yDos + H * 0.26],
  ], H * 0.09 * att, rng, { color: armour, alpha: 0.62 * att, layers: 2 })

  // La lance : l'oblique franche qui dit « chevalier » plutôt que
  // « cavalier ». C'est le seul trait vraiment long de la figure, donc
  // celui qu'on lit en premier — et le seul endroit où l'on s'autorise
  // une couleur vive, sur le fanion.
  const bas: Point = [x - f * H * 0.42, yDos + H * 0.16]
  const haut: Point = [x + f * H * 0.5, yDos - H * 1.15]
  dryStroke(ctx, [bas, haut], Math.max(0.6, H * 0.05 * att), rng, {
    color: accent,
    alpha: 0.62 * att,
    layers: 2,
    jitter: 0.03,
  })
  wash(ctx, [
    [haut[0], haut[1] + H * 0.05],
    [haut[0] - f * H * 0.34, haut[1] + H * 0.16],
    [haut[0] - f * H * 0.22, haut[1] + H * 0.22],
    [haut[0] - f * H * 0.02, haut[1] + H * 0.24],
  ], rng, { color: pennon, layers: 12, alpha: (0.72 * att) / 12, spread: 0.08, jitter: 0.13 })
}
