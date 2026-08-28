import type { Point } from './engine'
import { dryStroke, polygon, wash } from './engine'
import { litFromLeft } from './light'
import type { LightPlan } from './light'

/**
 * Le trait d'encre : une ligne fine posée PAR-DESSUS le lavis, repassée deux
 * fois à des épaisseurs et des opacités différentes (règle « Traits » de la
 * skill `aquarelle` : deux traits superposés, jamais une ligne unique).
 *
 * C'est ce qui manquait entièrement à ces figures. Elles n'étaient que des
 * masses de lavis, alors qu'une aquarelle illustrée est un lavis **plus** un
 * dessin. Sans ligne, une silhouette reste une tache — c'est exactement le
 * reproche fait au rendu : « des capsules arrondies ».
 */
function trait(
  ctx: CanvasRenderingContext2D,
  points: Point[],
  largeur: number,
  rng: () => number,
  color: string,
  alpha = 0.4,
): void {
  dryStroke(ctx, points, largeur, rng, { color, alpha, layers: 2 })
  dryStroke(ctx, points, largeur * 0.5, rng, { color, alpha: alpha * 0.7, layers: 1 })
}

/**
 * Décale une polyligne perpendiculairement à elle-même.
 *
 * Sert à dessiner les DEUX bords d'une manche à partir de son axe. Sans ça,
 * un bras se peint en aplat de couleur de peau par-dessus le vêtement — et
 * comme tout se compose en `multiply`, un ton chair clair posé sur un violet
 * saturé ne le modifie presque pas : le bras devient invisible. C'était la
 * cause exacte des « adultes sans bras ». Un bord tracé, lui, se voit sur
 * n'importe quel fond.
 */
function decale(points: Point[], d: number): Point[] {
  return points.map((p, i) => {
    const a = points[Math.max(0, i - 1)]
    const b = points[Math.min(points.length - 1, i + 1)]
    const dx = b[0] - a[0]
    const dy = b[1] - a[1]
    const len = Math.hypot(dx, dy) || 1
    return [p[0] - (dy / len) * d, p[1] + (dx / len) * d] as Point
  })
}

