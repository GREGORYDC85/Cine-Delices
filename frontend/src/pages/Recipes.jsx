import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import "./Recipes.css";

function Recipes() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true); // ✅ Ajout d'un état de chargement
  const [error, setError] = useState(null); // ✅ Gestion des erreurs
  const location = useLocation();

  const categoryMap = {
    1: "Entrée",
    2: "Plat",
    3: "Dessert",
    0: "Autre",
    null: "Autre",
  };

  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true);
      try {
        // ✅ Utilisation du proxy /api au lieu de VITE_API_URL
        const { data } = await axios.get('/api/recipes');
        console.log("✅ Données reçues :", data);
        setRecipes(data);
      } catch (err) {
        console.error("❌ Erreur lors de la récupération :", err);
        setError("Impossible de charger les recettes. Veuillez réessayer plus tard.");
      } finally {
        setLoading(false);
      }
    };
    fetchRecipes();
  }, []);

  // 🔁 Mapping des catégories (inchangé, mais plus robuste)
  const mappedRecipes = recipes.map((recipe) => ({
    ...recipe,
    category: recipe.category || recipe.category_name || categoryMap[recipe.code_category] || categoryMap[null],
    displayName: recipe.name || recipe.recipe_name || "Nom inconnu",
  }));

  // 🔍 Recherche côté frontend
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get("search")?.toLowerCase() || "";
  const filteredRecipes = mappedRecipes.filter((recipe) =>
    recipe.displayName.toLowerCase().includes(searchQuery) ||
    recipe.description?.toLowerCase().includes(searchQuery) ||
    recipe.category?.toLowerCase().includes(searchQuery) ||
    (recipe.film_serie?.toLowerCase() || "").includes(searchQuery)
  );

  // 🧩 Organisation par catégorie
  const categories = ["Entrée", "Plat", "Dessert", "Autre"];
  const recipesByCategory = categories.map((category) => ({
    name: category,
    recipes: filteredRecipes.filter((r) => r.category === category),
  }));

  return (
    <div className="recipes-container">
      <h1>🍽️ Recettes inspirées du cinéma et des séries</h1>

      {loading ? (
        <p className="loading">Chargement des recettes...</p> // ✅ Affichage pendant le chargement
      ) : error ? (
        <p className="error">{error}</p> // ✅ Affichage des erreurs
      ) : (
        recipesByCategory.map(({ name, recipes }) => (
          <div key={name} className="category-section">
            <h2 className="category-title">{name}</h2>
            {recipes.length === 0 ? (
              <p>Aucune recette trouvée pour cette catégorie.</p>
            ) : (
              <div className="recipe-list">
                {recipes.map((recipe) => (
                  <Link
                    to={`/recettes/${recipe.code_recipe}`}
                    key={recipe.code_recipe}
                    className="recipe-card"
                  >
                    {/* ✅ Chemin absolu pour les images + fallback */}
                    <img
                      src={recipe.picture ? `/images/${recipe.picture}` : '/images/placeholder.jpg'}
                      alt={recipe.displayName}
                      onError={(e) => {
                        e.target.onerror = null; // Évite les boucles
                        e.target.src = '/images/placeholder.jpg';
                      }}
                    />
                    <h3>{recipe.displayName}</h3>
                    <p><strong>Catégorie :</strong> {recipe.category}</p>
                    <p><strong>Œuvre :</strong> {recipe.film_serie || "—"}</p>
                    <p>{recipe.description}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default Recipes;
