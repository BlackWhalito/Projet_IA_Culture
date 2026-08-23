/// <reference types="node" />
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { describe, expect, it } from 'vitest'

// Lecture directe des fichiers plutôt qu'un import `?raw` : vitest neutralise
// le CSS (`environment: 'jsdom'` sans traitement des styles), donc un `?raw`
// y remonte une chaîne vide et le test passerait à côté de son sujet. La
// référence de types ci-dessus limite les types Node à ce seul fichier — le
// tsconfig de l'app n'expose que `vite/client`, et doit le rester.
const ICI = dirname(fileURLToPath(import.meta.url))
const tokensCss = readFileSync(join(ICI, 'tokens.css'), 'utf8')
const globalCss = readFileSync(join(ICI, 'global.css'), 'utf8')

/**
 * Ces deux invariants sont vérifiés sur le TEXTE des feuilles de style, pas
 * sur un rendu : jsdom n'applique ni la cascade des CSS Modules ni les
 * couleurs système (`buttontext`), donc aucun test de composant ne peut
 * attraper la régression visée. Un test de fichier est ici le seul garde-fou
 * possible, et il est largement justifié par ce que le défaut a coûté.
 *
 * Le défaut en question : l'app n'épinglait aucun `color-scheme` et ses
 * boutons ne fixaient pas leur couleur. Sur un appareil réglé en mode
 * sombre, l'habillage natif des contrôles passe en sombre et `buttontext`
 * devient blanc — donc du texte blanc sur le fond crème de l'app, invisible.
 * Le propriétaire n'a vu que des boutons de réponse vides, dans tous les
 * jeux, et l'a signalé comme « des bugs partout ». Reproduit puis corrigé en
 * forçant `color-scheme: dark` dans un navigateur réel.
 */
describe('thème', () => {
  it('épingle le thème clair : sans ça, les contrôles natifs virent au blanc en mode sombre', () => {
    expect(tokensCss).toMatch(/color-scheme:\s*light/)
  })

  it('ne laisse jamais un bouton hériter de la couleur système', () => {
    // Les commentaires sont retirés AVANT l'analyse : la règle `button` est
    // justement précédée d'un commentaire qui contient le mot « color », et
    // sans ce nettoyage le test passait au vert même après suppression de la
    // vraie déclaration — un garde-fou qui ne garde rien.
    const sansCommentaires = globalCss.replace(/\/\*[\s\S]*?\*\//g, '')
    const regleBouton = sansCommentaires.match(/\bbutton\s*\{[^}]*\}/)
    expect(regleBouton, 'aucune règle `button` dans global.css').not.toBeNull()
    expect(regleBouton![0]).toMatch(/color:/)
  })
})
