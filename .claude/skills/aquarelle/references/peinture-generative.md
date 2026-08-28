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

## Voir avant de livrer

Ne juge jamais une itération sans l'avoir regardée. La méthode de capture (le navigateur poste l'image dans un fichier via un petit serveur local) est décrite dans la skill `pieges-du-projet`, section « Voir réellement ce qu'on dessine ». Une itération esthétique livrée en aveugle coûte systématiquement un aller-retour de plus qu'une capture.

**Juge à la taille d'affichage réelle, pas seulement sur une capture zoomée.** Des colonnes ajoutées à `citeEngloutieScene` paraissaient nettes sur une capture agrandie (le canvas source, en résolution `devicePixelRatio`) mais étaient sous le seuil de lisibilité une fois réduites à la largeur CSS réellement affichée (170px, contre 220px de source — sans compter que la page peut encore la rétrécir sur un écran étroit). Avant de juger un détail petit ou fin, capture le canvas à sa taille CSS réelle (`getBoundingClientRect()`), pas sa résolution interne.

## L'auréole (backrun) n'est pas reproductible en `multiply`

Deux tentatives, deux échecs, une primitive écrite puis supprimée. À ne pas refaire.

L'auréole — le « chou-fleur » qui signe une aquarelle — a un **cœur plus clair que son entourage**, cerné d'un liseré dense. Or tout le moteur compose en `mix-blend-mode: multiply`, qui ne sait qu'**assombrir**. Éclaircir un centre y est impossible.

Le contournement paraît évident : ne peindre que le liseré, le cœur restant le lavis d'en dessous. Il ne marche pas. Un liseré fermé se lit comme un **contour tracé**, pas comme un dépôt de pigment :

- contour peu déformé → une flaque cernée au feutre ;
- contour très lobé (`deform` profondeur 4, spread 0.5) → un petit nuage dessiné posé sur l'eau.

Les deux ont été jugés ratés à l'écran. Le défaut ne vient pas du réglage mais du fait qu'une auréole est un **gradient**, et qu'un trait ne peut pas en tenir lieu.

**Ce qui marche à la place**, et qui donne bien plus de caractère aquarelle pour bien moins de risque :

- `hardEdge()` — le bord de flaque. C'est l'**alternance** entre bords durs et bords fondus dans une même image qui distingue une aquarelle d'un aérographe, pas les accidents de pigment. Une ou deux lignes dures suffisent à réveiller tout un tableau ; en barre continue d'un bord à l'autre, en revanche, elles se lisent comme un trait de règle — les poser en fragments.
- `granulation()` — le piqueté dur des pigments lourds, de densité croissante vers le bas. À ne pas confondre avec `flecks`, qui pose des taches molles.
- **Et surtout l'échelle des valeurs.** Le vrai écart avec une aquarelle de peintre n'était ni la texture ni les accidents : c'était que tout le tableau vivait dans une bande de tons moyens, sans papier nu ni sombre franc. C'est l'écart entre les deux qui fait la lumière. Élargir cette échelle a plus changé l'image que n'importe quel effet de matière.
