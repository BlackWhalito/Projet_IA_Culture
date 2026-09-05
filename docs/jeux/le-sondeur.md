# Le Sondeur

Dossier de conception — septembre 2026.
Créneau visé : **`cp-geographie-oceans-mers`** (aujourd'hui occupé par le vrai/faux).

> **Statut : conçu, pas construit.** Ce dossier est le premier rendu par
> l'agent `game-designer` sous son brief réécrit. Rien n'en est codé.
>
> **Vérifications faites par la session principale**, et non reprises de
> l'agent sur parole : la Meteorbank relevée le 18 octobre 1925 à 560 m ✓ ;
> le *Meteor* premier navire à employer le sondage par écho à des fins
> scientifiques ✓ ; l'or de l'eau de mer de Fritz Haber pour payer les
> réparations, concentration surestimée, projet arrêté par lui en 1927 ✓ ;
> Marie Tharp identifiant le rift en 1952 et Heezen le rejetant comme « girl
> talk » ✓.
>
> **Deux réserves à lever avant de coder :** les sources divergent sur le fond
> entourant la Meteorbank (3 000 m selon GEOMAR, 4 000 m ailleurs) et sur son
> sommet (560 m ou 590 m selon le journal du capitaine Spieß) — le contenu
> ci-dessous retient 4 000 / 560. Et la première campagne en mer de Marie Tharp
> en 1965 n'a pas été reconfirmée directement.

---

## 1. Le placement

**Geste** : *régler un curseur jusqu'au point juste* (acte 1), puis *tracer au
doigt* (acte 2) — les deux figurent dans la liste des gestes que le projet
n'utilise nulle part. **Sens** : **l'oreille d'abord**, la main ensuite ; c'est
le premier jeu du catalogue où l'œil ne suffit pas, et où le joueur **produit**
le son qui porte l'énigme. **Tempo** : scène (90 à 140 s par transect).
**Famille** : mesure et estimation, puis arbitrage.

En quoi le geste diffère des onze existantes :

| Existante | Son geste | Ce que Le Sondeur fait à la place |
|---|---|---|
| `qcm` | taper un choix | rien à choisir : pas de propositions, une valeur continue à trouver |
| `chaine` | balayer gauche/droite | on ne juge pas une phrase, on mesure une durée |
| `riviere` | taper une cible qui descend | ici l'objet qui descend est **invisible** (il est sous l'eau) et se suit à l'oreille |
| `capsur` | taper un point sur une carte | on ne lit pas une carte : **on la fabrique** |
| `timeline` | taper une fente | pas de fentes, un axe continu au mètre près |
| `fildesjours` | taper un choix | l'arbitrage existe (acte 2) mais il se joue au doigt |
| `ponctuation` | taper une fente, cycler | pas de signes discrets à poser |
| `vers` | poser/retirer des tuiles | rien à assembler |
| `telegramme` | barrer des mots | rien à retrancher |
| `flatterie` | taper une réplique | pas de dialogue |
| `arebours` | poser des tuiles dans un ordre | pas de liste, pas d'ordre |

Aucune des onze n'utilise le son comme information. Aucune ne demande un
ajustement continu. Aucune ne fait dessiner le joueur.

---

## 2. Nom et fiction

**Le Sondeur.** Sous-titre à l'écran : *Meteor — Atlantique Sud — 1925*.

Le joueur croit être l'homme au casque, dans le poste de sonde du navire
allemand *Meteor*. Il frappe un coup dans la mer, il attend, il écoute revenir
l'écho, et il note la profondeur. Six fois, le long d'une ligne. Puis il pose le
casque, prend la plume, et **dessine le fond que personne n'a jamais vu** — en
sachant qu'entre deux sondages il n'y a rien, et que ce qu'il trace là, il
l'invente.

---

## 3. Née de quoi

De la notion **`cp-geographie-oceans-mers`**, et d'un fait qui n'est dans aucun
de ses jeux actuels : **la mer est noire, et le son est le seul de nos sens qui
descende jusqu'au fond.** Le relief sous-marin n'a pas été vu, il a été
*entendu* ; il l'a été de notre vivant, ou presque ; et le premier navire à le
faire pour la science est le *Meteor*, en 1925.

La mécanique tombe de là et de nulle part ailleurs : dans un milieu opaque, une
**durée est une distance**. C'est pour cette raison que l'axe vertical de
l'écran est à la fois une profondeur en mètres et un délai en secondes — les
deux sont la même chose, et c'est toute la leçon.

