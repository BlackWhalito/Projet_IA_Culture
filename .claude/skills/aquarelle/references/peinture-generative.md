# Peindre en génératif — les pièges qui coûtent des itérations

À lire **avant** de toucher à `src/components/watercolor/` ou à une scène qui l'utilise.

Ces règles viennent d'itérations réelles jugées ratées par le propriétaire. Chacune a coûté un aller-retour complet ; aucune n'est théorique.

## Le piège fondateur : améliorer la matière quand c'est le dessin qui manque

Le réflexe est d'ajouter du grain, du contraste, des bords baveux. Ça ne sauve jamais une image où **rien n'est représenté**. Les verdicts « ça fait des taches », « on dirait des crayons », « pas d'identité » désignent tous ce défaut-là, jamais la texture.

**Le test** : masque la couleur et demande *« quel objet est-ce ? »*. Si la réponse est « une forme verticale », aucun réglage de pigment ne sauvera l'image. Il faut du vocabulaire (`architecture.ts`), pas des filtres.

Corollaire : une étendue vide (mer, ciel, sable) sans **horizon** ni **objet de taille connue** se lit comme des bandes de couleur empilées. C'est le sujet qui crée la profondeur, pas la matière.

## `multiply` : l'ordre de dessin ne masque rien

Tout le moteur peint en `mix-blend-mode: multiply`. Conséquence contre-intuitive : **une forme peinte en premier reste visible à travers celles peintes après**. Un lavis de brume qui déborde sur une façade se lit comme une écharpe qui traverse le bâtiment, quel que soit l'ordre des appels.

**La règle** : chaque masse reste confinée à sa zone. Ne compte jamais sur l'ordre pour occulter — vérifie les bornes (`cy ± ry`) de chaque lavis contre la ligne d'horizon ou de quai.

## `dryStroke` s'effile aux deux bouts — surveille le rapport longueur/largeur

`dryStroke` amincit ses extrémités pour imiter un pinceau qui se lève. Une touche **large et courte** devient donc un losange : à l'écran, une feuille collée sur le mur.

| Usage | Rapport longueur/largeur minimum |
|---|---|
| Coulure sur une façade | 20:1 |
| Ride à la surface de l'eau | 60:1 |
| Arête, mât (trait franc) | 10:1 suffit |

Piège associé, déjà corrigé mais à ne pas réintroduire : un chemin de **2 points exactement** n'a aucun point au milieu, donc l'effilement le rend quasi invisible. `resample()` règle ça en tête de `dryStroke` — ne le contourne pas.

## Une arche part du sol

Dessiner seulement la courbe donne un pétale suspendu. Une arche est : montant gauche → naissance de la courbe → demi-cercle → montant droit → sol. La naissance se calcule **depuis le haut de l'ouverture** (`yTop + hauteur * 0.42`), jamais depuis un point flottant au milieu.

## Une lumière unique, décidée avant de peindre

Le défaut le plus coûteux en harmonie : chaque objet calcule son ombre dans son coin, donc rien ne se répond. Décide **un** `LightPlan` par scène (`light.ts`) et passe-le à chaque élément. Toutes les ombres tombent alors du même côté — c'est ce qui fait tenir un tableau.

## Les petits noirs font tout

Le noir le plus dense d'une aquarelle réussie couvre **une poignée de pixels** : fenêtres, une proue, une silhouette. Étalé en grandes masses sombres, il produit l'inverse — une image lourde et sans air. `VALEUR.ACCENT` est réservé aux ouvertures et aux accents ; jamais sur une surface.

Symétriquement, `VALEUR.LUMIERE` doit rester du papier presque nu quelque part dans l'image. Sans vrai clair, pas de vrai sombre.

## Sur un dégradé, aucune touche de texture isolée ne se cache — même sans bord

Trois tentatives successives, toutes jugées ratées par le propriétaire : des `wash()` adoucis, puis un `createRadialGradient` sans bord fermé, puis (ailleurs, via `highlight()`) une couleur de palette au lieu d'un ton papier. Le point commun n'est **pas** la netteté du bord — le radial n'en a aucun et se voyait quand même. La vraie cause : tout se peint en `mix-blend-mode: multiply`, donc n'importe quelle touche de couleur posée sur un dégradé l'**assombrit localement**, et un assombrissement isolé se repère, bord dur ou pas.

**La règle** : sur une grande surface en dégradé (ciel, eau), ne pose **aucune** texture décorative séparée du sujet. Le grain de `WatercolorScene` (appliqué une fois sur toute la scène) donne déjà la matière ; le sujet lui-même (nuages, reflets, rides, bâtiments) donne le reste. `gradedWash()` a fini par redevenir un pur dégradé natif, sans rien ajouté par-dessus — voir son commentaire dans `atmosphere.ts`.