/** Un membre dessiné : sa masse, puis ses deux bords tracés. */
function membre(
  ctx: CanvasRenderingContext2D,
  axe: Point[],
  rayon: number,
  rng: () => number,
  remplissage: string,
  encre: string,
): void {
  dryStroke(ctx, axe, rayon * 2, rng, { color: remplissage, alpha: 0.34, layers: 2 })
  trait(ctx, decale(axe, rayon), rayon * 0.42, rng, encre, 0.38)
  trait(ctx, decale(axe, -rayon), rayon * 0.42, rng, encre, 0.38)
}

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
  trait(ctx, [[cx - deskW / 2, yDesk], [cx + deskW / 2, yDesk]], scale * 0.04, rng, accent, 0.34)
  trait(ctx, [
    [cx - deskW / 2, yDesk],
    [cx - deskW / 2, yDesk + deskH],
    [cx + deskW / 2, yDesk + deskH],
    [cx + deskW / 2, yDesk],
  ], scale * 0.022, rng, accent, 0.22)

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

  // Le contour de la robe : la ligne qui fait passer la masse à la
  // silhouette. Sans elle, le torse reste un rectangle de lavis.
  trait(ctx, [
    [cx - torsoW * 0.55, yDesk + scale * 0.15],
    [cx - torsoW * 0.5, shoulderY],
    [cx + torsoW * 0.5, shoulderY],
    [cx + torsoW * 0.55, yDesk + scale * 0.15],
  ], scale * 0.026, rng, accent, 0.3)

  // Les bras : des manches cernées, comme celles des adultes. Peints en
  // couleur de peau par-dessus la robe, ils étaient invisibles — un ton chair
  // clair sur un violet saturé ne le modifie presque pas en `multiply`.
  const handX = bookX + writingSide * bookW * 0.1
  const handY = bookY + bookH * 0.32
  membre(ctx, [
    [cx + writingSide * torsoW * 0.45, shoulderY + scale * 0.12],
    [cx + writingSide * torsoW * 0.74, yDesk - scale * 0.34],
    [handX, handY],
  ], scale * 0.085, rng, dress, accent)
  membre(ctx, [
    [cx - writingSide * torsoW * 0.46, shoulderY + scale * 0.14],
    [cx - writingSide * torsoW * 0.72, yDesk - scale * 0.06],
  ], scale * 0.08, rng, dress, accent)

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
  const visage = polygon(cx, headY, headR, headR * 1.05, 14, 0, rng)
  wash(ctx, visage, rng, {
    color: skin,
    layers: 20,
    alpha: 0.42 / 20,
    spread: 0.05,
    jitter: 0.06,
  })
  // Le chemin se referme sur son premier point : sinon `dryStroke` effile ses
  // deux extrémités et laisse une encoche visible sur le bord du visage.
  trait(ctx, [...visage, visage[0]], scale * 0.02, rng, accent, 0.26)

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

  for (const t of [-0.5, 0.05, 0.55]) {
    trait(ctx, [
      [cx + headR * t * 0.9, headY - headR * 1.0],
      [cx + headR * t * 1.15, headY - headR * 0.35],
    ], scale * 0.013, rng, accent, 0.2)
  }

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

  // Les bras : des MANCHES dessinées, pas des aplats. Trois points — épaule,
  // coude, main — plutôt que deux : un bras qui plie se lit comme un bras, un
  // segment droit fait une barre. Peints dans la couleur du vêtement puis
  // cernés, parce qu'un remplissage couleur peau posé sur un vêtement saturé
  // ne se voit pas en `multiply` (voir `decale`).
  const brasG: Point[] = [
    [cx - shoulderW * 0.46, shoulderY + scale * 0.08],
    [cx - shoulderW * 0.58, shoulderY + scale * 0.34],
    [bookX - bookW * 0.52, bookY + scale * 0.04],
  ]
  const brasD: Point[] = [
    [cx + shoulderW * 0.46, shoulderY + scale * 0.08],
    [cx + shoulderW * 0.58, shoulderY + scale * 0.34],
    [bookX + bookW * 0.52, bookY + scale * 0.04],
  ]
  membre(ctx, brasG, scale * 0.082, rng, clothes, accent)
  membre(ctx, brasD, scale * 0.082, rng, clothes, accent)

  // Les mains : deux petits accents de peau posés SUR le livre. Là, et là
  // seulement, la peau se voit — le papier du livre est clair, un ton chair
  // l'assombrit visiblement, contrairement au vêtement.
  for (const hx of [bookX - bookW * 0.52, bookX + bookW * 0.52]) {
    wash(ctx, polygon(hx, bookY + scale * 0.04, scale * 0.065, scale * 0.055, 7, 0, rng), rng, {
      color: skin,
      layers: 10,
      alpha: 0.5 / 10,
      spread: 0.08,
      jitter: 0.1,
    })
  }

  // Le contour du vêtement : la ligne qui fait passer la masse à la
  // silhouette. Plus un seul pli vertical — une ligne suffit à dire l'étoffe,
  // deux commencent à faire un pyjama rayé.
  trait(ctx, [
    [cx - hipW / 2, yGround],
    [cx - shoulderW / 2, shoulderY],
    [cx + shoulderW / 2, shoulderY],
    [cx + hipW / 2, yGround],
  ], scale * 0.026, rng, accent, 0.3)
  trait(ctx, [
    [cx - scale * 0.05, shoulderY + scale * 0.75],
    [cx - scale * 0.02, yGround - scale * 0.12],
  ], scale * 0.018, rng, accent, 0.18)

  // La tête, penchée vers le livre : décalée vers le bas et de son côté
  // plutôt que centrée sur les épaules — c'est cette inclinaison qui dit
  // « absorbé dans sa lecture », pas seulement « debout ».
  const headR = scale * 0.26
  const headX = cx + side * scale * 0.05
  const headY = shoulderY - headR * 0.55
  const visage = polygon(headX, headY, headR, headR * 1.05, 14, 0, rng)
  wash(ctx, visage, rng, {
    color: skin,
    layers: 16,
    alpha: 0.4 / 16,
    spread: 0.05,
    jitter: 0.06,
  })
  // Le contour du visage : sans lui la tête reste une tache posée sur les
  // épaules. Le chemin se referme sur son premier point, sinon `dryStroke`
  // effile ses deux extrémités et laisse une encoche visible.
  trait(ctx, [...visage, visage[0]], scale * 0.02, rng, accent, 0.26)

  // Les cheveux : une masse courte, puis quelques mèches tracées. C'est la
  // silhouette (épaules larges, vêtement long) qui dit « adulte », pas la
  // coiffure — les mèches ne servent qu'à la finesse du dessin.
  wash(ctx, [
    [headX - headR * 1.0, headY + headR * 0.2],
    [headX - headR * 0.7, headY - headR * 0.85],
    [headX, headY - headR * 1.05],
    [headX + headR * 0.7, headY - headR * 0.85],
    [headX + headR * 1.0, headY + headR * 0.2],
    [headX, headY - headR * 0.25],
  ], rng, { color: hair, layers: 14, alpha: 0.45 / 14, spread: 0.06, jitter: 0.08 })
  for (const t of [-0.55, 0, 0.55]) {
    trait(ctx, [
      [headX + headR * t * 0.95, headY - headR * 0.98],
      [headX + headR * t * 1.2, headY - headR * 0.3],
    ], scale * 0.014, rng, accent, 0.2)
  }

  // Les yeux : deux arcs courts tournés vers le bas, pas deux points ronds.
  // Un adulte absorbé dans sa lecture regarde la page — l'arc dit la paupière
  // baissée, là où deux points diraient un regard vers le joueur.
  const eyeY = headY + headR * 0.2
  for (const ex of [-0.34, 0.32]) {
    trait(ctx, [
      [headX + headR * ex - headR * 0.17, eyeY],
      [headX + headR * ex, eyeY + headR * 0.06],
      [headX + headR * ex + headR * 0.17, eyeY],
    ], scale * 0.016, rng, accent, 0.32)
  }

  // Une petite touche d'accent au col, même rôle que sur `girlWriting` :
  // sans elle, une chevelure et un vêtement de teinte proche fusionnent.
  trait(ctx, [
    [headX - shoulderW * 0.3, headY + headR * 1.32],
    [headX + shoulderW * 0.3, headY + headR * 1.26],
  ], scale * 0.024, rng, accent, 0.3)
}
