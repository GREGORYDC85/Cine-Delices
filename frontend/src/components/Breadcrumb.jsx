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
  "legal-mentions": "Mentions légales",
  sitemap: "Plan du site",
  admin: "Administration",
  dashboard: "Tableau de bord",
};

const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);
  const [recipeName, setRecipeName] = useState(null);

  // ✅ Corrige le cas "/admin" pour éviter les 404
  const fixedPathnames = [...pathnames];
  if (fixedPathnames[0] === "admin" && fixedPathnames.length === 1) {
    fixedPathnames.push("dashboard");
  }

  useEffect(() => {
    if (pathnames[0] === "recettes" && pathnames[1]) {
      const id = pathnames[1];
      fetch(`http://localhost:5002/recipes/${id}`)
        .then((res) => res.json())
        .then((data) => {
          setRecipeName(data.recipe_name || data.name || "Recette");
        })
        .catch(() => setRecipeName("Recette introuvable"));
    } else {
      setRecipeName(null);
    }
  }, [location]);

  return (
    <nav className="breadcrumb-container" aria-label="Fil d'Ariane">
      <ol className="breadcrumb-list">
        <li>
          <Link to="/">Accueil</Link>
        </li>

        {fixedPathnames.map((value, index) => {
          let to = `/${fixedPathnames.slice(0, index + 1).join("/")}`;
          const isLast = index === fixedPathnames.length - 1;

          // Redirection spéciale pour /recettes vers /recipes
          if (fixedPathnames[0] === "recettes" && index === 0) {
            to = "/recipes";
          }

          let label = labelMap[value] || decodeURIComponent(value);
          if (fixedPathnames[0] === "recettes" && index === 1 && recipeName) {
            label = recipeName;
          }

          return (
            <li key={to}>
              <span className="breadcrumb-separator">/</span>
              {isLast ? (
                <span>{label}</span>
              ) : (
                <Link to={to === "/admin" ? "/admin/dashboard" : to}>{label}</Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
