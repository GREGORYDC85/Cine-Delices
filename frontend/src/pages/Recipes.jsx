import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import "./Recipes.css";

function Recipes() {
  const [recipes, setRecipes] = useState([]);
  const location = useLocation();

  const categoryMap = {
    1: "Entrée",
    2: "Plat",
    3: "Dessert",
    0: "Autre",
    null: "Autre",
  };

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/recipes`)
      .then((response) => {
        console.log("✅ Données reçues :", response.data);
        setRecipes(response.data);
      })
      .catch((error) => {
        console.error("❌ Erreur lors de la récupération :", error);
      });
  }, []);

  // 🔁 Mapping des catégories
  const mappedRecipes = recipes.map((recipe) => {
    const categoryName =
      recipe.category ||
      recipe.category_name || // si le backend renvoie category_name
      categoryMap[recipe.code_category] ||
      categoryMap[null];

    return {
      ...recipe,
      category: categoryName,
      displayName: recipe.name || recipe.recipe_name || "Nom inconnu",
    };
  });

  // 🔍 Recherche côté frontend
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get("search")?.toLowerCase() || "";

  const filteredRecipes = mappedRecipes.filter((recipe) =>
    recipe.displayName.toLowerCase().includes(searchQuery) ||
    recipe.description?.toLowerCase().includes(searchQuery) ||
    recipe.category?.toLowerCase().includes(searchQuery) ||
    recipe.film_serie?.toLowerCase().includes(searchQuery)
  );

  // 🧩 Organisation par catégorie après filtrage
  const categories = ["Entrée", "Plat", "Dessert", "Autre"];
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
                    alt={recipe.displayName}
                  />
                  <h3>{recipe.displayName}</h3>
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
