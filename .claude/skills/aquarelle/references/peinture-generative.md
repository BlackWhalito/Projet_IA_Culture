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

## Voir avant de livrer

Ne juge jamais une itération sans l'avoir regardée. La méthode de capture (le navigateur poste l'image dans un fichier via un petit serveur local) est décrite dans la skill `pieges-du-projet`, section « Voir réellement ce qu'on dessine ». Une itération esthétique livrée en aveugle coûte systématiquement un aller-retour de plus qu'une capture.
