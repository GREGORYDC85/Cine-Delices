// frontend/src/pages/Recipes.jsx
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import "./Recipes.css";

function Recipes() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
        // ✅ Utilisation de l'URL correcte
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/recipes`);
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

  const mappedRecipes = recipes.map((recipe) => ({
    ...recipe,
    category: recipe.category || recipe.category_name || categoryMap[recipe.code_category] || categoryMap[null],
    displayName: recipe.name || recipe.recipe_name || "Nom inconnu",
  }));

  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get("search")?.toLowerCase() || "";
  const filteredRecipes = mappedRecipes.filter((recipe) =>
    recipe.displayName.toLowerCase().includes(searchQuery) ||
    recipe.description?.toLowerCase().includes(searchQuery) ||
    recipe.category?.toLowerCase().includes(searchQuery) ||
    (recipe.film_serie?.toLowerCase() || "").includes(searchQuery)
  );

  const categories = ["Entrée", "Plat", "Dessert", "Autre"];
  const recipesByCategory = categories.map((category) => ({
    name: category,
    recipes: filteredRecipes.filter((r) => r.category === category),
  }));

  return (
    <div className="recipes-container">
      <h1>🍽️ Recettes inspirées du cinéma et des séries</h1>
      {loading ? (
        <p className="loading">Chargement des recettes...</p>
      ) : error ? (
        <p className="error">{error}</p>
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
                    <img
                      src={recipe.picture ? `${import.meta.env.VITE_API_URL}/images/${recipe.picture}` : '/images/placeholder.jpg'}
                      alt={recipe.displayName}
                      onError={(e) => {
                        e.target.onerror = null;
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