Corollaire pour tout ce qui reste posé isolément sur une grande surface (ex. les éclats de lumière réservée) : la couleur doit être un ton **papier/clair**, jamais une teinte saturée de la palette — un ton clair n'assombrit presque rien, une teinte saturée assombrit assez pour se voir comme une tache colorée.

Un deuxième bug s'est caché derrière le premier : même repeints en papier, ces éclats ressortaient encore en ronds pleins sur l'eau. `highlight()`/`wash()` ne peuvent PAS peindre une forme fine et allongée — `spread`/`jitter` finissent toujours par arrondir un contour plat en disque, quels que soient ses proportions d'origine. Pour un trait de lumière (un fil, pas une nappe), c'est `dryStroke` qu'il faut — voir `glint()` dans `scenes.ts`, qui remplace ces `highlight()` par des traits fins.

Un troisième bug, plus bête, s'est glissé en corrigeant le deuxième : `glint()` a d'abord été appelé en recopiant telles quelles les anciennes valeurs `ry` des `highlight()` qu'elle remplaçait — sauf que ces valeurs avaient été choisies pour une ellipse, pas pour l'épaisseur d'un trait, et sur l'un des deux tableaux elles rendaient l'épaisseur presque égale à la longueur (le rond revenait). **La règle** : un correctif qui dépend d'un ratio (ici longueur/épaisseur) doit être vérifié À CHAQUE site d'appel, pas seulement au premier — recopier d'anciens paramètres dans une nouvelle fonction ne transfère pas leur intention.

Règle plus générale qui ressort de ce round : **une forme dérivée (une ombre, un reflet, un écho) doit partager la géométrie de son parent, pas être une nouvelle forme positionnée à côté.** L'ombre de chaque lobe de `cloud()` était d'abord une ellipse indépendante calculée à une position approchée ; elle pouvait atterrir légèrement décalée du lobe et se lire comme un rond qui flotte tout seul. Corrigé en construisant l'ombre à partir des points MÊMES du lobe (translatés/réduits), ce qui la garde géométriquement à l'intérieur de sa silhouette, quoi qu'il arrive.

## Un tirage aléatoire malchanceux peut annuler tout un effet

`ruinFacade()` calcule la hauteur de chaque pan de mur par un tirage indépendant — en théorie assez pour casser la silhouette, en pratique il est arrivé qu'un bâtiment étroit tire des hauteurs presque identiques et rende un sommet parfaitement droit, sans aucune ruine visible. La graine est fixe (même seed à chaque rendu), donc ce n'était pas un accident ponctuel : c'était reproductible à chaque chargement, pour ce bâtiment précis.

**La règle** : quand un effet dépend d'un **écart** entre plusieurs tirages (pas juste d'un tirage), calcule tous les tirages d'abord, mesure l'écart obtenu, et force-le au minimum voulu s'il n'y est pas — ne fais jamais confiance au hasard seul pour produire une variation qui doit être visible à chaque rendu.

## Un contour cassé n'est jamais une pente

Pour dessiner une silhouette brisée (toit effondré, sommet de ruine) en alimentant `wash()` avec une ligne faite de points à hauteurs différentes : ne jamais relier deux hauteurs par une **pente continue**. `wash()` applique son propre flou fractal par-dessus n'importe quel contour qu'on lui donne ; une pente reprise par ce flou se courbe et se lit comme un pic de montagne ou un éclat de verre — pas comme un mur cassé. C'est arrivé en écrivant `ruinFacade()` : la première version reliait chaque hauteur à la suivante en diagonale, résultat immédiatement identifié comme « des cristaux », pas des bâtiments.

**La règle** : encoder un contour brisé comme une fonction en **plateaux** — un segment horizontal à une hauteur, une chute quasi verticale, un nouveau segment horizontal à une autre hauteur. Deux points par palier (début et fin), jamais un point unique reliant deux hauteurs différentes. Le flou fractal de `wash()` arrondit ensuite les angles sans détruire la lecture « mur cassé, pas montagne ».

## Une ruine se lit par sa silhouette, une ruine antique par ses colonnes

Un mur au sommet cassé (`ruinFacade()`) dit « vieux et abandonné » — n'importe quelle époque. Pour dire spécifiquement « Antiquité », il faut le repère iconographique dédié : une **colonne** (`column()`), debout ou cassée à mi-hauteur, et un **tambour effondré** couché au sol (`fallenColumn()`, toujours 2-3 disques disjoints — une colonne qui tombe se brise à ses jointures, elle ne reste pas entière). Une colonnade, même réduite à 2-3 éléments discrets en fond de scène, change la lecture entière d'une skyline plus sûrement qu'un ajustement de palette.