**Test de creusité, passé honnêtement.** Remplacez le contenu par des rimes, des
saisons, des rois : le jeu s'effondre immédiatement, parce que le geste
(chercher l'instant où deux sons se confondent) n'a de sens que si la grandeur
cherchée est convertible en temps. Le seul transfert qui tienne est celui d'un
autre phénomène de propagation : la distance de l'orage par le tonnerre,
l'écholocation d'une chauve-souris (§14). Trois sujets possibles au lieu de
quarante — c'est le contraire d'un moule, et c'est assumé : ce jeu coûte cher
parce qu'il ne resservira pas partout.

Et l'acte 2 n'est transposable nulle part non plus : **on ne trace pas un profil
de fond marin comme on trace autre chose**, parce que la question posée est
propre à la cartographie sous-marine — que dessine-t-on entre deux mesures
espacées de quarante kilomètres ?

---

## 4. Ce que ça enseigne

1. **La profondeur est un délai.** 1 500 m/s dans l'eau de mer, aller-retour :
   4 000 m de fond, c'est 5,3 secondes de silence. Le joueur n'apprend pas cette
   formule, il la *subit* — les stations profondes durent longtemps, les
   stations peu profondes lui reviennent en pleine figure.
2. **Le fond de l'océan est un paysage**, avec des sommets de trois mille
   mètres, des plaines et des vallées — et non le « fond plat » que la plupart
   des adultes se représentent.
3. **Le fond n'est pas le seul à répondre.** Une couche de petites bêtes vers
   400 m renvoie l'écho et se fait passer pour le sol ; un fond dur répond deux
   fois, la seconde à profondeur double. Deux erreurs d'opérateur réelles.
4. **Une carte est une décision.** Entre deux sondages, le cartographe dessine
   ce qu'il croit. Un point aberrant est un fait tant qu'on ne l'a pas réfuté.

**Pourquoi mieux qu'un QCM sur la même notion.** Le QCM actuel demande
« Comment est l'eau de la mer ? — Salée / Sucrée / Gazeuse ». Même un bon QCM
(« à quelle vitesse le son voyage-t-il dans l'eau ? ») ferait reconnaître un
chiffre. Ici on n'apprend pas que le son va vite : **on attend qu'il revienne**,
et cinq secondes d'attente pour quatre kilomètres enseignent l'ordre de grandeur
mieux que n'importe quelle phrase. Quant au point aberrant, aucun questionnaire
ne peut faire vivre l'envie de l'effacer — il faut l'avoir eu sous la plume.

**La phrase du soir :** « On a mesuré le fond de l'océan à l'oreille. On tapait
un coup dans l'eau et on écoutait revenir l'écho : le silence entre les deux,
c'était la profondeur. Et le 18 octobre 1925, un bateau allemand est passé
au-dessus d'un sommet de trois mille quatre cents mètres de haut dont personne
ne soupçonnait l'existence, en plein Atlantique. »

---

## 5. Le déroulé, seconde par seconde

### Écran (mobile portrait, une seule page, pas de défilement)

- **Bandeau (0–12 %)** : ligne de flottaison ; silhouette du *Meteor* de profil ;
  à droite un **galvanomètre** (cadran, aiguille) ; à gauche les **lampes de
  ping** restantes (4 pastilles) ; au centre `Station 3 / 6`.
- **Colonne d'eau (12–76 %)** : lavis dégradé du bleu-vert au noir d'encre.
  Graduée à gauche, un trait tous les 500 m, un chiffre tous les 1 000 m,
  échelle 0 → `echelleMetres`. **En dessous de 900 m il n'y a plus rien à
  voir** : le noir est plein, et le fond n'y est jamais dessiné.
- **La ligne d'écoute** : une horizontale pointillée blanche traversant la
  colonne, poignée circulaire de 48 px calée à droite. Un cartouche affiche la
  profondeur courante (`3 480 m`).
- **Feuille de profil (76–92 %)** : papier ivoire quadrillé, abscisse en milles
  marins. Les stations marquées y sont des points d'encre, non reliés. Un trait
  vertical fin marque la station en cours.
- **Barre (92–100 %)** : bouton **SONDER** (56 px, à gauche), bouton **MARQUER**
  (56 px, à droite, éteint tant qu'aucun ping n'a été tiré).

### Acte 1 — mesurer (6 stations)

- **t = 0** : l'ordre du transect s'affiche sur la colonne, deux lignes, fond
  voilé. Un tap le chasse. Rien n'est chronométré tant qu'on n'a pas sondé — le
  joueur a tout le temps de lire, comme dans *À rebours*.
- **Le joueur appuie sur SONDER.** Le ping part (§7). Une lampe s'éteint. Un
  **anneau blanc** naît sous la coque et descend à vitesse constante, calibrée
  pour que l'écran soit à la fois une échelle de profondeurs et une échelle de
  temps : à 1 500 m/s, l'anneau met 2,67 s pour atteindre le trait des 4 000 m.
- **L'anneau croise la ligne d'écoute** → **tic** du joueur, la ligne blanchit.
  C'est *sa* marque, à *sa* profondeur.
- **L'anneau s'efface** en entrant dans le noir, vers 900 m. À partir de là,
  plus rien à l'écran. **On écoute.**
- **L'écho revient** à `2 × fond / 1500` secondes. L'aiguille du galvanomètre
  bat d'un cran, la coque tremble d'un pixel. Aucun indice de profondeur : seul
  l'**instant** est visible.
- **Le joueur glisse la ligne** et re-sonde. Trois cas à l'oreille :
  - tic et écho nettement séparés → on est loin, et **l'ordre donne le sens** :
    tic avant l'écho = ligne trop haute ; tic après = trop basse ;
  - **flam** (deux frappes très proches, 40 à 300 ms) → à moins de 225 m ; le
    sens s'entend encore ;
  - **fusion** (moins de 40 ms, soit 30 m) → un seul son, plus plein ; la ligne
    passe en ambre et cesse d'être pointillée.
- **Réglage fin** : tant que le doigt tient la poignée, l'éloigner
  horizontalement de plus de 80 px divise la sensibilité par dix (1 px = 1 m au
  lieu de 10 m) et fait apparaître une loupe des graduations. Geste standard des
  curseurs mobiles ; ici il est indispensable, la fusion se jouant à 30 m et un
  doigt ne valant pas mieux que 3 px.
- **MARQUER** plante le point sur la feuille, à la profondeur affichée — juste
  ou fausse. Le navire avance : la coque translate, le trait de station glisse,
  les lampes se rallument. Station suivante.
- **Si les lampes s'épuisent** sans marquage, la station reste vide : un `?`
  s'inscrit sur la feuille. Ce n'est pas une punition, c'est **un trou dans les
  données** — et l'acte 2 va demander ce qu'on met dedans.

Durée mesurée sur le papier : 4 stations profondes à ~2,2 pings de 6,5 s
+ 2 stations rapides ≈ **90 à 140 s**.

### Acte 2 — dessiner (une seule fois)

- La colonne d'eau se retire vers le haut en 600 ms ; la feuille monte et occupe
  tout l'écran, points d'encre en place, `?` compris.
- Bandeau : *« Le Bureau attend une ligne, pas des points. »*
- **Le joueur trace au doigt**, de la marge gauche à la marge droite, en une
  passe. Le trait est lissé par `courbeOuverte` (déjà dans le projet). Bouton
  **GOMME** : efface tout, autant de fois qu'on veut.
- **Aucun chrono ici**, et c'est délibéré : toute la tension est dans l'acte 1 ;
  l'acte 2 est l'arbitrage, et un arbitrage pressé n'est plus un arbitrage.
- **ENVOYER AU BUREAU** : le papier s'incline de 2°, un tampon tombe.
- **Le profil réel se dessine par-dessus**, de gauche à droite, à la plume, en
  sanguine, en 1,5 s. Les écarts se remplissent en hachures fines.
- Verdict : `Écart moyen : 210 m` — un chiffre qu'on veut battre.
- Puis les textes : la station notable, l'anomalie (honorée ou lissée), la
  révélation.

---

## 6. La boucle de 200 ms

| Geste | Ce qui se passe dans les 200 ms |
|---|---|
| **Appui sur SONDER** | Le bouton s'enfonce de 2 px (60 ms) ; le ping sonne à l'instant du contact, pas au relâchement ; une lampe s'éteint avec un déclic sec ; l'anneau apparaît sous la coque, opacité 0 → 1 en 90 ms ; la colonne d'eau s'éclaircit de 6 % pendant 150 ms — la mer *encaisse* le coup. |
| **Doigt posé sur la poignée** | Poignée ×1,25 en 90 ms, la ligne pointillée s'épaissit de 1 à 2 px, le cartouche passe du gris au noir, son `tap`, et un vignettage de 8 % assombrit les bords. |
| **Glissement** | La ligne suit sans latence (`transform`, aucun recalcul de mise en page). Le cartouche recompte au pas de 10 m. **Chaque graduation de 500 m franchie déclenche un micro-tic** (12 ms, gain 0,04) : la main sent l'échelle défiler, comme un cran de molette. |
| **Passage en réglage fin** | Sous 120 ms : le trait s'affine, la loupe glisse depuis le bord gauche, un souffle très court (`apparition`), le pas du cartouche passe à 1 m. Le changement doit se voir sans être lu. |
| **L'anneau croise la ligne** | Tic + la ligne blanchit à 100 % puis retombe à 60 % en 80 ms + un tremblement vertical de 2 px amorti. On voit le son passer sur sa propre marque. |
| **L'écho revient** | Aiguille : +18° en 40 ms, retour amorti en 260 ms. Coque : 1 px. Rien d'autre — c'est l'oreille qui travaille. |
| **Fusion atteinte** | La ligne cesse d'être pointillée et vire à l'ambre en 120 ms ; un halo de 6 px se dilate de part et d'autre en 180 ms ; MARQUER s'allume d'un liseré ambré qui pulse lentement. Le joueur sait qu'il y est **avant d'avoir lu quoi que ce soit**. |
| **MARQUER** | Le point tombe sur la feuille avec un son de goutte (`depot`) ; une fine verticale relie la ligne d'écoute au point pendant 200 ms puis s'efface. |
| **Dernière lampe** | Elle clignote deux fois (2 × 120 ms) avant de s'éteindre : l'avertissement se voit du coin de l'œil. |
| **Tracé au doigt** | L'encre naît sous le doigt (3 px) avec une traînée de 6 px qui sèche en 400 ms. **Quand le trait passe à moins de 20 px d'un point marqué, le point s'aimante et cliquette.** Passer à côté d'un point ne fait aucun bruit — et c'est ce silence-là qui rend palpable la décision d'ignorer l'anomalie. |
| **ENVOYER** | Inclinaison de 2° en 120 ms, tampon (son `depot` grave), puis la plume part. |

---

## 7. Le son

C'est la section la plus longue du dossier, parce que **le son est l'énigme** et
que **le joueur le produit**. Tout tient dans ce que `sound.ts` sait déjà faire :
oscillateurs, fréquence, glissando, délai, durée, gain, réverbération. Aucun
fichier audio, aucune reconnaissance de timbre réel.

### Les cinq voix

| Voix | Paramètres | Rôle |
|---|---|---|
| **Ping** (émis par le joueur) | deux notes simultanées, sine 110 Hz et sine 165 Hz (une quinte), durée 0,10 s, gain 0,22, reverb 0,15 | Le coup dans l'eau. Plus grave que tout le reste du jeu : il ne se confond avec rien. |
| **Tic** (la ligne d'écoute) | triangle 1046 Hz, durée 0,035 s, gain 0,14, reverb 0,05 | Sec, très aigu, sans réverbération : c'est un repère, pas un lieu. Il ne masque pas l'écho. |
| **Écho du fond** | sine 330 Hz → glissando 300 Hz, durée 0,12 s, gain `0,20 × (1 − fond/8000)`, **reverb 0,55** | L'atténuation avec la profondeur est physiquement juste. La réverbération le place *dans un lieu*, là où le tic est *sur la vitre*. |
| **Écho de couche** (faux fond) | sine 300 Hz, **sans glissando**, durée 0,20 s, gain `0,45 ×` celui du fond, reverb 0,6 | Plus long, plus mou, sans attaque nette : une couche diffuse ne renvoie pas de front. |
| **Double écho** | identique à l'écho du fond, gain × 0,30, à `2 ×` le délai | Le fond dur qui répond une seconde fois. Toujours plus faible que le premier — c'est ce qui rend le piège loyal. |

### Le signal « je tombe juste »

- **|Δt| > 300 ms** — deux événements franchement séparés. On entend l'**ordre**,
  donc le **signe de l'erreur** : tic *avant* écho = ligne trop haute ; tic
  *après* = trop basse. (Le seuil de perception de l'ordre temporel est de 20 à
  30 ms : à 300 ms, personne ne s'y trompe.)
- **40 ms < |Δt| < 300 ms** — un **flam** : deux frappes si proches qu'on les
  entend comme une seule frappe « épaisse », dont on perçoit encore le sens. La
  ligne passe en blanc franc. Traduction : « à moins de 225 m ».
- **|Δt| < 40 ms** — **fusion**. On ne joue pas deux sons : on en joue **un
  seul**, l'écho au gain +40 %, plus une note très brève à 1568 Hz posée dessus.
  Les deux coups n'en font plus qu'un et le son s'ouvre. C'est un accordage
  d'instrument : on cherche le point où deux sons cessent d'être deux.

### Ce qu'on entend d'une station, en clair

Station 1 du transect A (fond 4 020 m), ligne posée par réflexe à 1 500 m :

> **BOUM** *(le ping)* … *tic* (à 1,0 s) …………………… *toc* (à 5,36 s)

Le joueur entend un gouffre de quatre secondes entre sa marque et la réponse. Il
descend la ligne. Deuxième ping :

> **BOUM** ………………… *tic* (à 5,0 s) … *toc* (à 5,36 s) → **flam**

Troisième ping, en réglage fin :

> **BOUM** ………………………… **TOC** *(un seul)* → fusion, 4 020 m.

Station 4 du même transect (le sommet, 560 m), le joueur ayant gardé sa ligne à
4 000 m :

> **BOUM** … *toc* (à 0,75 s) ! ………………… *tic* (à 2,67 s)

L'écho arrive **avant** sa marque, et bien avant qu'il ne s'y attende. C'est un
sursaut, et c'est le moment le plus mémorable de la manche : **l'anomalie est
d'abord une surprise auditive**, pas une valeur bizarre dans un tableau.

### Accessibilité — dit franchement

Le galvanomètre bat à chaque écho, parasites compris, sans jamais indiquer de
profondeur. Un joueur sans son peut donc jouer **à l'œil**, en comparant le
battement de l'aiguille au flash de sa ligne. C'est plus difficile et beaucoup
moins beau, mais le jeu n'est pas fermé. Ce repli est assumé et doit être
implémenté dès la première version.

---

## 8. Le dessin et les figures

Les **trois** usages du dessin sont employés, ce qui est rare et justifie une
partie du coût :

- **Tracé au doigt** : le profil de l'acte 2, comparé au profil réel.
- **Objets manipulés** : la ligne d'écoute, la poignée, la loupe, l'aiguille.
- **Dessin qui se révèle** : le profil réel qui se peint à la plume par-dessus le
  tracé du joueur — c'est la récompense de fin, et elle donne envie de finir une
  manche même déjà jouée.

**Palette** (aquarelle, conforme à la DA du CP) : bleu de Prusse très dilué en
haut de colonne, viré au noir d'encre en bas ; papier ivoire pour la feuille ;
**sanguine** (terre de Sienne brûlée) pour le profil réel ; **ambre** pour la
fusion ; blanc cassé pour l'anneau et la ligne.

**Les figures** — deux, propres à ce jeu, en formes composables, sans visage :

- **Le sondeur**, de dos, en bas à gauche de la colonne, 60 px : une masse sombre
  en trapèze (les épaules), une tête ronde, un casque (deux disques et un
  arceau), un bras qui rejoint la table. Trois poses : *à l'écoute* (immobile,
  tête inclinée de 8°), *il l'a* (l'épaule se redresse, 200 ms, au moment de la
  fusion), *station perdue* (les épaules tombent de 4 px quand la dernière lampe
  s'éteint). Coût faible : trois formes.
- **Le *Meteor***, de profil, 90 px : coque en arc, une cheminée, deux mâts. Il
  ne fait qu'une chose — **translater d'une station à l'autre** — et cette
  translation est ce qui fait comprendre qu'une station ne se rejoue pas.

Et un troisième acteur sans corps : **la plume**, un trait qui avance avec une
pointe brillante pendant la révélation.

---

## 9. L'animation et le régime de mouvement

**Régime « décor calme, objets vifs ».** La mer ne bouge pas, le papier ne bouge
pas, aucun défilement de fond. Tout ce qui vit est un objet : l'anneau qui
descend, l'aiguille qui bat, la ligne qui vire, les lampes, l'encre qui sèche.
**Aucune dérogation à la skill `aquarelle`** — le seul mouvement continu pendant
qu'on réfléchit est l'anneau, qui est un objet et non un décor.

Note d'implémentation qui évitera une itération : la colonne d'eau doit porter
`touch-action: none`, sinon le glissement vertical de la ligne entre en conflit
avec le défilement de la page sur mobile.

---

## 10. Le contenu

### L'interface, prête à coller dans `src/types/game.ts`

```ts
/**
 * « Le Sondeur » — le poste de sonde d'un navire de 1925.
 *
 * On frappe un coup dans la mer et on écoute revenir l'écho : le silence entre
 * les deux EST la profondeur. Le joueur règle une ligne d'écoute jusqu'à ce que
 * son tic et l'écho se confondent, marque le point, recommence six fois — puis
 * trace au doigt le fond entre ses six points.
 *
 * Ce que ça enseigne, et qu'aucun questionnaire ne peut enseigner : dans un
 * milieu opaque, une durée est une distance ; le fond de l'océan est un paysage
 * et non un plancher ; et entre deux sondages, un cartographe **décide**.
 */
export interface SondeurContent extends AvecConsigne {
  navire: { nom: string; campagne: string; annee: string; instrument: string }
  /** Vitesse du son retenue par l'appareil, en m/s. 1500 en eau de mer. */
  vitesseSonMS: number
  /** Pings disponibles par station. Épuisés sans marquage = trou dans le relevé. */
  pingsParStation: number
  transects: {
    titre: string
    /** Lu avant le premier ping, deux lignes. Le chrono ne court pas encore. */
    ordre: string
    /** Largeur de la feuille, en milles marins. */
    longueurMilles: number
    /** Profondeur maximale de l'échelle, en mètres. */
    echelleMetres: number
    stations: {
      /** Position sur la feuille, en milles depuis le départ. */
      mille: number
      /** La profondeur vraie. C'est elle qui fixe le délai de l'écho. */
      fond: number
      /**
       * Ce qui répond sans être le fond. `couche` arrive AVANT et sonne mou ;
       * `double` arrive à profondeur double et sonne plus faible.
       */
      parasites?: { profondeurApparente: number; force: number; nature: 'couche' | 'double' }[]
      /** Servi si le point est marqué à moins de 100 m du vrai. Une ligne. */
      note?: string
    }[]
    /** Le fond réel, échantillonné : c'est lui que le tracé doit épouser. */
    profilReel: { mille: number; fond: number }[]
    /** Le point que le joueur va vouloir prendre pour une erreur d'appareil. */
    anomalie?: {
      mille: number
      /** Écart toléré, en mètres, pour considérer que le tracé l'a honorée. */
      toleranceM: number
      siHonoree: string
      /** La scène de défaite. Servie quand le tracé l'a lissée. */
      siLissee: string
    }
    /** Écart moyen (m) au-delà duquel la manche est perdue. */
    ecartMaxM: number
    /** La leçon, servie dans tous les cas, après le profil réel. */
    revelation: string
  }[]
}
```

À ajouter aussi : `sondeur?: SondeurContent` dans `NotionGames`, et `'sondeur'`
dans `GameTypeId`.

### Le cadre narratif de la mécanique — `src/games/consignes.ts`

> « La mer est noire. Le son est le seul de tes sens qui descende jusqu'au fond. »

### L'exemple, entièrement rempli — `cp-geographie-oceans-mers`

Le payload complet figure dans le rapport de conception. Ses deux transects :

**Transect A — « 48° sud, 18 octobre 1925 »**, six stations
(4 020 / 3 960 / 3 380 / **560** / 3 620 / 4 050 m), un faux fond de couche à
430 m sur la station 2, un double écho à 1 120 m sur la station 4, seuil d'écart
400 m. L'anomalie est **un sommet** : la Meteorbank. Révélation : l'or de Fritz
Haber, la surestimation d'un facteur mille, et le relief rapporté à la place.

**Transect B — « 30° sud, la traversée de la dorsale »**, six stations
(5 080 / 4 620 / 2 740 / **3 560** / 2 810 / 4 900 m), seuil 450 m. L'anomalie
est **un creux** — la vallée médiane — et l'inversion est voulue : la leçon est
la même dans les deux sens, un point isolé est un fait tant qu'on ne l'a pas
réfuté. Révélation : Marie Tharp, 1952, le « girl talk » de Heezen, et son nom
absent de l'article de 1956.

### Ce que rend `onComplete`

- `correct` : écart moyen ≤ `ecartMaxM` **et** anomalie honorée.
- `mistakes` : stations marquées à plus de 300 m du vrai, plus les trous.
- `streak` : plus longue série de stations à moins de 100 m.

La logique (délais, tolérances, écart moyen, verdicts) va dans un
`src/engine/sondeur.ts` testable sans navigateur, sur le modèle de
`engine/telegramme.ts` — le composant ne doit rien calculer.

---

## 11. L'échec

### Les trois façons de perdre

1. **Marquer un parasite.** Un point à 430 m au milieu d'un fond à 4 000 m
   ajoute à lui seul près de 600 m à l'écart moyen : une seule station perdue de
   cette façon suffit à faire sauter le seuil.
2. **Marquer au flam** partout, sans jamais chercher la fusion : six écarts de
   200 m environ, et l'on frôle le seuil sans le passer. On ne perd pas, mais on
   ne progresse pas — c'est le régime « moyen » du jeu.
3. **Lisser l'anomalie.** Le tracé passe au-dessus du sommet (ou au-dessus du
   fossé). Perdu, même avec six stations parfaites — et c'est voulu : mesurer
   juste ne suffit pas, il faut oser dessiner ce qu'on a mesuré.

### Les deux scènes de défaite, écrites

**Si l'anomalie a été lissée** (transect A) — la scène se joue, elle ne se
raconte pas : la feuille du joueur glisse hors champ vers la droite ; un
cartouche « Bureau hydrographique » tombe ; **la feuille revient dupliquée** en
sept exemplaires imprimés qui s'empilent avec un bruit de presse, et sur chacun
l'Atlantique est une plaine unie. Puis, en bas, la sanguine dessine seule le
sommet, hors de la pile :

> *Il y avait là une montagne de près de trois mille cinq cents mètres de haut.
> Tu l'as prise pour une erreur d'appareil — c'est ce qu'on faisait, et c'est
> pour ça que le fond des océans est resté vide si longtemps.*

**Si le joueur a marqué le faux fond** — la même carte s'imprime, mais avec un
**haut-fond à 430 m en plein Atlantique**. Un avis aux navigateurs se déplie ; un
second navire, minuscule, traverse l'écran jusqu'au point ; il sonde ; et son
anneau ne rencontre rien du tout. Puis, en fondu, un nuage de petites formes qui
monte lentement vers la surface :

> *Il n'y a pas de haut-fond là-bas. Ce qui t'a répondu à quatre cents mètres
> était vivant : un banc de bestioles assez dense pour renvoyer le son, qui
> remonte chaque nuit vers la surface et redescend au jour. Les sonars de 1942
> l'ont pris pour le fond de la mer avant toi, et l'ont appelé le faux fond.*

Aucune des deux scènes ne dit « raté ». Les deux racontent une conséquence
datée, et les deux apprennent quelque chose que le joueur ne savait pas.

### Le taux

Visé : **une manche sur quatre**. La première partie est presque toujours perdue
(le faux fond de la station 2 est conçu pour ça, et cette défaite-là est la
leçon d'ouverture). Le chiffre honnête, c'est qu'il **ne peut pas être garanti
sur le papier** : il dépend entièrement de la facilité du geste fin. Réglage
prévu : si les essais perdent trop, porter `pingsParStation` de 4 à 5 ; si l'on
gagne toujours, descendre `ecartMaxM` de 400 à 250. **Les deux boutons sont dans
le contenu, pas dans le code.**

---

## 12. Les tests

**Comment on saura que c'est amusant — le test du son coupé.** Faire jouer une
manche entière **avec le son coupé**, puis une manche avec le son. Si l'écart
moyen et le plaisir déclaré ne changent presque pas, l'oreille n'est qu'un
habillage et le jeu est raté : il faut alors renforcer le contraste de timbre
entre tic et écho, et affaiblir le galvanomètre. Si au contraire le joueur dit
spontanément « attends, laisse-moi remettre le son », la mécanique tient. C'est
le seul test qui décide si le son est l'énigme ou la décoration.

Deux vérifications de contrôle :

- **On doit pouvoir perdre en jouant au hasard** : six points marqués sans
  écouter donnent un écart moyen de l'ordre de 2 000 m, soit cinq fois le seuil.
  Le test qui a démasqué La Rivière est passé.
- **Un joueur qui connaît déjà les profondeurs doit pouvoir rater** : connaître
  la valeur ne dispense pas de trouver les 30 m de fusion au doigt, et l'anomalie
  du transect B se lisse par réflexe même quand on sait qu'elle est là. À la
  troisième manche, on doit vouloir rejouer **pour faire descendre l'écart moyen
  sous 100 m**.

**Comment on saura qu'on apprend.** Le joueur doit pouvoir dire, le soir même :

> « Le fond de l'océan, on l'a mesuré à l'oreille : on tape un coup dans l'eau,
> on attend l'écho, et le silence entre les deux, c'est la profondeur — cinq
> secondes et demie pour quatre kilomètres. Et il y a des montagnes là-dessous :
> un bateau allemand est passé au-dessus d'un sommet de trois mille quatre cents
> mètres en 1925, en plein Atlantique, sans que personne ne s'en doute. »

Avant de jouer, il aurait dit que la mer est profonde et que le fond est plat.

---

## 13. Le coût

**Élevé.** La dépense se répartit ainsi :

- **Audio à échéance (moyen).** Programmer ping, tic, écho et parasites sur
  l'horloge audio à des instants calculés. `engine/musique.ts` fait déjà
  exactement cela (programmation par tranches, horizon, horloge audio pour ne
  pas dériver) : modèle à copier, pas à inventer. Il faut néanmoins élargir
  `sound.ts`, dont les voix sont aujourd'hui des constantes sans paramètre — le
  gain de l'écho dépend de la profondeur.
- **Le geste à deux vitesses et la boucle de ping (le gros morceau).** ~250
  lignes de composant, plus `engine/sondeur.ts` testable sans navigateur.
- **Le tracé et sa comparaison (faible à moyen).** `engine/courbe.ts` existe ; il
  manque l'échantillonnage du tracé et l'écart moyen à un profil.
- **Dessin (moyen).** Colonne d'eau en dégradé, feuille quadrillée, deux
  silhouettes, un cadran. Rien que le moteur aquarelle ne sache faire, mais il
  faut le **regarder à la taille réelle**.
- **Contenu (fait).** Les deux transects sont écrits et vérifiés.

C'est le dossier le plus cher proposé jusqu'ici, et il est assumé : il ouvre
l'oreille, qui est un axe entier du catalogue, et l'audio à échéance resservira à
tout jeu rythmique ultérieur.

---

## 14. Les variantes

- **L'orage** (CE1-CE2, sciences) — compter les secondes entre l'éclair et le
  tonnerre : même moteur d'échéance, autre constante (340 m/s dans l'air), et la
  comparaison des deux vitesses devient la leçon.
- **La chauve-souris** (CM, le vivant) — on émet des cris et on règle leur
  cadence : à l'approche de la proie, la cadence doit exploser.
- **Le Rift** (4e, tectonique) — plusieurs profils empilés dont il faut aligner
  les encoches : le geste devient littéralement celui de Marie Tharp, et la DA
  arcade rétro des grandes classes s'y prête.

---

## Sources

- Expédition allemande de l'Atlantique (*Meteor*), 1925-1927, sondeur à écho
  Behm, quatorze traversées, premier navire à employer le sondage par écho à des
  fins scientifiques — GEOMAR (centenaire), EBSCO Research Starters, Wikipédia
  EN *German Meteor expedition* et *German survey ship Meteor*.
  **Réserve** : le nombre de sondages est donné à ~67 000 par GEOMAR et à
  ~34 000 par Wikipédia FR, et 67 535 est par ailleurs le nombre de milles
  parcourus. **Le contenu n'utilise aucun compte de sondages.**
- Meteorbank : relevée le 18 octobre 1925, 48°16′ S / 8°16′ E.
  **Réserve** : sommet à 560 m selon plusieurs sources, 590 m selon le journal du
  capitaine Spieß ; fond environnant donné à 3 000 m par GEOMAR et à 4 000 m
  ailleurs. Le contenu retient 4 000 / 560 — **à trancher avant de coder**.
- Or de l'eau de mer, Fritz Haber, surestimation, arrêt du projet en 1927 —
  EBSCO, *Journal of Geological Education* « Gold from the Sea ».
- Vitesse du son en eau de mer ≈ 1 500 m/s, profondeur = délai × vitesse / 2 —
  Wikipédia FR *Acoustique sous-marine*.
- Couche de diffusion profonde (« faux fond ») : USS *Jasper*, été 1942, au large
  de San Diego ; nature biologique établie par Martin Johnson en 1945 —
  Wikipédia EN *Deep scattering layer*, WHOI.
- Échos multiples sur fond dur, second écho à profondeur double et plus faible —
  manuels d'échosondeur.
- Marie Tharp : rift identifié en 1952, « girl talk » de Bruce Heezen,
  confirmation par les épicentres de séismes, nom absent de l'article de 1956 —
  American Institute of Physics, *Smithsonian Magazine*, Lamont-Doherty.
  **Réserve** : sa première campagne en mer en 1965 n'a pas été reconfirmée par
  la session principale.

**Non transcrit, et dit franchement** : les profondeurs intermédiaires des deux
profils sont une reconstitution cohérente avec la bathymétrie publiée. Seuls les
deux chiffres d'ancrage du transect A sont ceux du relevé du 18 octobre 1925 ; le
transect B est une coupe type de la dorsale, non un profil daté.
