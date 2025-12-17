import { useLocation, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Breadcrumb.css";

const labelMap = {
  recipes: "Recettes",
  recettes: "Recettes",
  profile: "Profil",
  login: "Connexion",
  signup: "Inscription",
  contact: "Contact",
  sitemap: "Plan du site",
  "legal-mentions": "Mentions légales",

  admin: "Administration",
  dashboard: "Tableau de bord",
  recettes: "Recettes",
  utilisateurs: "Utilisateurs",
  commentaires: "Commentaires",
  works: "Œuvres",
};

const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter(Boolean);
  const [recipeName, setRecipeName] = useState(null);

  // 🔎 Récupération du nom de la recette
  useEffect(() => {
    if (pathnames[0] === "recettes" && pathnames[1]) {
      fetch(`${import.meta.env.VITE_API_URL}/recipes/${pathnames[1]}`)
        .then((res) => res.json())
        .then((data) =>
          setRecipeName(data.name || "Recette")
        )
        .catch(() => setRecipeName("Recette"));
    } else {
      setRecipeName(null);
    }
  }, [location.pathname]);

  return (
    <nav className="breadcrumb-container" aria-label="Fil d'Ariane">
      <ol className="breadcrumb-list">
        <li>
          <Link to="/">Accueil</Link>
        </li>

        {pathnames.map((value, index) => {
          let label = labelMap[value] || value;
          let to = `/${pathnames.slice(0, index + 1).join("/")}`;
          const isLast = index === pathnames.length - 1;

          // 🔐 ADMIN — forcer le premier lien vers /admin/dashboard
          if (value === "admin") {
            to = "/admin/dashboard";
          }

          // 🍽️ Recette détail
          if (pathnames[0] === "recettes" && index === 1 && recipeName) {
            label = recipeName;
          }

          return (
            <li key={to}>
              <span className="breadcrumb-separator"> / </span>
              {isLast ? (
                <span>{label}</span>
              ) : (
                <Link to={to}>{label}</Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