## Une figure humaine reste iconique, jamais anatomique

Le risque est spécifique et plus élevé qu'ailleurs : un visage raté se voit immédiatement, plus que n'importe quel bâtiment raté. `figure.ts` (`girlWriting()`) applique la même logique que `voile()` (le bateau) : peu de formes déterminantes plutôt que du détail.

- **Les yeux** : deux tout petits accents sombres (`VALEUR.ACCENT`), rien de plus — ils suffisent à faire « un regard vers le joueur ». Une bouche détaillée est plus risquée qu'utile à cette échelle ; mieux vaut l'omettre que la rater.
- **La coiffure** est le repère le plus fiable pour l'âge/le genre d'une silhouette (ex. deux couettes → « une enfant ») — plus fiable qu'aucun détail de visage, et sans aucun risque puisque c'est une simple masse de `wash()`.
- **Un petit objet posé sur une surface de teinte proche disparaît** : le carnet (papier clair sur bois clair) était invisible tant qu'il n'avait pas son propre contour sombre (`dryStroke` en rectangle). Toute forme claire posée sur un fond clair a besoin d'un bord tracé, pas seulement d'un remplissage.

## `jitter` est le seul réglage qui élargit un bord — et les valeurs « organiques » sont trop basses

Symptôme : la scène sort en **aplats vectoriels**, bords au ruban adhésif, alors que tous les réglages sont dans les fourchettes documentées. Le réflexe est d'accuser la couleur ou le nombre de couches. C'est faux.

`wash()` construit son bord par l'écart entre deux couches successives, et `deform()` déplace chaque point d'une fraction de la **longueur de son arête**. Or la forme parente est déjà subdivisée deux fois : ses arêtes font environ un quart de celles du polygone d'origine. Avec `jitter: 0.1` sur un polygone dont les arêtes font 15 px, l'écart entre deux couches vaut donc ~0,4 px. Un bord de 0,4 px est un bord net.

Ordres de grandeur qui marchent réellement, mesurés sur le tableau de Versailles :

| Sujet | `spread` | `jitter` |
|---|---|---|
| Maçonnerie (façade, margelle) | 0.04 – 0.06 | 0.10 – 0.14 |
| Feuillage, plate-bande, eau | 0.10 – 0.16 | 0.26 – 0.40 |
| Vapeur, gerbe d'eau, brume | 0.20 – 0.34 | 0.40 – 0.46 |

`spread` reste borné à ~0.3 (au-delà la silhouette part en lambeaux) ; `jitter`, lui, ne fait qu'adoucir et peut monter bien plus haut qu'on ne l'imagine.

## Mesurer les valeurs, pas les regarder

Le défaut le plus coûteux du tableau de Versailles a résisté à cinq itérations : le palais paraissait fade et gris, et chaque tentative portait sur sa **couleur**. Un relevé de pixels (`ctx.getImageData` depuis la console) a tranché en une minute : façade à 190 de luminance, ciel à 183. Deux masses à la même valeur ne se séparent jamais, quelle que soit leur teinte.

**Réflexe** : avant de retoucher une couleur, relève la luminance des deux masses qui devraient s'opposer. Si l'écart est sous ~25, c'est un problème de valeur, et aucune retouche de teinte ne le corrigera.

Corollaire pour un ciel en dégradé derrière un bâtiment : sa chute doit être calée **exactement sur la ligne de toit**. Trop haut, le ciel n'a plus de densité au-dessus du bâtiment et les deux se rejoignent en valeur. Trop bas, le ciel teinte le bâtiment à travers lui (`multiply`) — un ciel chaud rend un palais rose.

## Le produit de deux pigments, jamais un pigment seul

En `multiply`, ce qu'on voit est le **produit** de tout ce qui a été posé. Trois pièges rencontrés d'affilée sur la même image, chacun sur des couleurs pourtant justes prises isolément :

- **Prune sur vert → brun.** `VIOLET_PROFOND` en ombre sur des ifs `VERT` : quelques cônes viraient au marron pendant que leurs voisins restaient verts, selon la part du cône que l'ombre couvrait. L'ombre d'un feuillage se peint en bleu ardoise. La règle du projet est « une ombre n'est jamais grise », pas « une ombre est toujours violette ».
- **Sable orangé sous du vert → kaki.** Le sable des allées en `SABLE` teintait en tan tout if qui le chevauchait. Un sable en `PIERRE_PALE` (crème) ne fait pas ça.
- **Pierre ocre sous un ciel chaud → rose.** `PIERRE_CHAUDE` + un dégradé `SABLE` a rendu un Versailles de dragée. La pierre au soleil se peint en crème, et la chaleur vient d'un voile étroit posé du seul côté éclairé.

