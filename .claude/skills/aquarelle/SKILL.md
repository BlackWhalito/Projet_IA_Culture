---
name: aquarelle
description: La langue visuelle aquarelle du projet — palette, filtres SVG, règles de cohérence et hiérarchie. À invoquer avant de dessiner ou de styler quoi que ce soit pour les petites classes (CP), pour que chaque nouvel écran ressemble au précédent sans avoir à le redécouvrir.
---

Direction artistique des **petites classes** (CP). Les grandes classes basculeront en arcade rétro : ne pas appliquer ces règles là-bas.

Objectif : **beau et contemplatif, sans jamais gêner le jeu.** Tout ce qui suit sert cet arbitrage.

> **Tu vas peindre une scène dans un `<canvas>`** (les tableaux de l'accueil, `src/components/watercolor/`) ? Lis d'abord `references/peinture-generative.md`. Il rassemble les pièges qui ont chacun coûté une itération jugée ratée — dont le plus coûteux : ajouter de la matière quand c'est le dessin qui manque. Ce qui suit ici traite du SVG et du CSS, pas du moteur génératif.

## Montage dans l'app

Les filtres et le grain de papier sont déclarés une seule fois, montés à la racine (`src/components/AquarelleAtmosphere.tsx`, appelé dans `App.tsx`) — ne les redéclare jamais dans un écran ou un composant de jeu, référence-les simplement par `filter="url(#aq-bord-1)"` etc. Pour teinter un badge ou un élément avec une couleur dynamique (ex. la couleur du domaine), passe-la en propriété CSS personnalisée via `style` plutôt qu'en valeur figée dans le module CSS :

```tsx
<div className={styles.badge} style={{ '--_domain-color': domain.color } as CSSProperties}>
```

```css
.badge { color: var(--_domain-color, var(--violet)); }
```

## Le principe qui tranche tout

Le décor est peint, **l'interface ne l'est pas.**

L'aquarelle — bords baveux, texture, transparence — appartient au fond, aux illustrations, aux éléments narratifs. Tout ce qu'on peut toucher garde des **bords nets, un contraste élevé et une zone tapable rectangulaire**. Un bouton flou est un bouton qu'on rate. Quand un doute survient entre « joli » et « jouable », jouable gagne.

## Palette

Sur papier, pas sur blanc. Le blanc pur n'existe nulle part.

```css
--papier:        #f7f2e7;   /* fond, crème chaud */
--papier-ombre:  #e8dfe4;   /* creux, séparations — teinté violet, jamais gris neutre */
--encre:         #3f3542;   /* texte, tracés — violacé, jamais #000 */
--encre-pale:    #7d7183;   /* texte secondaire */

/* Famille violette — atmosphère, ombres, profondeur */
--violet-brume:  #c3b0d4;   /* lointain, brume, lavis les plus pâles */
--violet:        #8d6aa8;   /* accent, ombres portées */
--violet-profond:#5d4574;   /* creux, nuit, contrastes */

--histoire:      #c1663f;   /* terre de Sienne */
--geographie:    #5a7fa0;   /* bleu ardoise */
--sciences:      #7a9455;   /* vert olive */
--francais:      #8d6aa8;   /* prune violette */

--juste:         #6f9457;
--faux:          #c0714f;   /* jamais un rouge vif : se tromper enseigne, ça ne sanctionne pas */
```

Règles : **trois couleurs maximum par écran**, fond compris. Une couleur de domaine domine, les autres sont des accents. Les couleurs se superposent en `mix-blend-mode: multiply` — c'est ce qui donne la sensation de pigment, un aplat opaque tue l'effet.

## Le violet porte les ombres

En aquarelle, **une ombre n'est jamais grise : elle est violette.** C'est ce qui fait vibrer une peinture au lieu de la salir. Le violet est donc le liant de toute la palette, pas une couleur parmi d'autres.

- Tout ce qui est **loin** reçoit un lavis `--violet-brume` : c'est la perspective atmosphérique, elle crée la profondeur à elle seule.
- Toute **ombre portée** est un `--violet` ou `--violet-profond` en `multiply`. Jamais un noir transparent, jamais un gris.
- Les **creux d'interface** (séparations, fonds enfoncés, bordures) sont teintés violet, pas gris neutre.
- Superposer violet et vert, ou violet et ocre, donne des gris colorés magnifiques. Un gris fabriqué comme ça vaut infiniment mieux qu'un `#888`.

**Le violet ne compte pas dans la limite de trois couleurs.** C'est un liant, pas une couleur de contenu — au même titre que le papier.

## Les trois filtres

À déclarer une fois dans un `<svg>` caché monté à la racine, puis référencer par `filter="url(#…)"`.

**1. Bord aquarelle** — l'effet principal, celui qui fait tout.

```xml
<filter id="aq-bord" x="-20%" y="-20%" width="140%" height="140%">
  <feTurbulence type="fractalNoise" baseFrequency="0.014" numOctaves="4" seed="7" result="grain"/>
  <feDisplacementMap in="SourceGraphic" in2="grain" scale="14"
                     xChannelSelector="R" yChannelSelector="G"/>
</filter>
```

`scale` règle l'irrégularité : 6 pour une petite forme, 14 pour une grande, au-delà de 20 c'est de la bouillie. **Changer `seed` à chaque forme** — deux formes avec le même seed se déforment à l'identique et l'œil repère la répétition immédiatement.

**2. Grain du papier** — sur le fond de page, une seule fois.

```xml
<filter id="aq-papier">
  <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" result="b"/>
  <feColorMatrix type="saturate" values="0"/>
  <feComponentTransfer><feFuncA type="linear" slope="0.055"/></feComponentTransfer>
</filter>
```

Opacité finale sous **8 %**. Au-delà, l'écran devient sale et le texte perd en lisibilité.

**3. Diffusion humide** — halos, auréoles, lueurs.

```xml
<filter id="aq-diffusion">
  <feGaussianBlur stdDeviation="8"/>
</filter>
```

## Le pigment se dépose en couches

Un aplat plat ne ressemble à rien. **Toute forme peinte se dessine 2 ou 3 fois**, même chemin, `seed` différent, opacité 0.35 à 0.5, en `multiply`. Les recouvrements foncent naturellement, comme un pinceau qui repasse — c'est ce qui crée le grain et les bords riches.

```xml
<g style="mix-blend-mode: multiply">
  <path d="…" fill="var(--sciences)" opacity="0.42" filter="url(#aq-bord)"/>
  <path d="…" fill="var(--sciences)" opacity="0.38" filter="url(#aq-bord-2)"/>
</g>
```

## Traits

Jamais une ligne droite parfaite : le tracé à main levée respire. Utiliser des courbes légèrement irrégulières, et une épaisseur qui varie (`stroke-linecap="round"`, deux traits superposés d'opacité différente). Les angles droits appartiennent à l'interface, pas au dessin.

## Typographie

Une serif douce pour les titres et le contenu narratif, une sans-serif très lisible pour l'interface et les boutons. **Le texte de jeu ne se pose jamais sur une zone peinte chargée** : soit sur le papier nu, soit sur un lavis très pâle (opacité ≤ 0.15).

Taille minimale 17px pour tout texte de jeu. On conçoit pour un adulte, mais le confort de lecture reste une contrainte : l'app se joue au téléphone, souvent en extérieur.

## Mouvement

Contemplatif veut dire **lent et rare**, pas immobile.

- Le décor peut respirer très lentement (8 à 20 s par cycle), en opacité ou en translation de quelques pixels. Jamais en couleur.
- **Rien ne bouge dans le décor pendant que le joueur agit.** Le mouvement d'ambiance se fige au premier tap et reprend après le feedback.
- Le retour au tap est immédiat (< 100 ms) et net : c'est de l'interface, il échappe aux règles douces.
- Respecter `prefers-reduced-motion` : tout le mouvement d'ambiance disparaît.

## Une œuvre en fond d'écran de jeu

Un niveau peut recevoir une **œuvre** en fond de ses jeux (`src/screens/GameSessionScreen/backdrops/`). La règle de choix : ce n'est pas une seconde illustration du niveau, c'est quelque chose que son époque ou son sujet a réellement produit — Lascaux derrière les jeux de la Préhistoire. C'est ce qui lui donne quelque chose à transmettre sans demander qu'on la lise.

Trois réglages la rendent inoffensive, et il faut les trois :

- **`opacity` sous 0,22.** Le texte de jeu ne se pose que sur du papier nu ou sur un lavis très pâle — la règle ci-dessus vaut aussi pour un décor peint.
- **Un masque radial qui la creuse en son centre**, là où passe la colonne de contenu. Elle n'est pleinement visible que sur les marges — c'est bien ce qu'on veut d'un décor : qu'on le voie sans jamais le regarder.
- **`position: fixed` et `pointer-events: none`.** Un décor qui défile avec le contenu attire l'œil à chaque scroll ; un décor qui intercepte les taps est un bug.

## Coût de rendu

`feTurbulence` est cher. Sur mobile, il fait chuter le framerate s'il est recalculé en continu.

- **Jamais de filtre SVG sur un élément animé ou qui se déplace.** Peindre une fois, animer le résultat en `transform`/`opacity`.
- Plafond indicatif : une douzaine de formes filtrées par écran.
- Pour un décor fixe et complexe, envisager de le rendre une fois et de le réutiliser plutôt que de le recalculer à chaque montage.

## Checklist avant de valider un écran

- [ ] Fond papier, aucun blanc pur
- [ ] Trois couleurs maximum
- [ ] Chaque forme peinte a 2-3 couches et un `seed` distinct
- [ ] Aucun élément interactif n'est flou, ni sous 44px
- [ ] Le décor s'arrête de bouger dès qu'on joue
- [ ] Aucun filtre sur un élément animé
- [ ] Lisible sur fond clair comme en plein soleil (contraste du texte ≥ 4.5:1)
