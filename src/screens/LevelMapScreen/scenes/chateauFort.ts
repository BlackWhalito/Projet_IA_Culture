import type { PaintScene } from '../../../components/watercolor/WatercolorScene'
import { dryStroke, wash } from '../../../components/watercolor/engine'
import {
  arcade,
  banner,
  battlement,
  facade,
  roundTower,
} from '../../../components/watercolor/architecture'
import { cloud, gradedWash, reflection, ripples, vignette } from '../../../components/watercolor/atmosphere'
import { knightOnHorse } from '../../../components/watercolor/figure'
import { roche } from '../../../components/watercolor/terrain'
import {
  BLEU,
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
  // Le vignetage referme les angles du ciel autour de la lueur basse :
  // c'est lui qui concentre le contre-jour derrière la forteresse au lieu
  // de l'étaler sur toute la largeur.
  vignette(ctx, -w * 0.05, 0, w * 1.05, yCrete + h * 0.02, {
    cx: w * 0.34,
    cy: yCrete * 0.94,
    color: VIOLET_PROFOND,
    alpha: 0.34,
    creux: 0.2,
  })

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