**Réflexe** : quand une teinte dérape, ne cherche pas quelle couleur est fausse — cherche quelles DEUX couleurs se superposent à cet endroit.

## Une réserve claire se prépare, elle ne se peint pas

On ne peut pas éclaircir en `multiply`. Un jet d'eau, une écume, un rai de lumière n'existent que **là où le papier a été laissé nu**. La gerbe du bassin de Versailles ne fonctionne que parce qu'elle monte au-dessus de l'allée de sable, seule zone quasi non peinte du tableau ; posée devant les parterres, elle disparaissait.

Corollaire : place d'abord la zone claire dans la composition, peins le voile ensuite. L'inverse ne marche jamais.

## Un vide se remplit par un sujet, pas par de la matière

Le quart de tableau vide entre le palais et les parterres a résisté à trois lavis de sol successifs — chacun le grisait sans le remplir. Ce qui a marché : y mettre **ce qui s'y trouve réellement**, le Parterre d'Eau et ses deux miroirs. C'est le piège fondateur de ce fichier sous un autre angle : quand une zone paraît vide, il lui manque un sujet, pas du pigment.

## Deux masses pleines ne se chevauchent jamais

Le corollaire architectural de la règle `multiply` ci-dessus, et il coûte cher parce qu'il est contre-intuitif : superposer une tour à une courtine ne met pas la tour DEVANT le mur, ça double le pigment sur leur intersection. Le rectangle de la tour ressort alors comme une boîte translucide collée sur le mur — un château fort entier s'est lu comme un empilement de calques avant que le problème soit nommé.

**La règle** : les volumes d'un même bâtiment se JOIGNENT bord à bord, ils ne se recouvrent pas. Les pans de courtine courent entre les tours ; un donjon qui s'élève derrière une muraille ne se dessine qu'au-dessus du chemin de ronde. Quand un recouvrement est inévitable, il faut qu'il soit voulu et lu comme une ombre portée, jamais comme une silhouette.

## Un bâtiment posé sur une horizontale parfaite est un carton

Toutes les bases de murs et de tours alignées sur un même `y` : le château se lit comme une découpe posée sur une étagère, quelle que soit la qualité de son dessin.

**Le correctif tient en un appel** : repeindre le terrain PAR-DESSUS le pied du bâtiment, avec une crête irrégulière qui mord les bases à des hauteurs différentes. L'édifice sort alors de son sol au lieu d'y être posé. C'est le même geste qu'un rocher de premier plan qui mord le bord bas du cadre.

## La précision d'une architecture vient de ses traits, pas de la netteté de ses lavis

Verdict reçu sur le palais de Versailles : « pas assez précis ». Le réflexe — baisser `spread`/`jitter` pour durcir les bords — est le mauvais : il rend la masse vectorielle sans rien ajouter de lisible.

Ce qui a marché, et qui vaut pour toute architecture régulière :

- **Une seule trame partagée.** Une fonction `travee(i)` dont dérivent les arcades du bas, les fenêtres du haut et les ressauts. C'est l'alignement vertical entre les trois registres qui produit la précision, bien avant le détail de chacun.
- **Des horizontales franches.** Entablement, bandeau d'étage, socle : trois `dryStroke` sombres et droits font plus qu'un modelé de pierre.
- **Une symétrie exacte.** Avec un nombre impair de travées, l'axe tombe entre deux : les paires symétriques ne sont pas celles qu'on écrit spontanément. Une demi-travée d'erreur se voit immédiatement sur un bâtiment dont la symétrie est tout le sujet.
- **Attention à `windows()`** : elle décale chaque ouverture au hasard et en supprime une sur six, exprès — c'est juste pour un palazzo en ruine, et faux pour une façade classique, dont la régularité EST le sujet. `floors: 0` et une grille tracée à la main.

## Un animal se peint d'un seul contour fermé

Un tronc, un trait d'encolure et une boule de tête assemblés donnent une table à pattes surmontée d'un ballon — vérifié deux fois. Ce qui fait reconnaître un animal, ce sont les PASSAGES : garrot vers encolure, courbe de la croupe, attache de la tête. Aucun n'existe si chaque partie est peinte séparément. Corps, encolure et tête vont donc dans un seul polygone ; seuls les membres, la queue et le cavalier se posent à part.

