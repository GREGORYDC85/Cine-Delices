import { Link } from "react-router-dom";
import "./PlanDuSite.css"; // Style de la page (à créer aussi)

function PlanDuSite() {
  return (
    <div className="plan-du-site">
      <h1>📍 Plan du site</h1>
      <ul>
        <li><Link to="/">Accueil</Link></li>
        <li><Link to="/recipes">Recettes</Link></li>
        <li><Link to="/contact">Contact</Link></li>
        <li><Link to="/mentions-legales">Mentions légales</Link></li>
      </ul>
    </div>
  );
}

export default PlanDuSite;
