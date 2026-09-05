/*
 * Assemble l'app en UN seul fichier, jouable sans serveur.
 *
 * Sert à faire essayer le jeu depuis un téléphone : le propriétaire n'a pas
 * accès au serveur de dev, qui ne vit que dans le conteneur. On inline donc le
 * CSS et le JS produits par Vite dans un document unique.
 *
 * Le fichier est écrit SANS <html>, <head> ni <body> : c'est ce qu'attend
 * l'hébergement d'artefact, qui fournit lui-même l'enveloppe.
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const dist = process.argv[2] ?? 'dist'
const sortie = process.argv[3] ?? 'jeu.html'

const assets = readdirSync(join(dist, 'assets'))
const js = assets.filter((f) => f.endsWith('.js'))
const css = assets.filter((f) => f.endsWith('.css'))

if (js.length !== 1) {
  throw new Error(`Attendu un seul fichier JS, trouvé ${js.length} : ${js.join(', ')}`)
}

const styles = css.map((f) => readFileSync(join(dist, 'assets', f), 'utf8')).join('\n')
const script = readFileSync(join(dist, 'assets', js[0]), 'utf8')

const html = `<title>Jeu Culture</title>
<style>
${styles}
</style>
<div id="root"></div>
<script type="module">
${script}
</script>
`

writeFileSync(sortie, html)
const ko = (html.length / 1024).toFixed(0)
console.log(`${sortie} écrit — ${ko} ko`)
