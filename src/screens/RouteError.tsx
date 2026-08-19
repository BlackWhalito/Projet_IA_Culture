import { Link } from 'react-router-dom'

export function RouteError() {
  return (
    <div style={{ padding: 'var(--space-5)', textAlign: 'center' }}>
      <h1>Oups, une erreur est survenue.</h1>
      <Link to="/">Retour à l'accueil</Link>
    </div>
  )
}
