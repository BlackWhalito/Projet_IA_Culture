import { createBrowserRouter, createHashRouter } from 'react-router-dom'
import { HomeScreen } from './screens/HomeScreen/HomeScreen'
import { LevelMapScreen } from './screens/LevelMapScreen/LevelMapScreen'
import { GameSessionRoute } from './screens/GameSessionScreen/GameSessionRoute'
import { RouteError } from './screens/RouteError'

/*
 * Le routeur normal réécrit l'URL, ce qui suppose un serveur qui renvoie
 * index.html sur n'importe quel chemin. Ce n'est pas le cas d'un fichier
 * unique posé quelque part pour être essayé depuis un téléphone : là, ouvrir
 * /cp quitte la page au lieu de changer d'écran.
 *
 * `VITE_ROUTEUR=hash` bascule donc sur les ancres. Le comportement par défaut
 * ne change pas d'un iota — c'est un drapeau de build, pas une option
 * d'exécution.
 */
const creerRouteur = import.meta.env.VITE_ROUTEUR === 'hash' ? createHashRouter : createBrowserRouter

export const router = creerRouteur([
  { path: '/', element: <HomeScreen />, errorElement: <RouteError /> },
  { path: '/:gradeId', element: <LevelMapScreen />, errorElement: <RouteError /> },
  { path: '/:gradeId/level/:levelId', element: <GameSessionRoute />, errorElement: <RouteError /> },
])
