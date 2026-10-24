import { Link } from 'react-router-dom'

export function NotFound() {
  return (
    <div className="page">
      <div className="card result">
        <div className="result-emoji">🧭</div>
        <h2>Página não encontrada</h2>
        <p className="muted">Cette page n’existe pas.</p>
        <Link to="/" className="btn btn-primary">
          Retour à l’accueil
        </Link>
      </div>
    </div>
  )
}
