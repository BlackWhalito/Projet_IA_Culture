import { createBrowserRouter } from 'react-router-dom'
import { HomeScreen } from './screens/HomeScreen/HomeScreen'
import { LevelMapScreen } from './screens/LevelMapScreen/LevelMapScreen'
import { GameSessionRoute } from './screens/GameSessionScreen/GameSessionRoute'
import { RouteError } from './screens/RouteError'

export const router = createBrowserRouter([
  { path: '/', element: <HomeScreen />, errorElement: <RouteError /> },
  { path: '/:gradeId', element: <LevelMapScreen />, errorElement: <RouteError /> },
  { path: '/:gradeId/level/:levelId', element: <GameSessionRoute />, errorElement: <RouteError /> },
])
