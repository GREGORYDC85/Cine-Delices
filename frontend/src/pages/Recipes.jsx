import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import "./Recipes.css";

function Recipes() {
  const [recipes, setRecipes] = useState([]);
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get("search")?.toLowerCase() || "";

  const categoryMap = {
    1: "Entrée",
    2: "Plat",
    3: "Dessert",
  };

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/recipes`)
      .then((response) => setRecipes(response.data))
      .catch((error) =>
        console.error("❌ Erreur lors de la récupération :", error)
      );
  }, []);

  const mappedRecipes = recipes
    .filter((recipe) => recipe.code_category)
    .map((recipe) => ({
      ...recipe,
      category: categoryMap[recipe.code_category] || "Inconnue",
    }));

  const filteredRecipes = mappedRecipes.filter((recipe) => {
    const name = recipe.name || recipe.recipe_name || "";
    const description = recipe.description || "";
    const filmSerie = recipe.film_serie || "";

    return (
      name.toLowerCase().includes(searchQuery) ||
      description.toLowerCase().includes(searchQuery) ||
      filmSerie.toLowerCase().includes(searchQuery)
    );
  });

  const categories = ["Entrée", "Plat", "Dessert"];
  const recipesByCategory = categories.map((category) => ({
    name: category,
    recipes: filteredRecipes.filter((r) => r.category === category),
  }));

  return (
    <div className="recipes-container">
      <h1>🍽️ Recettes inspirées du cinéma et des séries</h1>

      {recipesByCategory.map(({ name, recipes }) => (
        <div key={name} className="category-section">
          <h2 className="category-title">{name}</h2>
          <div className="recipe-list">
            {recipes.length === 0 ? (
              <p>Aucune recette trouvée pour cette catégorie.</p>
            ) : (
              recipes.map((recipe) => (
                <Link
                  to={`/recettes/${recipe.code_recipe}`}
                  key={recipe.code_recipe}
                  className="recipe-card"
                >
                  <img
                    src={`${import.meta.env.VITE_API_URL}/images/${recipe.picture}`}
                    alt={recipe.name || recipe.recipe_name}
                  />
                  <h3>{recipe.name || recipe.recipe_name}</h3>
                  <p><strong>Catégorie :</strong> {recipe.category}</p>
                  <p><strong>Œuvre :</strong> {recipe.film_serie || "—"}</p>
                  <p>{recipe.description}</p>
                </Link>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Recipes;
