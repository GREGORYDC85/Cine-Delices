import { Link } from "react-router-dom";
import "./NotFound.css"; // ✅ Ajout d'un fichier CSS dédié

function NotFound() {
  return (
    <div className="not-found-container">
      <h1 className="not-found-title">404</h1>
      <h2 className="not-found-subtitle">Page introuvable</h2>
      <p className="not-found-message">
        Oops ! La page que vous recherchez n'existe pas ou a été déplacée.
      </p>
      <Link to="/" className="not-found-link">
        Retour à l'accueil
      </Link>
    </div>
  );
}

export default NotFound;
