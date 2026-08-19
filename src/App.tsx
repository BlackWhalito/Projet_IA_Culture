import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { AquarelleAtmosphere } from './components/AquarelleAtmosphere'

function App() {
  return (
    <>
      <AquarelleAtmosphere />
      <RouterProvider router={router} />
    </>
  )
}

export default App