Et l'espèce se joue sur une proportion, pas sur du détail : la tête d'un cheval est **longue** (0,4 fois la hauteur au garrot, deux fois plus longue que haute) et nettement détachée de l'encolure. Courte et ronde au sommet d'une encolure épaisse, la même silhouette donne un lama. Aucun réglage de couleur ne rattrape une proportion fausse.

Deux détails qui ont chacun coûté un aller-retour : les membres se peignent **avant** le tronc (posés dessus, leur jointure reste visible en `multiply`), et leur tracé doit descendre **sous** la ligne de sol, sinon l'effilement de `dryStroke` termine chaque jambe en pointe d'aiguille au lieu d'un sabot.

## `wash()` n'arrondit pas un polygone à peu de sommets

Une aile de papillon dessinée à six sommets sort en cerf-volant facetté, et **aucun réglage de `spread`/`jitter` ne la rattrape** : `deform()` déplace chaque point d'une fraction de la longueur de son arête, donc six longues arêtes restent six longues arêtes légèrement ondulées. Deux essais l'ont vérifié.

**La règle** : une forme qui doit être ronde se construit avec **14 sommets ou plus**, ou directement avec `polygon()`. Une forme anguleuse (mur, toit, coque) se contente de peu. Le nombre de sommets décide de la rondeur, pas les réglages de bord.

## Un solide plus large à un bout ne peut pas être un `dryStroke`

`dryStroke` effile ses DEUX extrémités. Un tronc d'arbre, un mât, une patte de cheval tracés avec lui sortent en fuseau — aussi fins au pied qu'à la cime, une aubergine plantée dans le sol. Un tronc s'évase au pied ; une patte finit sur un sabot.

**La règle** : dès qu'une forme doit être dissymétrique en épaisseur, c'est un polygone passé à `wash()`. `dryStroke` reste pour ce qui est vraiment effilé aux deux bouts — une brindille, une ride, une arête.

Corollaire déjà vu sur les jambes du cheval : quand un `dryStroke` doit se terminer NET (un sabot sur le sol), il faut prolonger le tracé au-delà du point d'arrivée pour que l'effilement se produise hors champ.

## Un arbre est récursif, une fourche ne l'est pas

Trois branches droites partant du même point donnent une fourche à foin — visible immédiatement sur un arbre nu. Un arbre se dessine par **bifurcations successives** : une branche, deux sous-branches, deux ramilles, avec un angle et une longueur qui décroissent à chaque niveau. Une fonction récursive de six lignes suffit, et c'est la seule façon d'obtenir une silhouette d'arbre plutôt qu'un symbole.

Sous un houppier, ces branches doivent en plus être peintes **à opacité réduite** : à pleine densité elles transparaissent au travers du feuillage et se lisent comme des lames plantées dedans.

## Un noir ne se voit que dans une masse plus claire que lui

Corollaire inversé de la règle des petits noirs, et il a coûté trois versions de la même image : l'ouverture d'une grotte creusée dans une falaise **peinte en sombre** est invisible, et la même ouverture dans une falaise peinte en clair devient une porte de grange. Une masse qui doit contenir un trou doit rester dans une valeur MOYENNE.

Et quand un sujet refuse de se lire de l'extérieur, essayer de **s'en servir comme cadre**. La grotte préhistorique, montrée de l'extérieur, restait un caillou à 200 px ; vue de l'intérieur, la paroi devient une bordure sombre qui n'a plus à être reconnue — seulement à encadrer — et la scène raconte davantage. Un sujet difficile à représenter est parfois un excellent point de vue.

## Voir avant de livrer

Ne juge jamais une itération sans l'avoir regardée. La méthode de capture (le navigateur poste l'image dans un fichier via un petit serveur local) est décrite dans la skill `pieges-du-projet`, section « Voir réellement ce qu'on dessine ». Une itération esthétique livrée en aveugle coûte systématiquement un aller-retour de plus qu'une capture.

**Juge à la taille d'affichage réelle, pas seulement sur une capture zoomée.** Des colonnes ajoutées à `citeEngloutieScene` paraissaient nettes sur une capture agrandie (le canvas source, en résolution `devicePixelRatio`) mais étaient sous le seuil de lisibilité une fois réduites à la largeur CSS réellement affichée (170px, contre 220px de source — sans compter que la page peut encore la rétrécir sur un écran étroit). Avant de juger un détail petit ou fin, capture le canvas à sa taille CSS réelle (`getBoundingClientRect()`), pas sa résolution interne.
